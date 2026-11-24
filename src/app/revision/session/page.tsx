'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';
import { RevisionEvaluation } from '@/types/database';
import { ArrowRight, Play, Pause, RotateCcw, Check, Clock, Sparkles } from 'lucide-react';
import { formatQuranRange } from '@/data/quranData';
import confetti from 'canvas-confetti';

function RevisionSessionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addRevisionSession } = useQuranApp();

  // Query params prefill
  const initStartSurah = parseInt(searchParams.get('surah') || '1', 10);
  const initStartAyah = parseInt(searchParams.get('start') || '1', 10);
  const initEndSurah = parseInt(searchParams.get('endSurah') || `${initStartSurah}`, 10);
  const initEndAyah = parseInt(searchParams.get('end') || '7', 10);

  const [startSurah, setStartSurah] = useState(initStartSurah);
  const [startAyah, setStartAyah] = useState(initStartAyah);
  const [endSurah, setEndSurah] = useState(initEndSurah);
  const [endAyah, setEndAyah] = useState(initEndAyah);

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  // Evaluation & Notes
  const [evaluation, setEvaluation] = useState<RevisionEvaluation>('excellent');
  const [notes, setNotes] = useState('');

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActive(false);

    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    addRevisionSession({
      start_surah: startSurah,
      start_ayah: startAyah,
      end_surah: endSurah,
      end_ayah: endAyah,
      session_date: new Date().toISOString().split('T')[0],
      duration_minutes: durationMinutes,
      evaluation,
      notes: notes.trim() || null
    });

    if (evaluation === 'excellent') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn(e);
      }
    }

    router.push('/revision');
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/revision"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للمراجعة</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D]">
            جلسة مراجعة وتثبيت نشطة
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            شغّل المؤقت، رتّل المقطع غيباً بخشوع وهدوء، ثم قيّم حفظك وسجل موعد المراجعة القادم.
          </p>
        </div>

        {/* Stopwatch Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#145A45] to-[#0E3E30] text-white text-center shadow-lg space-y-6">
          <span className="text-xs font-semibold text-[#A6B89D] uppercase tracking-wider block">
            عداد وقت التسميع والمراجعة
          </span>

          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-widest text-[#F8F7F2]">
            {formatTime(seconds)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleTimer}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#145A45] text-xs font-bold shadow-md hover:bg-stone-100 active:scale-95 transition-all"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{seconds === 0 ? 'بدء التسميع' : 'استئناف'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الضبط</span>
            </button>
          </div>
        </div>

        {/* Range Selection & Finish Form */}
        <form onSubmit={handleFinish} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              المقطع القرآني المراد مراجعته:
            </h2>
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
              }}
            />
          </div>

          {/* Self-Evaluation */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                تقييمك لمستوى حفظ المقطع:
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                النظام يقترح موعد المراجعة القادم تلقائياً حسب مستوى الإتقان لتثبيت الحفظ.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'excellent',
                  title: 'ممتاز (إتقان تام) 🌟',
                  desc: 'تسميع سلس بدون توقف أو تردد (المراجعة القادمة بعد 3 أسابيع)'
                },
                {
                  id: 'good',
                  title: 'جيد (أخطاء يسيرة) ✨',
                  desc: 'تردد في آية أو آيتين فقط (المراجعة القادمة بعد 10 أيام)'
                },
                {
                  id: 'needs_improvement',
                  title: 'يحتاج تمكين ⚠️',
                  desc: 'صعوبة في تذكر بعض الآيات (المراجعة القادمة بعد 3 أيام)'
                },
                {
                  id: 'must_repeat',
                  title: 'يجب تكراره غداً 🔄',
                  desc: 'نسيان أو تلعثم شديد (المراجعة القادمة غداً)'
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEvaluation(item.id as RevisionEvaluation)}
                  className={`p-3 rounded-2xl border text-right transition-colors ${
                    evaluation === item.id
                      ? 'border-[#145A45] bg-[#145A45]/5 text-[#145A45] dark:text-[#C7A75B]'
                      : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E]'
                  }`}
                >
                  <p className="text-xs font-bold">{item.title}</p>
                  <p className="text-[11px] text-stone-500 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-stone-600 block">
                ملاحظات أو متشابهات واجهتها:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="سجل أين ترددت لتنتبه له في المرة القادمة..."
                className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] p-3 text-xs"
              />
            </div>
          </div>

          {/* Finish Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/revision"
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 text-xs font-semibold hover:bg-stone-50"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>إنهاء الجلسة وحفظ النتيجة</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default function RevisionSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] dark:bg-[#0B1914]">
          <span className="text-sm font-semibold text-[#145A45]">جارٍ تجهيز الجلسة...</span>
        </div>
      }
    >
      <RevisionSessionInner />
    </Suspense>
  );
}
