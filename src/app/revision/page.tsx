'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { EvaluationBadge } from '@/components/ui/EvaluationBadge';
import { formatQuranRange } from '@/data/quranData';
import { RotateCcw, Play, Calendar, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default function RevisionPage() {
  const { revisionSessions, revisionDueToday, overdueRevision } = useQuranApp();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>المراجعة والتثبيت المستمر</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              &ldquo;تعاهدوا هذا القرآن، فوالذي نفسي بيده لهو أشد تفلتاً من الإبل في عقلها&rdquo;
            </p>
          </div>

          <Link
            href="/revision/session"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>بدء جلسة مراجعة الآن (مع المؤقت)</span>
          </Link>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                مراجعات مستحقة اليوم
              </span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1">
              {revisionDueToday.length}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                مراجعات متأخرة
              </span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-800 dark:text-rose-200 mt-1">
              {overdueRevision.length}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                إجمالي الجلسات المنجزة
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
              {revisionSessions.length}
            </p>
          </div>
        </div>

        {/* Due Today & Overdue List */}
        {(overdueRevision.length > 0 || revisionDueToday.length > 0) && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11251E] border border-amber-300 dark:border-amber-800/50 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <span>🔔 مقاطع يُوصى بمراجعتها الآن لتثبيتها:</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[...overdueRevision, ...revisionDueToday].map((item) => {
                const range = formatQuranRange(
                  item.start_surah,
                  item.start_ayah,
                  item.end_surah,
                  item.end_ayah
                );

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                        {range}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        آخر مراجعة: {item.session_date}
                      </span>
                    </div>
                    <Link
                      href={`/revision/session?surah=${item.start_surah}&start=${item.start_ayah}&endSurah=${item.end_surah}&end=${item.end_ayah}`}
                      className="px-3 py-1 rounded-lg bg-[#145A45] text-white text-xs font-semibold hover:bg-[#1b6f57]"
                    >
                      راجع الآن
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Revision History */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
            سجل جلسات المراجعة السابقة ({revisionSessions.length}):
          </h2>

          {revisionSessions.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-dashed border-[#E6E4DC] dark:border-[#1F3B32] bg-white/50 dark:bg-[#11251E]/50 space-y-3">
              <RotateCcw className="w-8 h-8 text-stone-400 mx-auto stroke-1" />
              <p className="text-xs text-stone-500">
                لم تسجل أي جلسة مراجعة بعد. ابدأ أول جلسة مع المؤقت والتقييم الذاتي.
              </p>
              <Link
                href="/revision/session"
                className="inline-block px-4 py-2 rounded-xl bg-[#145A45] text-white text-xs font-bold"
              >
                بدء جلسة مراجعة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {revisionSessions.map((session) => {
                const range = formatQuranRange(
                  session.start_surah,
                  session.start_ayah,
                  session.end_surah,
                  session.end_ayah
                );

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                          {range}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {session.session_date}
                          </span>
                          {session.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration_minutes} دقيقة
                            </span>
                          )}
                        </div>
                      </div>
                      <EvaluationBadge evaluation={session.evaluation} size="sm" type="revision" />
                    </div>

                    {session.notes && (
                      <p className="text-xs text-stone-500 bg-[#F8F7F2] dark:bg-[#0B1914] p-2 rounded-lg">
                        {session.notes}
                      </p>
                    )}

                    {session.next_review_date && (
                      <p className="text-[11px] text-[#145A45] dark:text-[#C7A75B] font-medium pt-1">
                        المراجعة القادمة المقترحة: {session.next_review_date}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
