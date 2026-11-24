'use client';

import React from 'react';
import Link from 'next/link';
import { useQuranApp } from '@/context/QuranAppContext';
import { formatQuranRange } from '@/data/quranData';
import { Heart, X, ArrowLeft, RotateCcw, CheckCircle2, GraduationCap } from 'lucide-react';

export const WelcomeBackCard: React.FC = () => {
  const {
    isReturningAfterAbsence,
    daysSinceLastActivity,
    dismissWelcomeBack,
    lessons,
    currentAssignment,
    outstandingTasks
  } = useQuranApp();

  if (!isReturningAfterAbsence) return null;

  const lastLesson = lessons[0];

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#145A45] to-[#113C30] text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Decorative subtle background icon */}
      <span className="absolute -left-6 -bottom-6 text-8xl opacity-10 pointer-events-none select-none">
        🌿
      </span>

      <button
        onClick={dismissWelcomeBack}
        className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
        title="إغلاق التنبيه"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[#C7A75B] text-black text-sm">❤️</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            حمدًا لله على رجوعك يا صاحبي! نورت مصحفك
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
          مفيش أي مشكلة إنك غبت شوية؛ مشاغل الدنيا كتير وضغوط الحياة بتمر على الكل. المهم والأساس
          إنك فتحت مصحفك ورجعت النهارده. مش هنضغط على نفسنا بجديد، هنمشي خطوة بخطوة بالراحة.
        </p>

        {/* Snapshot of Where they stopped */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-[#A6B89D] text-[11px] block font-semibold">
              آخر جلسة تسميع مع الشيخ:
            </span>
            <p className="font-bold text-white">
              {lastLesson
                ? `${lastLesson.sheikh_name} - ${new Date(lastLesson.lesson_date).toLocaleDateString('ar-EG')}`
                : 'لم تسجل جلسة سابقة'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
            <span className="text-[#A6B89D] text-[11px] block font-semibold">
              الموضع الحالي الذي وقفت عنده:
            </span>
            <p className="font-bold text-white">
              {currentAssignment
                ? formatQuranRange(
                    currentAssignment.start_surah,
                    currentAssignment.start_ayah,
                    currentAssignment.end_surah,
                    currentAssignment.end_ayah
                  )
                : 'جاهز لاختيار مقطع جديد'}
            </p>
          </div>
        </div>

        {/* Step-by-Step Suggested Resumption Plan */}
        <div className="pt-2 space-y-2">
          <span className="text-xs font-bold text-[#C7A75B] block">
            خطة الاستئناف الهادئة المقترحة لك اليوم:
          </span>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-100">
            <li className="flex items-start gap-2 bg-black/20 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-[#C7A75B] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span>جلسة مراجعة خفيفة (10 دقائق) لآخر وجه تم تسميعه للاطمئنان عليه.</span>
            </li>
            <li className="flex items-start gap-2 bg-black/20 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-[#C7A75B] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span>تلاوة صفحتين أو ثلاث من ورد القراءة لعودة الروح والسكينة.</span>
            </li>
            <li className="flex items-start gap-2 bg-black/20 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-[#C7A75B] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span>قراءة الواجب الجديد قراءة متأنية بالنظر بدون ضغط حفظ سريع.</span>
            </li>
            <li className="flex items-start gap-2 bg-black/20 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-[#C7A75B] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <span>التواصل مع الشيخ وتحديد موعد الجلسة القادمة بهمة متجددة.</span>
            </li>
          </ol>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/revision/session"
            className="px-5 py-2.5 rounded-xl bg-[#C7A75B] hover:bg-[#d8b86d] text-stone-900 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>بدء خطوة الاستئناف الأولى</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            onClick={dismissWelcomeBack}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            شكراً، أنا مستعد!
          </button>
        </div>
      </div>
    </div>
  );
};
