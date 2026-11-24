'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatQuranRange, getRangeAyahCount, getSurah } from '@/data/quranData';
import { ArrowRight, Trash2, Check, Calendar, BookOpen, Clock, Edit3 } from 'lucide-react';
import { MemorizationStatus } from '@/types/database';


function MemorizationDetailInner() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { assignments, updateAssignmentStatus, deleteAssignment, bulkUpdateRangeProgress } = useQuranApp();

  const assignment = assignments.find((a) => a.id === id);

  const [currentStatus, setCurrentStatus] = useState<MemorizationStatus>(
    assignment?.status || 'in_progress'
  );
  const [notes, setNotes] = useState(assignment?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!assignment) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-4">
          <p className="text-stone-500 text-sm">لم يتم العثور على هذا الواجب القرآني.</p>
          <Link href="/memorization" className="text-xs text-[#145A45] font-bold underline">
            العودة لقائمة الواجبات
          </Link>
        </div>
      </AppShell>
    );
  }

  const rangeText = formatQuranRange(
    assignment.start_surah,
    assignment.start_ayah,
    assignment.end_surah,
    assignment.end_ayah
  );

  const ayahCount = getRangeAyahCount(
    assignment.start_surah,
    assignment.start_ayah,
    assignment.end_surah,
    assignment.end_ayah
  );

  const handleSave = () => {
    updateAssignmentStatus(assignment.id, currentStatus);
    bulkUpdateRangeProgress(
      assignment.start_surah,
      assignment.start_ayah,
      assignment.end_surah,
      assignment.end_ayah,
      currentStatus,
      notes || undefined
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا الواجب؟')) {
      deleteAssignment(assignment.id);
      router.push('/memorization');
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/memorization"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لقائمة الحفظ والواجبات</span>
        </Link>

        {/* Header Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-stone-400">
                {assignment.assignment_type === 'new_memorization'
                  ? 'حفظ جديد'
                  : assignment.assignment_type === 'revision'
                  ? 'مراجعة'
                  : 'إعادة وتثبيت'}
              </span>
              <h1 className="text-xl font-bold text-[#145A45] dark:text-[#A6B89D] mt-0.5">
                {assignment.title || rangeText}
              </h1>
            </div>
            <StatusBadge status={currentStatus} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E6E4DC] dark:border-[#1F3B32] text-xs">
            <div className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#0B1914]">
              <span className="text-stone-400 block text-[11px]">المقطع المحدد</span>
              <span className="font-bold text-[#145A45] dark:text-[#C7A75B] mt-0.5 block">
                {rangeText}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#0B1914]">
              <span className="text-stone-400 block text-[11px]">عدد الآيات</span>
              <span className="font-bold text-stone-700 dark:text-stone-300 mt-0.5 block">
                {ayahCount} آية
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#0B1914] col-span-2 sm:col-span-1">
              <span className="text-stone-400 block text-[11px]">تاريخ التسجيل</span>
              <span className="font-bold text-stone-700 dark:text-stone-300 mt-0.5 block">
                {new Date(assignment.assigned_at).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              تحديث حالة المقطع:
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
                  onClick={() => setCurrentStatus(s.id as MemorizationStatus)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    currentStatus === s.id
                      ? 'border-[#145A45] bg-[#145A45] text-white shadow-xs'
                      : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              الملاحظات والتوجيهات:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="سجل ملاحظات الشيخ أو مواضع التردد..."
              className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] p-3 text-xs text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف الواجب</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{savedSuccess ? 'تم الحفظ بنجاح!' : 'تحديث البيانات'}</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function MemorizationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0B1914]">
          <span className="text-xs font-semibold text-[#145A45]">جارٍ التحميل...</span>
        </div>
      }
    >
      <MemorizationDetailInner />
    </Suspense>
  );
}
