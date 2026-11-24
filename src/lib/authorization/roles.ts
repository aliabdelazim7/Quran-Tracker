import type { UserRole } from '../../types/database.ts';

export const ALLOWED_REGISTRATION_ROLES = ['student', 'sheikh'] as const;

export function isValidRegistrationRole(role: unknown): role is 'student' | 'sheikh' {
  return typeof role === 'string' && (role === 'student' || role === 'sheikh');
}

export function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (role === 'student' || role === 'sheikh' || role === 'admin');
}

export function isStudent(role?: string | null): boolean {
  return role === 'student';
}

export function isSheikh(role?: string | null): boolean {
  return role === 'sheikh';
}

export function isAdmin(role?: string | null): boolean {
  return role === 'admin';
}

export function getRoleArabicLabel(role?: string | null): string {
  switch (role) {
    case 'sheikh':
      return 'شيخ ومُعلّم';
    case 'admin':
      return 'مشرف المنصة';
    case 'student':
    default:
      return 'طالب علم';
  }
}
