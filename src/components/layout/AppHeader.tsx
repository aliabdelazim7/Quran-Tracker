'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuranApp } from '@/context/QuranAppContext';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';

export const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useQuranApp();
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const [today, setToday] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkActive = document.documentElement.classList.contains('dark');
      setIsDark(isDarkActive);
      setToday(
        new Intl.DateTimeFormat('ar-EG', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(new Date())
      );
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        setIsDark(false);
        localStorage.setItem('theme', 'light');
      } else {
        root.classList.add('dark');
        setIsDark(true);
        localStorage.setItem('theme', 'dark');
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#11251E]/80 backdrop-blur-md border-b border-[#E6E4DC] dark:border-[#1F3B32] px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Right side: Mobile logo + Greeting */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
              <span className="text-2xl">📖</span>
            </Link>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-[#145A45] dark:text-[#C7A75B]">
                  السلام عليكم يا {user?.display_name?.split(' ')[0] || 'صاحبي'} ❤️
                </span>
                <span className="hidden sm:inline-block text-xs text-stone-400">|</span>
                <span className="hidden sm:inline-block text-xs text-stone-500 dark:text-stone-400">
                  {today}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                كل يوم بتقرب فيه من القرآن هو مكسب حقيقي.
              </p>
            </div>
          </div>

          {/* Left side: Quick Search, Dark Mode, Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            >
              <Search className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
              <span className="hidden md:inline">بحث في القرآن والدروس...</span>
              <kbd className="hidden md:inline text-[10px] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title="تبديل الوضع الليلي"
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-[#F8F7F2] dark:hover:bg-[#142D25] border border-[#E6E4DC] dark:border-[#1F3B32] transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-[#F8F7F2] dark:hover:bg-[#142D25] border border-[#E6E4DC] dark:border-[#1F3B32] transition-colors"
            >
              <Bell className="w-4 h-4 text-[#145A45] dark:text-[#C7A75B]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
};
