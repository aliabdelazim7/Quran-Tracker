'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  LayoutDashboard,
  UserPlus,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const sheikhNavItems = [
  { href: '/sheikh/dashboard', label: 'لوحة الحلقة', icon: LayoutDashboard },
  { href: '/sheikh/students', label: 'إدارة الطلاب والتسميع', icon: Users },
  { href: '/sheikh/invitations', label: 'رموز دعوة الطلاب', icon: UserPlus },
  { href: '/sheikh/statistics', label: 'إحصائيات الحلقة', icon: BarChart3 },
  { href: '/sheikh/notifications', label: 'الإشعارات والتنبيهات', icon: Bell },
  { href: '/sheikh/settings', label: 'الملف الشخصي والتوثيق', icon: Settings },
];

export const SheikhSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#122820] border-l border-[#E2DFD6] dark:border-[#24483B] min-h-screen fixed top-0 right-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E2DFD6] dark:border-[#24483B]">
        <Link href="/sheikh/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            🕌
          </div>
          <div>
            <h1 className="font-bold text-base text-[#145A45] dark:text-[#E0C37B] leading-tight">
              بوابة فضيلة الشيخ
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              إدارة الحلقات ومتابعة التسميع
            </p>
          </div>
        </Link>
      </div>

      {/* Sheikh Verification Status Card */}
      <div className="px-5 py-3.5 bg-[#F8F7F2] dark:bg-[#0E201A] mx-4 my-3 rounded-2xl border border-[#E2DFD6] dark:border-[#24483B] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-600 dark:text-stone-300 font-semibold">صفة الحساب:</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>شيخ معتمد</span>
          </span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          مرخّص لإسناد الحفظ ورصد تقييمات التسميع المعتمدة.
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {sheikhNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/sheikh/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#145A45] text-white shadow-xs font-bold'
                  : 'text-stone-700 dark:text-[#E2DFD6] hover:bg-[#F8F7F2] dark:hover:bg-[#152F26]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E0C37B]' : 'text-stone-500 dark:text-[#A8BDA0]'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-[#E2DFD6] dark:border-[#24483B] space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-[#E0C37B] flex items-center justify-center font-bold text-sm">
              {user?.display_name?.charAt(0) || 'ش'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                {user?.display_name || 'فضيلة الشيخ'}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {user?.email || 'حساب الشيخ'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="تسجيل الخروج"
            className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
