'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useQuranApp } from '@/context/QuranAppContext';
import { WelcomeBackCard } from '@/components/dashboard/WelcomeBackCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatQuranRange, getSurah, TOTAL_AYAH_COUNT, TOTAL_SURAHS, TOTAL_JUZ } from '@/data/quranData';
import { getRandomQuote, MOTIVATIONAL_QUOTES, MotivationalQuote } from '@/data/motivationalData';
import {
  BookOpen,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  Bookmark,
  BarChart3,
  Plus,
  Play,
  ArrowUpRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
  HeartHandshake
} from 'lucide-react';

interface CategorizedTask {
  id: string;
  rangeText: string;
  dateText: string;
  category: 'not_recited' | 'repeat' | 'revision' | 'overdue';
  categoryLabel: string;
  typeLabel: string;
  priority: 'urgent' | 'high' | 'medium';
  priorityLabel: string;
  link: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    stats,
    currentAssignment,
    outstandingTasks,
    revisionDueToday,
    overdueRevision,
    lessons,
    updateAssignmentStatus
  } = useQuranApp();

  const [quote, setQuote] = useState<MotivationalQuote>(MOTIVATIONAL_QUOTES[0]);
  const [religiousQuote, setReligiousQuote] = useState<MotivationalQuote>(MOTIVATIONAL_QUOTES[0]);
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | 'not_recited' | 'repeat' | 'revision' | 'overdue'>('all');

  React.useEffect(() => {
    setQuote(getRandomQuote('personal_egyptian'));
    setReligiousQuote(getRandomQuote('religious'));
  }, []);

  const lastLesson = lessons[0];

  // Group outstanding tasks into the 4 distinct categories specified in requirements
  const categorizedTasks = useMemo<CategorizedTask[]>(() => {
    const list: CategorizedTask[] = [];

    // 1. Overdue reviews
    for (const r of overdueRevision) {
      list.push({
        id: `overdue-${r.id}`,
        rangeText: formatQuranRange(r.start_surah, r.start_ayah, r.end_surah, r.end_ayah),
        dateText: r.next_review_date || r.session_date,
        category: 'overdue',
        categoryLabel: 'متأخر عن موعده',
        typeLabel: 'مراجعة دورية متأخرة',
        priority: 'urgent',
        priorityLabel: 'متأخر - بادر به',
        link: `/revision/session?surah=${r.start_surah}&start=${r.start_ayah}&endSurah=${r.end_surah}&endAyah=${r.end_ayah}`
      });
    }

    // 2. Needs re-recitation
    for (const t of outstandingTasks.filter(
      (a) => a.status === 'needs_repetition' || a.assignment_type === 'repetition'
    )) {
      list.push({
        id: t.id,
        rangeText: formatQuranRange(t.start_surah, t.start_ayah, t.end_surah, t.end_ayah),
        dateText: new Date(t.assigned_at).toLocaleDateString('ar-EG'),
        category: 'repeat',
        categoryLabel: 'بحاجة لإعادة تسميع',
        typeLabel: 'طلب الشيخ إعادته وتثبيته',
        priority: 'urgent',
        priorityLabel: 'عاجل للحلقة',
        link: `/memorization/${t.id}`
      });
    }

    // 3. Not yet recited
    for (const t of outstandingTasks.filter(
      (a) => a.status === 'ready_for_recitation' || (a.status === 'in_progress' && a.assignment_type === 'new_memorization')
    )) {
      list.push({
        id: t.id,
        rangeText: formatQuranRange(t.start_surah, t.start_ayah, t.end_surah, t.end_ayah),
        dateText: new Date(t.assigned_at).toLocaleDateString('ar-EG'),
        category: 'not_recited',
        categoryLabel: 'لم يُسمّع بعد',
        typeLabel: t.status === 'ready_for_recitation' ? 'جاهز للعرض على الشيخ' : 'واجب جديد قيد الحفظ',
        priority: 'high',
        priorityLabel: 'أولوية مرتفعة',
        link: `/memorization/${t.id}`
      });
    }

    // 4. Needs revision
    for (const t of outstandingTasks.filter(
      (a) => a.assignment_type === 'revision' || a.assignment_type === 'previous_memorization'
    )) {
      list.push({
        id: t.id,
        rangeText: formatQuranRange(t.start_surah, t.start_ayah, t.end_surah, t.end_ayah),
        dateText: new Date(t.assigned_at).toLocaleDateString('ar-EG'),
        category: 'revision',
        categoryLabel: 'بحاجة لمراجعة',
        typeLabel: 'حفظ سابق وتعهد',
        priority: 'medium',
        priorityLabel: 'تثبيت ومراجعة',
        link: `/memorization/${t.id}`
      });
    }

    return list;
  }, [outstandingTasks, overdueRevision]);

  const filteredCategorizedTasks = useMemo<CategorizedTask[]>(() => {
    if (taskCategoryFilter === 'all') return categorizedTasks;
    return categorizedTasks.filter((t: CategorizedTask) => t.category === taskCategoryFilter);
  }, [categorizedTasks, taskCategoryFilter]);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Back Card (if inactive for days) */}
        <WelcomeBackCard />

        {/* Motivational Greeting Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#145A45] text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-xs font-semibold text-[#A6B89D] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C7A75B]" />
                <span>رسالة رفيقك القرآني اليوم:</span>
              </span>
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-r border-white/20 pt-3 sm:pt-0 sm:pr-6 shrink-0">
              <span className="text-xs text-[#A6B89D]">المحفوظ حتى الآن</span>
              <span className="text-2xl sm:text-3xl font-black text-[#C7A75B]">
                {stats.memorizedPercentage}%
              </span>
              <span className="text-[11px] text-stone-300">
                {stats.memorizedAyahsCount} من {TOTAL_AYAH_COUNT} آية
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/memorization/new"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] hover:border-[#145A45] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              إضافة حفظ
            </span>
          </Link>

          <Link
            href="/lessons/new"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] hover:border-[#145A45] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              تسجيل جلسة شيخ
            </span>
          </Link>

          <Link
            href="/revision/session"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] hover:border-[#145A45] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              بدء مراجعة
            </span>
          </Link>

          <Link
            href="/reading"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] hover:border-[#145A45] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              ورد التلاوة
            </span>
          </Link>

          <Link
            href="/quran"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] hover:border-[#145A45] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              خريطة المصحف
            </span>
          </Link>

          <Link
            href="/statistics"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] hover:border-[#145A45] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              الإحصائيات
            </span>
          </Link>
        </div>

        {/* Section A: Overall Quran Progress Detailed Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#145A45] dark:text-[#C7A75B]" />
                <span>إجمالي التقدم في القرآن الكريم</span>
              </h2>
              <p className="text-xs text-stone-500">
                حساب دقيق لعدد الآيات والسور والأجزاء وفق مصحف حفص عن عاصم (6236 آية).
              </p>
            </div>

            <Link
              href="/quran"
              className="text-xs font-bold text-[#145A45] dark:text-[#C7A75B] hover:underline flex items-center gap-1"
            >
              <span>عرض الخريطة التفاعلية</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-700 dark:text-stone-300">
                نسبة إنجاز المصحف: {stats.memorizedPercentage}%
              </span>
              <span className="text-[#145A45] dark:text-[#C7A75B]">
                {stats.memorizedAyahsCount} / {TOTAL_AYAH_COUNT} آية
              </span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-3.5 rounded-full overflow-hidden flex">
              {/* Confirmed Mastered (Emerald) */}
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${(stats.masteredAyahsCount / TOTAL_AYAH_COUNT) * 100}%` }}
                title={`المتقن: ${stats.masteredAyahsCount} آية`}
              />
              {/* Memorized / Recited (Teal) */}
              <div
                className="bg-teal-500 h-full transition-all duration-500"
                style={{
                  width: `${
                    ((stats.memorizedAyahsCount - stats.masteredAyahsCount) / TOTAL_AYAH_COUNT) * 100
                  }%`
                }}
                title={`تم تسميعه: ${stats.memorizedAyahsCount - stats.masteredAyahsCount} آية`}
              />
              {/* Currently Learning (Amber) */}
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${(stats.learningAyahsCount / TOTAL_AYAH_COUNT) * 100}%` }}
                title={`قيد الحفظ: ${stats.learningAyahsCount} آية`}
              />
            </div>
          </div>

          {/* 4 Distinct Measurement Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>متقَن ومثبَّت ⭐</span>
              </div>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {stats.masteredAyahsCount}
              </p>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">
                {stats.masteredPercentage}% من القرآن
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
              <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>تم تسميعه ✅</span>
              </div>
              <p className="text-xl font-black text-teal-700 dark:text-teal-300">
                {stats.memorizedAyahsCount}
              </p>
              <p className="text-[11px] text-teal-600/80 mt-0.5">
                {stats.memorizedPercentage}% إجمالي التسميع
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>قيد الحفظ 🌱</span>
              </div>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                {stats.learningAyahsCount}
              </p>
              <p className="text-[11px] text-amber-600/80 mt-0.5">آيات جاري ضبطها</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                <span>المتبقي ⏳</span>
              </div>
              <p className="text-xl font-black text-stone-700 dark:text-stone-300">
                {stats.remainingAyahsCount}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {((stats.remainingAyahsCount / TOTAL_AYAH_COUNT) * 100).toFixed(1)}% من القرآن
              </p>
            </div>
          </div>

          {/* Juz and Surahs Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#E6E4DC] dark:border-[#1F3B32] text-xs text-stone-600 dark:text-stone-300">
            <div>
              <span>الأجزاء المكتملة: </span>
              <strong className="text-[#145A45] dark:text-[#C7A75B]">
                {stats.completedJuzCount} / {TOTAL_JUZ}
              </strong>
            </div>
            <div>
              <span>الأجزاء المتبقية: </span>
              <strong>{stats.remainingJuzCount} جزء</strong>
            </div>
            <div>
              <span>السور المكتملة: </span>
              <strong className="text-[#145A45] dark:text-[#C7A75B]">
                {stats.completedSurahsCount} / {TOTAL_SURAHS}
              </strong>
            </div>
            <div>
              <span>السور المتبقية: </span>
              <strong>{stats.remainingSurahsCount} سورة</strong>
            </div>
          </div>
        </div>

        {/* Section B & C Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section B: Current New Memorization Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#145A45] dark:text-[#C7A75B]" />
                <span>الحفظ الجديد (الواجب الحالي)</span>
              </h2>
              {currentAssignment && <StatusBadge status={currentAssignment.status} size="sm" />}
            </div>

            {currentAssignment ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2">
                  <span className="text-xs font-semibold text-stone-400 block">
                    المقطع المطلوب حفظه:
                  </span>
                  <h3 className="text-base font-bold text-[#252B27] dark:text-[#EDF3EF]">
                    {formatQuranRange(
                      currentAssignment.start_surah,
                      currentAssignment.start_ayah,
                      currentAssignment.end_surah,
                      currentAssignment.end_ayah
                    )}
                  </h3>
                  {currentAssignment.notes && (
                    <p className="text-xs text-stone-500 italic">
                      &ldquo;{currentAssignment.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Quick Status Updater */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-stone-500">تغيير الحالة:</span>
                  <button
                    onClick={() => updateAssignmentStatus(currentAssignment.id, 'ready_for_recitation')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                  >
                    جاهز للتسميع 📢
                  </button>
                  <button
                    onClick={() => updateAssignmentStatus(currentAssignment.id, 'recited')}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold"
                  >
                    تم التسميع مع الشيخ ✅
                  </button>
                  <button
                    onClick={() => updateAssignmentStatus(currentAssignment.id, 'mastered')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold"
                  >
                    تم الإتقان ⭐
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
                  <Link
                    href={`/memorization/${currentAssignment.id}`}
                    className="text-xs text-[#145A45] dark:text-[#C7A75B] font-bold hover:underline"
                  >
                    تعديل المقطع أو الملاحظات
                  </Link>
                  <Link
                    href="/memorization/new"
                    className="text-xs text-stone-500 hover:text-stone-800 font-medium"
                  >
                    + إضافة واجب جديد
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] space-y-3">
                <p className="text-xs text-stone-500">
                  لا يوجد واجب حفظ جديد مسجل حالياً. هل كلّفك الشيخ بمقطع جديد؟
                </p>
                <Link
                  href="/memorization/new"
                  className="inline-block px-4 py-2 rounded-xl bg-[#145A45] text-white text-xs font-bold"
                >
                  تسجيل واجب حفظ جديد
                </Link>
              </div>
            )}
          </div>

          {/* Section C: Outstanding Tasks Grouped into 4 Canonical Categories */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-[#145A45] dark:text-[#A6B89D]">
                  المعلقات والتكليفات السابقة
                </h2>
                <span className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {categorizedTasks.length}
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                مقسمة حسب الأولوية والتكليف الشرعي
              </span>
            </div>

            {/* 4 Categorical Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `الكل (${categorizedTasks.length})` },
                {
                  id: 'not_recited',
                  label: `لم يُسمّع بعد (${categorizedTasks.filter((t: CategorizedTask) => t.category === 'not_recited').length})`
                },
                {
                  id: 'repeat',
                  label: `إعادة تسميع (${categorizedTasks.filter((t: CategorizedTask) => t.category === 'repeat').length})`
                },
                {
                  id: 'revision',
                  label: `بحاجة لمراجعة (${categorizedTasks.filter((t: CategorizedTask) => t.category === 'revision').length})`
                },
                {
                  id: 'overdue',
                  label: `متأخر (${categorizedTasks.filter((t: CategorizedTask) => t.category === 'overdue').length})`
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTaskCategoryFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition-colors font-medium ${
                    taskCategoryFilter === tab.id
                      ? 'bg-[#145A45] text-white shadow-xs'
                      : 'bg-stone-50 dark:bg-[#0B1914] text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filteredCategorizedTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto stroke-1" />
                <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                  {taskCategoryFilter === 'all'
                    ? 'ما شاء الله! لا توجد عليك أي واجبات معلقة أو مقاطع متأخرة.'
                    : 'لا توجد عناصر في هذا التصنيف حالياً.'}
                </p>
                <p className="text-[11px] text-stone-400">
                  كل ما عليك الآن هو تثبيت ما حفظته أو الاستعداد للحفظ الجديد.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                {filteredCategorizedTasks.map((task: CategorizedTask) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] flex items-center justify-between text-xs gap-3 hover:border-[#145A45]/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                          {task.rangeText}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              : task.priority === 'high'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {task.priorityLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                        <span className="text-[#145A45] dark:text-[#C7A75B] font-medium">
                          {task.typeLabel}
                        </span>
                        <span>•</span>
                        <span>تاريخ الإسناد: {task.dateText}</span>
                      </div>
                    </div>

                    <Link
                      href={task.link}
                      className="px-3 py-1.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shrink-0 transition-colors"
                    >
                      متابعة
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section D: Today's Suggested Flexible Plan */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#145A45] dark:text-[#C7A75B]" />
              <span>خطة اليوم المقترحة (مرنة وبدون ضغط)</span>
            </h2>
            <span className="text-xs text-stone-400">اختر ما يناسب وقتك وطاقتك</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#145A45] dark:text-[#C7A75B]">
                <span>1. ورد المراجعة السريعة</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {revisionDueToday.length > 0
                  ? `مراجعة ${formatQuranRange(
                      revisionDueToday[0].start_surah,
                      revisionDueToday[0].start_ayah,
                      revisionDueToday[0].end_surah,
                      revisionDueToday[0].end_ayah
                    )}`
                  : 'مراجعة وجه أو وجهين من المحفوظ القديم لتثبيته.'}
              </p>
              <Link
                href="/revision/session"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#145A45] dark:text-[#C7A75B] hover:underline pt-1"
              >
                <span>بدء المراجعة</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                <span>2. خطوة في الحفظ الجديد</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {currentAssignment
                  ? `تكرار 3 إلى 5 آيات من ${formatQuranRange(
                      currentAssignment.start_surah,
                      currentAssignment.start_ayah,
                      currentAssignment.end_surah,
                      currentAssignment.end_ayah
                    )}`
                  : 'قراءة الوجه القادم ثلاث مرات بتأنٍ.'}
              </p>
              <Link
                href="/memorization"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline pt-1"
              >
                <span>تفاصيل الحفظ</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <span>3. ورد التلاوة اليومي</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                تلاوة حزب أو جزء نظراً لترطيب اللسان بذكر الله وكسب أجر الحروف.
              </p>
              <Link
                href="/reading"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline pt-1"
              >
                <span>تسجيل ورد التلاوة</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Verified Hadith / Quranic Reminder Section */}
        <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-stone-800 dark:text-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-700" />
              <span>من هدي النبوة وفضائل القرآن الكريم (حديث صحيح موثق):</span>
            </span>
            <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              {religiousQuote.authenticityStatus || 'حديث صحيح'}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-quran text-amber-950 dark:text-amber-100 font-semibold leading-relaxed">
            &ldquo;{religiousQuote.text}&rdquo;
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            المصدر: {religiousQuote.sourceReference}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
