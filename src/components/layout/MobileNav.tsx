'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Menu,
  X,
  GraduationCap,
  Bookmark,
  BarChart3,
  Award,
  HeartHandshake,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuranApp } from '@/context/QuranAppContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { notifications } = useQuranApp();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const primaryItems = [
    { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/quran', label: 'المصحف', icon: BookOpen },
    { href: '/memorization', label: 'الحفظ', icon: CheckCircle2 },
    { href: '/revision', label: 'المراجعة', icon: RotateCcw },
  ];

  const moreItems = [
    { href: '/lessons', label: 'جلسات الشيخ', icon: GraduationCap },
    { href: '/reading', label: 'ورد التلاوة', icon: Bookmark },
    { href: '/statistics', label: 'الإحصائيات', icon: BarChart3 },
    { href: '/achievements', label: 'الإنجازات', icon: Award },
    { href: '/motivation', label: 'زاد الروح', icon: HeartHandshake },
    { href: '/notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount },
    { href: '/settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 bg-white/95 dark:bg-[#11251E]/95 backdrop-blur-md border-t border-[#E6E4DC] dark:border-[#1F3B32] z-40 px-2 py-1 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full touch-target transition-colors ${
                  isActive
                    ? 'text-[#145A45] dark:text-[#C7A75B] font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[11px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full touch-target relative ${
              moreOpen ? 'text-[#145A45] dark:text-[#C7A75B]' : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Menu className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[11px] mt-0.5">المزيد</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </nav>

      {/* More Drawer Dialog */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div
            className="w-full bg-white dark:bg-[#11251E] rounded-t-3xl border-t border-[#E6E4DC] dark:border-[#1F3B32] p-6 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC] dark:border-[#1F3B32]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#145A45] text-white flex items-center justify-center text-sm font-bold">
                  {user?.display_name?.charAt(0) || 'ق'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#252B27] dark:text-[#EDF3EF]">
                    {user?.display_name || 'قارئ القرآن'}
                  </h3>
                  <p className="text-[11px] text-stone-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-colors ${
                      isActive
                        ? 'border-[#145A45] bg-[#145A45]/5 text-[#145A45] dark:text-[#C7A75B]'
                        : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className="bg-[#145A45] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
