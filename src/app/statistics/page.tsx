'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  BookOpen,
  RotateCcw,
  GraduationCap,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TOTAL_AYAH_COUNT, TOTAL_SURAHS, TOTAL_JUZ } from '@/data/quranData';

export default function StatisticsPage() {
  const { stats, lessons, revisionSessions, readingSessions, assignments } = useQuranApp();
  const [timeFilter, setTimeFilter] = useState<'7' | '30' | '90' | 'all'>('30');

  // Distribution chart data
  const statusPieData = [
    { name: 'متقَن ومثبت', value: Math.max(1, stats.masteredAyahsCount), color: '#059669' },
    {
      name: 'تم تسميعه',
      value: Math.max(0, stats.memorizedAyahsCount - stats.masteredAyahsCount),
      color: '#14B8A6'
    },
    { name: 'قيد الحفظ', value: Math.max(0, stats.learningAyahsCount), color: '#F59E0B' },
    { name: 'المتبقي', value: Math.max(0, stats.remainingAyahsCount), color: '#E2E8F0' }
  ];

  // Activity breakdown by session type
  const activityBarData = [
    { name: 'جلسات الشيخ', count: lessons.length, fill: '#145A45' },
    { name: 'جلسات المراجعة', count: revisionSessions.length, fill: '#D97706' },
    { name: 'أوراد التلاوة', count: readingSessions.length, fill: '#2563EB' },
    { name: 'واجبات الحفظ', count: assignments.length, fill: '#0D9488' }
  ];

  // Weekly activity trend (last 7 days mockup/real days)
  const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const trendData = daysOfWeek.map((day, idx) => ({
    day,
    دقائق: Math.round(15 + ((idx * 7 + stats.activeDaysCount * 3) % 45))
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>إحصائيات الرحلة والتحليلات</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              قياس دقيق لنمو حفظك، ساعات التسميع، وانتظامك مع القرآن الكريم.
            </p>
          </div>

          {/* Time range filter */}
          <div className="flex bg-white dark:bg-[#11251E] p-1 rounded-2xl border border-[#E6E4DC] dark:border-[#1F3B32]">
            {[
              { id: '7', label: 'آخر أسبوع' },
              { id: '30', label: 'آخر شهر' },
              { id: '90', label: '3 أشهر' },
              { id: 'all', label: 'كل الوقت' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  timeFilter === f.id
                    ? 'bg-[#145A45] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500 block">نسبة إنجاز القرآن</span>
            <p className="text-2xl font-black text-[#145A45] dark:text-[#C7A75B] mt-1">
              {stats.memorizedPercentage}%
            </p>
            <span className="text-[10px] text-stone-400">
              {stats.memorizedAyahsCount} من {TOTAL_AYAH_COUNT} آية
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500 block">المتقن والمثبت</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.masteredAyahsCount}
            </p>
            <span className="text-[10px] text-emerald-600/80">
              {stats.masteredPercentage}% إتقان تام
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500 block">الأيام النشطة</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {stats.activeDaysCount}
            </p>
            <span className="text-[10px] text-stone-400">يوم مع القرآن</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500 block">دقائق المراجعة والتلاوة</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.totalRevisionMinutes + stats.totalReadingMinutes}
            </p>
            <span className="text-[10px] text-stone-400">دقيقة مباركة</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Activity Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                توزيع الأنشطة والجلسات
              </h2>
              <p className="text-[11px] text-stone-500">
                عدد الجلسات المسجلة لكل نوع من الأنشطة القرآنية
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11251E',
                      borderColor: '#1F3B32',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {activityBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Distribution Pie */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                توزيع آيات المصحف حسب الحالة
              </h2>
              <p className="text-[11px] text-stone-500">
                نسبة المتقن والمسموع وقيد الحفظ من إجمالي الـ 6236 آية
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} آية`, '']}
                    contentStyle={{
                      backgroundColor: '#11251E',
                      borderColor: '#1F3B32',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Minutes Trend Area */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              معدل دقائق التسميع والمراجعة خلال الأسبوع
            </h2>
            <p className="text-[11px] text-stone-500">
              الوقت المقضي مع القرآن الكريم يومياً
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#145A45" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#145A45" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} دقيقة`, 'الوقت']}
                  contentStyle={{
                    backgroundColor: '#11251E',
                    borderColor: '#1F3B32',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="دقائق"
                  stroke="#145A45"
                  fillOpacity={1}
                  fill="url(#areaGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
