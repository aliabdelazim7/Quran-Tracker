'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';
import { formatQuranRange, getRangeAyahCount, SURAHS } from '@/data/quranData';
import { Bookmark, Plus, Calendar, Clock, Check, BookOpen } from 'lucide-react';

export default function ReadingTrackerPage() {
  const { readingSessions, addReadingSession } = useQuranApp();

  const [sessionDate, setSessionDate] = useState('2026-11-24');

  useEffect(() => {
    setSessionDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [startSurah, setStartSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(2);
  const [endAyah, setEndAyah] = useState(25);
  const [notes, setNotes] = useState('');
  const [ayahCount, setAyahCount] = useState(32);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addReadingSession({
      start_surah: startSurah,
      start_ayah: startAyah,
      end_surah: endSurah,
      end_ayah: endAyah,
      session_date: sessionDate,
      duration_minutes: durationMinutes,
      notes: notes.trim() || null
    });

    setShowAddForm(false);
    setNotes('');
  };

  // Compute total reading stats
  const totalReadingAyahs = readingSessions.reduce((acc, curr) => {
    return acc + getRangeAyahCount(curr.start_surah, curr.start_ayah, curr.end_surah, curr.end_ayah);
  }, 0);

  const totalReadingMinutes = readingSessions.reduce(
    (acc, curr) => acc + (curr.duration_minutes || 0),
    0
  );

  const readingDaysCount = new Set(readingSessions.map((s) => s.session_date)).size;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>متابعة ورد التلاوة والقراءة</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              متابعة تلاوة القرآن الكريم وتدبره (منفصلة تماماً عن الحفظ التسميعي مع الشيخ).
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'إلغاء' : 'تسجيل ورد تلاوة جديد'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">إجمالي الآيات المتلوة</span>
            <p className="text-xl font-bold text-[#145A45] dark:text-[#C7A75B] mt-1">
              {totalReadingAyahs} آية
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">جلسات التلاوة</span>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {readingSessions.length} جلسة
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">أيام التلاوة النشطة</span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {readingDaysCount} يوم
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs text-stone-500">مجموع دقائق القراءة</span>
            <p className="text-xl font-bold text-stone-700 dark:text-stone-300 mt-1">
              {totalReadingMinutes} دقيقة
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-sm space-y-4 animate-in fade-in duration-150"
          >
            <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              تسجيل ورد التلاوة اليومي:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 block mb-1">تاريخ التلاوة</label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-stone-600 block mb-1">المدة بالدقائق</label>
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value || '20', 10))}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>
            </div>

            <QuranRangeSelector
              startSurah={startSurah}
              startAyah={startAyah}
              endSurah={endSurah}
              endAyah={endAyah}
              onChange={(r) => {
                setStartSurah(r.startSurah);
                setStartAyah(r.startAyah);
                setEndSurah(r.endSurah);
                setEndAyah(r.endAyah);
                setAyahCount(r.ayahCount);
              }}
            />

            <div>
              <label className="text-xs text-stone-600 block mb-1">خواطر وتدبرات (اختياري)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="آية استوقفتك أو أثرت في قلبك أثناء التلاوة..."
                className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] p-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#145A45] text-white text-xs font-bold"
              >
                حفظ ورد التلاوة
              </button>
            </div>
          </form>
        )}

        {/* Sessions Timeline */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
            أوراد التلاوة السابقة:
          </h2>

          {readingSessions.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-dashed border-[#E6E4DC] dark:border-[#1F3B32] bg-white/50 dark:bg-[#11251E]/50 space-y-2">
              <BookOpen className="w-8 h-8 text-stone-400 mx-auto stroke-1" />
              <p className="text-xs text-stone-500">
                لم تسجل أي ورد تلاوة بعد. اضغط على زر &quot;تسجيل ورد تلاوة جديد&quot; لتوثيق قراءتك.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {readingSessions.map((session) => {
                const range = formatQuranRange(
                  session.start_surah,
                  session.start_ayah,
                  session.end_surah,
                  session.end_ayah
                );

                const count = getRangeAyahCount(
                  session.start_surah,
                  session.start_ayah,
                  session.end_surah,
                  session.end_ayah
                );

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {range}
                      </span>
                      <span className="text-xs bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] px-2 py-0.5 rounded-full font-bold">
                        {count} آية
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500">
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

                    {session.notes && (
                      <p className="text-xs text-stone-500 italic bg-[#F8F7F2] dark:bg-[#0B1914] p-2 rounded-lg">
                        &ldquo;{session.notes}&rdquo;
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
