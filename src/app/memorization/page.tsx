'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatQuranRange, getSurah } from '@/data/quranData';
import { Plus, CheckCircle2, AlertCircle, Filter, BookOpen, Clock, Trash2, ArrowUpRight, Mic } from 'lucide-react';
import { MemorizationStatus } from '@/types/database';

export default function MemorizationPage() {
  const { assignments, updateAssignmentStatus, deleteAssignment, stats } = useQuranApp();
  const [filter, setFilter] = useState<'all' | MemorizationStatus>('all');

  const filtered = assignments.filter((a) => (filter === 'all' ? true : a.status === filter));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>إدارة الحفظ والواجبات</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              متابعة مواضع الحفظ الجديدة وتكليفات التسميع مع الشيخ وتثبيت المحفوظ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/student/recitation"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>التسميع الذكي</span>
            </Link>
            <Link
              href="/memorization/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة واجب / حفظ جديد</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">إجمالي الآيات المحفوظة</span>
            <p className="text-xl font-bold text-[#145A45] dark:text-[#C7A75B] mt-1">
              {stats.memorizedAyahsCount}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">المتقن والمثبت</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.masteredAyahsCount}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">قيد التعلم والحفظ</span>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats.learningAyahsCount}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">المتبقي من القرآن</span>
            <p className="text-xl font-bold text-stone-700 dark:text-stone-300 mt-1">
              {stats.remainingAyahsCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {[
            { id: 'all', label: 'الكل' },
            { id: 'in_progress', label: 'قيد الحفظ' },
            { id: 'ready_for_recitation', label: 'جاهز للتسميع' },
            { id: 'needs_repetition', label: 'يحتاج إعادة' },
            { id: 'recited', label: 'تم التسميع' },
            { id: 'mastered', label: 'متقن' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
                filter === item.id
                  ? 'bg-[#145A45] text-white'
                  : 'bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] text-stone-600 dark:text-stone-300 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[#E6E4DC] dark:border-[#1F3B32] bg-white/50 dark:bg-[#11251E]/50 space-y-3">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
              لا توجد واجبات أو مواضع حفظ مطابقة
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              اضغط على زر &quot;إضافة واجب / حفظ جديد&quot; لتسجيل المقطع الذي كلّفك به الشيخ أو قررت البدء به.
            </p>
            <Link
              href="/memorization/new"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#145A45] text-white text-xs font-bold"
            >
              إضافة مقطع الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const rangeText = formatQuranRange(
                item.start_surah,
                item.start_ayah,
                item.end_surah,
                item.end_ayah
              );

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs hover:border-[#145A45] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-400">
                        {item.assignment_type === 'new_memorization'
                          ? 'حفظ جديد'
                          : item.assignment_type === 'revision'
                          ? 'مراجعة'
                          : 'إعادة وتثبيت'}
                      </span>
                      <h3 className="text-sm font-bold text-[#252B27] dark:text-[#EDF3EF] mt-0.5">
                        {item.title || rangeText}
                      </h3>
                      <p className="text-xs text-[#145A45] dark:text-[#C7A75B] font-medium mt-0.5">
                        {rangeText}
                      </p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  {item.notes && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 bg-[#F8F7F2] dark:bg-[#0B1914] p-2.5 rounded-lg line-clamp-2">
                      {item.notes}
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E6E4DC] dark:border-[#1F3B32] text-xs">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.status}
                        onChange={(e) => updateAssignmentStatus(item.id, e.target.value as any)}
                        className="rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-2 py-1 text-xs text-stone-900 dark:text-stone-100 font-medium"
                      >
                        <option value="in_progress">قيد الحفظ</option>
                        <option value="ready_for_recitation">جاهز للتسميع</option>
                        <option value="recited">تم التسميع</option>
                        <option value="mastered">متقن ومثبت</option>
                        <option value="needs_repetition">يحتاج إعادة</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/student/recitation?surah=${item.start_surah}&from=${item.start_ayah}&to=${item.end_ayah}&assignmentId=${item.id}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition-colors text-xs"
                        title="تسميع ذكي مع المساعد"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>تسميع ذكي</span>
                      </Link>
                      <Link
                        href={`/memorization/${item.id}`}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 transition-colors"
                        title="تفاصيل"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الواجب نهائياً؟')) {
                            deleteAssignment(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
