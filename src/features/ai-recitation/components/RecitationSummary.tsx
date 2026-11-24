import React, { useState } from 'react';
import { RecitationSessionSummary } from '../types/recitation';
import { SURAHS } from '@/data/quranData';
import { saveRecitationSession } from '../services/recitation.service';
import {
  Sparkles,
  Clock,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Heart,
  Save,
  RotateCcw,
  Share2,
  Check,
} from 'lucide-react';

interface Props {
  summary: RecitationSessionSummary;
  onRestart: () => void;
  onReturnDashboard: () => void;
}

export const RecitationSummary: React.FC<Props> = ({
  summary,
  onRestart,
  onReturnDashboard,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const surahMeta = summary.surahNumber ? SURAHS.find((s) => s.number === summary.surahNumber) : null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} دقيقة و ${s} ثانية`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await saveRecitationSession(summary);
      if (res.success) {
        setSaveSuccess(true);
      } else {
        setSaveError(res.error || 'فشل حفظ التقرير.');
      }
    } catch (e: any) {
      setSaveError(e?.message || 'خطأ أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  const getEncouragement = () => {
    if (summary.totalConfirmedMistakes === 0) {
      return {
        title: 'عاش يا بطل! تلاوة ممتازة ومتقنة ما شاء الله ❤️',
        subtitle: 'أتممت التسميع دون أي ملاحظات أو كلمات متجاوزة، ثبّت الله القرآن في صدرك!',
      };
    }
    if (summary.totalConfirmedMistakes <= 2) {
      return {
        title: 'عاش يا صاحبي ❤️ جلسة مراجعة طيبة جدًا!',
        subtitle: 'فيه موضع أو موضعين محتاجين تثبيت بسيط وده طبيعي جداً في طريق الحفظ المتقن.',
      };
    }
    return {
      title: 'جهد عظيم ومحاولة ممتازة يا غالي ❤️',
      subtitle: 'التكرار وسماع الأخطاء وتصحيحها هو أساس الرسوخ، راجع المواضع دي واسمعها تاني!',
    };
  };

  const encouragement = getEncouragement();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-2xl text-right" dir="rtl">
      {/* Celebration Header */}
      <div className="text-center pb-6 border-b border-slate-800">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/20">
          <Heart className="w-8 h-8 fill-emerald-500/20 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">{encouragement.title}</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">{encouragement.subtitle}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
          <div className="flex justify-center text-emerald-400 mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400">مدة التسميع</span>
          <p className="text-sm font-bold text-slate-100 mt-0.5">{formatTime(summary.durationSeconds)}</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
          <div className="flex justify-center text-emerald-400 mb-1">
            <Volume2 className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400">الكلمات المستمعة</span>
          <p className="text-sm font-bold text-slate-100 mt-0.5">{summary.totalWordsRecited} كلمة</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
          <div className="flex justify-center text-rose-400 mb-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400">مواضع للمراجعة</span>
          <p className="text-sm font-bold text-rose-400 mt-0.5">{summary.totalConfirmedMistakes}</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
          <div className="flex justify-center text-teal-400 mb-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400">تصحيح ذاتي</span>
          <p className="text-sm font-bold text-teal-400 mt-0.5">{summary.totalSelfCorrections}</p>
        </div>
      </div>

      {/* Passage Info */}
      {surahMeta && (
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 mb-6 text-xs text-slate-300 flex items-center justify-between">
          <span>المقطع: <strong className="text-emerald-400 font-bold">سورة {surahMeta.nameArabic}</strong> {summary.startAyah && summary.endAyah ? `(الآيات ${summary.startAyah} إلى ${summary.endAyah})` : '(تسميع حر)'}</span>
          <span className="text-slate-400">نموذج: Tilawa {summary.modelTier || 'auto'} ({summary.executionBackend || 'wasm'})</span>
        </div>
      )}

      {/* Detailed Mistakes List */}
      {summary.findings.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">تفاصيل المواضع التي تحتاج تثبيتاً:</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {summary.findings.map((f, i) => (
              <div key={i} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-400">{f.translatedLabel}</span>
                  <span className="text-slate-400">سورة {f.location.surah} - الآية {f.location.ayah}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{f.translatedExplanation}</p>
                {f.expected && (
                  <div className="mt-2 text-[11px] bg-slate-900 p-2 rounded-lg flex justify-between">
                    <span>النص المعتمد: <strong className="text-emerald-300 font-bold">{f.expected}</strong></span>
                    {f.observed && <span>المسموع: <strong className="text-rose-300">{f.observed}</strong></span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Notification */}
      {saveSuccess && (
        <div className="mb-6 bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>تم حفظ تقرير الجلسة في سجلك الشخصي بنجاح!</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 bg-rose-950/30 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300">
          {saveError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
        {!saveSuccess && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التقرير في سجلي'}</span>
          </button>
        )}

        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>تسميع مقطع آخر</span>
        </button>

        <button
          onClick={onReturnDashboard}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <span>العودة للرئيسية</span>
        </button>
      </div>
    </div>
  );
};
