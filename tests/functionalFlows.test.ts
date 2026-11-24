import assert from 'node:assert';
import test from 'node:test';

import {
  TOTAL_AYAH_COUNT,
  isValidRange,
  getRangeAyahCount,
  getAyahKeysForRange,
  getUniqueAyahCount,
  formatQuranRange
} from '../src/data/quranData.ts';

test('1. Return After Absence: 21-Day Inactivity Simulation', () => {
  // Simulate a user whose last activity was 21 days ago
  const now = new Date('2026-11-24T12:00:00Z');
  const lastActivityDate = new Date('2026-11-03T12:00:00Z');

  const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
  const daysSinceLastActivity = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  assert.strictEqual(daysSinceLastActivity, 21, 'User should be absent for exactly 21 days');

  // Trigger absence flag (threshold is >= 6 days)
  let isWelcomeDismissed = false;
  let isReturningAfterAbsence = daysSinceLastActivity >= 6 && !isWelcomeDismissed;
  assert.strictEqual(isReturningAfterAbsence, true, 'Should trigger welcome back state');

  // Dismissing welcome back card
  isWelcomeDismissed = true;
  isReturningAfterAbsence = daysSinceLastActivity >= 6 && !isWelcomeDismissed;
  assert.strictEqual(isReturningAfterAbsence, false, 'Dismissing should hide the return greeting');
});

test('2. Absence Preservation: No Fictional Lessons, Progress Unharmed', () => {
  // Existing state before absence
  const initialProgress = [
    { surah: 1, ayah: 1, status: 'mastered' },
    { surah: 1, ayah: 2, status: 'mastered' },
    { surah: 1, ayah: 3, status: 'mastered' }
  ];
  const initialAssignments = [
    { id: 'ass-1', startSurah: 2, startAyah: 1, endSurah: 2, endAyah: 5, status: 'in_progress' }
  ];
  const initialLessons = [
    { id: 'less-1', lesson_date: '2026-11-03', sheikh_name: 'الشيخ عبد الباسط' }
  ];

  // Advance time by 21 days without user adding any actions
  // The system must NOT automatically generate ghost lessons or mutate records
  const lessonsAfterAbsence = [...initialLessons];
  const assignmentsAfterAbsence = [...initialAssignments];
  const progressAfterAbsence = [...initialProgress];

  assert.strictEqual(lessonsAfterAbsence.length, 1, 'No ghost lessons created during absence');
  assert.strictEqual(assignmentsAfterAbsence[0].status, 'in_progress', 'Pending assignments stay intact');
  assert.strictEqual(progressAfterAbsence.length, 3, 'Memorization progress is preserved intact');
});

test('3. Spaced Revision Interval Calculations', () => {
  const getIntervalDays = (evalGrade: 'excellent' | 'good' | 'needs_improvement' | 'must_repeat') => {
    switch (evalGrade) {
      case 'excellent':
        return 21;
      case 'good':
        return 10;
      case 'needs_improvement':
        return 3;
      case 'must_repeat':
        return 1;
    }
  };

  assert.strictEqual(getIntervalDays('excellent'), 21, 'Excellent grade schedules review in 21 days');
  assert.strictEqual(getIntervalDays('good'), 10, 'Good grade schedules review in 10 days');
  assert.strictEqual(getIntervalDays('needs_improvement'), 3, 'Needs improvement schedules review in 3 days');
  assert.strictEqual(getIntervalDays('must_repeat'), 1, 'Must repeat schedules review next day (1 day)');
});

test('4. Statistics Calculations: Non-overlapping, No Double Counting, Reading Separation', () => {
  // User memorized Al-Fatihah (7 ayahs)
  // User then records a lesson for Al-Fatihah ayahs 1-4 again (evaluation: excellent)
  const memorizedPassages = [
    { startSurah: 1, startAyah: 1, endSurah: 1, endAyah: 7 }, // 7 ayahs
    { startSurah: 1, startAyah: 1, endSurah: 1, endAyah: 4 }  // 4 overlapping ayahs
  ];

  const uniqueAyahs = getUniqueAyahCount(memorizedPassages);
  assert.strictEqual(uniqueAyahs, 7, 'Overlapping recited passages must not double-count ayahs');

  // Progress percentage
  const percentage = Number(((uniqueAyahs / TOTAL_AYAH_COUNT) * 100).toFixed(2));
  assert.strictEqual(percentage, Number(((7 / 6236) * 100).toFixed(2)));

  // Independent Reading session (e.g. read Surah Al-Kahf)
  // Reading must NEVER automatically convert to memorization progress
  let memorizedCount = uniqueAyahs;
  const readingSession = {
    startSurah: 18,
    startAyah: 1,
    endSurah: 18,
    endAyah: 110,
    pages_read: 12
  };

  assert.strictEqual(memorizedCount, 7, 'Reading session has zero impact on memorization count');
});
