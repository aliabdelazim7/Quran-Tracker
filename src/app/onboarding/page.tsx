'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuranApp } from '@/context/QuranAppContext';
import { QuranRangeSelector } from '@/components/ui/QuranRangeSelector';
import { Check, ArrowLeft, ArrowRight, Sparkles, BookOpen, Clock, Heart, Award } from 'lucide-react';
import { SURAHS, JUZS, formatQuranRange } from '@/data/quranData';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateDisplayName } = useAuth();
  const { bulkUpdateRangeProgress, addAssignment, updateSettings } = useQuranApp();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form states
  const [name, setName] = useState(user?.display_name || 'علي');
  const [hasExistingProgress, setHasExistingProgress] = useState(false);
  const [existingPreset, setExistingPreset] = useState<'juz30' | 'juz29_30' | 'baqarah' | 'custom'>('juz30');

  // Custom range for existing progress
  const [startSurah, setStartSurah] = useState(78);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(114);
  const [endAyah, setEndAyah] = useState(6);

  // Current new memorization target
  const [currentSurah, setCurrentSurah] = useState(1);
  const [currentStartAyah, setCurrentStartAyah] = useState(1);
  const [currentEndAyah, setCurrentEndAyah] = useState(7);
  const [hasActiveAssignment, setHasActiveAssignment] = useState(true);

  // Goals & Reminders (Completely Optional!)
  const [enableDailyGoal, setEnableDailyGoal] = useState(false);
  const [dailyGoalAyahs, setDailyGoalAyahs] = useState(5);
  const [enableWeeklyGoal, setEnableWeeklyGoal] = useState(false);
  const [weeklyGoalAyahs, setWeeklyGoalAyahs] = useState(25);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [encouragementStyle, setEncouragementStyle] = useState<
    'balanced' | 'religious' | 'friendly_egyptian' | 'minimal'
  >('balanced');

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    // 1. Update display name
    if (name.trim()) {
      updateDisplayName(name.trim());
    }

    // 2. Record existing progress if specified
    if (hasExistingProgress) {
      if (existingPreset === 'juz30') {
        bulkUpdateRangeProgress(78, 1, 114, 6, 'recited', 'حفظ سابق - جزء عم');
      } else if (existingPreset === 'juz29_30') {
        bulkUpdateRangeProgress(67, 1, 114, 6, 'recited', 'حفظ سابق - جزأي تبارك وعم');
      } else if (existingPreset === 'baqarah') {
        bulkUpdateRangeProgress(2, 1, 2, 286, 'recited', 'حفظ سابق - سورة البقرة');
      } else {
        bulkUpdateRangeProgress(startSurah, startAyah, endSurah, endAyah, 'recited', 'حفظ سابق مدخل في التهيئة');
      }
    }

    // 3. Register current new memorization assignment
    if (hasActiveAssignment) {
      addAssignment({
        assignment_type: 'new_memorization',
        start_surah: currentSurah,
        start_ayah: currentStartAyah,
        end_surah: currentSurah,
        end_ayah: currentEndAyah,
        title: `حفظ ${SURAHS.find((s) => s.number === currentSurah)?.nameArabic || ''}`,
        status: 'in_progress',
        notes: 'الواجب المبدئي'
      });
    }

    // 4. Save settings
    updateSettings({
      daily_goal_enabled: enableDailyGoal,
      daily_goal_value: enableDailyGoal ? dailyGoalAyahs : null,
      weekly_goal_enabled: enableWeeklyGoal,
      weekly_goal_value: enableWeeklyGoal ? weeklyGoalAyahs : null,
      reminder_enabled: true,
      reminder_time: reminderTime,
      encouragement_style: encouragementStyle
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#0B1914] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-[#11251E] rounded-3xl border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xl p-6 sm:p-10 space-y-8">
        {/* Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>الخطوة {step} من {totalSteps}</span>
            <span className="text-[#145A45] dark:text-[#C7A75B]">
              {step === 1 && 'التعريف والترحيب'}
              {step === 2 && 'الحفظ السابق'}
              {step === 3 && 'الموضع الحالي للحفظ'}
              {step === 4 && 'التفضيلات والتذكيرات'}
            </span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#145A45] dark:bg-[#C7A75B] h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Greeting & Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <span className="text-4xl">👋</span>
              <h2 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D]">
                أهلاً بك في رحلتك مع القرآن
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                هذا التطبيق صُمم ليكون رفيقك الهادئ والمشجع، يساعدك على معرفة أين وقفت وماذا تسمع للشيخ اليوم.
              </p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                ما الاسم الذي تحب أن نناديك به؟
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="علي"
                className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-4 py-3 text-base text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
              />
              <p className="text-[11px] text-stone-400">
                سنستخدمه في التحيات الودية والرسائل التشجيعية اليومية.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Existing Memorization */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-[#145A45] dark:text-[#A6B89D]">
                هل لديك أجزاء أو سور محفوظة بالفعل؟
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                لا داعي لأن تبدأ من الصفر إذا كنت قد قطعت شوطاً سابقاً مع القرآن الكريم.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setHasExistingProgress(false)}
                className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs transition-colors ${
                  !hasExistingProgress
                    ? 'border-[#145A45] bg-[#145A45]/5 text-[#145A45] dark:text-[#C7A75B]'
                    : 'border-[#E6E4DC] dark:border-[#1F3B32] text-stone-600'
                }`}
              >
                أبدأ من البداية 🌟
              </button>
              <button
                type="button"
                onClick={() => setHasExistingProgress(true)}
                className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs transition-colors ${
                  hasExistingProgress
                    ? 'border-[#145A45] bg-[#145A45]/5 text-[#145A45] dark:text-[#C7A75B]'
                    : 'border-[#E6E4DC] dark:border-[#1F3B32] text-stone-600'
                }`}
              >
                نعم، لدي محفوظ سابق 📚
              </button>
            </div>

            {hasExistingProgress && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  حدد محفوظك السابق:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'juz30', label: 'جزء عم كامل' },
                    { id: 'juz29_30', label: 'تبارك وعم' },
                    { id: 'baqarah', label: 'سورة البقرة' },
                    { id: 'custom', label: 'تحديد مخصص' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setExistingPreset(p.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        existingPreset === p.id
                          ? 'border-[#145A45] bg-[#145A45] text-white'
                          : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {existingPreset === 'custom' && (
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
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Current New Memorization */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-[#145A45] dark:text-[#A6B89D]">
                أين تقف الآن؟ وما هو جديدك القادم؟
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                سجل المقطع الذي تعمل على حفظه أو تسميعه في حلقتك القادمة مع الشيخ.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeAssign"
                  checked={hasActiveAssignment}
                  onChange={(e) => setHasActiveAssignment(e.target.checked)}
                  className="rounded border-stone-300 text-[#145A45] focus:ring-[#145A45]"
                />
                <label htmlFor="activeAssign" className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  لدي موضع محدد أعمل على حفظه حالياً
                </label>
              </div>

              {hasActiveAssignment && (
                <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] border border-[#E6E4DC] dark:border-[#1F3B32] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-stone-500 block mb-1">السورة</label>
                      <select
                        value={currentSurah}
                        onChange={(e) => {
                          const sNum = parseInt(e.target.value, 10);
                          setCurrentSurah(sNum);
                          const s = SURAHS.find((item) => item.number === sNum);
                          setCurrentEndAyah(s?.ayahCount || 7);
                        }}
                        className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                      >
                        {SURAHS.map((s) => (
                          <option key={s.number} value={s.number}>
                            {s.number}. {s.nameArabic}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 block mb-1">من الآية</label>
                      <input
                        type="number"
                        min={1}
                        value={currentStartAyah}
                        onChange={(e) => setCurrentStartAyah(parseInt(e.target.value || '1', 10))}
                        className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-stone-500 block mb-1">إلى الآية</label>
                      <input
                        type="number"
                        min={1}
                        value={currentEndAyah}
                        onChange={(e) => setCurrentEndAyah(parseInt(e.target.value || '1', 10))}
                        className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] p-2 text-xs"
                      />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#145A45] dark:text-[#8B9E82]">
                    المقطع القادم:{' '}
                    {formatQuranRange(currentSurah, currentStartAyah, currentSurah, currentEndAyah)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Optional Goals & Encouragement Preferences */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-[#145A45] dark:text-[#A6B89D]">
                تفضيلاتك وأسلوب الرفيق القرآني
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                جميع الأهداف اختيارية تماماً. نحن نؤمن بأن الحفظ رحلة حب ومثابرة وليس سباقاً مشحوناً بالضغط.
              </p>
            </div>

            {/* Optional Daily Target */}
            <div className="p-4 rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#145A45]" />
                  <span>تحديد هدف حفظ يومي (اختياري)</span>
                </label>
                <input
                  type="checkbox"
                  checked={enableDailyGoal}
                  onChange={(e) => setEnableDailyGoal(e.target.checked)}
                  className="rounded border-stone-300 text-[#145A45]"
                />
              </div>

              {enableDailyGoal && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-stone-600">كم آية تفضل يومياً؟</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={dailyGoalAyahs}
                    onChange={(e) => setDailyGoalAyahs(parseInt(e.target.value || '5', 10))}
                    className="w-20 rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1 text-xs"
                  />
                  <span className="text-xs text-stone-400">آيات</span>
                </div>
              )}
            </div>

            {/* Encouragement Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>أسلوب التشجيع المفضل لديك:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'balanced', title: 'متوازن وودود', desc: 'مزيج من الأحاديث والتشجيع المصري الأخوي' },
                  { id: 'friendly_egyptian', title: 'صاحبي بالعامية المصرية', desc: 'مثل صديق مقرب يسندك ويدعمك' },
                  { id: 'religious', title: 'تأصيل شرعي فقط', desc: 'آيات وأحاديث نبوية صحيحة فقط' },
                  { id: 'minimal', title: 'هادئ ومختصر', desc: 'أرقام وإحصائيات دون رسائل مكثفة' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setEncouragementStyle(s.id as any)}
                    className={`p-3 rounded-xl border text-right transition-colors ${
                      encouragementStyle === s.id
                        ? 'border-[#145A45] bg-[#145A45]/5 text-[#145A45] dark:text-[#C7A75B]'
                        : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E]'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.title}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder Time */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914]">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                وقت التذكير اليومي المفضل:
              </span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1 text-xs"
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 text-xs font-semibold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#145A45] hover:bg-[#1b6f57] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <span>{step === totalSteps ? 'انطلق إلى لوحة رحلتي' : 'التالي'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
