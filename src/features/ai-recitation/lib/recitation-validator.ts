import { SURAHS } from '../../../data/quranData.ts';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePassage(
  surah: number,
  fromAyah: number,
  toAyah: number
): ValidationResult {
  if (isNaN(surah) || surah < 1 || surah > 114) {
    return { valid: false, error: 'رقم السورة غير صحيح (يجب أن يكون بين 1 و 114).' };
  }

  const meta = SURAHS.find((s) => s.number === surah);
  if (!meta) {
    return { valid: false, error: 'السورة المحددة غير موجودة في بيانات المصحف.' };
  }

  if (isNaN(fromAyah) || fromAyah < 1) {
    return { valid: false, error: 'آية البداية يجب أن تكون 1 أو أكثر.' };
  }

  if (isNaN(toAyah) || toAyah > meta.ayahCount) {
    return {
      valid: false,
      error: `آية النهاية (${toAyah}) تتجاوز إجمالي عدد آيات سورة ${meta.nameArabic} (${meta.ayahCount} آية).`,
    };
  }

  if (fromAyah > toAyah) {
    return { valid: false, error: 'آية البداية لا يمكن أن تكون أكبر من آية النهاية.' };
  }

  return { valid: true };
}

export interface BrowserSupportResult {
  supported: boolean;
  reasons: string[];
  isIosSafari: boolean;
  isSecureContext: boolean;
}

export function checkBrowserCapabilities(): BrowserSupportResult {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      reasons: ['Client-side environment required'],
      isIosSafari: false,
      isSecureContext: false,
    };
  }

  const reasons: string[] = [];
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isSecure) {
    reasons.push('الوصول إلى الميكروفون ونموذج الذكاء الاصطناعي يتطلب اتصالاً مشفرًا وآمنًا (HTTPS).');
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    reasons.push('المتصفح الحالي لا يدعم واجهة الوصول إلى الميكروفون (MediaDevices API).');
  }

  if (typeof window.AudioContext === 'undefined' && typeof (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === 'undefined') {
    reasons.push('المتصفح لا يدعم معالجة الصوت الرقمي (Web Audio API).');
  }

  if (typeof WebAssembly === 'undefined') {
    reasons.push('المتصفح لا يدعم تشغيل كود WebAssembly المطلوب لمحرك الاستنتاج الذكي.');
  }

  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|crios|android/.test(ua);
  const isIosSafari = isIos && isSafari;

  return {
    supported: reasons.length === 0,
    reasons,
    isIosSafari,
    isSecureContext: isSecure,
  };
}
