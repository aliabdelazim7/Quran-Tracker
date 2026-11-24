'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { useAuth } from '@/context/AuthContext';
import {
  getAuthorizedStudentDetails,
  AuthorizedStudentDetails,
  recordStudentLessonBySheikh,
} from '@/services/sheikh.service';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';
import { SheikhEvaluation, AssignmentType, LessonType } from '@/types/database';

interface PassageEntry {
  id: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  passageType: AssignmentType;
  evaluation: SheikhEvaluation;
  notes: string;
}

function SheikhNewLessonPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const studentId = params?.studentId as string;

  const [studentDetails, setStudentDetails] = useState<AuthorizedStudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lesson State
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonType, setLessonType] = useState<LessonType>('new_memorization');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [overallNotes, setOverallNotes] = useState('');

  // Passages State
  const [passages, setPassages] = useState<PassageEntry[]>([
    {
      id: 'p-1',
      startSurah: 78,
      startAyah: 1,
      endSurah: 78,
      endAyah: 40,
      passageType: 'new_memorization',
      evaluation: 'excellent',
      notes: '',
    },
  ]);

  useEffect(() => {
    async function load() {
      if (user?.id && studentId) {
        const res = await getAuthorizedStudentDetails(user.id, studentId);
        if (res.data) {
          setStudentDetails(res.data);
        } else {
          setError(res.error || 'غير مصرح بتسجيل درس لهذا الطالب');
        }
      }
      setLoading(false);
    }
    load();
  }, [user?.id, studentId]);

  const addPassage = () => {
    setPassages((prev) => [
      ...prev,
      {
        id: 'p-' + Math.random().toString(36).substring(2, 7),
        startSurah: 1,
        startAyah: 1,
        endSurah: 1,
        endAyah: 7,
        passageType: 'previous_memorization',
        evaluation: 'very_good',
        notes: '',
      },
    ]);
  };

  const removePassage = (id: string) => {
    if (passages.length > 1) {
      setPassages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const updatePassage = (id: string, updates: Partial<PassageEntry>) => {
    setPassages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !studentId) return;
    setError(null);
    setSubmitting(true);

    const res = await recordStudentLessonBySheikh({
      sheikhId: user.id,
      studentId,
      lessonDate,
      lessonType,
      durationMinutes,
      overallNotes,
      passages: passages.map((p) => ({
        startSurah: p.startSurah,
        startAyah: p.startAyah,
        endSurah: p.endSurah,
        endAyah: p.endAyah,
        passageType: p.passageType,
        evaluation: p.evaluation,
        notes: p.notes,
      })),
    });

    setSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/sheikh/students/${studentId}`);
      }, 1500);
    } else {
      setError(res.error || 'فشل تسجيل الجلسة');
    }
  };

  if (loading) {
    return (
      <SheikhAppShell>
        <div className="p-12 text-center text-xs font-semibold text-stone-500">
          جارٍ التحقق من الصلاحيات وفتح نموذج الجلسة...
        </div>
      </SheikhAppShell>
    );
  }

  if (error && !studentDetails) {
    return (
      <SheikhAppShell>
        <div className="p-8 rounded-3xl bg-white dark:bg-[#122820] border border-rose-200 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-rose-700 dark:text-rose-400">
            {error}
          </h2>
          <button
            onClick={() => router.push('/sheikh/students')}
            className="px-5 py-2.5 rounded-xl bg-[#145A45] text-white text-xs font-bold"
          >
            العودة للطلاب
          </button>
        </div>
      </SheikhAppShell>
    );
  }

  const studentName = studentDetails?.student.display_name || 'طالب الحلقة';

  return (
    <SheikhAppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <Link href="/sheikh/students" className="hover:text-[#145A45]">
            قائمة الطلاب
          </Link>
          <span>/</span>
          <Link href={`/sheikh/students/${studentId}`} className="hover:text-[#145A45]">
            {studentName}
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-stone-100 font-bold">
            رصد جلسة تسميع
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              <span>رصد جلسة تسميع وتقييم معتمد</span>
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              توثيق تسميع الطالب: <strong className="text-[#145A45] dark:text-[#E0C37B]">{studentName}</strong>
            </p>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
            تم توثيق جلسة التسميع ورصد التقييمات بنجاح في سجل الطالب ✅
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Lesson Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
              <span>1. البيانات الأساسية للجلسة</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  تاريخ الجلسة
                </label>
                <input
                  type="date"
                  required
                  value={lessonDate}
                  onChange={(e) => setLessonDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  نوع الجلسة
                </label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as any)}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
                >
                  <option value="new_memorization">تسميع حفظ جديد</option>
                  <option value="previous_memorization">تسميع ماضي قريب</option>
                  <option value="revision">مراجعة عامة</option>
                  <option value="mixed">مختلط (جديد + مراجعة)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  مدة الجلسة (بالدقائق)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value || '30', 10))}
                  className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recited Passages with Evaluations */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
                  <span>2. المقاطع المسمعة والتقييمات المعتمدة</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  يمكنك رصد أكثر من مقطع في الجلسة الواحدة مع إعطاء تقييم مستقل لكل مقطع.
                </p>
              </div>

              <button
                type="button"
                onClick={addPassage}
                className="px-3.5 py-1.5 rounded-xl border border-[#145A45] text-[#145A45] dark:text-[#E0C37B] hover:bg-[#145A45]/5 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مقطع آخر</span>
              </button>
            </div>

            <div className="space-y-4">
              {passages.map((p, index) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#145A45] dark:text-[#E0C37B]">
                      المقطع رقم {index + 1}
                    </span>
                    {passages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassage(p.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="حذف هذا المقطع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Range selector */}
                  <QuranRangeSelector
                    startSurah={p.startSurah}
                    startAyah={p.startAyah}
                    endSurah={p.endSurah}
                    endAyah={p.endAyah}
                    onChange={(range) => {
                      updatePassage(p.id, {
                        startSurah: range.startSurah,
                        startAyah: range.startAyah,
                        endSurah: range.endSurah,
                        endAyah: range.endAyah,
                      });
                    }}
                  />

                  {/* Passage Type & Sheikh Evaluation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                        تصنيف المقطع
                      </label>
                      <select
                        value={p.passageType}
                        onChange={(e) => updatePassage(p.id, { passageType: e.target.value as any })}
                        className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-white dark:bg-[#122820] p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
                      >
                        <option value="new_memorization">حفظ جديد</option>
                        <option value="previous_memorization">ماضي قريب</option>
                        <option value="revision">مراجعة دورية</option>
                        <option value="repetition">إعادة تسميع</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                        تقييم الشيخ للتسميع
                      </label>
                      <select
                        value={p.evaluation}
                        onChange={(e) => updatePassage(p.id, { evaluation: e.target.value as any })}
                        className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-white dark:bg-[#122820] p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
                      >
                        <option value="excellent">ممتاز (بلا أي تردد أو لحن) ⭐</option>
                        <option value="very_good">جيد جداً (تردد خفيف مع تصويب فوري) 👍</option>
                        <option value="good">جيد (يحتاج لمزيد من التكرار) 🌿</option>
                        <option value="needs_improvement">يحتاج مراجعة وضبط أحكام ⚠️</option>
                        <option value="repeat_required">إعادة التسميع في الحلقة القادمة 🔄</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                      ملاحظات خاصة بالمقطع (توجيهات التجويد والمخارج)
                    </label>
                    <input
                      type="text"
                      value={p.notes}
                      onChange={(e) => updatePassage(p.id, { notes: e.target.value })}
                      placeholder="مثال: الانتباه لترقيق الراء والمد المنفصل..."
                      className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-white dark:bg-[#122820] p-2.5 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Overall Sheikh Notes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              3. كلمة تشجيعية وتوجيه عام للتلميذ
            </h2>
            <textarea
              rows={3}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="اكتب رسالة أو نصيحة لتلميذك تظهر في تقرير جلسته اليوم..."
              className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-3 text-xs text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/sheikh/students/${studentId}`)}
              className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'جارٍ حفظ الجلسة...' : 'اعتماد ورصد الجلسة رسمياً'}
            </button>
          </div>
        </form>
      </div>
    </SheikhAppShell>
  );
}

export default function SheikhNewLessonPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0A1612]">
          <span className="text-sm font-semibold text-[#145A45] dark:text-[#E0C37B]">جارٍ تجهيز استمارة الجلسة...</span>
        </div>
      }
    >
      <SheikhNewLessonPageContent />
    </React.Suspense>
  );
}
