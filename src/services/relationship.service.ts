import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { TeacherStudentRelationship, RelationshipPermissions } from '@/types/database';
import { logAuditEvent } from './audit.service';
import { DEFAULT_RELATIONSHIP_PERMISSIONS } from '@/lib/authorization/permissions';

const RELATIONSHIPS_STORAGE_KEY = 'rehlaty_teacher_student_relationships';

export async function getStudentRelationships(studentId: string): Promise<TeacherStudentRelationship[]> {
  try {
    if (!isSupabaseConfigured()) {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(RELATIONSHIPS_STORAGE_KEY);
      if (!stored) return [];
      const list: TeacherStudentRelationship[] = JSON.parse(stored);
      return list.filter((r) => r.student_id === studentId);
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('teacher_student_relationships')
      .select('*, teacher:profiles!teacher_id(*), permissions:relationship_permissions(*)')
      .eq('student_id', studentId);

    return (data as TeacherStudentRelationship[]) || [];
  } catch {
    return [];
  }
}

export async function getTeacherRelationships(teacherId: string): Promise<TeacherStudentRelationship[]> {
  try {
    if (!isSupabaseConfigured()) {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(RELATIONSHIPS_STORAGE_KEY);
      if (!stored) {
        // Mock default demo student connected to sheikh if testing demo
        const defaultRel: TeacherStudentRelationship = {
          id: 'rel-demo-1',
          teacher_id: teacherId,
          student_id: 'demo-student-1',
          status: 'active',
          connected_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          accepted_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          student: {
            id: 'demo-student-1',
            display_name: 'علي أحمد عبد الرحيم',
            role: 'student',
            verification_status: 'unverified',
            language: 'ar',
            timezone: 'Africa/Cairo',
            preferred_theme: 'light',
            created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          permissions: {
            id: 'perm-demo-1',
            relationship_id: 'rel-demo-1',
            ...DEFAULT_RELATIONSHIP_PERMISSIONS,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(RELATIONSHIPS_STORAGE_KEY, JSON.stringify([defaultRel]));
        return [defaultRel];
      }
      const list: TeacherStudentRelationship[] = JSON.parse(stored);
      return list.filter((r) => r.teacher_id === teacherId);
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('teacher_student_relationships')
      .select('*, student:profiles!student_id(*), permissions:relationship_permissions(*)')
      .eq('teacher_id', teacherId);

    return (data as TeacherStudentRelationship[]) || [];
  } catch {
    return [];
  }
}

export async function updateRelationshipPermissions(
  relationshipId: string,
  studentId: string,
  permissions: Partial<RelationshipPermissions>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(RELATIONSHIPS_STORAGE_KEY);
      if (stored) {
        const list: TeacherStudentRelationship[] = JSON.parse(stored);
        const idx = list.findIndex((r) => r.id === relationshipId && r.student_id === studentId);
        if (idx !== -1) {
          list[idx].permissions = {
            ...list[idx].permissions,
            ...permissions,
            updated_at: new Date().toISOString(),
          } as RelationshipPermissions;
          localStorage.setItem(RELATIONSHIPS_STORAGE_KEY, JSON.stringify(list));
        }
      }

      await logAuditEvent({
        actor_id: studentId,
        actor_role: 'student',
        action: 'permissions_updated',
        resource_type: 'relationship_permissions',
        resource_id: relationshipId,
        student_id: studentId,
        metadata: permissions,
      });

      return { success: true };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('relationship_permissions')
      .update({
        ...permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('relationship_id', relationshipId);

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      actor_id: studentId,
      actor_role: 'student',
      action: 'permissions_updated',
      resource_type: 'relationship_permissions',
      resource_id: relationshipId,
      student_id: studentId,
      metadata: permissions,
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'فشل تعديل الصلاحيات' };
  }
}

export async function revokeRelationship(
  relationshipId: string,
  actorId: string,
  actorRole: 'student' | 'sheikh'
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(RELATIONSHIPS_STORAGE_KEY);
      if (stored) {
        const list: TeacherStudentRelationship[] = JSON.parse(stored);
        const updated = list.map((r) =>
          r.id === relationshipId ? { ...r, status: 'revoked' as const, revoked_at: now } : r
        );
        localStorage.setItem(RELATIONSHIPS_STORAGE_KEY, JSON.stringify(updated));
      }

      await logAuditEvent({
        actor_id: actorId,
        actor_role: actorRole,
        action: 'relationship_revoked',
        resource_type: 'teacher_student_relationships',
        resource_id: relationshipId,
      });

      return { success: true };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('teacher_student_relationships')
      .update({
        status: 'revoked',
        revoked_at: now,
        updated_at: now,
      })
      .eq('id', relationshipId);

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      actor_id: actorId,
      actor_role: actorRole,
      action: 'relationship_revoked',
      resource_type: 'teacher_student_relationships',
      resource_id: relationshipId,
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'فشل إلغاء الربط' };
  }
}
