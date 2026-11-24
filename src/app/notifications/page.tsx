'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { Bell, CheckCheck, Trash2, Calendar, Sparkles, BookOpen } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useQuranApp();
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>مركز الإشعارات والتذكيرات</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              تنبيهات مواعيد التسميع والمراجعات المقترحة والتكليفات القرآنية.
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح كل الإشعارات</span>
            </button>
          )}
        </div>

        {/* Browser Notification Permission Banner */}
        {browserPermission !== 'granted' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                لتلقي تذكيرات وردك اليومي ومراجعتك في موعدها، يمكنك تفعيل إشعارات المتصفح.
              </span>
            </div>
            <button
              onClick={requestPermission}
              className="px-3 py-1.5 rounded-lg bg-[#145A45] text-white font-bold shrink-0 hover:bg-[#1b6f57]"
            >
              تفعيل التنبيهات
            </button>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[#E6E4DC] dark:border-[#1F3B32] bg-white/50 dark:bg-[#11251E]/50 space-y-2">
            <CheckCheck className="w-10 h-10 text-stone-400 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
              صندوق الإشعارات فارغ
            </h3>
            <p className="text-xs text-stone-500">
              ستظهر هنا تذكيرات المراجعة وتنبيهات مواعيد الشيخ والإنجازات فور حدوثها.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  n.read_at
                    ? 'bg-white dark:bg-[#11251E] border-[#E6E4DC] dark:border-[#1F3B32] opacity-80'
                    : 'bg-[#145A45]/5 dark:bg-[#145A45]/20 border-[#145A45]/30 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] flex items-center justify-center text-lg shrink-0 mt-0.5">
                    {n.notification_type === 'milestone'
                      ? '🏆'
                      : n.notification_type === 'sheikh_assignment'
                      ? '📋'
                      : '🔔'}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100">
                      {n.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {n.body}
                    </p>
                    <span className="text-[10px] text-stone-400 block pt-1">
                      {new Date(n.created_at).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {!n.read_at && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#145A45] dark:bg-[#C7A75B] shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
