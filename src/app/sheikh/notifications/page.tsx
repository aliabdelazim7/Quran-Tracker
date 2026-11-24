'use client';

import React from 'react';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { Bell, CheckCircle2, UserPlus, GraduationCap, Clock } from 'lucide-react';

export default function SheikhNotificationsPage() {
  const notifications = [
    {
      id: 'not-1',
      title: 'انضمام طالب جديد للحلقة',
      body: 'قام الطالب علي أحمد عبد الرحيم بقبول رمز دعوتك وربط حسابه بحلقتك رسمياً.',
      time: 'منذ ساعتين',
      read: false,
      type: 'invitation',
    },
    {
      id: 'not-2',
      title: 'إتمام حفظ المقطع المطلوب',
      body: 'أفاد الطالب علي أحمد بأنه جاهز لتسميع سورة النبأ (كاملة) في الحلقة القادمة.',
      time: 'أمس، 04:30 م',
      read: true,
      type: 'assignment',
    },
    {
      id: 'not-3',
      title: 'تذكير موعد حلقة الغد',
      body: 'موعد حلقة التسميع الأسبوعية غداً الساعة 05:00 مساءً مع طلاب الجزء الثلاثين.',
      time: 'منذ يومين',
      read: true,
      type: 'reminder',
    },
  ];

  return (
    <SheikhAppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
            <Bell className="w-6 h-6" />
            <span>إشعارات وتنبيهات الحلقة</span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            متابعة قبول الدعوات، جاهزية الطلاب للتسميع، ومواعيد الحلقات.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                !n.read
                  ? 'bg-emerald-50/50 dark:bg-[#152F26] border-emerald-200 dark:border-[#24483B]'
                  : 'bg-[#F8F7F2] dark:bg-[#0E201A] border-[#E2DFD6] dark:border-[#24483B]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'invitation'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-[#E0C37B]'
                    : n.type === 'assignment'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {n.type === 'invitation' ? (
                  <UserPlus className="w-4 h-4" />
                ) : n.type === 'assignment' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-stone-400">{n.time}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {n.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SheikhAppShell>
  );
}
