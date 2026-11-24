'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { EvaluationBadge } from '@/components/ui/EvaluationBadge';
import { formatQuranRange } from '@/data/quranData';
import { GraduationCap, Plus, Calendar, Clock, ArrowUpRight, Filter, BookOpen, Trash2 } from 'lucide-react';
import { LessonType } from '@/types/database';

export default function LessonsPage() {
  const { lessons, deleteLesson } = useQuranApp();
  const [filterType, setFilterType] = useState<'all' | LessonType>('all');

  const filtered = lessons.filter((l) => (filterType === 'all' ? true : l.lesson_type === filterType));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>جلسات وحلقات الشيخ</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              سجل كامل لحلقات التسميع مع الشيخ، تقييمات المقاطع، والتكليفات القادمة بدون التزام بجدول صارم.
            </p>
          </div>

          <Link
            href="/lessons/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل جلسة تسميع جديدة</span>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">إجمالي الجلسات المسجلة</span>
            <p className="text-xl font-bold text-[#145A45] dark:text-[#C7A75B] mt-1">
              {lessons.length} {lessons.length === 1 ? 'جلسة' : 'جلسات'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">جلسات هذا الشهر</span>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {
                lessons.filter((l) => {
                  const d = new Date(l.lesson_date);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length
              }
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] col-span-2 sm:col-span-1">
            <span className="text-xs text-stone-500">آخر موعد تسميع</span>
            <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mt-1.5">
              {lessons.length > 0
                ? new Date(lessons[0].lesson_date).toLocaleDateString('ar-EG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'لم تسجل بعد'}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {[
            { id: 'all', label: 'جميع الجلسات' },
            { id: 'new_memorization', label: 'حفظ جديد فقط' },
            { id: 'previous_memorization', label: 'محفوظ سابق' },
            { id: 'revision', label: 'مراجعة دورية' },
            { id: 'mixed', label: 'جلسة مشتركة' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
                filterType === item.id
                  ? 'bg-[#145A45] text-white'
                  : 'bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] text-stone-600 dark:text-stone-300 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Lessons Timeline List */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[#E6E4DC] dark:border-[#1F3B32] bg-white/50 dark:bg-[#11251E]/50 space-y-3">
            <GraduationCap className="w-10 h-10 text-stone-400 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
              لا توجد جلسات مسجلة حتى الآن
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              سجل أول جلسة تسميع لك مع الشيخ لتوثيق التقييمات وملاحظات الحفظ.
            </p>
            <Link
              href="/lessons/new"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#145A45] text-white text-xs font-bold"
            >
              تسجيل جلسة الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((lesson) => (
              <div
                key={lesson.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs hover:border-[#145A45] transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E4DC] dark:border-[#1F3B32] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] flex items-center justify-center font-bold text-base">
                      🕌
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#252B27] dark:text-[#EDF3EF]">
                        جلسة مع {lesson.sheikh_name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lesson.lesson_date).toLocaleDateString('ar-EG', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        {lesson.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {lesson.duration_minutes} دقيقة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 flex items-center gap-1"
                    >
                      <span>التفاصيل</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteLesson(lesson.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف الجلسة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recited Passages in this lesson */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400 block">
                    المقاطع التي تم تسميعها وتقييم الشيخ لها:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lesson.passages?.map((passage, pIdx) => {
                      const range = formatQuranRange(
                        passage.start_surah,
                        passage.start_ayah,
                        passage.end_surah,
                        passage.end_ayah
                      );

                      return (
                        <div
                          key={passage.id || pIdx}
                          className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                              {range}
                            </span>
                            <EvaluationBadge evaluation={passage.evaluation} size="sm" />
                          </div>
                          {passage.notes && (
                            <p className="text-[11px] text-stone-500 italic">
                              &ldquo;{passage.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall Notes */}
                {lesson.overall_notes && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-0.5">ملاحظات عامة من الشيخ:</span>
                    <p>{lesson.overall_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
