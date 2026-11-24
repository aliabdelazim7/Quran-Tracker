import type { RelationshipPermissions } from '../../types/database.ts';

export type PermissionKey =
  | 'can_view_profile'
  | 'can_view_memorization'
  | 'can_view_progress'
  | 'can_view_lessons'
  | 'can_view_assignments'
  | 'can_view_revision_history'
  | 'can_create_lessons'
  | 'can_record_evaluations'
  | 'can_create_assignments';

export const DEFAULT_RELATIONSHIP_PERMISSIONS: Record<PermissionKey, boolean> = {
  can_view_profile: true,
  can_view_memorization: true,
  can_view_progress: true,
  can_view_lessons: true,
  can_view_assignments: true,
  can_view_revision_history: true,
  can_create_lessons: true,
  can_record_evaluations: true,
  can_create_assignments: true,
};

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'read' | 'write';
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'can_view_profile',
    label: 'عرض الملف الشخصي الأساسي',
    description: 'يتيح للشيخ رؤية اسمك وصورتك وتاريخ انضمامك للحلقة.',
    category: 'read',
  },
  {
    key: 'can_view_progress',
    label: 'عرض نسبة وإجمالي التقدم',
    description: 'يتيح للشيخ الاطلاع على إجمالي عدد الآيات المحفوظة والمتقنة والأجزاء المتبقية.',
    category: 'read',
  },
  {
    key: 'can_view_memorization',
    label: 'عرض سجلات ومواضع الحفظ',
    description: 'يتيح للشيخ معرفة السور والمقاطع التي أتممت حفظها وتسميعها.',
    category: 'read',
  },
  {
    key: 'can_view_lessons',
    label: 'عرض سجل الجلسات السابقة',
    description: 'يتيح للشيخ مراجعة تواريخ جلساتك وملاحظات التسميع المسجلة.',
    category: 'read',
  },
  {
    key: 'can_view_assignments',
    label: 'عرض الواجبات والتكليفات',
    description: 'يتيح للشيخ متابعة الواجبات الحالية وحالتها (قيد الحفظ / جاهز للتسميع).',
    category: 'read',
  },
  {
    key: 'can_view_revision_history',
    label: 'عرض سجل ومواعيد المراجعة',
    description: 'يتيح للشيخ متابعة دورات مراجعتك وتثبيت المحفوظ القديم.',
    category: 'read',
  },
  {
    key: 'can_create_lessons',
    label: 'تسجيل جلسة تسميع جديدة',
    description: 'يسمح للشيخ بإضافة جلسة حلقة جديدة وتحديد موعدها ونوعها.',
    category: 'write',
  },
  {
    key: 'can_record_evaluations',
    label: 'رصد تقييمات المقاطع والملاحظات',
    description: 'يسمح للشيخ بوضع درجات التقييم (ممتاز، جيد، يحتاج مراجعة) وكتابة توجيهاته.',
    category: 'write',
  },
  {
    key: 'can_create_assignments',
    label: 'إسناد وتكليف بواجب حفظ جديد',
    description: 'يسمح للشيخ بتحديد المقطع القادم وتكليفك بحفظه أو إعادته.',
    category: 'write',
  },
];

export function hasPermission(
  permissions: Partial<RelationshipPermissions> | undefined | null,
  key: PermissionKey
): boolean {
  if (!permissions) return false;
  return permissions[key] === true;
}
