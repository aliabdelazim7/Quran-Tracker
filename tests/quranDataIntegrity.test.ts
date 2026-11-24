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
  getRangeAyahCount,
  getAyahKeysForRange,
  getUniqueAyahCount,
  getSurah,
  formatQuranRange
} from '../src/data/quranData.ts';
import { QURAN_RUBS } from '../src/data/quranRubData.ts';

test('1. Canonical Hafs 6,236 Ayahs Completeness and Structure', () => {
  assert.strictEqual(SURAHS.length, 114, 'Surahs must be exactly 114');
  assert.strictEqual(TOTAL_SURAHS, 114);
  assert.strictEqual(JUZS.length, 30, 'Juz must be exactly 30');
  assert.strictEqual(TOTAL_JUZ, 30);
  assert.strictEqual(QURAN_RUBS.length, 240, 'Rub al-Hizb must be exactly 240');

  // Verify total sum of ayahs across all 114 surahs
  const total = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
  assert.strictEqual(total, 6236, 'Sum of all Surah ayahs must equal 6236');
  assert.strictEqual(TOTAL_AYAH_COUNT, 6236);

  // First and last Surahs
  assert.strictEqual(SURAHS[0].number, 1);
  assert.strictEqual(SURAHS[0].nameArabic, 'الفاتحة');
  assert.strictEqual(SURAHS[0].ayahCount, 7);

  assert.strictEqual(SURAHS[113].number, 114);
  assert.strictEqual(SURAHS[113].nameArabic, 'الناس');
  assert.strictEqual(SURAHS[113].ayahCount, 6);
});

test('2. Surah Ordering, Consecutive Numbers and Metadata Integrity', () => {
  for (let i = 0; i < SURAHS.length; i++) {
    const s = SURAHS[i];
    assert.strictEqual(s.number, i + 1, `Surah at index ${i} must have number ${i + 1}`);
    assert.ok(s.nameArabic.length > 0, `Surah ${s.number} must have an Arabic name`);
    assert.ok(s.ayahCount > 0, `Surah ${s.number} must have positive ayah count`);
    assert.ok(s.startJuz >= 1 && s.startJuz <= 30, `Surah ${s.number} startJuz must be between 1 and 30`);
  }
});

test('3. Quarters of the Quran (240 Rub al-Hizb) Alignment', () => {
  assert.strictEqual(QURAN_RUBS.length, 240);

  for (let i = 0; i < QURAN_RUBS.length; i++) {
    const rub = QURAN_RUBS[i];
    assert.strictEqual(rub.rubNumber, i + 1, `Rub number at index ${i} must be ${i + 1}`);
    assert.ok(rub.juzNumber >= 1 && rub.juzNumber <= 30, `Juz number must be 1-30`);
    assert.ok(rub.hizbNumber >= 1 && rub.hizbNumber <= 60, `Hizb number must be 1-60`);
    assert.ok(isValidAyah(rub.startSurah, rub.startAyah), `Rub ${rub.rubNumber} start position must be valid`);
    assert.ok(rub.firstWords.length > 0, `Rub ${rub.rubNumber} must have opening words`);
  }
});

test('4. Global Ayah Key Generation & Unique Ayah Counting', () => {
  // Test range with Al-Fatihah (7 ayahs)
  const fatihahKeys = getAyahKeysForRange(1, 1, 1, 7);
  assert.strictEqual(fatihahKeys.length, 7);
  assert.deepStrictEqual(fatihahKeys, ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7']);

  // Overlapping ranges: Al-Fatihah 1-5 and Al-Fatihah 3-7
  const count = getUniqueAyahCount([
    { startSurah: 1, startAyah: 1, endSurah: 1, endAyah: 5 },
    { startSurah: 1, startAyah: 3, endSurah: 1, endAyah: 7 }
  ]);
  assert.strictEqual(count, 7, 'Overlapping ranges in Al-Fatihah must count exactly 7 unique ayahs');
});
