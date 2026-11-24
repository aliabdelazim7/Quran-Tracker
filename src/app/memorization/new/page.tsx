'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';
import { AssignmentType, MemorizationStatus } from '@/types/database';
import { ArrowRight, Plus, Check } from 'lucide-react';
import { formatQuranRange, SURAHS } from '@/data/quranData';

export default function NewMemorizationPage() {
  const router = useRouter();
  const { addAssignment, bulkUpdateRangeProgress } = useQuranApp();

  const [title, setTitle] = useState('');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('new_memorization');
  const [status, setStatus] = useState<MemorizationStatus>('in_progress');
  const [startSurah, setStartSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);
  const [notes, setNotes] = useState('');
  const [ayahCount, setAyahCount] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rangeTitle =
      title.trim() ||
      `${assignmentType === 'new_memorization' ? 'حفظ' : 'مراجعة'} ${formatQuranRange(
        startSurah,
        startAyah,
        endSurah,
        endAyah
      )}`;

    // 1. Add assignment
    addAssignment({
      assignment_type: assignmentType,
      start_surah: startSurah,
      start_ayah: startAyah,
      end_surah: endSurah,
      end_ayah: endAyah,
      title: rangeTitle,
      status,
      notes: notes.trim() || null
    });

    // 2. Also update progress in user_ayah_progress
    bulkUpdateRangeProgress(
      startSurah,
      startAyah,
      endSurah,
      endAyah,
      status,
      notes.trim() || undefined
    );

    router.push('/memorization');
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/memorization"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لقائمة الحفظ والواجبات</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D]">
            إضافة واجب أو مقطع حفظ جديد
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            سواء كان تكليفاً من الشيخ في الحلقة، أو خطتك الشخصية للتثبيت والحفظ.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-sm space-y-6"
        >
          {/* Assignment Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              نوع التكليف
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'new_memorization', label: 'حفظ جديد' },
                { id: 'previous_memorization', label: 'حفظ سابق' },
                { id: 'revision', label: 'مراجعة دورية' },
                { id: 'repetition', label: 'إعادة وتكرار' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAssignmentType(t.id as AssignmentType)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    assignmentType === t.id
                      ? 'border-[#145A45] bg-[#145A45] text-white shadow-xs'
                      : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              عنوان التكليف (اختياري)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الربع الأول من سورة البقرة"
              className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-4 py-2.5 text-xs text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
            />
          </div>

          {/* Quran Range Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              تحديد الآيات بدقة:
            </label>
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
          </div>

          {/* Initial Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              الحالة الحالية
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'in_progress', label: 'قيد الحفظ 🌱' },
                { id: 'ready_for_recitation', label: 'جاهز للتسميع 📢' },
                { id: 'recited', label: 'تم التسميع ✅' },
                { id: 'mastered', label: 'متقن ومثبت ⭐' },
                { id: 'needs_repetition', label: 'يحتاج إعادة 🔄' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id as MemorizationStatus)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    status === s.id
                      ? 'border-[#145A45] bg-[#145A45] text-white shadow-xs'
                      : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              ملاحظات الشيخ أو ملاحظات شخصية
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تنبيهات على أحكام التجويد، مواضع المتشابهات، أو تاريخ التسميع المتوقع..."
              className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] p-3 text-xs text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
            <Link
              href="/memorization"
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 text-xs font-semibold hover:bg-stone-50"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التكليف</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
