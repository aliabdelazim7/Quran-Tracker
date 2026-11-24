import React from 'react';
import { TrackerState } from '../types/recitation';
import { translateTrackerState } from '../lib/error-translator';
import { Clock, Check, X, Mic, Volume2 } from 'lucide-react';

interface Props {
  trackerState: TrackerState;
  elapsedSeconds: number;
  wordsCount: number;
  audioLevel: number;
  onFinish: () => void;
  onCancel: () => void;
}

export const RecitationProgress: React.FC<Props> = ({
  trackerState,
  elapsedSeconds,
  wordsCount,
  audioLevel,
  onFinish,
  onCancel,
}) => {
  const { label, description } = translateTrackerState(trackerState);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert dBFS (-60 to 0) to percentage (0 to 100)
  const levelPercent = Math.min(100, Math.max(5, ((audioLevel + 60) / 60) * 100));

  const getStatusColor = () => {
    switch (trackerState) {
      case 'locked':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'acquiring':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'ambiguous':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'lost':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg text-right" dir="rtl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${getStatusColor()}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{label}</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">{description}</span>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-6 text-xs text-slate-300">
          {/* Audio Visualizer */}
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400" />
            <div className="w-16 sm:w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-emerald-400 h-full transition-all duration-100 ease-out"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
          </div>

          {/* Words Count */}
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span>الكلمات: <strong className="text-emerald-400 font-bold">{wordsCount}</strong></span>
          </div>

          {/* Time Elapsed */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-slate-100 font-bold">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Session Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
            إلغاء
          </button>
          <button
            onClick={onFinish}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
          >
            <Check className="w-4 h-4" />
            إنهاء وعرض التقرير
          </button>
        </div>
      </div>
    </div>
  );
};
