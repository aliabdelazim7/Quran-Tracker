import React from 'react';
import { ModelDownloadState } from '../types/recitation';
import { Cpu, HardDrive, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  state: ModelDownloadState;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const ModelDownloadProgress: React.FC<Props> = ({ state, onRetry, onCancel }) => {
  const percent = Math.min(100, Math.round(state.fraction * 100));

  const getStageTitle = () => {
    switch (state.stage) {
      case 'model':
        return 'جاري تحميل نموذج الذكاء الاصطناعي...';
      case 'reference':
        return 'جاري تحميل وضبط المصحف الشريف المرجعي...';
      case 'warmup':
        return 'جاري تهيئة محرك الاستنتاج الصوتي وتجهيز الذاكرة...';
      case 'ready':
        return 'اكتمل تجهيز المساعد الذكي بنجاح!';
      case 'error':
        return 'تعذر إكمال تجهيز النموذج الذكي';
      default:
        return 'بنجهز مساعد التسميع الذكي...';
    }
  };

  const getStageDescription = () => {
    if (state.fromCache) {
      return 'تم استرجاع النموذج من التخزين المحلي للمتصفح (Cache API) دون الحاجة لإعادة التنزيل.';
    }
    switch (state.stage) {
      case 'model':
        return 'يتم تنزيل أوزان نموذج التعرف الصوتي (مرة واحدة فقط ويُحفظ محلياً على جهازك).';
      case 'reference':
        return 'يتم فحص مصفوفة النص القرآني المعتمدة لمطابقة الكلمات بدقة أثناء التلاوة.';
      case 'warmup':
        return 'يتم فحص تسريع العتاد (WebAssembly / WebGPU) لبدء التتبع الفوري.';
      case 'ready':
        return 'كل شيء جاهز للبدء في الاستماع إلى تلاوتك الكريمة.';
      case 'error':
        return state.error || 'يرجى التأكد من اتصالك بالإنترنت وإعادة المحاولة.';
      default:
        return 'يرجى الانتظار بضع ثوانٍ...';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl backdrop-blur-md text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {state.stage === 'error' ? (
            <AlertCircle className="w-6 h-6 text-rose-400" />
          ) : state.stage === 'ready' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">{getStageTitle()}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{getStageDescription()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {state.stage !== 'error' && (
        <div className="space-y-2 my-5">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>{percent}%</span>
            <span>
              {state.total > 0
                ? `${(state.loaded / (1024 * 1024)).toFixed(1)} ميجابايت من ${(state.total / (1024 * 1024)).toFixed(1)} ميجابايت`
                : 'جاري الحساب...'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Hardware / Engine Metadata */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 my-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>محرك التشغيل: <strong className="text-slate-200">{state.backend || 'WASM SIMD'}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>حجم النموذج: <strong className="text-slate-200">{state.tier === 'lite' ? 'خفيف (24MB)' : 'كامل (68MB)'}</strong></span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/80">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            إلغاء
          </button>
        )}
        {state.stage === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
};
