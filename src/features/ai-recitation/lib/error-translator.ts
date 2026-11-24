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
