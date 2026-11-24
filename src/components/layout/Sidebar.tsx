'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  Bookmark,
  BarChart3,
  Award,
  HeartHandshake,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Mic
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuranApp } from '@/context/QuranAppContext';

export const navItems = [
  { href: '/student/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/student/recitation', label: 'التسميع الذكي', icon: Mic },
  { href: '/student/teacher', label: 'الشيخ المتابع والحلقة', icon: GraduationCap },
  { href: '/student/quran', label: 'خريطة القرآن', icon: BookOpen },
  { href: '/student/memorization', label: 'الحفظ والتسميع', icon: CheckCircle2 },
  { href: '/student/revision', label: 'المراجعة والتثبيت', icon: RotateCcw },
  { href: '/student/lessons', label: 'جلسات الشيخ', icon: Award },
  { href: '/student/reading', label: 'ورد التلاوة', icon: Bookmark },
  { href: '/student/statistics', label: 'الإحصائيات', icon: BarChart3 },
  { href: '/achievements', label: 'الإنجازات', icon: Sparkles },
  { href: '/motivation', label: 'زاد الروح', icon: HeartHandshake },
  { href: '/student/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/student/settings', label: 'الإعدادات', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { notifications, stats } = useQuranApp();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#11251E] border-l border-[#E6E4DC] dark:border-[#1F3B32] min-h-screen fixed top-0 right-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E6E4DC] dark:border-[#1F3B32]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#145A45] text-white flex items-center justify-center font-bold text-xl shadow-sm">
            📖
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#145A45] dark:text-[#A6B89D] leading-tight">
              رحلتي مع القرآن
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              رفيقك اليومي في الحفظ والمراجعة
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Progress Indicator */}
      <div className="px-6 py-4 bg-[#F8F7F2] dark:bg-[#0B1914] mx-4 my-3 rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32]">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-stone-600 dark:text-stone-300">نسبة الحفظ الكلية:</span>
          <span className="text-[#145A45] dark:text-[#C7A75B] font-bold">
            {stats.memorizedPercentage}%
          </span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#145A45] dark:bg-[#C7A75B] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.memorizedPercentage)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 mt-2">
          <span>{stats.memorizedAyahsCount} آية</span>
          <span>المتبقي {stats.remainingAyahsCount} آية</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const strippedHref = item.href.replace('/student', '');
          const isActive =
            pathname === item.href ||
            (strippedHref && pathname === strippedHref) ||
            (item.href !== '/student/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#145A45] text-white shadow-xs font-bold'
                  : 'text-stone-700 dark:text-[#E2DFD6] hover:bg-[#F8F7F2] dark:hover:bg-[#142D25]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C7A75B]' : 'text-stone-500 dark:text-[#A8BDA0]'}`} />
                <span>{item.label}</span>
              </div>
              {item.href === '/notifications' && unreadCount > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#145A45]' : 'bg-[#145A45] text-white'}`}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-[#E6E4DC] dark:border-[#1F3B32] space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#145A45]/10 text-[#145A45] dark:text-[#A6B89D] flex items-center justify-center font-bold text-sm">
              {user?.display_name?.charAt(0) || 'ق'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                {user?.display_name || 'قارئ القرآن'}
              </p>
              <p className="text-[10px] text-stone-500 truncate">{user?.email || 'حساب زائر'}</p>
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
