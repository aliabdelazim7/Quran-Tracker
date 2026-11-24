import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Profile,
  TeacherStudentRelationship,
  Lesson,
  LessonPassage,
  MemorizationAssignment,
  SheikhEvaluation,
  AssignmentType,
  LessonType,
} from '@/types/database';
import { getTeacherRelationships } from './relationship.service';
import { logAuditEvent } from './audit.service';
import { hasPermission } from '@/lib/authorization/permissions';

export interface SheikhDashboardData {
  totalStudents: number;
  activeStudents: number;
  studentsNeedingRevision: number;
  studentsWithPendingAssignments: number;
  lessonsThisMonth: number;
  pendingInvitationsCount: number;
  recentActivity: Array<{
    id: string;
    studentName: string;
    action: string;
    date: string;
  }>;
}

export async function getSheikhDashboardData(sheikhId: string): Promise<SheikhDashboardData> {
  const relationships = await getTeacherRelationships(sheikhId);
  const activeRels = relationships.filter((r) => r.status === 'active');

  return {
    totalStudents: relationships.length,
    activeStudents: activeRels.length,
    studentsNeedingRevision: Math.max(1, Math.floor(activeRels.length * 0.4)),
    studentsWithPendingAssignments: activeRels.length,
    lessonsThisMonth: 12,
    pendingInvitationsCount: 2,
    recentActivity: [
      {
        id: 'act-1',
        studentName: activeRels[0]?.student?.display_name || 'علي أحمد',
        action: 'أتم حفظ سورة النبأ وجاهز للتسميع في الحلقة القادمة',
        date: 'اليوم، 04:30 م',
      },
      {
        id: 'act-2',
        studentName: 'محمود عبد السلام',
        action: 'تم تسجيل جلسة تسميع وتقييم (ممتاز)',
        date: 'أمس، 06:15 م',
      },
      {
        id: 'act-3',
        studentName: 'إبراهيم يوسف',
        action: 'تأخر عن موعد مراجعة الربع الثاني من البقرة',
        date: 'منذ يومين',
      },
    ],
  };
}

export interface AuthorizedStudentDetails {
  relationship: TeacherStudentRelationship;
  student: Profile;
  canViewProgress: boolean;
  canViewMemorization: boolean;
  canViewLessons: boolean;
  canViewAssignments: boolean;
  canViewRevisionHistory: boolean;
  canCreateLessons: boolean;
  canCreateAssignments: boolean;
  stats: {
    memorizedAyahs: number;
    masteredAyahs: number;
    totalAyahs: number;
    percentage: number;
  };
  assignments: MemorizationAssignment[];
  lessons: Lesson[];
}

export async function getAuthorizedStudentDetails(
  sheikhId: string,
  studentId: string
): Promise<{ data?: AuthorizedStudentDetails; error?: string }> {
  const relationships = await getTeacherRelationships(sheikhId);
  const rel = relationships.find(
    (r) => r.student_id === studentId && r.status === 'active'
  );

  if (!rel) {
    return { error: 'لا يوجد ربط نشط أو مصرح به مع هذا الطالب.' };
  }

  const perms = rel.permissions;

  // Mock / offline data builder
  const student = rel.student || {
    id: studentId,
    display_name: 'طالب الحلقة',
    role: 'student',
    verification_status: 'unverified',
    language: 'ar',
    timezone: 'Africa/Cairo',
    preferred_theme: 'light',
    created_at: rel.connected_at,
    updated_at: rel.connected_at,
  };

  const mockAssignments: MemorizationAssignment[] = [
    {
      id: 'asg-1',
      user_id: studentId,
      assignment_type: 'new_memorization',
      start_surah: 78,
      start_ayah: 1,
      end_surah: 78,
      end_ayah: 40,
      title: 'سورة النبأ كاملة',
      status: 'ready_for_recitation',
      assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      notes: 'التركيز على أحكام النون الساكنة والتنوين والمد المتصل.',
      created_by: sheikhId,
      created_by_role: 'sheikh',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'asg-2',
      user_id: studentId,
      assignment_type: 'revision',
      start_surah: 1,
      start_ayah: 1,
      end_surah: 1,
      end_ayah: 7,
      title: 'الفاتحة وتثبيت الأحكام',
      status: 'mastered',
      assigned_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      created_by: sheikhId,
      created_by_role: 'sheikh',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockLessons: Lesson[] = [
    {
      id: 'les-1',
      user_id: studentId,
      lesson_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      lesson_type: 'new_memorization',
      sheikh_name: 'فضيلة الشيخ',
      duration_minutes: 30,
      overall_notes: 'قراءة طيبة مع حسن الأداء ومخارج حروف واضحة.',
      created_by: sheikhId,
      created_by_role: 'sheikh',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      passages: [
        {
          id: 'pas-1',
          lesson_id: 'les-1',
          start_surah: 78,
          start_ayah: 1,
          end_surah: 78,
          end_ayah: 20,
          passage_type: 'new_memorization',
          evaluation: 'excellent',
          notes: 'إتقان تام للغنة والمدود.',
          created_at: new Date().toISOString(),
        },
      ],
    },
  ];

  return {
    data: {
      relationship: rel,
      student,
      canViewProgress: hasPermission(perms, 'can_view_progress'),
      canViewMemorization: hasPermission(perms, 'can_view_memorization'),
      canViewLessons: hasPermission(perms, 'can_view_lessons'),
      canViewAssignments: hasPermission(perms, 'can_view_assignments'),
      canViewRevisionHistory: hasPermission(perms, 'can_view_revision_history'),
      canCreateLessons: hasPermission(perms, 'can_create_lessons'),
      canCreateAssignments: hasPermission(perms, 'can_create_assignments'),
      stats: {
        memorizedAyahs: 240,
        masteredAyahs: 180,
        totalAyahs: 6236,
        percentage: 3.8,
      },
      assignments: hasPermission(perms, 'can_view_assignments') ? mockAssignments : [],
      lessons: hasPermission(perms, 'can_view_lessons') ? mockLessons : [],
    },
  };
}

export async function recordStudentLessonBySheikh(params: {
  sheikhId: string;
  studentId: string;
  lessonDate: string;
  lessonType: LessonType;
  durationMinutes?: number;
  overallNotes?: string;
  passages: Array<{
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
    passageType: AssignmentType;
    evaluation: SheikhEvaluation;
    notes?: string;
  }>;
  newAssignment?: {
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
    title?: string;
    notes?: string;
  };
}): Promise<{ success: boolean; lessonId?: string; error?: string }> {
  try {
    const relationships = await getTeacherRelationships(params.sheikhId);
    const rel = relationships.find(
      (r) => r.student_id === params.studentId && r.status === 'active'
    );

    if (!rel) {
      return { success: false, error: 'غير مصرح للشيخ بتسجيل درس لطالب غير مرتبط به.' };
    }

    if (!hasPermission(rel.permissions, 'can_create_lessons')) {
      return { success: false, error: 'قام الطالب بإيقاف صلاحية تسجيل الجلسات لهذا الحساب.' };
    }

    const lessonId = 'les-' + Math.random().toString(36).substring(2, 9);

    await logAuditEvent({
      actor_id: params.sheikhId,
      actor_role: 'sheikh',
      action: 'lesson_created',
      resource_type: 'lessons',
      resource_id: lessonId,
      student_id: params.studentId,
      teacher_id: params.sheikhId,
      metadata: {
        lesson_date: params.lessonDate,
        passages_count: params.passages.length,
      },
    });

    return { success: true, lessonId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'فشل تسجيل الدرس' };
  }
}

export async function assignMemorizationBySheikh(params: {
  sheikhId: string;
  studentId: string;
  assignmentType: AssignmentType;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  title?: string;
  notes?: string;
}): Promise<{ success: boolean; assignmentId?: string; error?: string }> {
  try {
    const relationships = await getTeacherRelationships(params.sheikhId);
    const rel = relationships.find(
      (r) => r.student_id === params.studentId && r.status === 'active'
    );

    if (!rel) {
      return { success: false, error: 'غير مصرح للشيخ بإسناد تكليف لطالب غير مرتبط به.' };
    }

    if (!hasPermission(rel.permissions, 'can_create_assignments')) {
      return { success: false, error: 'قام الطالب بإيقاف صلاحية التكليف بالواجبات.' };
    }

    const assignmentId = 'asg-' + Math.random().toString(36).substring(2, 9);

    await logAuditEvent({
      actor_id: params.sheikhId,
      actor_role: 'sheikh',
      action: 'assignment_created',
      resource_type: 'memorization_assignments',
      resource_id: assignmentId,
      student_id: params.studentId,
      teacher_id: params.sheikhId,
      metadata: {
        type: params.assignmentType,
        range: `${params.startSurah}:${params.startAyah} - ${params.endSurah}:${params.endAyah}`,
      },
    });

    return { success: true, assignmentId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'فشل إسناد التكليف' };
  }
}
