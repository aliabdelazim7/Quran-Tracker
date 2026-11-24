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

  // Load passage text on mount
  useEffect(() => {
    async function fetchPassage() {
      if (mode === 'memorization' && passageConfig) {
        setIsLoadingPassage(true);
        try {
          const items = await loadPassageText(
            passageConfig.surah,
            passageConfig.fromAyah,
            passageConfig.toAyah
          );
          setAyahs(items);
        } catch (e) {
          console.error('Failed to load passage text:', e);
        } finally {
          setIsLoadingPassage(false);
        }
      } else if (mode === 'free' && currentPosition?.surah) {
        // In free recitation, dynamically load surrounding ayahs when position is detected
        try {
          const items = await loadPassageText(
            currentPosition.surah,
            Math.max(1, currentPosition.ayah - 2),
            currentPosition.ayah + 3
          );
          setAyahs(items);
        } catch (e) {}
      }
    }

    fetchPassage();
  }, [mode, passageConfig, currentPosition?.surah, currentPosition?.ayah]);

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
              findings={confirmedFindings}
              surahName={surahMeta?.nameArabic}
              isFreeRecitation={mode === 'free'}
            />
          )}

          {/* Quick Guidance Footer */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span>💡 اقرأ بهدوء وترتيل ليتابع النظام تلاوتك بدقة.</span>
            <span className="text-emerald-400 font-mono">
              {currentPosition ? `الآية ${currentPosition.ayah}، كلمة ${currentPosition.word + 1}` : 'بانتظار صوتك'}
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
