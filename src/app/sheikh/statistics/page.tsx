'use client';

import React from 'react';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { BarChart3, Award, CheckCircle2, TrendingUp, Users, Calendar } from 'lucide-react';

export default function SheikhStatisticsPage() {
  return (
    <SheikhAppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            <span>إحصائيات وتقارير أداء الحلقة</span>
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            مؤشرات التسميع، نسب الإتقان، ومعدلات انتظام الطلاب وتثبيت المحفوظ.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-stone-500 font-semibold block">معدل الإتقان العام</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92%</p>
            <p className="text-[10px] text-stone-500">تقييم (ممتاز وجيد جداً)</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-stone-500 font-semibold block">جلسات الأسبوع الحالي</span>
            <p className="text-2xl font-black text-[#145A45] dark:text-[#E0C37B]">8</p>
            <p className="text-[10px] text-emerald-600 font-bold">انتظام ممتاز للحلقة</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-stone-500 font-semibold block">متوسط مدة الجلسة</span>
            <p className="text-2xl font-black text-stone-900 dark:text-stone-100">25</p>
            <p className="text-[10px] text-stone-500">دقيقة لكل تلميذ</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] space-y-1">
            <span className="text-stone-500 font-semibold block">نسبة الحضور بالحلقات</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">96%</p>
            <p className="text-[10px] text-stone-500">التزام مستمر</p>
          </div>
        </div>

        {/* Detailed Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
              <span>توزيع تقييمات التسميع المعتمدة</span>
            </h2>

            <div className="space-y-3">
              {[
                { label: 'ممتاز ⭐', count: '14 جلسة', pct: 70, color: 'bg-emerald-600' },
                { label: 'جيد جداً 👍', count: '4 جلسات', pct: 20, color: 'bg-teal-500' },
                { label: 'جيد 🌿', count: '2 جلسة', pct: 10, color: 'bg-amber-500' },
                { label: 'إعادة تسميع 🔄', count: '0 جلسات', pct: 0, color: 'bg-rose-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700 dark:text-stone-200">{item.label}</span>
                    <span className="text-stone-500">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
              <span>توجيهات الشيخ لتحسين أداء الحلقة</span>
            </h2>

            <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B]">
                <strong className="text-[#145A45] dark:text-[#E0C37B] block mb-0.5">
                  تثبيت الماضي القريب:
                </strong>
                يوصى بتخصيص ربع ساعة في بداية كل جلسة لمراجعة المحفوظ السابق قبل التسميع الجديد.
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B]">
                <strong className="text-[#145A45] dark:text-[#E0C37B] block mb-0.5">
                  التحفيز بدون ضغط:
                </strong>
                تشجيع الطلاب الذين توقفوا لأيام قليلة بخطة عودة مرنة بدلاً من مراكمة الواجبات.
              </div>
            </div>
          </div>
        </div>
      </div>
    </SheikhAppShell>
  );
}
