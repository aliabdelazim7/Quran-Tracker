'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SheikhAppShell } from '@/components/layout/SheikhAppShell';
import { useAuth } from '@/context/AuthContext';
import {
  getAuthorizedStudentDetails,
  AuthorizedStudentDetails,
  assignMemorizationBySheikh,
} from '@/services/sheikh.service';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Star,
  Award,
  Clock,
} from 'lucide-react';
import { formatQuranRange } from '@/data/quranData';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';

function SheikhStudentDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const studentId = params?.studentId as string;

  const [details, setDetails] = useState<AuthorizedStudentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New Assignment Modal / Form State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<'new_memorization' | 'previous_memorization' | 'revision' | 'repetition'>('new_memorization');
  const [startSurah, setStartSurah] = useState(78);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(78);
  const [endAyah, setEndAyah] = useState(40);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (user?.id && studentId) {
        const res = await getAuthorizedStudentDetails(user.id, studentId);
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setDetails(res.data);
        }
      }
      setLoading(false);
    }
    load();
  }, [user?.id, studentId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setAssignLoading(true);

    const res = await assignMemorizationBySheikh({
      sheikhId: user.id,
      studentId,
      assignmentType: assignType,
      startSurah,
      startAyah,
      endSurah,
      endAyah,
      title: assignTitle.trim() || undefined,
      notes: assignNotes.trim() || undefined,
    });

    setAssignLoading(false);
    if (res.success) {
      setAssignSuccess(true);
      setTimeout(() => {
        setAssignSuccess(false);
        setShowAssignModal(false);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <SheikhAppShell>
        <div className="p-12 text-center text-xs font-semibold text-stone-500">
          جارٍ استدعاء السجل القرآني المصرح به...
        </div>
      </SheikhAppShell>
    );
  }

  if (error || !details) {
    return (
      <SheikhAppShell>
        <div className="p-8 rounded-3xl bg-white dark:bg-[#122820] border border-rose-200 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-rose-700 dark:text-rose-400">
            {error || 'تعذر تحميل بيانات الطالب'}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            تأكد من وجود ربط نشط وموافقة الطالب على منح صلاحيات العرض لحسابك.
          </p>
          <button
            onClick={() => router.push('/sheikh/students')}
            className="px-5 py-2.5 rounded-xl bg-[#145A45] text-white text-xs font-bold"
          >
            العودة لقائمة الطلاب
          </button>
        </div>
      </SheikhAppShell>
    );
  }

  const { student, relationship } = details;

  return (
    <SheikhAppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <Link href="/sheikh/students" className="hover:text-[#145A45] flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>قائمة الطلاب</span>
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-stone-100 font-bold">
            {student.display_name}
          </span>
        </div>

        {/* Student Profile Header Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#145A45] dark:bg-emerald-950/60 dark:text-[#E0C37B] flex items-center justify-center font-black text-2xl shadow-xs">
              {student.display_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  {student.display_name}
                </h1>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  طالب معتمد بالحلَقة ✅
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                تاريخ الالتحاق بالحلقة:{' '}
                {new Date(relationship.connected_at).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2.5 rounded-xl border border-[#145A45] text-[#145A45] dark:text-[#E0C37B] hover:bg-[#145A45]/5 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إسناد واجب جديد</span>
            </button>
            <Link
              href={`/sheikh/students/${studentId}/lessons/new`}
              className="px-4 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>رصد جلسة تسميع</span>
            </Link>
          </div>
        </div>

        {/* Quran Progress Stats Grid */}
        {details.canViewProgress && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B]">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-semibold">
                إجمالي الآيات المسمعة
              </span>
              <p className="text-2xl font-black text-[#145A45] dark:text-[#E0C37B]">
                {details.stats.memorizedAyahs}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">من أصل 6236 آية</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B]">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-semibold">
                المتقن والمثبت ⭐
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {details.stats.masteredAyahs}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                تسميع بلا أخطاء
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B]">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-semibold">
                نسبة إنجاز المصحف
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {details.stats.percentage}%
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">مكتمل حتى الآن</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B]">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-semibold">
                جلسات التسميع الموثقة
              </span>
              <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {details.lessons.length}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">جلسة مسجلة</p>
            </div>
          </div>
        )}

        {/* Current Active Assignments */}
        {details.canViewAssignments && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
                <span>تكليفات وواجبات الطالب الحالية</span>
              </h2>
              <button
                onClick={() => setShowAssignModal(true)}
                className="text-xs font-bold text-[#145A45] dark:text-[#E0C37B] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة واجب</span>
              </button>
            </div>

            {details.assignments.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                لا توجد تكليفات نشطة لهذا الطالب حالياً.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {details.assignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                        {asg.assignment_type === 'new_memorization'
                          ? 'حفظ جديد'
                          : asg.assignment_type === 'revision'
                          ? 'مراجعة دورية'
                          : 'إعادة تسميع'}
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        {asg.status === 'ready_for_recitation'
                          ? 'جاهز للتسميع 📢'
                          : asg.status === 'mastered'
                          ? 'تم الإتقان ⭐'
                          : 'قيد الحفظ 🌱'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {formatQuranRange(asg.start_surah, asg.start_ayah, asg.end_surah, asg.end_ayah)}
                    </h3>

                    {asg.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                        &ldquo;{asg.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lesson History */}
        {details.canViewLessons && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#122820] border border-[#E2DFD6] dark:border-[#24483B] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#145A45] dark:text-[#E0C37B]" />
              <span>سجل جلسات التسميع والتقييمات السابقة</span>
            </h2>

            {details.lessons.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                لم يتم تسجيل أي جلسة تسميع سابقة لهذا الطالب بعد.
              </p>
            ) : (
              <div className="space-y-3">
                {details.lessons.map((les) => (
                  <div
                    key={les.id}
                    className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0E201A] border border-[#E2DFD6] dark:border-[#24483B] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                        <Calendar className="w-4 h-4 text-[#145A45] dark:text-[#E0C37B]" />
                        <span>جلسة يوم: {les.lesson_date}</span>
                      </div>
                      <span className="text-stone-500">{les.duration_minutes || 30} دقيقة</span>
                    </div>

                    {les.overall_notes && (
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        <strong>ملاحظات الشيخ:</strong> {les.overall_notes}
                      </p>
                    )}

                    {/* Passages Evaluations */}
                    {les.passages && les.passages.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-[#E2DFD6] dark:border-[#24483B]">
                        {les.passages.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-[#122820]"
                          >
                            <span className="font-semibold text-stone-900 dark:text-stone-100">
                              {formatQuranRange(p.start_surah, p.start_ayah, p.end_surah, p.end_ayah)}
                            </span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              تقييم: ممتاز ⭐
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: New Assignment */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#122820] rounded-3xl border border-[#E2DFD6] dark:border-[#24483B] p-6 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#145A45] dark:text-[#E0C37B] flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>إسناد تكليف جديد للطالب</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {assignSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                  تم إسناد التكليف للطالب بنجاح وسيظهر في حسابه فوراً ✅
                </div>
              )}

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                    نوع التكليف
                  </label>
                  <select
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
                  >
                    <option value="new_memorization">حفظ جديد</option>
                    <option value="previous_memorization">تثبيت وتسميع سابق</option>
                    <option value="revision">مراجعة دورية</option>
                    <option value="repetition">إعادة تسميع مقطع لم يضبط</option>
                  </select>
                </div>

                <QuranRangeSelector
                  startSurah={startSurah}
                  startAyah={startAyah}
                  endSurah={endSurah}
                  endAyah={endAyah}
                  onChange={(range) => {
                    setStartSurah(range.startSurah);
                    setStartAyah(range.startAyah);
                    setEndSurah(range.endSurah);
                    setEndAyah(range.endAyah);
                  }}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                    توجيهات وملاحظات الشيخ للطالب
                  </label>
                  <textarea
                    rows={2}
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="مثال: يرجى التركيز على أحكام الميم الساكنة وإتمام الغنن..."
                    className="w-full rounded-xl border border-[#E2DFD6] dark:border-[#24483B] bg-[#F8F7F2] dark:bg-[#0E201A] p-3 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold"
                  >
                    {assignLoading ? 'جارٍ الإسناد...' : 'إسناد التكليف للطالب'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SheikhAppShell>
  );
}

export default function SheikhStudentDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0A1612]">
          <span className="text-sm font-semibold text-[#145A45] dark:text-[#E0C37B]">جارٍ تحميل بيانات الطالب...</span>
        </div>
      }
    >
      <SheikhStudentDetailPageContent />
    </React.Suspense>
  );
}
