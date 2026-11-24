'use client';

import React, { useState, useEffect } from 'react';
import {
  SURAHS,
  JUZS,
  isValidRange,
  getRangeAyahCount,
  formatQuranRange,
  getSurah,
  TOTAL_JUZ
} from '@/data/quranData';

interface QuranRangeSelectorProps {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  onChange: (range: {
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
    ayahCount: number;
  }) => void;
  className?: string;
}

export const QuranRangeSelector: React.FC<QuranRangeSelectorProps> = ({
  startSurah,
  startAyah,
  endSurah,
  endAyah,
  onChange,
  className = ''
}) => {
  const [mode, setMode] = useState<'custom' | 'surah' | 'juz'>('custom');

  const startSurahMeta = getSurah(startSurah) || SURAHS[0];
  const endSurahMeta = getSurah(endSurah) || SURAHS[0];

  const valid = isValidRange(startSurah, startAyah, endSurah, endAyah);
  const count = valid ? getRangeAyahCount(startSurah, startAyah, endSurah, endAyah) : 0;

  const handleStartSurahChange = (sNum: number) => {
    const s = getSurah(sNum);
    if (!s) return;
    const newStartAyah = 1;
    let newEndSurah = endSurah;
    let newEndAyah = endAyah;

    // If new start surah is after end surah, push end surah to match
    if (sNum > endSurah) {
      newEndSurah = sNum;
      newEndAyah = s.ayahCount;
    }
    const ayahCnt = getRangeAyahCount(sNum, newStartAyah, newEndSurah, newEndAyah);
    onChange({
      startSurah: sNum,
      startAyah: newStartAyah,
      endSurah: newEndSurah,
      endAyah: newEndAyah,
      ayahCount: ayahCnt
    });
  };

  const handleEndSurahChange = (sNum: number) => {
    const s = getSurah(sNum);
    if (!s) return;
    let newStartSurah = startSurah;
    let newStartAyah = startAyah;

    // If new end surah is before start surah, pull start surah back
    if (sNum < startSurah) {
      newStartSurah = sNum;
      newStartAyah = 1;
    }
    const newEndAyah = s.ayahCount;
    const ayahCnt = getRangeAyahCount(newStartSurah, newStartAyah, sNum, newEndAyah);
    onChange({
      startSurah: newStartSurah,
      startAyah: newStartAyah,
      endSurah: sNum,
      endAyah: newEndAyah,
      ayahCount: ayahCnt
    });
  };

  const handleStartAyahChange = (aNum: number) => {
    let newEndAyah = endAyah;
    if (startSurah === endSurah && aNum > endAyah) {
      newEndAyah = aNum;
    }
    const ayahCnt = getRangeAyahCount(startSurah, aNum, endSurah, newEndAyah);
    onChange({
      startSurah,
      startAyah: aNum,
      endSurah,
      endAyah: newEndAyah,
      ayahCount: ayahCnt
    });
  };

  const handleEndAyahChange = (aNum: number) => {
    let newStartAyah = startAyah;
    if (startSurah === endSurah && aNum < startAyah) {
      newStartAyah = aNum;
    }
    const ayahCnt = getRangeAyahCount(startSurah, newStartAyah, endSurah, aNum);
    onChange({
      startSurah,
      startAyah: newStartAyah,
      endSurah,
      endAyah: aNum,
      ayahCount: ayahCnt
    });
  };

  // Quick preset shortcuts
  const selectFullSurah = (surahNum: number) => {
    const s = getSurah(surahNum);
    if (!s) return;
    onChange({
      startSurah: surahNum,
      startAyah: 1,
      endSurah: surahNum,
      endAyah: s.ayahCount,
      ayahCount: s.ayahCount
    });
  };

  const selectFullJuz = (juzNum: number) => {
    const j = JUZS.find((item) => item.juzNumber === juzNum);
    if (!j) return;
    const cnt = getRangeAyahCount(j.startSurah, j.startAyah, j.endSurah, j.endAyah);
    onChange({
      startSurah: j.startSurah,
      startAyah: j.startAyah,
      endSurah: j.endSurah,
      endAyah: j.endAyah,
      ayahCount: cnt
    });
  };

  return (
    <div className={`space-y-4 rounded-xl border border-[#E6E4DC] dark:border-[#1F3B32] p-4 bg-white dark:bg-[#11251E] ${className}`}>
      {/* Shortcut Mode Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E6E4DC] dark:border-[#1F3B32] pb-3">
        <label className="text-sm font-semibold text-[#252B27] dark:text-[#EDF3EF]">
          تحديد المقطع القرآني:
        </label>
        <div className="flex bg-[#F8F7F2] dark:bg-[#0B1914] p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'custom'
                ? 'bg-[#145A45] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            آيات مخصصة
          </button>
          <button
            type="button"
            onClick={() => setMode('surah')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'surah'
                ? 'bg-[#145A45] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            سورة كاملة
          </button>
          <button
            type="button"
            onClick={() => setMode('juz')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mode === 'juz'
                ? 'bg-[#145A45] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            جزء كامل
          </button>
        </div>
      </div>

      {mode === 'surah' ? (
        <div className="space-y-2">
          <label className="text-xs text-stone-500 dark:text-stone-400">اختر السورة:</label>
          <select
            value={startSurah}
            onChange={(e) => selectFullSurah(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-sm text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
          >
            {SURAHS.map((s) => (
              <option
                key={s.number}
                value={s.number}
              >
                {s.number}. سورة {s.nameArabic} ({s.ayahCount} آية)
              </option>
            ))}
          </select>
        </div>
      ) : mode === 'juz' ? (
        <div className="space-y-2">
          <label className="text-xs text-stone-500 dark:text-stone-400">اختر الجزء:</label>
          <select
            onChange={(e) => selectFullJuz(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-[#E6E4DC] dark:border-[#1F3B32] bg-[#F8F7F2] dark:bg-[#0B1914] px-3 py-2 text-sm text-[#252B27] dark:text-[#EDF3EF] focus:outline-none focus:ring-2 focus:ring-[#145A45]"
          >
            {JUZS.map((j) => (
              <option
                key={j.juzNumber}
                value={j.juzNumber}
              >
                {j.nameArabic} (من {getSurah(j.startSurah)?.nameArabic}:{j.startAyah} إلى {getSurah(j.endSurah)?.nameArabic}:{j.endAyah})
              </option>
            ))}
          </select>
        </div>
      ) : (
        /* Custom Arbitrary Range (including cross-Surah!) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Point */}
          <div className="space-y-2 rounded-lg bg-[#F8F7F2] dark:bg-[#0B1914] p-3 border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs font-semibold text-[#145A45] dark:text-[#8B9E82] block">
              بداية المقطع:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">
                  السورة
                </label>
                <select
                  value={startSurah}
                  onChange={(e) => handleStartSurahChange(parseInt(e.target.value, 10))}
                  className="w-full rounded-md border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1.5 text-xs text-[#252B27] dark:text-[#EDF3EF] font-semibold"
                >
                  {SURAHS.map((s) => (
                    <option
                      key={s.number}
                      value={s.number}
                    >
                      {s.number}. {s.nameArabic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">
                  من الآية (1 - {startSurahMeta.ayahCount})
                </label>
                <input
                  type="number"
                  min={1}
                  max={startSurahMeta.ayahCount}
                  value={startAyah}
                  onChange={(e) => handleStartAyahChange(parseInt(e.target.value || '1', 10))}
                  className="w-full rounded-md border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1.5 text-xs text-[#252B27] dark:text-[#EDF3EF]"
                />
              </div>
            </div>
          </div>

          {/* End Point */}
          <div className="space-y-2 rounded-lg bg-[#F8F7F2] dark:bg-[#0B1914] p-3 border border-[#E6E4DC] dark:border-[#1F3B32]">
            <span className="text-xs font-semibold text-[#145A45] dark:text-[#8B9E82] block">
              نهاية المقطع:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">
                  السورة
                </label>
                <select
                  value={endSurah}
                  onChange={(e) => handleEndSurahChange(parseInt(e.target.value, 10))}
                  className="w-full rounded-md border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1.5 text-xs text-[#252B27] dark:text-[#EDF3EF] font-semibold"
                >
                  {SURAHS.map((s) => (
                    <option
                      key={s.number}
                      value={s.number}
                    >
                      {s.number}. {s.nameArabic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">
                  إلى الآية (1 - {endSurahMeta.ayahCount})
                </label>
                <input
                  type="number"
                  min={1}
                  max={endSurahMeta.ayahCount}
                  value={endAyah}
                  onChange={(e) => handleEndAyahChange(parseInt(e.target.value || '1', 10))}
                  className="w-full rounded-md border border-[#E6E4DC] dark:border-[#1F3B32] bg-white dark:bg-[#11251E] px-2 py-1.5 text-xs text-[#252B27] dark:text-[#EDF3EF]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview & Verification */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-[#E6E4DC] dark:border-[#1F3B32]">
        <div className="flex items-center gap-1.5 font-medium text-[#145A45] dark:text-[#8B9E82]">
          <span>📍 النطاق المحدد:</span>
          <span className="font-semibold underline">
            {formatQuranRange(startSurah, startAyah, endSurah, endAyah)}
          </span>
        </div>
        <div className="bg-[#145A45]/10 dark:bg-[#145A45]/30 text-[#145A45] dark:text-[#A6B89D] px-2.5 py-1 rounded-full font-bold">
          {count} {count === 1 ? 'آية' : count === 2 ? 'آيتان' : count <= 10 ? 'آيات' : 'آية'}
        </div>
      </div>

      {!valid && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
          ⚠️ تنبيه: نهاية المقطع يجب أن تكون بعد بدايته.
        </p>
      )}
    </div>
  );
};
