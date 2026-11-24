import React from 'react';
import { RecitationFinding } from '../types/recitation';
import { AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';

interface Props {
  confirmedFindings: RecitationFinding[];
  suspectedFindings: RecitationFinding[];
  resolvedFindings: RecitationFinding[];
}

export const RecitationFindings: React.FC<Props> = ({
  confirmedFindings,
  suspectedFindings,
  resolvedFindings,
}) => {
  const hasAny = confirmedFindings.length > 0 || suspectedFindings.length > 0 || resolvedFindings.length > 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg text-right" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>الملاحظات الفورية للتسميع</span>
          {hasAny && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {confirmedFindings.length}
            </span>
          )}
        </h3>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          تنبيهات استرشادية للمراجعة
        </span>
      </div>

      {!hasAny ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <p className="text-emerald-400 font-semibold mb-1">ما شاء الله، التلاوة تسير بسلاسة! ✨</p>
          <p className="text-slate-500">لم يتم رصد أي كلمات متروكة أو غير متطابقة حتى الآن.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {/* Confirmed Mistakes */}
          {confirmedFindings.map((f) => (
            <div
              key={f.id}
              className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3 flex items-start gap-3 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">{f.translatedLabel}</span>
                  <span className="text-[10px] text-rose-400 font-sans">
                    سورة {f.location.surah} - الآية {f.location.ayah}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">{f.translatedExplanation}</p>
                {f.expected && (
                  <div className="mt-1.5 text-[11px] text-slate-400 flex gap-4">
                    <span>المتوقع: <strong className="text-emerald-300">{f.expected}</strong></span>
                    {f.observed && <span>المسموع: <strong className="text-rose-300">{f.observed}</strong></span>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Resolved Self-Corrections */}
          {resolvedFindings.map((f) => (
            <div
              key={f.id}
              className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                عاش! تم تصحيح الموضع ذاتياً في الآية <strong>{f.location.ayah}</strong> بنجاح.
              </span>
            </div>
          ))}

          {/* Suspected Pending Warnings */}
          {suspectedFindings.map((f) => (
            <div
              key={f.id}
              className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-300 opacity-80"
            >
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
              <span>جاري التحقق من الآية {f.location.ayah}...</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
