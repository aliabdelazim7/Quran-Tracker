'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { EvaluationBadge } from '@/components/ui/EvaluationBadge';
import { formatQuranRange } from '@/data/quranData';
import { ArrowRight, Calendar, Clock, Trash2, Edit3, Check, X, BookOpen } from 'lucide-react';
import { SheikhEvaluation, LessonPassage } from '@/types/database';

function LessonDetailInner() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { lessons, updateLesson, deleteLesson } = useQuranApp();

  const lesson = lessons.find((l) => l.id === id);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [sheikhName, setSheikhName] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [overallNotes, setOverallNotes] = useState('');
  const [passages, setPassages] = useState<LessonPassage[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (lesson) {
      setSheikhName(lesson.sheikh_name);
      setLessonDate(lesson.lesson_date);
      setDurationMinutes(lesson.duration_minutes || 30);
      setOverallNotes(lesson.overall_notes || '');
      setPassages(lesson.passages || []);
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-4">
          <p className="text-stone-500 text-sm">لم يتم العثور على هذه الجلسة.</p>
          <Link href="/lessons" className="text-xs text-[#145A45] font-bold underline">
            العودة لجلسات الشيخ
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه الجلسة نهائياً؟')) {
      deleteLesson(lesson.id);
      router.push('/lessons');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheikhName.trim()) return;

    updateLesson(
      lesson.id,
      {
        sheikh_name: sheikhName.trim(),
        lesson_date: lessonDate,
        duration_minutes: durationMinutes,
        overall_notes: overallNotes.trim() || undefined
      },
      passages
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  const updatePassageField = (idx: number, field: keyof LessonPassage, value: any) => {
    setPassages((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لجلسات الشيخ</span>
        </Link>

        {/* Lesson Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] flex items-center justify-center text-xl">
                🕌
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#145A45] dark:text-[#A6B89D]">
                  {isEditing ? 'تعديل تفاصيل الجلسة' : `جلسة تسميع مع ${lesson.sheikh_name}`}
                </h1>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(lesson.lesson_date).toLocaleDateString('ar-EG', {
                      weekday: 'long',
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

            <div className="flex items-center gap-1.5">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-stone-500 hover:text-[#145A45] dark:hover:text-[#C7A75B] rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    title="تعديل تفاصيل الجلسة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="حذف الجلسة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
                  title="إلغاء التعديل"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            /* Editing Form */
            <form onSubmit={handleSave} className="space-y-5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-600 dark:text-stone-300 block mb-1 font-medium">
                    اسم الشيخ / الحلقة
                  </label>
                  <input
                    type="text"
                    required
                    value={sheikhName}
                    onChange={(e) => setSheikhName(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-600 dark:text-stone-300 block mb-1 font-medium">
                    تاريخ الجلسة
                  </label>
                  <input
                    type="date"
                    required
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-600 dark:text-stone-300 block mb-1 font-medium">
                    مدة الجلسة (دقائق)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Edit Passages */}
              <div className="space-y-3 pt-3 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  تعديل تقييمات المقاطع والملاحظات:
                </h3>
                {passages.map((p, idx) => {
                  const range = formatQuranRange(p.start_surah, p.start_ayah, p.end_surah, p.end_ayah);
                  return (
                    <div
                      key={p.id || idx}
                      className="p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 dark:text-stone-200">{range}</span>
                        <select
                          value={p.evaluation}
                          onChange={(e) => updatePassageField(idx, 'evaluation', e.target.value as SheikhEvaluation)}
                          className="rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] text-stone-900 dark:text-stone-100 px-2 py-1 text-xs font-semibold"
                        >
                          <option value="excellent">ممتاز ⭐</option>
                          <option value="very_good">جيد جداً 👍</option>
                          <option value="good">جيد ✨</option>
                          <option value="needs_improvement">يحتاج تدريب ⚠️</option>
                          <option value="repeat_required">إعادة مطلوبة 🔄</option>
                        </select>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="ملاحظات الشيخ على هذا المقطع..."
                          value={p.notes || ''}
                          onChange={(e) => updatePassageField(idx, 'notes', e.target.value)}
                          className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-3 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Notes */}
              <div>
                <label className="text-xs text-stone-600 dark:text-stone-300 block mb-1 font-medium">
                  ملاحظات وتوجيهات عامة من الشيخ
                </label>
                <textarea
                  rows={2}
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold transition-all shadow-xs"
                >
                  {saveSuccess ? 'تم حفظ التعديل ✅' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              {/* Passages List */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  المقاطع المسجلة في هذه الجلسة ({lesson.passages?.length || 0}):
                </h2>
                <div className="space-y-3">
                  {lesson.passages?.map((passage, idx) => {
                    const range = formatQuranRange(
                      passage.start_surah,
                      passage.start_ayah,
                      passage.end_surah,
                      passage.end_ayah
                    );

                    return (
                      <div
                        key={passage.id || idx}
                        className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#252B27] dark:text-[#EDF3EF]">
                            {range}
                          </span>
                          <EvaluationBadge evaluation={passage.evaluation} />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>النوع:</span>
                          <span className="font-medium text-stone-700 dark:text-stone-300">
                            {passage.passage_type === 'new_memorization'
                              ? 'حفظ جديد'
                              : passage.passage_type === 'revision'
                              ? 'مراجعة دورية'
                              : 'ماضٍ قريب'}
                          </span>
                        </div>

                        {passage.notes && (
                          <p className="text-xs text-stone-600 dark:text-stone-300 bg-white dark:bg-[#11251E] p-2.5 rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32]">
                            {passage.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Notes */}
              {lesson.overall_notes && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 space-y-1">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                    ملاحظات وتوجيهات عامة:
                  </span>
                  <p className="text-xs text-amber-900/90 dark:text-amber-200/90">
                    {lesson.overall_notes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function LessonDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0B1914]">
          <span className="text-xs font-semibold text-[#145A45]">جارٍ التحميل...</span>
        </div>
      }
    >
      <LessonDetailInner />
    </Suspense>
  );
}
