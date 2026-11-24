import React, { useEffect, useRef } from 'react';
import { AyahDisplayItem, RecitationPosition, RecitationFinding } from '../types/recitation';

interface Props {
  ayahs: AyahDisplayItem[];
  currentPosition: RecitationPosition | null;
  findings: RecitationFinding[];
  surahName?: string;
  isFreeRecitation?: boolean;
}

export const QuranWordDisplay: React.FC<Props> = ({
  ayahs,
  currentPosition,
  findings,
  surahName,
  isFreeRecitation,
}) => {
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Auto-scroll to active word
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [currentPosition?.surah, currentPosition?.ayah, currentPosition?.word]);

  const getWordFinding = (surah: number, ayah: number, wordIndex: number) => {
    return findings.find(
      (f) =>
        f.location.surah === surah &&
        f.location.ayah === ayah &&
        f.location.word === wordIndex
    );
  };

  return (
    <div
      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-inner max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700/50 text-right leading-loose select-none"
      dir="rtl"
    >
      {/* Surah Header */}
      {surahName && (
        <div className="text-center mb-8 pb-4 border-b border-emerald-900/40">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 inline-block mb-2">
            سورة {surahName}
          </span>
          <h2 className="text-2xl font-serif text-emerald-300 tracking-wide font-bold">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </h2>
        </div>
      )}

      {isFreeRecitation && ayahs.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <p className="text-base font-medium">ابدأ بالقراءة بصوت واضح من أي موضع في القرآن الكريم...</p>
          <p className="text-xs text-slate-500 mt-2">سيتعرف المساعد الذكي على السورة والآية ويظهر النص تلقائياً.</p>
        </div>
      )}

      {/* Ayahs Flow */}
      <div className="text-slate-100 font-serif text-2xl sm:text-3xl leading-[2.6] sm:leading-[2.8] text-justify space-x-reverse">
        {ayahs.map((ay) => (
          <span key={`${ay.surah}:${ay.ayah}`} className="inline">
            {ay.words.map((w) => {
              const isCurrent =
                currentPosition?.surah === w.surah &&
                currentPosition?.ayah === w.ayah &&
                currentPosition?.word === w.wordIndex &&
                currentPosition?.state === 'locked';

              const finding = getWordFinding(w.surah, w.ayah, w.wordIndex);

              let badgeStyle = 'text-slate-200 hover:text-emerald-300';
              if (isCurrent) {
                badgeStyle =
                  'bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-lg ring-2 ring-emerald-400 shadow-md animate-pulse';
              } else if (finding) {
                if (finding.state === 'confirmed') {
                  badgeStyle =
                    'bg-rose-500/20 text-rose-300 underline decoration-rose-500 decoration-wavy px-1 rounded';
                } else if (finding.state === 'suspected') {
                  badgeStyle =
                    'bg-amber-500/20 text-amber-300 underline decoration-amber-500 decoration-dotted px-1 rounded';
                } else if (finding.state === 'resolved') {
                  badgeStyle = 'bg-teal-500/20 text-teal-300 px-1 rounded';
                }
              }

              return (
                <span
                  key={`${w.surah}:${w.ayah}:${w.wordIndex}`}
                  ref={isCurrent ? activeWordRef : null}
                  title={
                    finding
                      ? `${finding.translatedLabel} (${finding.state})`
                      : `الآية ${w.ayah}، كلمة ${w.wordIndex + 1}`
                  }
                  className={`inline-block mx-1 transition-all duration-200 cursor-default ${badgeStyle}`}
                >
                  {w.text}
                </span>
              );
            })}
            {/* Ayah End Symbol */}
            <span className="inline-block mx-2 text-emerald-500 text-lg sm:text-xl font-sans font-bold select-none opacity-80">
              ﴿{ay.ayah}﴾
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
