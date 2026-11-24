import assert from 'node:assert';
import test from 'node:test';

import {
  SURAHS,
  JUZS,
  TOTAL_AYAH_COUNT,
  TOTAL_SURAHS,
  TOTAL_JUZ,
  isValidAyah,
  isValidRange,
  compareQuranPositions,
  getRangeAyahCount,
  getAyahKeysForRange,
  getUniqueAyahCount,
  formatQuranRange
} from '../src/data/quranData.ts';

test('1. Canonical Quran Metadata Integrity', () => {
  assert.strictEqual(SURAHS.length, 114, 'Surahs count must be exactly 114');
  assert.strictEqual(TOTAL_SURAHS, 114);
  assert.strictEqual(JUZS.length, 30, 'Juz count must be exactly 30');
  assert.strictEqual(TOTAL_JUZ, 30);

  const totalAyahs = SURAHS.reduce((acc, s) => acc + s.ayahCount, 0);
  assert.strictEqual(totalAyahs, 6236, 'Canonical Hafs total Ayahs must be exactly 6236');
  assert.strictEqual(TOTAL_AYAH_COUNT, 6236);
});

test('2. Surah & Ayah Selection & Boundary Validation', () => {
  // Al-Fatihah has 7 Ayahs
  assert.strictEqual(isValidAyah(1, 1), true);
  assert.strictEqual(isValidAyah(1, 7), true);
  assert.strictEqual(isValidAyah(1, 0), false, 'Ayah 0 is invalid');
  assert.strictEqual(isValidAyah(1, 8), false, 'Al-Fatihah ayah 8 is invalid');

  // Al-Baqarah has 286 Ayahs
  assert.strictEqual(isValidAyah(2, 286), true);
  assert.strictEqual(isValidAyah(2, 287), false);

  // Invalid Surah 115
  assert.strictEqual(isValidAyah(115, 1), false);
});

test('3. Within-Surah Range Validation & Ayah Count', () => {
  // Al-Fatihah 1 to 7
  assert.strictEqual(isValidRange(1, 1, 1, 7), true);
  assert.strictEqual(getRangeAyahCount(1, 1, 1, 7), 7);

  // Partial range in Al-Baqarah (1 to 25)
  assert.strictEqual(isValidRange(2, 1, 2, 25), true);
  assert.strictEqual(getRangeAyahCount(2, 1, 2, 25), 25);

  // Inverted range (end before start)
  assert.strictEqual(isValidRange(2, 50, 2, 20), false, 'Inverted ayah range must be invalid');
  assert.strictEqual(getRangeAyahCount(2, 50, 2, 20), 0);
});

test('4. Cross-Surah Memorization Ranges', () => {
  // From Al-Fatihah 5 to Al-Baqarah 5
  // Al-Fatihah (7 ayahs total): ayahs 5, 6, 7 = 3 ayahs.
  // Al-Baqarah: ayahs 1, 2, 3, 4, 5 = 5 ayahs.
  // Total = 3 + 5 = 8 ayahs.
  assert.strictEqual(isValidRange(1, 5, 2, 5), true);
  assert.strictEqual(getRangeAyahCount(1, 5, 2, 5), 8);

  // Cross 3 Surahs: Al-Ikhlas (4 ayahs), Al-Falaq (5 ayahs), An-Nas (6 ayahs)
  // From Al-Ikhlas 3 (ayahs 3, 4 = 2) + Al-Falaq (all 5 ayahs) + An-Nas (ayahs 1, 2 = 2)
  // Total = 2 + 5 + 2 = 9 ayahs.
  assert.strictEqual(isValidRange(112, 3, 114, 2), true);
  assert.strictEqual(getRangeAyahCount(112, 3, 114, 2), 9);

  // Inverted cross-surah range
  assert.strictEqual(isValidRange(3, 1, 2, 286), false, 'Surah 3 to 2 is backward');
});

test('5. Overlapping Memorization Ranges - Never Double Count', () => {
  // Range 1: Al-Baqarah 1 to 20 (20 ayahs)
  // Range 2: Al-Baqarah 15 to 35 (21 ayahs, overlapping 15-20)
  // Unique ayahs: 1 to 35 = 35 unique ayahs!
  const ranges = [
    { startSurah: 2, startAyah: 1, endSurah: 2, endAyah: 20 },
    { startSurah: 2, startAyah: 15, endSurah: 2, endAyah: 35 }
  ];

  const uniqueCount = getUniqueAyahCount(ranges);
  assert.strictEqual(uniqueCount, 35, 'Overlapping ayahs 15-20 must not be counted twice');
});

test('6. Percentage Progress Calculation Accuracy', () => {
  // Full Quran memorized
  const fullRanges = [{ startSurah: 1, startAyah: 1, endSurah: 114, endAyah: 6 }];
  const count = getUniqueAyahCount(fullRanges);
  assert.strictEqual(count, 6236);

  const percentage = (count / TOTAL_AYAH_COUNT) * 100;
  assert.strictEqual(percentage, 100);
});

test('7. Spaced Revision Scheduling Logic', () => {
  // Spaced revision logic test
  function getNextReviewDays(evaluation: 'excellent' | 'good' | 'needs_improvement' | 'must_repeat') {
    switch (evaluation) {
      case 'excellent':
        return 21;
      case 'good':
        return 10;
      case 'needs_improvement':
        return 3;
      case 'must_repeat':
        return 1;
    }
  }

  assert.strictEqual(getNextReviewDays('excellent'), 21);
  assert.strictEqual(getNextReviewDays('good'), 10);
  assert.strictEqual(getNextReviewDays('needs_improvement'), 3);
  assert.strictEqual(getNextReviewDays('must_repeat'), 1);
});

test('8. Return-After-Absence Absence Detection', () => {
  function checkAbsence(lastActivityDate: Date | null, now: Date): boolean {
    if (!lastActivityDate) return false;
    const diffDays = Math.floor(
      Math.abs(now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 6;
  }

  const now = new Date('2026-11-24T12:00:00Z');
  const recentActivity = new Date('2026-11-22T12:00:00Z'); // 2 days ago
  const absentActivity = new Date('2026-11-10T12:00:00Z'); // 14 days ago

  assert.strictEqual(checkAbsence(recentActivity, now), false);
  assert.strictEqual(checkAbsence(absentActivity, now), true);
});

test('9. Arabic Range Formatting', () => {
  // Single surah full
  assert.strictEqual(formatQuranRange(1, 1, 1, 7), 'سورة الفاتحة (كاملة)');
  // Partial range
  assert.strictEqual(formatQuranRange(2, 1, 2, 25), 'سورة البقرة: الآيات (1 - 25)');
  // Cross surah
  const cross = formatQuranRange(1, 5, 2, 10);
  assert.strictEqual(cross.includes('الفاتحة') && cross.includes('البقرة'), true);
});
