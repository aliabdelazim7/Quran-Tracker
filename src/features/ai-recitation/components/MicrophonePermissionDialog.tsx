import React from 'react';
import { Mic, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isIosSafari?: boolean;
}

export const MicrophonePermissionDialog: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onCancel,
  isIosSafari,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">إذن استخدام الميكروفون للتسميع</h3>
            <p className="text-xs text-emerald-400 mt-0.5">خصوصية تامة ومعالجة محلية على جهازك 100%</p>
          </div>
        </div>

        {/* Privacy Guarantees */}
        <div className="space-y-3 my-5 text-xs text-slate-300">
          <div className="flex items-start gap-3 bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>لا يُرفع أي صوت إلى السيرفر:</strong> يتم تحليل التلاوة وتتبع الكلمات بالكامل داخل متصفحك باستخدام الذكاء الاصطناعي المحلي (Edge AI). لا يتم حفظ أو تسجيل أو إرسال صوتك لأي جهة.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>مساعد استرشادي فقط:</strong> التسميع الذكي مخصص لتنبيهك إلى الكلمات المتروكة أو الزائدة أثناء المراجعة، وليس حُكماً فقهياً أو تقييماً لأحكام التجويد ومخارج الحروف.
            </p>
          </div>

          {isIosSafari && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>ملاحظة لأجهزة آيفون (Safari):</strong> يتطلب نظام iOS الضغط مباشرة على زر البدء لتفعيل استقبال الصوت بسلاسة.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition"
          >
            <Mic className="w-4 h-4" />
            السماح وبدء التسميع
          </button>
        </div>
      </div>
    </div>
  );
};
