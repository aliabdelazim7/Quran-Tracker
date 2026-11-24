export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemorizationStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_for_recitation'
  | 'recited'
  | 'mastered'
  | 'needs_repetition';

export type AssignmentType =
  | 'new_memorization'
  | 'previous_memorization'
  | 'revision'
  | 'repetition';

export type LessonType =
  | 'new_memorization'
  | 'previous_memorization'
  | 'revision'
  | 'mixed';

export type SheikhEvaluation =
  | 'excellent'
  | 'very_good'
  | 'good'
  | 'needs_improvement'
  | 'repeat_required';

export type RevisionEvaluation =
  | 'excellent'
  | 'good'
  | 'needs_improvement'
  | 'must_repeat';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  language: string;
  timezone: string;
  preferred_theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface QuranSurah {
  id: number;
  surah_number: number;
  name_arabic: string;
  name_transliteration: string;
  ayah_count: number;
  revelation_type: string;
  start_juz: number;
}

export interface UserAyahProgress {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  memorization_status: MemorizationStatus;
  first_memorized_at?: string | null;
  mastered_at?: string | null;
  last_recited_at?: string | null;
  confidence_score: number;
  review_due_at?: string | null;
  personal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemorizationAssignment {
  id: string;
  user_id: string;
  assignment_type: AssignmentType;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  title?: string | null;
  status: MemorizationStatus;
  assigned_at: string;
  completed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  user_id: string;
  lesson_date: string;
  lesson_type: LessonType;
  sheikh_name: string;
  duration_minutes?: number | null;
  overall_notes?: string | null;
  created_at: string;
  updated_at: string;
  passages?: LessonPassage[];
}

export interface LessonPassage {
  id: string;
  lesson_id: string;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  passage_type: AssignmentType;
  evaluation: SheikhEvaluation;
  notes?: string | null;
  created_at: string;
}

export interface RevisionSession {
  id: string;
  user_id: string;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  session_date: string;
  duration_minutes?: number | null;
  evaluation: RevisionEvaluation;
  notes?: string | null;
  next_review_date?: string | null;
  created_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  session_date: string;
  duration_minutes?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  daily_goal_enabled: boolean;
  daily_goal_value?: number | null;
  weekly_goal_enabled: boolean;
  weekly_goal_value?: number | null;
  reminder_enabled: boolean;
  reminder_time: string;
  encouragement_style: 'balanced' | 'religious' | 'friendly_egyptian' | 'minimal';
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_code: string;
  title: string;
  description: string;
  badge_icon: string;
  unlocked_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  notification_type:
    | 'daily_reminder'
    | 'revision_due'
    | 'lesson_prep'
    | 'welcome_back'
    | 'milestone'
    | 'sheikh_assignment';
  read_at?: string | null;
  created_at: string;
}
