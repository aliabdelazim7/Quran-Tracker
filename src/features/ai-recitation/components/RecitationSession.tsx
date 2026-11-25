import React, { useEffect, useState } from 'react';
import {
  RecitationMode,
  DeclaredPassageConfig,
  RecitationPosition,
  RecitationFinding,
  AyahDisplayItem,
  TrackerState,
} from '../types/recitation';
import { loadPassageText } from '../lib/quran-text-loader';
import { SURAHS } from '@/data/quranData';
import { QuranWordDisplay } from './QuranWordDisplay';
import { RecitationProgress } from './RecitationProgress';
import { RecitationFindings } from './RecitationFindings';

interface Props {
  mode: RecitationMode;
  passageConfig: DeclaredPassageConfig | null;
  currentPosition: RecitationPosition | null;
  confirmedFindings: RecitationFinding[];
  suspectedFindings: RecitationFinding[];
  resolvedFindings: RecitationFinding[];
  elapsedSeconds: number;
  wordsCount: number;
  audioLevel: number;
  onFinish: () => void;
  onCancel: () => void;
}

export const RecitationSession: React.FC<Props> = ({
  mode,
  passageConfig,
  currentPosition,
  confirmedFindings,
  suspectedFindings,
  resolvedFindings,
  elapsedSeconds,
  wordsCount,
  audioLevel,
  onFinish,
  onCancel,
}) => {
  const [ayahs, setAyahs] = useState<AyahDisplayItem[]>([]);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);

  // 1. Memorization mode: Load fixed passage once on session start
  useEffect(() => {
    let active = true;
    if (mode === 'memorization' && passageConfig) {
      setIsLoadingPassage(true);
      loadPassageText(
        passageConfig.surah,
        passageConfig.fromAyah,
        passageConfig.toAyah
      )
        .then((items) => {
          if (active) setAyahs(items);
        })
        .catch((e) => {
          console.error('Failed to load passage text:', e);
        })
        .finally(() => {
          if (active) setIsLoadingPassage(false);
        });
    }
    return () => {
      active = false;
    };
  }, [mode, passageConfig?.surah, passageConfig?.fromAyah, passageConfig?.toAyah]);

  // 2. Free recitation mode: Dynamically load surrounding window when new surah/ayah detected
  const currentSurah = currentPosition?.surah;
  const currentAyah = currentPosition?.ayah;

  useEffect(() => {
    let active = true;
    if (mode === 'free' && currentSurah && currentAyah) {
      const alreadyLoaded = ayahs.some((a) => a.surah === currentSurah && a.ayah === currentAyah);
      if (!alreadyLoaded || ayahs.length === 0) {
        loadPassageText(
          currentSurah,
          Math.max(1, currentAyah - 2),
          currentAyah + 4
        )
          .then((items) => {
            if (active && items.length > 0) setAyahs(items);
          })
          .catch((e) => {
            console.error('Failed to load dynamic free recitation text:', e);
          });
      }
    }
    return () => {
      active = false;
    };
  }, [mode, currentSurah, currentAyah, ayahs]);

  const surahNum = passageConfig?.surah || currentPosition?.surah;
  const surahMeta = surahNum ? SURAHS.find((s) => s.number === surahNum) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Live Header & Audio Controls */}
      <RecitationProgress
        trackerState={currentPosition?.state || 'acquiring'}
        elapsedSeconds={elapsedSeconds}
        wordsCount={wordsCount}
        audioLevel={audioLevel}
        onFinish={onFinish}
        onCancel={onCancel}
      />

      {/* Main Quran Word Flow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLoadingPassage ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
              <span className="animate-pulse">جاري تحميل النص القرآني المعتمد...</span>
            </div>
          ) : (
            <QuranWordDisplay
              ayahs={ayahs}
              currentPosition={currentPosition}
              findings={[...confirmedFindings, ...suspectedFindings, ...resolvedFindings]}
              surahName={surahMeta?.nameArabic}
              isFreeRecitation={mode === 'free'}
            />
          )}

          {/* Quick Guidance Footer */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span>💡 اقرأ بهدوء وترتيل ليتابع النظام تلاوتك بدقة.</span>
            <span className="text-emerald-400 font-mono">
              {currentPosition ? `الآية ${currentPosition.ayah}، كلمة ${currentPosition.word}` : 'بانتظار صوتك'}
            </span>
          </div>
        </div>

        {/* Live Findings Sidebar */}
        <div className="lg:col-span-1">
          <RecitationFindings
            confirmedFindings={confirmedFindings}
            suspectedFindings={suspectedFindings}
            resolvedFindings={resolvedFindings}
          />
        </div>
      </div>
    </div>
  );
};
