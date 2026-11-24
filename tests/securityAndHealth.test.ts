import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inviteCodeSchema,
  memorizationRangeSchema,
  lessonPassageSchema,
  lessonCreationSchema,
  userSettingsSchema,
} from '../src/lib/validation/schemas.ts';

test('1. Invite code validation accepts valid alphanumeric codes and forces uppercase', () => {
  const valid = inviteCodeSchema.parse('sheikh-2026_az');
  assert.equal(valid, 'SHEIKH-2026_AZ');
});

test('2. Invite code validation rejects invalid characters or dangerous inputs', () => {
  assert.throws(() => inviteCodeSchema.parse('code<script>'), /أحرف وأرقام فقط/);
  assert.throws(() => inviteCodeSchema.parse('sh'), /4 أحرف على الأقل/);
});

test('3. Memorization range validation enforces valid Quran bounds (1-114)', () => {
  const validRange = memorizationRangeSchema.parse({
    start_surah: 1,
    start_ayah: 1,
    end_surah: 2,
    end_ayah: 20,
  });
  assert.equal(validRange.start_surah, 1);
  assert.equal(validRange.end_surah, 2);

  // Reject backwards range
  assert.throws(() => {
    memorizationRangeSchema.parse({
      start_surah: 2,
      start_ayah: 50,
      end_surah: 2,
      end_ayah: 10,
    });
  }, /بداية المقطع يجب أن تسبق نهايته/);
});

test('4. Lesson passage schema validates allowed evaluation ratings', () => {
  const validPassage = lessonPassageSchema.parse({
    start_surah: 18,
    start_ayah: 1,
    end_surah: 18,
    end_ayah: 10,
    passage_type: 'new_memorization',
    evaluation: 'excellent',
  });
  assert.equal(validPassage.evaluation, 'excellent');

  assert.throws(() => {
    lessonPassageSchema.parse({
      start_surah: 18,
      start_ayah: 1,
      end_surah: 18,
      end_ayah: 10,
      passage_type: 'new_memorization',
      evaluation: 'invalid_rating' as any,
    });
  });
});

test('5. User settings schema strictly validates reminder time format (HH:MM)', () => {
  const validSettings = userSettingsSchema.parse({
    reminder_enabled: true,
    reminder_time: '21:30',
    encouragement_style: 'friendly_egyptian',
  });
  assert.equal(validSettings.reminder_time, '21:30');

  assert.throws(() => {
    userSettingsSchema.parse({
      reminder_time: '25:99',
    });
  }, /صيغة الوقت يجب أن تكون HH:MM/);
});
