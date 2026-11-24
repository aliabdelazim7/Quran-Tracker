'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';
import { isAllowedRoute } from '@/lib/authorization/guards';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Allow auth pages and onboarding
        const publicPaths = ['/login', '/register', '/forgot-password', '/onboarding'];
        if (!publicPaths.includes(pathname)) {
          router.push('/login');
        }
      } else {
        const check = isAllowedRoute(pathname, user.role);
        if (!check.allowed && check.redirectTo) {
          router.push(check.redirectTo);
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0B1914]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#145A45] text-white flex items-center justify-center text-2xl shadow-lg animate-pulse">
            📖
          </div>
          <p className="text-sm font-semibold text-[#145A45] dark:text-[#A6B89D]">
            جارٍ تحميل رحلتك مع القرآن...
          </p>
        </div>
      </div>
    );
  }

  // If user is on an auth page, render without shell
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#0B1914] text-[#252B27] dark:text-[#EDF3EF] flex flex-row-reverse">
      {/* Desktop Sidebar (RTL: right side) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 pb-20 lg:pb-8">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
