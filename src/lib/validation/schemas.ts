import { z } from 'zod';

export const inviteCodeSchema = z
  .string()
  .trim()
  .min(4, 'كود الدعوة يجب أن يتكون من 4 أحرف على الأقل')
  .max(16, 'كود الدعوة غير صالح')
  .regex(/^[A-Za-z0-9_-]+$/, 'كود الدعوة يجب أن يحتوي على أحرف وأرقام فقط')
  .transform((val) => val.toUpperCase());

export const memorizationRangeSchema = z.object({
  start_surah: z.number().int().min(1, 'رقم السورة يجب أن يكون بين 1 و 114').max(114),
  start_ayah: z.number().int().min(1, 'رقم الآية يجب أن يكون 1 على الأقل'),
  end_surah: z.number().int().min(1).max(114),
  end_ayah: z.number().int().min(1),
  assignment_type: z.enum(['new_memorization', 'previous_memorization', 'revision', 'repetition']).default('new_memorization'),
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.start_surah === data.end_surah) {
      return data.start_ayah <= data.end_ayah;
    }
    return data.start_surah < data.end_surah;
  },
  {
    message: 'بداية المقطع يجب أن تسبق نهايته في ترتيب المصحف الشريف',
    path: ['end_ayah'],
  }
);

export const lessonPassageSchema = z.object({
  start_surah: z.number().int().min(1).max(114),
  start_ayah: z.number().int().min(1),
  end_surah: z.number().int().min(1).max(114),
  end_ayah: z.number().int().min(1),
  passage_type: z.enum(['new_memorization', 'previous_memorization', 'revision', 'repetition']),
  evaluation: z.enum(['excellent', 'very_good', 'good', 'needs_improvement', 'repeat_required']),
  notes: z.string().max(500).optional(),
});

export const lessonCreationSchema = z.object({
  user_id: z.string().uuid('معرف الطالب غير صالح'),
  lesson_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ يجب أن تكون YYYY-MM-DD'),
  lesson_type: z.enum(['new_memorization', 'previous_memorization', 'revision', 'mixed']),
  sheikh_name: z.string().min(1).max(100).default('الشيخ'),
  duration_minutes: z.number().int().min(1).max(360).optional(),
  overall_notes: z.string().max(1000).optional(),
  passages: z.array(lessonPassageSchema).min(1, 'يجب إضافة مقطع قرآني واحد على الأقل للجلسة'),
});

export const userSettingsSchema = z.object({
  daily_goal_enabled: z.boolean().default(false),
  daily_goal_value: z.number().int().min(1).max(500).nullable().optional(),
  weekly_goal_enabled: z.boolean().default(false),
  weekly_goal_value: z.number().int().min(1).max(3000).nullable().optional(),
  reminder_enabled: z.boolean().default(true),
  reminder_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'صيغة الوقت يجب أن تكون HH:MM').default('20:00'),
  encouragement_style: z.enum(['balanced', 'religious', 'friendly_egyptian', 'minimal']).default('balanced'),
});
