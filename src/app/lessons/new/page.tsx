'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';
import { SheikhEvaluation, AssignmentType, LessonType } from '@/types/database';
import { ArrowRight, Plus, Trash2, Check, GraduationCap, Sparkles } from 'lucide-react';
import { formatQuranRange, SURAHS } from '@/data/quranData';

interface PassageInput {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  passageType: AssignmentType;
  evaluation: SheikhEvaluation;
  notes: string;
}

export default function NewLessonPage() {
  const router = useRouter();
  const { addLesson, currentAssignment } = useQuranApp();

  const [lessonDate, setLessonDate] = useState('2026-11-24');

  useEffect(() => {
    setLessonDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [sheikhName, setSheikhName] = useState('الشيخ');
  const [lessonType, setLessonType] = useState<LessonType>('mixed');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [overallNotes, setOverallNotes] = useState('');

  // Default passages (prefilled with current active assignment if available!)
  const [passages, setPassages] = useState<PassageInput[]>([
    {
      startSurah: currentAssignment?.start_surah || 1,
      startAyah: currentAssignment?.start_ayah || 1,
      endSurah: currentAssignment?.end_surah || 1,
      endAyah: currentAssignment?.end_ayah || 7,
      passageType: 'new_memorization',
      evaluation: 'excellent',
      notes: ''
    }
  ]);

  // Next assignment from Sheikh
  const [hasNextAssignment, setHasNextAssignment] = useState(true);
  const [nextSurah, setNextSurah] = useState(2);
  const [nextStartAyah, setNextStartAyah] = useState(1);
  const [nextEndAyah, setNextEndAyah] = useState(25);
  const [nextNotes, setNextNotes] = useState('');

  const addPassage = () => {
    setPassages((prev) => [
      ...prev,
      {
        startSurah: 1,
        startAyah: 1,
        endSurah: 1,
        endAyah: 7,
        passageType: 'revision',
        evaluation: 'very_good',
        notes: ''
      }
    ]);
  };

  const removePassage = (index: number) => {
    if (passages.length > 1) {
      setPassages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updatePassage = (index: number, updates: Partial<PassageInput>) => {
    setPassages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lessonData = {
      lesson_date: lessonDate,
      lesson_type: lessonType,
      sheikh_name: sheikhName.trim() || 'الشيخ',
      duration_minutes: durationMinutes,
      overall_notes: overallNotes.trim() || null
    };

    const passagesData = passages.map((p) => ({
      start_surah: p.startSurah,
      start_ayah: p.startAyah,
      end_surah: p.endSurah,
      end_ayah: p.endAyah,
      passage_type: p.passageType,
      evaluation: p.evaluation,
      notes: p.notes.trim() || null
    }));

    const nextAss = hasNextAssignment
      ? {
          startSurah: nextSurah,
          startAyah: nextStartAyah,
          endSurah: nextSurah,
          endAyah: nextEndAyah,
          title: `واجب من ${sheikhName}: ${formatQuranRange(nextSurah, nextStartAyah, nextSurah, nextEndAyah)}`,
          notes: nextNotes.trim() || undefined
        }
      : undefined;

    addLesson(lessonData, passagesData, nextAss);
    router.push('/lessons');
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لجلسات الشيخ</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
            <span>توثيق جلسة تسميع مع الشيخ</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            سجل المقاطع التي سمعتها، تقييم الشيخ لكل مقطع على حدة، والواجب المكلف به للقاء القادم.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Lesson Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              1. بيانات الجلسة الأساسية
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">
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
                <label className="text-xs font-semibold text-stone-600 block mb-1">
                  اسم الشيخ أو الحلقة
                </label>
                <input
                  type="text"
                  required
                  value={sheikhName}
                  onChange={(e) => setSheikhName(e.target.value)}
                  placeholder="الشيخ فلان"
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">
                  مدة الجلسة (بالدقائق)
                </label>
                <input
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value || '30', 10))}
                  className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recited Passages (Multi-passage) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  2. المقاطع التي تم تسميعها وتقييماتها
                </h2>
                <p className="text-[11px] text-stone-500">
                  يمكنك تسجيل أكثر من مقطع (حفظ جديد، ماضٍ قريب، مراجعة) مع تقييم الشيخ المستقل لكل مقطع.
                </p>
              </div>

              <button
                type="button"
                onClick={addPassage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#145A45] bg-[#145A45]/5 hover:bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مقطع آخر</span>
              </button>
            </div>

            <div className="space-y-4">
              {passages.map((passage, pIndex) => (
                <div
                  key={pIndex}
                  className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#145A45] dark:text-[#C7A75B]">
                      المقطع رقم {pIndex + 1}
                    </span>
                    {passages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassage(pIndex)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="حذف هذا المقطع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Range Selector */}
                  <QuranRangeSelector
                    startSurah={passage.startSurah}
                    startAyah={passage.startAyah}
                    endSurah={passage.endSurah}
                    endAyah={passage.endAyah}
                    onChange={(r) => {
                      updatePassage(pIndex, {
                        startSurah: r.startSurah,
                        startAyah: r.startAyah,
                        endSurah: r.endSurah,
                        endAyah: r.endAyah
                      });
                    }}
                  />

                  {/* Passage Type & Sheikh Evaluation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                        نوع المقطع
                      </label>
                      <select
                        value={passage.passageType}
                        onChange={(e) =>
                          updatePassage(pIndex, { passageType: e.target.value as AssignmentType })
                        }
                        className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] text-stone-900 dark:text-stone-100 font-medium p-2 text-xs"
                      >
                        <option value="new_memorization">حفظ جديد لأول مرة</option>
                        <option value="previous_memorization">ماضٍ قريب (تسميع سابق)</option>
                        <option value="revision">مراجعة دورية</option>
                        <option value="repetition">إعادة بسبب خطأ</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                        تقييم الشيخ لهذا المقطع ⭐
                      </label>
                      <select
                        value={passage.evaluation}
                        onChange={(e) =>
                          updatePassage(pIndex, { evaluation: e.target.value as SheikhEvaluation })
                        }
                        className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] text-stone-900 dark:text-stone-100 p-2 text-xs font-bold"
                      >
                        <option value="excellent">ممتاز (إتقان تام بدون أخطاء)</option>
                        <option value="very_good">جيد جداً (خطأ أو خطآن يسيران)</option>
                        <option value="good">جيد (يحتاج لمزيد من الضبط)</option>
                        <option value="needs_improvement">يحتاج تمكين ومراجعة</option>
                        <option value="repeat_required">إعادة التسميع في الجلسة القادمة</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={passage.notes}
                      onChange={(e) => updatePassage(pIndex, { notes: e.target.value })}
                      placeholder="ملاحظات الشيخ على هذا المقطع تحديداً (تجويد، متشابهات...)"
                      className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Next Assignment from Sheikh */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <span>3. التكليف والواجب للقاء القادم</span>
              </label>
              <input
                type="checkbox"
                checked={hasNextAssignment}
                onChange={(e) => setHasNextAssignment(e.target.checked)}
                className="rounded border-stone-300 text-[#145A45]"
              />
            </div>

            {hasNextAssignment && (
              <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-stone-500 block mb-1">السورة</label>
                    <select
                      value={nextSurah}
                      onChange={(e) => {
                        const sNum = parseInt(e.target.value, 10);
                        setNextSurah(sNum);
                        const s = SURAHS.find((item) => item.number === sNum);
                        setNextEndAyah(s?.ayahCount || 25);
                      }}
                      className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] text-stone-900 dark:text-stone-100 font-medium p-2 text-xs"
                    >
                      {SURAHS.map((s) => (
                        <option
                          key={s.number}
                          value={s.number}
                          className="bg-white dark:bg-[#11251E] text-stone-900 dark:text-stone-100 py-1 font-medium"
                        >
                          {s.number}. سورة {s.nameArabic} ({s.ayahCount} آية)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-stone-500 block mb-1">من الآية</label>
                    <input
                      type="number"
                      min={1}
                      value={nextStartAyah}
                      onChange={(e) => setNextStartAyah(parseInt(e.target.value || '1', 10))}
                      className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-stone-500 block mb-1">إلى الآية</label>
                    <input
                      type="number"
                      min={1}
                      value={nextEndAyah}
                      onChange={(e) => setNextEndAyah(parseInt(e.target.value || '1', 10))}
                      className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={nextNotes}
                  onChange={(e) => setNextNotes(e.target.value)}
                  placeholder="ملاحظات وتوجيهات الشيخ الخاصة بالواجب القادم..."
                  className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                />
              </div>
            )}
          </div>

          {/* Section 4: General Lesson Notes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-2">
            <label className="text-sm font-bold text-stone-800 dark:text-stone-200 block">
              4. ملاحظات عامة حول الجلسة
            </label>
            <textarea
              rows={2}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="نصائح عامة من الشيخ، تنبيهات على مخارج الحروف، تشجيع..."
              className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] p-3 text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/lessons"
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 text-xs font-semibold hover:bg-stone-50"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الجلسة وتحديث المحفوظ</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
