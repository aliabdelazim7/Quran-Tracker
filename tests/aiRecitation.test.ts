import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validatePassage } from '../src/features/ai-recitation/lib/recitation-validator.ts';
import {
  translateErrorClass,
  translateCheckerState,
  translateTrackerState,
} from '../src/features/ai-recitation/lib/error-translator.ts';
import {
  mapPositionEvent,
  mapCheckerEvent,
  normalizePhonemes,
} from '../src/features/ai-recitation/lib/event-mapper.ts';
import type {
  RawPositionEvent,
  RawCheckerEvent,
} from '../src/features/ai-recitation/lib/event-mapper.ts';

describe('AI Recitation Module Tests', () => {
  describe('Passage Validation', () => {
    test('accepts valid passage within Surah bounds', () => {
      const res = validatePassage(1, 1, 7);
      assert.strictEqual(res.valid, true);
    });

    test('accepts valid passage for Al-Baqarah', () => {
      const res = validatePassage(2, 1, 50);
      assert.strictEqual(res.valid, true);
    });

    test('rejects out of bounds surah number', () => {
      const res = validatePassage(115, 1, 5);
      assert.strictEqual(res.valid, false);
      assert.ok(res.error?.includes('رقم السورة غير صحيح'));
    });

    test('rejects fromAyah greater than toAyah', () => {
      const res = validatePassage(1, 5, 2);
      assert.strictEqual(res.valid, false);
      assert.ok(res.error?.includes('أكبر من آية النهاية'));
    });

    test('rejects toAyah exceeding total ayahs in surah', () => {
      const res = validatePassage(1, 1, 10);
      assert.strictEqual(res.valid, false);
      assert.ok(res.error?.includes('تتجاوز إجمالي عدد آيات سورة الفاتحة'));
    });
  });

  describe('Error Translation', () => {
    test('translates wrong_word error class to Arabic', () => {
      const trans = translateErrorClass('wrong_word');
      assert.strictEqual(trans.label, 'كلمة مختلفة عن النص المتوقع');
      assert.strictEqual(trans.severity, 'high');
    });

    test('translates omitted_word error class to Arabic', () => {
      const trans = translateErrorClass('omitted_word');
      assert.strictEqual(trans.label, 'كلمة محتمل إنها سقطت');
      assert.strictEqual(trans.severity, 'high');
    });

    test('translates added_word error class to Arabic', () => {
      const trans = translateErrorClass('added_word');
      assert.strictEqual(trans.label, 'كلمة إضافية محتملة');
      assert.strictEqual(trans.severity, 'medium');
    });

    test('translates skipped_passage error class to Arabic', () => {
      const trans = translateErrorClass('skipped_passage');
      assert.strictEqual(trans.label, 'مقطع محتمل تم تخطيه');
      assert.strictEqual(trans.severity, 'high');
    });

    test('translates checker states accurately', () => {
      assert.ok(translateCheckerState('suspected').includes('تنبيه معلق'));
      assert.ok(translateCheckerState('confirmed').includes('موضع يحتاج مراجعة'));
      assert.ok(translateCheckerState('resolved').includes('تم تصحيحها ذاتيًا'));
      assert.ok(translateCheckerState('uncertain').includes('غير مؤكد'));
    });

    test('translates tracker states accurately', () => {
      assert.ok(translateTrackerState('locked').label.includes('مُتابع للتلاوة'));
      assert.ok(translateTrackerState('acquiring').label.includes('جاري تحديد الموضع'));
    });
  });

  describe('Event Mapping', () => {
    test('maps raw PositionEvent to clean RecitationPosition', () => {
      const rawPos: RawPositionEvent = {
        type: 'position',
        timeMs: 1500,
        expected: { surah: 1, ayah: 2, word: 1 },
        observed: [{ word: { surah: 1, ayah: 2, word: 1 }, confidence: 0.95 }],
        state: 'locked',
      };

      const mapped = mapPositionEvent(rawPos);
      assert.ok(mapped);
      assert.strictEqual(mapped?.surah, 1);
      assert.strictEqual(mapped?.ayah, 2);
      assert.strictEqual(mapped?.word, 1);
      assert.strictEqual(mapped?.state, 'locked');
      assert.strictEqual(mapped?.confidence, 0.95);
      assert.strictEqual(mapped?.expected?.surah, 1);
    });

    test('normalizes raw Tilawa phonemes to clean Arabic text', () => {
      assert.strictEqual(normalizePhonemes('ررَحمَاانِ'), 'رَّحمَانِ');
      assert.strictEqual(normalizePhonemes('ررَحِۦۦم'), 'رَّحِيم');
    });

    test('maps raw CheckerEvent preserving unique event ID and location', () => {
      const rawChecker: RawCheckerEvent = {
        type: 'checker',
        id: 'chk-evt-9912',
        timeMs: 3200,
        state: 'confirmed',
        errorClass: 'wrong_word',
        location: { surah: 1, ayah: 3, word: 1 },
        expected: 'الرَّحْمَـٰنِ',
        observed: 'الرحيم',
        confidence: 0.92,
      };

      const mapped = mapCheckerEvent(rawChecker);
      assert.strictEqual(mapped.id, 'chk-evt-9912');
      assert.strictEqual(mapped.errorClass, 'wrong_word');
      assert.strictEqual(mapped.state, 'confirmed');
      assert.strictEqual(mapped.location.surah, 1);
      assert.strictEqual(mapped.location.ayah, 3);
      assert.strictEqual(mapped.location.word, 1);
      assert.strictEqual(mapped.expected, 'الرَّحْمَـٰنِ');
      assert.strictEqual(mapped.observed, 'الرحيم');
      assert.strictEqual(mapped.confidence, 0.92);
      assert.strictEqual(mapped.translatedLabel, 'كلمة مختلفة عن النص المتوقع');
    });
  });
});
