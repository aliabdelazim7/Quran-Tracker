import type { MemorizationErrorClass, CheckerState } from '../types/recitation.ts';

export interface TranslatedError {
  label: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export function translateErrorClass(errorClass: MemorizationErrorClass | string): TranslatedError {
  switch (errorClass) {
    case 'wrong_word':
      return {
        label: 'كلمة مختلفة عن النص المتوقع',
        explanation: 'تم رصد كلمة مختلفة عن الآية الكريمة، يُرجى التثبت من موضع الكلمة وحركتها.',
        severity: 'high',
      };
    case 'omitted_word':
      return {
        label: 'كلمة محتمل إنها سقطت',
        explanation: 'يبدو أن إحدى كلمات الآية لم تُنطق أثناء التلاوة، راجع الآية للتأكد من تمامها.',
        severity: 'high',
      };
    case 'added_word':
      return {
        label: 'كلمة إضافية محتملة',
        explanation: 'تم رصد لفظ زائد غير موجود في نص المصحف الشريف لهذا الموضع.',
        severity: 'medium',
      };
    case 'skipped_passage':
      return {
        label: 'مقطع محتمل تم تخطيه',
        explanation: 'انتقلت التلاوة إلى موضع تالٍ مع تجاوز جزء من الآيات السابقة.',
        severity: 'high',
      };
    default:
      return {
        label: 'ملاحظة حفظ محتملة',
        explanation: 'إشارة استرشادية من النموذج لمراجعة هذا الموضع في المصحف.',
        severity: 'low',
      };
  }
}

export function translateCheckerState(state: CheckerState): string {
  switch (state) {
    case 'suspected':
      return 'تنبيه معلق (قيد المتابعة)';
    case 'confirmed':
      return 'موضع يحتاج مراجعة';
    case 'resolved':
      return 'تم تصحيحها ذاتيًا بنجاح ✨';
    case 'uncertain':
      return 'تنبيه غير مؤكد';
    default:
      return state;
  }
}

export function translateTrackerState(state: string): { label: string; description: string } {
  switch (state) {
    case 'acquiring':
      return {
        label: 'جاري تحديد الموضع...',
        description: 'استمع للتلاوة للتعرف على السورة والآية الحالية.',
      };
    case 'locked':
      return {
        label: 'مُتابع للتلاوة مباشرة 🎯',
        description: 'تم قفل الموضع ويتم تتبع القراءة كلمة بكلمة بدقة.',
      };
    case 'ambiguous':
      return {
        label: 'تشابه في الآيات',
        description: 'يوجد تشابه قرآني بين أكثر من موضع، يستمر النظام في الاستماع للفصل بينها.',
      };
    case 'lost':
      return {
        label: 'فُقد تتبع الموضع',
        description: 'يرجى مواصلة القراءة بصوت واضح من بداية الآية لإعادة قفل الموضع.',
      };
    default:
      return {
        label: state,
        description: '',
      };
  }
}

/**
 * Translates engine and browser microphone/runtime errors to clear Arabic guidance.
 */
export function translateRecitationError(err: any): string {
  if (!err) return 'حدث خطأ غير متوقع أثناء إعداد جلسة التسميع.';
  const message = typeof err === 'string' ? err : err?.message || String(err);
  const name = err?.name || '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || message.includes('denied') || message.includes('Permission')) {
    return 'تم رفض إذن الوصول إلى الميكروفون. يرجى السماح بالوصول للميكروفون من شريط المتصفح ثم إعادة المحاولة.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || message.includes('unavailable')) {
    return 'لم يتم العثور على ميكروفون متصل بالجهاز. يرجى التحقق من توصيل الميكروفون وإعادة المحاولة.';
  }
  if (name === 'SecurityError' || message.includes('insecure-context')) {
    return 'تشغيل التسميع الصوتي يتطلب بيئة آمنة (HTTPS أو localhost).';
  }
  if (message.includes('No onnxruntime-web provider') || message.includes('WASM') || message.includes('wasm')) {
    return 'تعذر تشغيل معالج الذكاء الاصطناعي على متصفحك. يرجى التأكد من دعم WebAssembly أو تحديث المتصفح.';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
    return 'فشل تنزيل ملفات النموذج الذكي. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.';
  }
  return message;
}
