'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SheikhSidebar, sheikhNavItems } from './SheikhSidebar';
import { AppHeader } from './AppHeader';
import { isAllowedRoute } from '@/lib/authorization/guards';
import Link from 'next/link';

interface SheikhAppShellProps {
  children: React.ReactNode;
}

export const SheikhAppShell: React.FC<SheikhAppShellProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0A1612]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-2xl shadow-lg animate-pulse">
            🕌
          </div>
          <p className="text-sm font-semibold text-[#145A45] dark:text-[#E0C37B]">
            جارٍ تحميل بوابة فضيلة الشيخ...
          </p>
        </div>
      </div>
    );
  }

  // Security guard check
  if (user && user.role !== 'sheikh' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2] dark:bg-[#0A1612]">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#122820] border border-rose-200 text-center space-y-4 max-w-md">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-lg font-bold text-rose-700 dark:text-rose-400">
            غير مصرح بالدخول لبوابة الشيوخ
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            هذه البوابة مخصصة للشيوخ والمعلمين لإدارة الحلقات والتسميع. حسابك مسجل كطالب.
          </p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#145A45] text-white text-xs font-bold"
          >
            الانتقال إلى بوابة الطالب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#0A1612] text-[#18201C] dark:text-[#F4F7F5] flex flex-row-reverse">
      {/* Desktop Sidebar (RTL: right side) */}
      <SheikhSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 pb-20 lg:pb-8">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Sheikh */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#122820]/95 backdrop-blur-md border-t border-[#E2DFD6] dark:border-[#24483B] px-3 py-2 flex items-center justify-around">
        {sheikhNavItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-2 rounded-lg ${
                isActive
                  ? 'text-[#145A45] dark:text-[#E0C37B]'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
