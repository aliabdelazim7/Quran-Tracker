import React, { useState } from 'react';
import { SURAHS } from '@/data/quranData';
import { RecitationMode, DeclaredPassageConfig } from '../types/recitation';
import { validatePassage } from '../lib/recitation-validator';
import { BookOpen, Sparkles, Mic, Play, Compass, CheckCircle } from 'lucide-react';

interface Props {
  onStart: (mode: RecitationMode, passage?: DeclaredPassageConfig) => void;
  isLoading?: boolean;
}

export const RecitationSetup: React.FC<Props> = ({ onStart, isLoading }) => {
  const [mode, setMode] = useState<RecitationMode>('memorization');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(7);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentSurahMeta = SURAHS.find((s) => s.number === selectedSurah) || SURAHS[0];

  const handleSurahChange = (surahNum: number) => {
    setSelectedSurah(surahNum);
    setFromAyah(1);
    const meta = SURAHS.find((s) => s.number === surahNum);
    setToAyah(meta ? Math.min(10, meta.ayahCount) : 7);
    setValidationError(null);
  };

  const handleStart = () => {
    if (mode === 'memorization') {
      const val = validatePassage(selectedSurah, fromAyah, toAyah);
      if (!val.valid) {
        setValidationError(val.error || 'البيانات غير صحيحة.');
        return;
      }
      setValidationError(null);
      onStart('memorization', {
        surah: selectedSurah,
        fromAyah,
        toAyah,
      });
    } else {
      onStart('free');
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl text-right" dir="rtl">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">إعداد جلسة التسميع الذكي</h2>
          <p className="text-xs text-slate-400 mt-0.5">اختر نمط التسميع والمقطع القرآني الذي ترغب في مراجعته</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMode('memorization')}
          className={`flex flex-col p-4 rounded-xl border text-right transition-all ${
            mode === 'memorization'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/20'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className={`p-2 rounded-lg ${mode === 'memorization' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <BookOpen className="w-5 h-5" />
            </span>
            {mode === 'memorization' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          </div>
          <span className="font-bold text-slate-100 text-sm">تسميع مقطع محدد (موصى به)</span>
          <span className="text-xs text-slate-400 mt-1">تحديد سورة ومجال آيات معين لمقارنة تلاوتك بالنص القرآني بدقة.</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('free')}
          className={`flex flex-col p-4 rounded-xl border text-right transition-all ${
            mode === 'free'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/20'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className={`p-2 rounded-lg ${mode === 'free' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Compass className="w-5 h-5" />
            </span>
            {mode === 'free' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          </div>
          <span className="font-bold text-slate-100 text-sm">تسميع حر / مفتوح</span>
          <span className="text-xs text-slate-400 mt-1">اقرأ أي موضع من القرآن، وسيتعرف النظام على السورة والآية تلقائياً.</span>
        </button>
      </div>

      {/* Mode A Fields */}
      {mode === 'memorization' && (
        <div className="space-y-4 bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 sm:p-5 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">السورة الكريمة</label>
            <select
              value={selectedSurah}
              onChange={(e) => handleSurahChange(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.nameArabic} ({s.ayahCount} آية) - {s.revelationType}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">من الآية</label>
              <input
                type="number"
                min={1}
                max={currentSurahMeta.ayahCount}
                value={fromAyah}
                onChange={(e) => setFromAyah(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">إلى الآية</label>
              <input
                type="number"
                min={fromAyah}
                max={currentSurahMeta.ayahCount}
                value={toAyah}
                onChange={(e) => setToAyah(parseInt(e.target.value, 10) || fromAyah)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
              />
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            عدد الآيات المحددة للتسميع: <strong className="text-emerald-400 font-bold">{Math.max(0, toAyah - fromAyah + 1)}</strong> آية من سورة {currentSurahMeta.nameArabic}.
          </div>

          {validationError && (
            <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/50 p-2.5 rounded-lg">
              {validationError}
            </div>
          )}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/30 transition-all duration-200 disabled:opacity-50 text-sm"
      >
        <Mic className="w-5 h-5" />
        <span>{isLoading ? 'جاري التحضير...' : 'ابدأ التسميع الآن'}</span>
        <Play className="w-4 h-4 fill-current mr-1" />
      </button>
    </div>
  );
};
