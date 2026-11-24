-- ====================================================================
-- 'رحلتي مع القرآن' - Database Schema Migration
-- Production-Ready Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ====================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Africa/Cairo',
  preferred_theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quran Surahs Reference Table
CREATE TABLE IF NOT EXISTS public.quran_surahs (
  id SERIAL PRIMARY KEY,
  surah_number INT UNIQUE NOT NULL,
  name_arabic TEXT NOT NULL,
  name_transliteration TEXT NOT NULL,
  ayah_count INT NOT NULL,
  revelation_type TEXT NOT NULL,
  start_juz INT NOT NULL
);

-- 3. Quran Ayahs Reference Table (Hafs 6236 canonical)
CREATE TABLE IF NOT EXISTS public.quran_ayahs (
  id SERIAL PRIMARY KEY,
  surah_number INT NOT NULL REFERENCES public.quran_surahs(surah_number) ON DELETE CASCADE,
  ayah_number INT NOT NULL,
  global_ayah_number INT UNIQUE NOT NULL,
  juz_number INT NOT NULL,
  hizb_number INT NOT NULL,
  rub_number INT NOT NULL,
  CONSTRAINT uq_surah_ayah UNIQUE(surah_number, ayah_number)
);

-- 4. User Ayah Progress Table
CREATE TABLE IF NOT EXISTS public.user_ayah_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  memorization_status TEXT NOT NULL CHECK (
    memorization_status IN ('not_started', 'in_progress', 'ready_for_recitation', 'recited', 'mastered', 'needs_repetition')
  ),
  first_memorized_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  last_recited_at TIMESTAMPTZ,
  confidence_score INT DEFAULT 3 CHECK (confidence_score BETWEEN 1 AND 5),
  review_due_at TIMESTAMPTZ,
  personal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_surah_ayah UNIQUE (user_id, surah_number, ayah_number)
);

-- 5. Memorization Assignments Table
CREATE TABLE IF NOT EXISTS public.memorization_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (
    assignment_type IN ('new_memorization', 'previous_memorization', 'revision', 'repetition')
  ),
  start_surah INT NOT NULL,
  start_ayah INT NOT NULL,
  end_surah INT NOT NULL,
  end_ayah INT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (
    status IN ('not_started', 'in_progress', 'ready_for_recitation', 'recited', 'mastered', 'needs_repetition')
  ),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Lessons with Sheikh Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  lesson_type TEXT NOT NULL CHECK (
    lesson_type IN ('new_memorization', 'previous_memorization', 'revision', 'mixed')
  ),
  sheikh_name TEXT DEFAULT 'الشيخ',
  duration_minutes INT,
  overall_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Lesson Passages Table (Multi-passage per lesson with specific Sheikh evaluation)
CREATE TABLE IF NOT EXISTS public.lesson_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  start_surah INT NOT NULL,
  start_ayah INT NOT NULL,
  end_surah INT NOT NULL,
  end_ayah INT NOT NULL,
  passage_type TEXT NOT NULL CHECK (
    passage_type IN ('new_memorization', 'previous_memorization', 'revision', 'repetition')
  ),
  evaluation TEXT NOT NULL CHECK (
    evaluation IN ('excellent', 'very_good', 'good', 'needs_improvement', 'repeat_required')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Revision Sessions Table
CREATE TABLE IF NOT EXISTS public.revision_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_surah INT NOT NULL,
  start_ayah INT NOT NULL,
  end_surah INT NOT NULL,
  end_ayah INT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INT,
  evaluation TEXT NOT NULL CHECK (
    evaluation IN ('excellent', 'good', 'needs_improvement', 'must_repeat')
  ),
  notes TEXT,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reading Sessions Table (Independent Quran Reading Tracker)
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_surah INT NOT NULL,
  start_ayah INT NOT NULL,
  end_surah INT NOT NULL,
  end_ayah INT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Verified Motivational Messages Table
CREATE TABLE IF NOT EXISTS public.motivational_messages (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (
    category IN ('religious', 'personal_egyptian', 'progress_milestone', 'hasanat_virtue', 'welcome_back')
  ),
  message TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (
    source_type IN ('quran', 'hadith', 'egyptian_companion', 'virtue')
  ),
  source_reference TEXT,
  authenticity_status TEXT DEFAULT 'verified',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal_enabled BOOLEAN DEFAULT FALSE,
  daily_goal_value INT,
  weekly_goal_enabled BOOLEAN DEFAULT FALSE,
  weekly_goal_value INT,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_time TEXT DEFAULT '20:00',
  encouragement_style TEXT DEFAULT 'balanced' CHECK (encouragement_style IN ('balanced', 'religious', 'friendly_egyptian', 'minimal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. User Achievements Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_achievement UNIQUE(user_id, achievement_code)
);

-- 13. User Notifications Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('daily_reminder', 'revision_due', 'lesson_prep', 'welcome_back', 'milestone', 'sheikh_assignment')
  ),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_user_ayah_progress_user ON public.user_ayah_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ayah_progress_status ON public.user_ayah_progress(user_id, memorization_status);
CREATE INDEX IF NOT EXISTS idx_memorization_assignments_user ON public.memorization_assignments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lessons_user ON public.lessons(user_id, lesson_date DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_passages_lesson ON public.lesson_passages(lesson_id);
CREATE INDEX IF NOT EXISTS idx_revision_sessions_user ON public.revision_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON public.reading_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id, read_at);

-- ====================================================================
-- Enable Row Level Security (RLS) on all user-specific tables
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ayah_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_ayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivational_messages ENABLE ROW LEVEL SECURITY;

-- Reference Tables: Read-only for authenticated & anonymous
CREATE POLICY "Allow public read on quran_surahs" ON public.quran_surahs FOR SELECT USING (true);
CREATE POLICY "Allow public read on quran_ayahs" ON public.quran_ayahs FOR SELECT USING (true);
CREATE POLICY "Allow public read on motivational_messages" ON public.motivational_messages FOR SELECT USING (true);

-- User-Specific Tables Policies (Strict Isolation)
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_ayah_progress
CREATE POLICY "Users can view own ayah progress" ON public.user_ayah_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ayah progress" ON public.user_ayah_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ayah progress" ON public.user_ayah_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ayah progress" ON public.user_ayah_progress FOR DELETE USING (auth.uid() = user_id);

-- memorization_assignments
CREATE POLICY "Users can view own assignments" ON public.memorization_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignments" ON public.memorization_assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON public.memorization_assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignments" ON public.memorization_assignments FOR DELETE USING (auth.uid() = user_id);

-- lessons
CREATE POLICY "Users can view own lessons" ON public.lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lessons" ON public.lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lessons" ON public.lessons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lessons" ON public.lessons FOR DELETE USING (auth.uid() = user_id);

-- lesson_passages (Joined with lessons for user ownership check)
CREATE POLICY "Users can view own lesson passages" ON public.lesson_passages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.lessons WHERE id = lesson_passages.lesson_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own lesson passages" ON public.lesson_passages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.lessons WHERE id = lesson_passages.lesson_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own lesson passages" ON public.lesson_passages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.lessons WHERE id = lesson_passages.lesson_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own lesson passages" ON public.lesson_passages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.lessons WHERE id = lesson_passages.lesson_id AND user_id = auth.uid()));

-- revision_sessions
CREATE POLICY "Users can view own revision sessions" ON public.revision_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revision sessions" ON public.revision_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revision sessions" ON public.revision_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revision sessions" ON public.revision_sessions FOR DELETE USING (auth.uid() = user_id);

-- reading_sessions
CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading sessions" ON public.reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading sessions" ON public.reading_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading sessions" ON public.reading_sessions FOR DELETE USING (auth.uid() = user_id);

-- user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_notifications
CREATE POLICY "Users can view own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.user_notifications FOR DELETE USING (auth.uid() = user_id);
