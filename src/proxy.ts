import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Enforce security headers at the proxy layer
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Cache-Control protection on sensitive routes
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/student') ||
    pathname.startsWith('/sheikh') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login')
  ) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
