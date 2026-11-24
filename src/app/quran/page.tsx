'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuranApp } from '@/context/QuranAppContext';
import { StatusBadge, statusConfig } from '@/components/ui/StatusBadge';
import {
  SURAHS,
  JUZS,
  SurahMeta,
  JuzMeta,
  TOTAL_AYAH_COUNT,
  TOTAL_SURAHS,
  TOTAL_JUZ,
  formatQuranRange,
  getSurah
} from '@/data/quranData';
import { QURAN_RUBS, QuranRubMeta } from '@/data/quranRubData';
import { MemorizationStatus } from '@/types/database';
import { BookOpen, X, Check, Search, Layers, Compass, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function QuranMapPage() {
  const {
    getSurahStatus,
    getSurahMemorizedCount,
    getJuzProgress,
    bulkUpdateRangeProgress,
    stats
  } = useQuranApp();

  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'rub'>('surahs');
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemorizationStatus>('all');

  // Filter Surahs
  const filteredSurahs = SURAHS.filter((s) => {
    const matchesSearch =
      s.nameArabic.includes(searchQuery) ||
      s.nameTransliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery;

    if (!matchesSearch) return false;

    if (statusFilter !== 'all') {
      const status = getSurahStatus(s.number);
      return status === statusFilter;
    }

    return true;
  });

  const handleMarkSurah = (surah: SurahMeta, status: MemorizationStatus) => {
    bulkUpdateRangeProgress(
      surah.number,
      1,
      surah.number,
      surah.ayahCount,
      status,
      `تحديث شامل لسورة ${surah.nameArabic}`
    );
    setSelectedSurah(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#145A45] dark:text-[#A6B89D] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#145A45] dark:text-[#C7A75B]" />
              <span>خريطة المصحف الشريف التفاعلية</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              استكشف تقدمك في الـ 114 سورة والـ 30 جزءاً والـ 240 ربعاً بدقة الآية الواحدة.
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex bg-white dark:bg-[#11251E] p-1 rounded-2xl border border-[#E6E4DC] dark:border-[#1F3B32] shadow-2xs">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'surahs'
                  ? 'bg-[#145A45] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              خريطة السور (114)
            </button>
            <button
              onClick={() => setActiveTab('juz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'juz'
                  ? 'bg-[#145A45] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              خريطة الأجزاء (30)
            </button>
            <button
              onClick={() => setActiveTab('rub')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'rub'
                  ? 'bg-[#145A45] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              خريطة الأرباع (240)
            </button>
          </div>
        </div>

        {/* Search & Status Filters (for Surahs) */}
        {activeTab === 'surahs' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سورة بالاسم أو الرقم..."
                className="w-full rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-3 py-2 pr-9 text-xs text-[#252B27] dark:text-[#EDF3EF] outline-none focus:ring-2 focus:ring-[#145A45]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              {[
                { id: 'all', label: 'الكل' },
                { id: 'mastered', label: 'متقن ⭐' },
                { id: 'recited', label: 'تم التسميع ✅' },
                { id: 'in_progress', label: 'قيد الحفظ 🌱' },
                { id: 'not_started', label: 'لم يبدأ ⏳' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
                    statusFilter === f.id
                      ? 'bg-[#145A45] text-white'
                      : 'bg-white dark:bg-[#11251E] border border-[#E6E4DC] dark:border-[#1F3B32] text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View 1: Surahs Grid */}
        {activeTab === 'surahs' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredSurahs.map((surah) => {
              const status = getSurahStatus(surah.number);
              const memorizedAyahs = getSurahMemorizedCount(surah.number);
              const pct = Math.round((memorizedAyahs / surah.ayahCount) * 100);

              const cardBorder =
                status === 'mastered'
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : status === 'recited'
                  ? 'border-teal-400 bg-teal-50/30 dark:bg-teal-950/20'
                  : status === 'in_progress'
                  ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                  : status === 'needs_repetition'
                  ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
                  : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E]';

              return (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => setSelectedSurah(surah)}
                  className={`p-3 rounded-2xl border text-right transition-all hover:scale-[1.02] shadow-2xs ${cardBorder}`}
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-bold text-stone-600 dark:text-stone-300">
                      {surah.number}
                    </span>
                    <span>{surah.revelationType}</span>
                  </div>

                  <h3 className="font-bold text-sm text-[#252B27] dark:text-[#EDF3EF] truncate">
                    سورة {surah.nameArabic}
                  </h3>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2">
                    <span>{surah.ayahCount} آية</span>
                    <span className="font-bold text-[#145A45] dark:text-[#C7A75B]">{pct}%</span>
                  </div>

                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-[#145A45] dark:bg-[#C7A75B] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* View 2: Juz Grid */}
        {activeTab === 'juz' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {JUZS.map((juz) => {
              const { memorizedCount, totalCount, percentage } = getJuzProgress(juz.juzNumber);
              const isCompleted = percentage >= 100;

              return (
                <div
                  key={juz.juzNumber}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-xl bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] flex items-center justify-center font-bold text-xs">
                      {juz.juzNumber}
                    </span>
                    <span className="text-xs font-bold text-[#145A45] dark:text-[#C7A75B]">
                      {percentage}%
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#252B27] dark:text-[#EDF3EF]">
                    {juz.nameArabic}
                  </h3>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                    {formatQuranRange(juz.startSurah, juz.startAyah, juz.endSurah, juz.endAyah)}
                  </p>

                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-[#145A45] dark:bg-[#C7A75B] h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                    <span>
                      {memorizedCount} من {totalCount} آية
                    </span>
                    {isCompleted && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>مكتمل</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 3: Rub' (Quarters) Grid */}
        {activeTab === 'rub' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {QURAN_RUBS.map((rub) => {
              const surah = getSurah(rub.startSurah);
              return (
                <div
                  key={rub.rubNumber}
                  className="p-4 rounded-2xl border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] shadow-2xs space-y-2 hover:border-[#145A45] transition-all"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="w-6 h-6 rounded-lg bg-[#145A45]/10 text-[#145A45] dark:text-[#C7A75B] flex items-center justify-center font-bold">
                      {rub.rubNumber}
                    </span>
                    <span className="text-stone-400">
                      الجزء {rub.juzNumber} | الحزب {rub.hizbNumber}
                    </span>
                  </div>

                  <p className="font-quran text-sm font-bold text-stone-800 dark:text-stone-100 line-clamp-1">
                    &ldquo;{rub.firstWords}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-[#E6E4DC] dark:border-[#1F3B32]">
                    <span>
                      سورة {surah?.nameArabic} (الآية {rub.startAyah})
                    </span>
                    <Link
                      href={`/memorization/new?surah=${rub.startSurah}&ayah=${rub.startAyah}`}
                      className="text-[#145A45] dark:text-[#C7A75B] font-bold hover:underline"
                    >
                      + تعيين كواجب
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Surah Detail Modal */}
        {selectedSurah && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#11251E] rounded-3xl border border-[#E6E4DC] dark:border-[#1F3B32] shadow-xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-[#E6E4DC] dark:border-[#1F3B32] pb-3">
                <div>
                  <span className="text-xs text-stone-400">
                    السورة رقم {selectedSurah.number} ({selectedSurah.revelationType})
                  </span>
                  <h2 className="text-xl font-bold text-[#145A45] dark:text-[#A6B89D] mt-0.5">
                    سورة {selectedSurah.nameArabic} ({selectedSurah.nameTransliteration})
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedSurah(null)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">حالة السورة الحالية:</span>
                  <StatusBadge status={getSurahStatus(selectedSurah.number)} />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F7F2] dark:bg-[#0B1914] flex justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">عدد الآيات الكلي</span>
                    <strong className="text-sm">{selectedSurah.ayahCount} آية</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">الآيات المحفوظة</span>
                    <strong className="text-sm text-[#145A45] dark:text-[#C7A75B]">
                      {getSurahMemorizedCount(selectedSurah.number)} آية
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">بداية الجزء</span>
                    <strong className="text-sm">الجزء {selectedSurah.startJuz}</strong>
                  </div>
                </div>
              </div>

              {/* Quick Update Buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  تحديث سريع للسورة كاملة:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMarkSurah(selectedSurah, 'mastered')}
                    className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    ⭐ تعليم كمتقنة ومثبتة
                  </button>
                  <button
                    onClick={() => handleMarkSurah(selectedSurah, 'recited')}
                    className="p-2.5 rounded-xl border border-teal-300 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
                  >
                    ✅ تعليم كتم تسميعها
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSurah(null)}
                  className="px-5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
