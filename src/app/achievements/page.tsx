'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { Award, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';

interface AchievementDef {
  code: string;
  title: string;
  description: string;
  badge: string;
  category: string;
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  {
    code: 'first_memorization',
    title: 'بداية الرحلة المباركة',
    description: 'سجلت أول آيات تم حفظها في مصحفك المبارك.',
    badge: '📖',
    category: 'الحفظ'
  },
  {
    code: 'first_lesson',
    title: 'أول لقاء مع الشيخ',
    description: 'وثقت أول حلقة تسميع ودرس مع الشيخ.',
    badge: '🕌',
    category: 'الحلقات'
  },
  {
    code: 'first_revision',
    title: 'تعهَّد القرآن',
    description: 'أتممت أول جلسة مراجعة وتثبيت لحفظك.',
    badge: '✨',
    category: 'المراجعة'
  },
  {
    code: 'first_reading',
    title: 'ورد التلاوة',
    description: 'سجلت أول جلسة قراءة وتلاوة لكتاب الله.',
    badge: '🌿',
    category: 'التلاوة'
  },
  {
    code: 'ten_sessions',
    title: 'عشر خطوات ثابتة',
    description: 'أتممت 10 جلسات متنوعة بين الحفظ والمراجعة والقراءة.',
    badge: '🌟',
    category: 'الاستمرارية'
  },
  {
    code: 'first_surah',
    title: 'سورة مكتملة الإتقان',
    description: 'أتممت حفظ وتسميع أول سورة كاملة بنجاح.',
    badge: '👑',
    category: 'الإنجاز'
  },
  {
    code: 'first_juz',
    title: 'جزء في الصدر',
    description: 'أتممت حفظ ومراجعة جزء كامل من أجزاء المصحف الشريف.',
    badge: '🏆',
    category: 'الإنجاز'
  },
  {
    code: 'return_after_break',
    title: 'البطل العائد',
    description: 'تغلبت على الانقطاع وعدت لمصحفك بهمة عالية.',
    badge: '❤️',
    category: 'العزيمة'
  },
  {
    code: 'active_month',
    title: 'شهر من النور',
    description: '30 يوماً نشطاً في صحبة القرآن الكريم.',
    badge: '🌙',
    category: 'الاستمرارية'
  }
];

export default function AchievementsPage() {
  const { achievements, stats } = useQuranApp();

  const unlockedCodes = new Set(achievements.map((a) => a.achievement_code));

  // Dynamically check extra achievements based on stats
  const isUnlocked = (code: string) => {
    if (unlockedCodes.has(code)) return true;
    if (code === 'first_surah' && stats.completedSurahsCount > 0) return true;
    if (code === 'first_juz' && stats.completedJuzCount > 0) return true;
    if (code === 'active_month' && stats.activeDaysCount >= 30) return true;
    if (code === 'ten_sessions' && stats.totalLessonsCount >= 10) return true;
    return false;
  };

  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => isUnlocked(a.code)).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <Award className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>أوسمة وإنجازات الرحلة</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              محطات تحفيزية لطيفة للاحتفاء بخطواتك المباركة بدون مقارنة أو ضغط سلاسل الأيام.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#11251E] px-4 py-2 rounded-2xl border border-[#E6E4DC] dark:border-[#1F3B32] shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#C7A75B]" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
              أتممت {unlockedCount} من {ALL_ACHIEVEMENTS.length} إنجاز
            </span>
          </div>
        </div>

        {/* Motivation note */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200">
          💡 <strong>مبدأ رحلتنا:</strong> هنا لا يوجد عقاب على الانقطاع ولا إعادة تصفير لنقاطك
          أو إنجازاتك. كل حرف وخطوة خطوتها مسجلة ومحفوظة لك دائماً.
        </div>

        {/* Grid of Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ALL_ACHIEVEMENTS.map((item) => {
            const unlocked = isUnlocked(item.code);
            const userAch = achievements.find((a) => a.achievement_code === item.code);

            return (
              <div
                key={item.code}
                className={`p-5 rounded-3xl border transition-all ${
                  unlocked
                    ? 'bg-white dark:bg-[#11251E] border-[#C7A75B]/60 shadow-xs'
                    : 'bg-stone-50/60 dark:bg-stone-900/40 border-[#E6E4DC] dark:border-[#1F3B32] opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs ${
                      unlocked
                        ? 'bg-gradient-to-br from-[#145A45] to-[#1E7057] text-white ring-4 ring-[#C7A75B]/20'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-400 grayscale'
                    }`}
                  >
                    {item.badge}
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      unlocked
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {unlocked ? 'مكتمل ✅' : 'قيد التقدم 🔒'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#252B27] dark:text-[#EDF3EF]">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {item.description}
                </p>

                {unlocked && (
                  <p className="text-[10px] text-[#145A45] dark:text-[#C7A75B] font-semibold mt-3 pt-2 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
                    تم الفتح: {userAch ? new Date(userAch.unlocked_at).toLocaleDateString('ar-EG') : 'أثناء مسيرتك'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
