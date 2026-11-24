-- Migration: AI-Assisted Quran Recitation (التسميع الذكي)
-- Tables: ai_recitation_sessions, ai_recitation_findings
-- Permissions: can_view_ai_recitation_reports in relationship_permissions

ALTER TABLE public.relationship_permissions 
ADD COLUMN IF NOT EXISTS can_view_ai_recitation_reports boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.ai_recitation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.memorization_assignments(id) ON DELETE SET NULL,
    session_mode TEXT NOT NULL CHECK (session_mode IN ('memorization', 'free')),
    surah_number INT CHECK (surah_number BETWEEN 1 AND 114),
    start_ayah INT,
    end_ayah INT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    session_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (session_status IN ('in_progress', 'completed', 'cancelled')),
    sdk_version TEXT,
    model_id TEXT,
    model_version TEXT,
    model_sha256 TEXT,
    model_tier TEXT,
    execution_backend TEXT,
    total_words_recited INT DEFAULT 0,
    total_confirmed_mistakes INT DEFAULT 0,
    total_self_corrections INT DEFAULT 0,
    total_uncertain INT DEFAULT 0,
    verified_report_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_recitation_student ON public.ai_recitation_sessions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_recitation_assignment ON public.ai_recitation_sessions(assignment_id);

CREATE TABLE IF NOT EXISTS public.ai_recitation_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.ai_recitation_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    finding_uid TEXT NOT NULL,
    error_class TEXT NOT NULL CHECK (error_class IN ('wrong_word', 'omitted_word', 'added_word', 'skipped_passage', 'other')),
    event_status TEXT NOT NULL CHECK (event_status IN ('suspected', 'confirmed', 'resolved', 'uncertain')),
    surah_number INT CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT,
    word_index INT,
    expected_text TEXT,
    observed_text TEXT,
    confidence NUMERIC,
    audio_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_findings_session ON public.ai_recitation_findings(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_student ON public.ai_recitation_findings(student_id);

ALTER TABLE public.ai_recitation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recitation_findings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_sessions' AND policyname = 'Students can view own ai sessions'
  ) THEN
    CREATE POLICY "Students can view own ai sessions"
    ON public.ai_recitation_sessions FOR SELECT
    TO authenticated
    USING (
      student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.teacher_student_relationships tsr
        JOIN public.relationship_permissions rp ON rp.relationship_id = tsr.id
        WHERE tsr.student_id = ai_recitation_sessions.student_id
          AND tsr.teacher_id = auth.uid()
          AND tsr.status = 'active'
          AND rp.can_view_ai_recitation_reports = true
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_sessions' AND policyname = 'Students can create own ai sessions'
  ) THEN
    CREATE POLICY "Students can create own ai sessions"
    ON public.ai_recitation_sessions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_sessions' AND policyname = 'Students can update own ai sessions'
  ) THEN
    CREATE POLICY "Students can update own ai sessions"
    ON public.ai_recitation_sessions FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_sessions' AND policyname = 'Students can delete own ai sessions'
  ) THEN
    CREATE POLICY "Students can delete own ai sessions"
    ON public.ai_recitation_sessions FOR DELETE
    TO authenticated
    USING (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_findings' AND policyname = 'Students can view own ai findings'
  ) THEN
    CREATE POLICY "Students can view own ai findings"
    ON public.ai_recitation_findings FOR SELECT
    TO authenticated
    USING (
      student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.teacher_student_relationships tsr
        JOIN public.relationship_permissions rp ON rp.relationship_id = tsr.id
        WHERE tsr.student_id = ai_recitation_findings.student_id
          AND tsr.teacher_id = auth.uid()
          AND tsr.status = 'active'
          AND rp.can_view_ai_recitation_reports = true
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_findings' AND policyname = 'Students can create own ai findings'
  ) THEN
    CREATE POLICY "Students can create own ai findings"
    ON public.ai_recitation_findings FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recitation_findings' AND policyname = 'Students can delete own ai findings'
  ) THEN
    CREATE POLICY "Students can delete own ai findings"
    ON public.ai_recitation_findings FOR DELETE
    TO authenticated
    USING (student_id = auth.uid());
  END IF;
END $$;
