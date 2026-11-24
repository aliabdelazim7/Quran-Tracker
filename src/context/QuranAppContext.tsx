'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  MemorizationStatus,
  AssignmentType,
  SheikhEvaluation,
  RevisionEvaluation,
  UserAyahProgress,
  MemorizationAssignment,
  Lesson,
  LessonPassage,
  RevisionSession,
  ReadingSession,
  UserSettings,
  UserAchievement,
  UserNotification
} from '@/types/database';
import {
  TOTAL_AYAH_COUNT,
  TOTAL_SURAHS,
  TOTAL_JUZ,
  SURAHS,
  JUZS,
  isValidRange,
  getRangeAyahCount,
  getAyahKeysForRange,
  formatQuranRange
} from '@/data/quranData';
import { MOTIVATIONAL_QUOTES } from '@/data/motivationalData';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface QuranAppContextType {
  // Progress
  progressList: UserAyahProgress[];
  bulkUpdateRangeProgress: (
    startSurah: number,
    startAyah: number,
    endSurah: number,
    endAyah: number,
    status: MemorizationStatus,
    notes?: string
  ) => void;
  getSurahMemorizedCount: (surahNumber: number) => number;
  getSurahStatus: (surahNumber: number) => MemorizationStatus;
  getJuzProgress: (juzNumber: number) => { memorizedCount: number; totalCount: number; percentage: number };

  // Computed Global Stats
  stats: {
    memorizedAyahsCount: number;
    masteredAyahsCount: number;
    learningAyahsCount: number;
    remainingAyahsCount: number;
    memorizedPercentage: number;
    masteredPercentage: number;
    completedSurahsCount: number;
    remainingSurahsCount: number;
    completedJuzCount: number;
    remainingJuzCount: number;
    totalLessonsCount: number;
    totalRevisionMinutes: number;
    totalReadingMinutes: number;
    activeDaysCount: number;
  };

  // Assignments
  assignments: MemorizationAssignment[];
  currentAssignment: MemorizationAssignment | null;
  outstandingTasks: MemorizationAssignment[];
  addAssignment: (
    assignment: Omit<MemorizationAssignment, 'id' | 'user_id' | 'assigned_at' | 'created_at' | 'updated_at'>
  ) => void;
  updateAssignmentStatus: (id: string, status: MemorizationStatus) => void;
  deleteAssignment: (id: string) => void;

  // Sheikh Lessons
  lessons: Lesson[];
  addLesson: (
    lesson: Omit<Lesson, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'passages'>,
    passages: Omit<LessonPassage, 'id' | 'lesson_id' | 'created_at'>[],
    newAssignment?: {
      startSurah: number;
      startAyah: number;
      endSurah: number;
      endAyah: number;
      title?: string;
      notes?: string;
    }
  ) => void;
  updateLesson: (
    id: string,
    lessonUpdates: Partial<Omit<Lesson, 'id' | 'user_id' | 'created_at' | 'passages'>>,
    updatedPassages?: LessonPassage[]
  ) => void;
  deleteLesson: (id: string) => void;

  // Revision Sessions
  revisionSessions: RevisionSession[];
  addRevisionSession: (
    session: Omit<RevisionSession, 'id' | 'user_id' | 'created_at'>
  ) => void;
  revisionDueToday: RevisionSession[];
  overdueRevision: RevisionSession[];

  // Reading Tracker
  readingSessions: ReadingSession[];
  addReadingSession: (
    session: Omit<ReadingSession, 'id' | 'user_id' | 'created_at'>
  ) => void;

  // Return After Absence
  isReturningAfterAbsence: boolean;
  daysSinceLastActivity: number;
  dismissWelcomeBack: () => void;

  // Settings
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Achievements & Notifications
  achievements: UserAchievement[];
  notifications: UserNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Export
  exportData: (format: 'json' | 'csv') => void;
  resetAllUserData: () => void;
}

const QuranAppContext = createContext<QuranAppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROGRESS: 'rehlaty_user_progress',
  ASSIGNMENTS: 'rehlaty_user_assignments',
  LESSONS: 'rehlaty_user_lessons',
  REVISIONS: 'rehlaty_user_revisions',
  READING: 'rehlaty_user_reading',
  SETTINGS: 'rehlaty_user_settings',
  ACHIEVEMENTS: 'rehlaty_user_achievements',
  NOTIFICATIONS: 'rehlaty_user_notifications',
  LAST_ACTIVE: 'rehlaty_last_active_timestamp',
  WELCOME_DISMISSED: 'rehlaty_welcome_dismissed'
};

const DEFAULT_SETTINGS: UserSettings = {
  id: '00000000-0000-4000-8000-000000000001',
  user_id: 'default',
  daily_goal_enabled: false,
  daily_goal_value: 5,
  weekly_goal_enabled: false,
  weekly_goal_value: 20,
  reminder_enabled: true,
  reminder_time: '20:00',
  encouragement_style: 'balanced',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z'
};

export const QuranAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemo } = useAuth();
  const userId = user?.id || 'guest-user';

  // State
  const [progressList, setProgressList] = useState<UserAyahProgress[]>([]);
  const [assignments, setAssignments] = useState<MemorizationAssignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [revisionSessions, setRevisionSessions] = useState<RevisionSession[]>([]);
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false);
  const [lastActivityDate, setLastActivityDate] = useState<Date | null>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userKeyPrefix = `${userId}_`;

    try {
      const savedProg = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.PROGRESS);
      const savedAss = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.ASSIGNMENTS);
      const savedLess = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.LESSONS);
      const savedRev = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.REVISIONS);
      const savedRead = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.READING);
      const savedSet = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.SETTINGS);
      const savedAch = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.ACHIEVEMENTS);
      const savedNotif = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.NOTIFICATIONS);
      const savedLast = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.LAST_ACTIVE);
      const savedDismissed = localStorage.getItem(userKeyPrefix + STORAGE_KEYS.WELCOME_DISMISSED);

      if (savedProg) setProgressList(JSON.parse(savedProg));
      if (savedAss) setAssignments(JSON.parse(savedAss));
      if (savedLess) setLessons(JSON.parse(savedLess));
      if (savedRev) setRevisionSessions(JSON.parse(savedRev));
      if (savedRead) setReadingSessions(JSON.parse(savedRead));
      if (savedSet) setSettings(JSON.parse(savedSet));
      if (savedAch) setAchievements(JSON.parse(savedAch));
      if (savedNotif) setNotifications(JSON.parse(savedNotif));
      if (savedLast) setLastActivityDate(new Date(savedLast));
      if (savedDismissed) setIsWelcomeDismissed(JSON.parse(savedDismissed));

      // Record activity timestamp for today
      localStorage.setItem(userKeyPrefix + STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
    } catch (e) {
      console.error('Error loading stored Quran app data:', e);
    }
  }, [userId]);

  // Persist helper for localStorage
  const save = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${userId}_${key}`, JSON.stringify(data));
    }
  };

  // 2. Cloud Sync from Supabase on Mount / Login
  useEffect(() => {
    if (!isSupabaseConfigured() || isDemo || !user?.id) return;
    let isCancelled = false;

    const syncFromSupabase = async () => {
      try {
        const supabase = createClient();
        const [progRes, assRes, lessRes, revRes, readRes, setRes, achRes, notifRes] =
          await Promise.all([
            supabase.from('user_ayah_progress').select('*').eq('user_id', user.id),
            supabase
              .from('memorization_assignments')
              .select('*')
              .eq('user_id', user.id)
              .order('assigned_at', { ascending: false }),
            supabase
              .from('lessons')
              .select('*, passages:lesson_passages(*)')
              .eq('user_id', user.id)
              .order('lesson_date', { ascending: false }),
            supabase
              .from('revision_sessions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }),
            supabase
              .from('reading_sessions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }),
            supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
            supabase
              .from('user_achievements')
              .select('*')
              .eq('user_id', user.id)
              .order('unlocked_at', { ascending: false }),
            supabase
              .from('user_notifications')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
          ]);

        if (isCancelled) return;

        if (progRes.data && progRes.data.length > 0) {
          setProgressList(progRes.data as UserAyahProgress[]);
          save(STORAGE_KEYS.PROGRESS, progRes.data);
        }
        if (assRes.data && assRes.data.length > 0) {
          setAssignments(assRes.data as MemorizationAssignment[]);
          save(STORAGE_KEYS.ASSIGNMENTS, assRes.data);
        }
        if (lessRes.data && lessRes.data.length > 0) {
          setLessons(lessRes.data as Lesson[]);
          save(STORAGE_KEYS.LESSONS, lessRes.data);
        }
        if (revRes.data && revRes.data.length > 0) {
          setRevisionSessions(revRes.data as RevisionSession[]);
          save(STORAGE_KEYS.REVISIONS, revRes.data);
        }
        if (readRes.data && readRes.data.length > 0) {
          setReadingSessions(readRes.data as ReadingSession[]);
          save(STORAGE_KEYS.READING, readRes.data);
        }
        if (setRes.data) {
          setSettings(setRes.data as UserSettings);
          save(STORAGE_KEYS.SETTINGS, setRes.data);
        }
        if (achRes.data && achRes.data.length > 0) {
          setAchievements(achRes.data as UserAchievement[]);
          save(STORAGE_KEYS.ACHIEVEMENTS, achRes.data);
        }
        if (notifRes.data && notifRes.data.length > 0) {
          setNotifications(notifRes.data as UserNotification[]);
          save(STORAGE_KEYS.NOTIFICATIONS, notifRes.data);
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    };

    syncFromSupabase();

    return () => {
      isCancelled = true;
    };
  }, [userId, isDemo, user?.id]);

  // Check achievements unlock
  const checkAndUnlockAchievement = (code: string, title: string, description: string, badgeIcon: string) => {
    setAchievements((prev) => {
      if (prev.some((a) => a.achievement_code === code)) return prev;
      const newAch: UserAchievement = {
        id: generateId(),
        user_id: userId,
        achievement_code: code,
        title,
        description,
        badge_icon: badgeIcon,
        unlocked_at: new Date().toISOString()
      };
      const updated = [...prev, newAch];
      save(STORAGE_KEYS.ACHIEVEMENTS, updated);

      // Send in-app notification
      const newNotif: UserNotification = {
        id: generateId(),
        user_id: userId,
        title: `🏆 إنجاز جديد: ${title}`,
        body: description,
        notification_type: 'milestone',
        read_at: null,
        created_at: new Date().toISOString()
      };

      setNotifications((nPrev) => {
        const uNotifs = [newNotif, ...nPrev];
        save(STORAGE_KEYS.NOTIFICATIONS, uNotifs);
        return uNotifs;
      });

      // Background Supabase Sync
      if (isSupabaseConfigured() && !isDemo && user?.id) {
        (async () => {
          try {
            const supabase = createClient();
            await supabase.from('user_achievements').insert(newAch);
            await supabase.from('user_notifications').insert(newNotif);
          } catch (e) {
            console.warn('Supabase achievement sync error:', e);
          }
        })();
      }

      return updated;
    });
  };

  // Bulk update range progress (ensuring unique Ayahs and canonical consistency)
  const bulkUpdateRangeProgress = (
    startSurah: number,
    startAyah: number,
    endSurah: number,
    endAyah: number,
    status: MemorizationStatus,
    notes?: string
  ) => {
    if (!isValidRange(startSurah, startAyah, endSurah, endAyah)) return;

    const keys = getAyahKeysForRange(startSurah, startAyah, endSurah, endAyah);
    const now = new Date().toISOString();

    setProgressList((prev) => {
      const map = new Map<string, UserAyahProgress>();
      for (const p of prev) {
        map.set(`${p.surah_number}:${p.ayah_number}`, p);
      }

      for (const k of keys) {
        const [sStr, aStr] = k.split(':');
        const s = parseInt(sStr, 10);
        const a = parseInt(aStr, 10);

        const existing = map.get(k);
        map.set(k, {
          id: existing?.id || generateId(),
          user_id: userId,
          surah_number: s,
          ayah_number: a,
          memorization_status: status,
          first_memorized_at: existing?.first_memorized_at || (status !== 'not_started' ? now : null),
          mastered_at: status === 'mastered' ? now : existing?.mastered_at || null,
          last_recited_at: status === 'recited' || status === 'mastered' ? now : existing?.last_recited_at || null,
          confidence_score: status === 'mastered' ? 5 : status === 'recited' ? 4 : 3,
          personal_notes: notes !== undefined ? notes : existing?.personal_notes || null,
          created_at: existing?.created_at || now,
          updated_at: now
        });
      }

      const updated = Array.from(map.values());
      save(STORAGE_KEYS.PROGRESS, updated);

      // Background Supabase Upsert
      if (isSupabaseConfigured() && !isDemo && user?.id) {
        (async () => {
          try {
            const supabase = createClient();
            const recordsToUpsert = keys.map((k) => {
              const item = map.get(k)!;
              return {
                id: item.id,
                user_id: user.id,
                surah_number: item.surah_number,
                ayah_number: item.ayah_number,
                memorization_status: item.memorization_status,
                first_memorized_at: item.first_memorized_at,
                mastered_at: item.mastered_at,
                last_recited_at: item.last_recited_at,
                confidence_score: item.confidence_score,
                personal_notes: item.personal_notes,
                created_at: item.created_at,
                updated_at: item.updated_at
              };
            });
            await supabase.from('user_ayah_progress').upsert(recordsToUpsert, {
              onConflict: 'user_id,surah_number,ayah_number'
            });
          } catch (e) {
            console.warn('Supabase progress sync error:', e);
          }
        })();
      }

      return updated;
    });

    // Check milestone achievement
    checkAndUnlockAchievement(
      'first_memorization',
      'بداية الرحلة المباركة',
      'سجلت أول آيات تم حفظها في مصحفك',
      '📖'
    );
  };

  // Add Memorization Assignment
  const addAssignment = (
    data: Omit<MemorizationAssignment, 'id' | 'user_id' | 'assigned_at' | 'created_at' | 'updated_at'>
  ) => {
    const now = new Date().toISOString();
    const newAss: MemorizationAssignment = {
      ...data,
      id: generateId(),
      user_id: userId,
      assigned_at: now,
      created_at: now,
      updated_at: now
    };

    setAssignments((prev) => {
      const updated = [newAss, ...prev];
      save(STORAGE_KEYS.ASSIGNMENTS, updated);
      return updated;
    });

    // Add Notification
    const notif: UserNotification = {
      id: generateId(),
      user_id: userId,
      title: '📋 واجب قرآني جديد',
      body: `تم تسجيل ${formatQuranRange(data.start_surah, data.start_ayah, data.end_surah, data.end_ayah)}`,
      notification_type: 'sheikh_assignment',
      read_at: null,
      created_at: now
    };

    setNotifications((prev) => {
      const updatedNotifs = [notif, ...prev];
      save(STORAGE_KEYS.NOTIFICATIONS, updatedNotifs);
      return updatedNotifs;
    });

    // Background Supabase Insert
    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase.from('memorization_assignments').insert(newAss);
          await supabase.from('user_notifications').insert(notif);
        } catch (e) {
          console.warn('Supabase add assignment sync error:', e);
        }
      })();
    }
  };

  const updateAssignmentStatus = (id: string, status: MemorizationStatus) => {
    const now = new Date().toISOString();
    setAssignments((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              completed_at: status === 'mastered' || status === 'recited' ? now : a.completed_at,
              updated_at: now
            }
          : a
      );
      save(STORAGE_KEYS.ASSIGNMENTS, updated);
      return updated;
    });

    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase
            .from('memorization_assignments')
            .update({
              status,
              completed_at: status === 'mastered' || status === 'recited' ? now : undefined,
              updated_at: now
            })
            .eq('id', id)
            .eq('user_id', user.id);
        } catch (e) {
          console.warn('Supabase update assignment sync error:', e);
        }
      })();
    }
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      save(STORAGE_KEYS.ASSIGNMENTS, updated);
      return updated;
    });

    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase.from('memorization_assignments').delete().eq('id', id).eq('user_id', user.id);
        } catch (e) {
          console.warn('Supabase delete assignment sync error:', e);
        }
      })();
    }
  };

  // Record a Lesson with Sheikh
  const addLesson = (
    lessonData: Omit<Lesson, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'passages'>,
    passages: Omit<LessonPassage, 'id' | 'lesson_id' | 'created_at'>[],
    newAssignmentData?: {
      startSurah: number;
      startAyah: number;
      endSurah: number;
      endAyah: number;
      title?: string;
      notes?: string;
    }
  ) => {
    const lessonId = generateId();
    const now = new Date().toISOString();

    const fullPassages: LessonPassage[] = passages.map((p) => ({
      ...p,
      id: generateId(),
      lesson_id: lessonId,
      created_at: now
    }));

    const newLesson: Lesson = {
      ...lessonData,
      id: lessonId,
      user_id: userId,
      created_at: now,
      updated_at: now,
      passages: fullPassages
    };

    setLessons((prev) => {
      const updated = [newLesson, ...prev];
      save(STORAGE_KEYS.LESSONS, updated);
      return updated;
    });

    // Background Supabase Sync for Lesson
    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          const { passages: _, ...lessonRow } = newLesson;
          await supabase.from('lessons').insert(lessonRow);
          if (fullPassages.length > 0) {
            await supabase.from('lesson_passages').insert(fullPassages);
          }
        } catch (e) {
          console.warn('Supabase add lesson sync error:', e);
        }
      })();
    }

    // Automatically update user progress based on passage evaluation
    for (const passage of passages) {
      let derivedStatus: MemorizationStatus = 'recited';
      if (passage.evaluation === 'excellent' || passage.evaluation === 'very_good') {
        derivedStatus = 'recited';
      } else if (passage.evaluation === 'repeat_required' || passage.evaluation === 'needs_improvement') {
        derivedStatus = 'needs_repetition';
      }
      bulkUpdateRangeProgress(
        passage.start_surah,
        passage.start_ayah,
        passage.end_surah,
        passage.end_ayah,
        derivedStatus,
        `تسميع مع ${lessonData.sheikh_name} - تقييم: ${passage.evaluation}`
      );
    }

    // Automatically register new assignment if Sheikh gave one
    if (newAssignmentData && isValidRange(newAssignmentData.startSurah, newAssignmentData.startAyah, newAssignmentData.endSurah, newAssignmentData.endAyah)) {
      addAssignment({
        assignment_type: 'new_memorization',
        start_surah: newAssignmentData.startSurah,
        start_ayah: newAssignmentData.startAyah,
        end_surah: newAssignmentData.endSurah,
        end_ayah: newAssignmentData.endAyah,
        title: newAssignmentData.title || `واجب من ${lessonData.sheikh_name}`,
        status: 'in_progress',
        notes: newAssignmentData.notes
      });
    }

    // Achievements check
    checkAndUnlockAchievement(
      'first_lesson',
      'أول لقاء مع الشيخ',
      'سجلت أول حلقة تسميع ودرس في مسيرتك',
      '🕌'
    );
  };

  // Update existing Lesson
  const updateLesson = (
    id: string,
    lessonUpdates: Partial<Omit<Lesson, 'id' | 'user_id' | 'created_at' | 'passages'>>,
    updatedPassages?: LessonPassage[]
  ) => {
    const now = new Date().toISOString();
    setLessons((prev) => {
      const updated = prev.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          ...lessonUpdates,
          passages: updatedPassages || l.passages,
          updated_at: now
        };
      });
      save(STORAGE_KEYS.LESSONS, updated);
      return updated;
    });

    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase
            .from('lessons')
            .update({ ...lessonUpdates, updated_at: now })
            .eq('id', id)
            .eq('user_id', user.id);

          if (updatedPassages) {
            for (const p of updatedPassages) {
              await supabase
                .from('lesson_passages')
                .upsert({
                  id: p.id,
                  lesson_id: id,
                  start_surah: p.start_surah,
                  start_ayah: p.start_ayah,
                  end_surah: p.end_surah,
                  end_ayah: p.end_ayah,
                  passage_type: p.passage_type,
                  evaluation: p.evaluation,
                  notes: p.notes
                });
            }
          }
        } catch (err) {
          console.warn('Error syncing lesson update to Supabase:', err);
        }
      })();
    }
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      save(STORAGE_KEYS.LESSONS, updated);
      return updated;
    });

    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase.from('lessons').delete().eq('id', id).eq('user_id', user.id);
        } catch (e) {
          console.warn('Supabase delete lesson sync error:', e);
        }
      })();
    }
  };

  // Revision Sessions
  const addRevisionSession = (
    sessionData: Omit<RevisionSession, 'id' | 'user_id' | 'created_at'>
  ) => {
    const now = new Date().toISOString();

    let daysToAdd = 7;
    if (sessionData.evaluation === 'excellent') daysToAdd = 21;
    else if (sessionData.evaluation === 'good') daysToAdd = 10;
    else if (sessionData.evaluation === 'needs_improvement') daysToAdd = 3;
    else if (sessionData.evaluation === 'must_repeat') daysToAdd = 1;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    const nextReviewStr = nextDate.toISOString().split('T')[0];

    const newSession: RevisionSession = {
      ...sessionData,
      id: generateId(),
      user_id: userId,
      next_review_date: sessionData.next_review_date || nextReviewStr,
      created_at: now
    };

    setRevisionSessions((prev) => {
      const updated = [newSession, ...prev];
      save(STORAGE_KEYS.REVISIONS, updated);
      return updated;
    });

    // Supabase Sync
    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase.from('revision_sessions').insert(newSession);
        } catch (e) {
          console.warn('Supabase add revision sync error:', e);
        }
      })();
    }

    // Update status if evaluation was excellent
    if (sessionData.evaluation === 'excellent') {
      bulkUpdateRangeProgress(
        sessionData.start_surah,
        sessionData.start_ayah,
        sessionData.end_surah,
        sessionData.end_ayah,
        'mastered',
        'تم تثبيته وإتقانه في جلسة مراجعة ممتازة'
      );
    }

    checkAndUnlockAchievement(
      'first_revision',
      'تعهَّد القرآن',
      'أتممت أول جلسة مراجعة وتثبيت للحفظ',
      '✨'
    );
  };

  // Quran Reading Sessions Tracker
  const addReadingSession = (
    sessionData: Omit<ReadingSession, 'id' | 'user_id' | 'created_at'>
  ) => {
    const now = new Date().toISOString();
    const newSession: ReadingSession = {
      ...sessionData,
      id: generateId(),
      user_id: userId,
      created_at: now
    };

    setReadingSessions((prev) => {
      const updated = [newSession, ...prev];
      save(STORAGE_KEYS.READING, updated);
      return updated;
    });

    // Supabase Sync
    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase.from('reading_sessions').insert(newSession);
        } catch (e) {
          console.warn('Supabase add reading sync error:', e);
        }
      })();
    }

    checkAndUnlockAchievement(
      'first_reading',
      'ورد التلاوة',
      'سجلت أول ورد قراءة وتلاوة لكتاب الله',
      '🌿'
    );
  };

  // Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings, updated_at: new Date().toISOString() };
      save(STORAGE_KEYS.SETTINGS, updated);

      if (isSupabaseConfigured() && !isDemo && user?.id) {
        (async () => {
          try {
            const supabase = createClient();
            await supabase.from('user_settings').upsert({
              ...updated,
              user_id: user.id
            }, { onConflict: 'user_id' });
          } catch (e) {
            console.warn('Supabase update settings sync error:', e);
          }
        })();
      }

      return updated;
    });
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      save(STORAGE_KEYS.NOTIFICATIONS, updated);

      if (isSupabaseConfigured() && !isDemo && user?.id) {
        (async () => {
          try {
            const supabase = createClient();
            await supabase.from('user_notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
          } catch (e) {
            console.warn('Supabase mark notification read error:', e);
          }
        })();
      }

      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    save(STORAGE_KEYS.NOTIFICATIONS, []);

    if (isSupabaseConfigured() && !isDemo && user?.id) {
      (async () => {
        try {
          const supabase = createClient();
          await supabase.from('user_notifications').delete().eq('user_id', user.id);
        } catch (e) {
          console.warn('Supabase clear notifications error:', e);
        }
      })();
    }
  };

  // Return After Absence Calculation
  const daysSinceLastActivity = useMemo(() => {
    if (!lastActivityDate) return 0;
    const diffTime = Math.abs(new Date().getTime() - lastActivityDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [lastActivityDate]);

  const isReturningAfterAbsence = useMemo(() => {
    return daysSinceLastActivity >= 6 && !isWelcomeDismissed;
  }, [daysSinceLastActivity, isWelcomeDismissed]);

  const dismissWelcomeBack = () => {
    setIsWelcomeDismissed(true);
    save(STORAGE_KEYS.WELCOME_DISMISSED, true);
  };

  // Current new memorization assignment
  const currentAssignment = useMemo(() => {
    return (
      assignments.find(
        (a) =>
          a.assignment_type === 'new_memorization' &&
          (a.status === 'in_progress' || a.status === 'not_started' || a.status === 'ready_for_recitation')
      ) || null
    );
  }, [assignments]);

  // Outstanding tasks (not yet recited, repeat required, needs revision)
  const outstandingTasks = useMemo(() => {
    return assignments.filter(
      (a) =>
        a.status === 'needs_repetition' ||
        a.status === 'ready_for_recitation' ||
        a.assignment_type === 'repetition' ||
        a.assignment_type === 'previous_memorization'
    );
  }, [assignments]);

  // Revisions due
  const [todayStr, setTodayStr] = useState('');
  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const revisionDueToday = useMemo(() => {
    return revisionSessions.filter((r) => r.next_review_date === todayStr);
  }, [revisionSessions, todayStr]);

  const overdueRevision = useMemo(() => {
    return revisionSessions.filter((r) => r.next_review_date && r.next_review_date < todayStr);
  }, [revisionSessions, todayStr]);

  // Global Canonical Progress & Stats
  const stats = useMemo(() => {
    let memorizedAyahs = 0;
    let masteredAyahs = 0;
    let learningAyahs = 0;

    for (const p of progressList) {
      if (p.memorization_status === 'mastered') {
        masteredAyahs++;
        memorizedAyahs++;
      } else if (p.memorization_status === 'recited') {
        memorizedAyahs++;
      } else if (
        p.memorization_status === 'in_progress' ||
        p.memorization_status === 'ready_for_recitation' ||
        p.memorization_status === 'needs_repetition'
      ) {
        learningAyahs++;
      }
    }

    const remainingAyahs = Math.max(0, TOTAL_AYAH_COUNT - memorizedAyahs);
    const memorizedPercentage = Number(((memorizedAyahs / TOTAL_AYAH_COUNT) * 100).toFixed(1));
    const masteredPercentage = Number(((masteredAyahs / TOTAL_AYAH_COUNT) * 100).toFixed(1));

    // Calculate completed Surahs
    const surahAyahsCountMap = new Map<number, number>();
    for (const p of progressList) {
      if (p.memorization_status === 'mastered' || p.memorization_status === 'recited') {
        surahAyahsCountMap.set(p.surah_number, (surahAyahsCountMap.get(p.surah_number) || 0) + 1);
      }
    }

    let completedSurahs = 0;
    for (const s of SURAHS) {
      const count = surahAyahsCountMap.get(s.number) || 0;
      if (count >= s.ayahCount) {
        completedSurahs++;
      }
    }

    // Calculate completed Juz
    let completedJuzCount = 0;
    for (const j of JUZS) {
      const keys = getAyahKeysForRange(j.startSurah, j.startAyah, j.endSurah, j.endAyah);
      const memorizedInJuz = keys.filter((k) => {
        const [sStr, aStr] = k.split(':');
        const s = parseInt(sStr, 10);
        const a = parseInt(aStr, 10);
        const p = progressList.find((item) => item.surah_number === s && item.ayah_number === a);
        return p && (p.memorization_status === 'mastered' || p.memorization_status === 'recited');
      }).length;
      if (memorizedInJuz >= keys.length && keys.length > 0) {
        completedJuzCount++;
      }
    }

    // Active days count
    const activeDates = new Set<string>();
    for (const l of lessons) activeDates.add(l.lesson_date);
    for (const r of revisionSessions) activeDates.add(r.session_date);
    for (const rd of readingSessions) activeDates.add(rd.session_date);

    const totalRevisionMinutes = revisionSessions.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
    const totalReadingMinutes = readingSessions.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

    return {
      memorizedAyahsCount: memorizedAyahs,
      masteredAyahsCount: masteredAyahs,
      learningAyahsCount: learningAyahs,
      remainingAyahsCount: remainingAyahs,
      memorizedPercentage,
      masteredPercentage,
      completedSurahsCount: completedSurahs,
      remainingSurahsCount: TOTAL_SURAHS - completedSurahs,
      completedJuzCount,
      remainingJuzCount: TOTAL_JUZ - completedJuzCount,
      totalLessonsCount: lessons.length,
      totalRevisionMinutes,
      totalReadingMinutes,
      activeDaysCount: Math.max(1, activeDates.size)
    };
  }, [progressList, lessons, revisionSessions, readingSessions]);

  const getSurahMemorizedCount = (surahNumber: number) => {
    return progressList.filter(
      (p) =>
        p.surah_number === surahNumber &&
        (p.memorization_status === 'mastered' || p.memorization_status === 'recited')
    ).length;
  };

  const getSurahStatus = (surahNumber: number): MemorizationStatus => {
    const s = SURAHS.find((item) => item.number === surahNumber);
    if (!s) return 'not_started';
    const ayahs = progressList.filter((p) => p.surah_number === surahNumber);
    if (ayahs.length === 0) return 'not_started';

    const masteredCount = ayahs.filter((p) => p.memorization_status === 'mastered').length;
    if (masteredCount >= s.ayahCount) return 'mastered';

    const memorizedCount = ayahs.filter(
      (p) => p.memorization_status === 'recited' || p.memorization_status === 'mastered'
    ).length;
    if (memorizedCount >= s.ayahCount) return 'recited';

    const hasRepetition = ayahs.some((p) => p.memorization_status === 'needs_repetition');
    if (hasRepetition) return 'needs_repetition';

    return 'in_progress';
  };

  const getJuzProgress = (juzNumber: number) => {
    const j = JUZS.find((item) => item.juzNumber === juzNumber);
    if (!j) return { memorizedCount: 0, totalCount: 0, percentage: 0 };
    const keys = getAyahKeysForRange(j.startSurah, j.startAyah, j.endSurah, j.endAyah);
    const totalCount = keys.length;
    let memorizedCount = 0;

    for (const k of keys) {
      const [sStr, aStr] = k.split(':');
      const s = parseInt(sStr, 10);
      const a = parseInt(aStr, 10);
      const p = progressList.find((item) => item.surah_number === s && item.ayah_number === a);
      if (p && (p.memorization_status === 'mastered' || p.memorization_status === 'recited')) {
        memorizedCount++;
      }
    }

    const percentage = totalCount > 0 ? Number(((memorizedCount / totalCount) * 100).toFixed(1)) : 0;
    return { memorizedCount, totalCount, percentage };
  };

  // Export Data
  const exportData = (format: 'json' | 'csv') => {
    const payload = {
      user: { id: userId },
      exportDate: new Date().toISOString(),
      stats,
      progressList,
      assignments,
      lessons,
      revisionSessions,
      readingSessions,
      settings,
      achievements
    };

    if (format === 'json') {
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rehlaty-quran-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      let csv = 'النوع,السورة,من آية,إلى آية,الحالة,التاريخ,ملاحظات\n';
      for (const a of assignments) {
        csv += `واجب,${a.start_surah},${a.start_ayah},${a.end_ayah},${a.status},${a.assigned_at},"${a.notes || ''}"\n`;
      }
      for (const l of lessons) {
        csv += `درس الشيخ,${l.sheikh_name},-, -,${l.lesson_type},${l.lesson_date},"${l.overall_notes || ''}"\n`;
      }
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rehlaty-quran-lessons-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const resetAllUserData = () => {
    setProgressList([]);
    setAssignments([]);
    setLessons([]);
    setRevisionSessions([]);
    setReadingSessions([]);
    setAchievements([]);
    setNotifications([]);
    if (typeof window !== 'undefined') {
      const userKeyPrefix = `${userId}_`;
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(userKeyPrefix + k));
    }
  };

  return (
    <QuranAppContext.Provider
      value={{
        progressList,
        bulkUpdateRangeProgress,
        getSurahMemorizedCount,
        getSurahStatus,
        getJuzProgress,
        stats,
        assignments,
        currentAssignment,
        outstandingTasks,
        addAssignment,
        updateAssignmentStatus,
        deleteAssignment,
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        revisionSessions,
        addRevisionSession,
        revisionDueToday,
        overdueRevision,
        readingSessions,
        addReadingSession,
        isReturningAfterAbsence,
        daysSinceLastActivity,
        dismissWelcomeBack,
        settings,
        updateSettings,
        achievements,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        exportData,
        resetAllUserData
      }}
    >
      {children}
    </QuranAppContext.Provider>
  );
};

export const useQuranApp = () => {
  const context = useContext(QuranAppContext);
  if (!context) {
    throw new Error('useQuranApp must be used within a QuranAppProvider');
  }
  return context;
};
