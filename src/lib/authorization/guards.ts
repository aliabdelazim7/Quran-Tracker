import type { UserRole } from '../../types/database.ts';

export function getPortalHome(role?: UserRole | string | null): string {
  if (role === 'sheikh') {
    return '/sheikh/dashboard';
  }
  return '/student/dashboard';
}

export function isAllowedRoute(pathname: string, role?: UserRole | string | null): { allowed: boolean; redirectTo?: string } {
  // Public auth routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/onboarding'];
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return { allowed: true };
  }

  // Root path redirects to role portal
  if (pathname === '/' || pathname === '/dashboard') {
    return { allowed: false, redirectTo: getPortalHome(role) };
  }

  // Sheikh Routes
  if (pathname.startsWith('/sheikh')) {
    if (role === 'sheikh' || role === 'admin') {
      return { allowed: true };
    }
    // Student attempting to access Sheikh portal
    return { allowed: false, redirectTo: '/student/dashboard' };
  }

  // Student Routes
  if (pathname.startsWith('/student')) {
    if (role === 'student' || role === 'admin') {
      return { allowed: true };
    }
    // Sheikh attempting to access Student portal
    return { allowed: false, redirectTo: '/sheikh/dashboard' };
  }

  // Legacy paths (e.g. /memorization, /revision, /lessons, /reading, /quran, /statistics, /settings)
  // For backwards compatibility, allow if user is authenticated student, else map to appropriate portal
  if (role === 'sheikh') {
    return { allowed: false, redirectTo: '/sheikh/dashboard' };
  }

  return { allowed: true };
}
