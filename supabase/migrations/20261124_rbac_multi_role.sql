-- ====================================================================
-- 'رحلتي مع القرآن' - Phase 3 Multi-Role RBAC & Sheikh-Student Portals
-- Migration: 20261124_rbac_multi_role.sql
-- ====================================================================

-- 1. Extend Profiles Table with Protected Role & Verification Status
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'sheikh', 'admin')),
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Non-destructive migration: Ensure existing accounts have default 'student' role
UPDATE public.profiles
SET role = 'student'
WHERE role IS NULL OR role NOT IN ('student', 'sheikh', 'admin');

-- 2. Teacher-Student Relationships Table
CREATE TABLE IF NOT EXISTS public.teacher_student_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'suspended')),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_teacher_student_rel UNIQUE (teacher_id, student_id),
  CONSTRAINT chk_teacher_not_student CHECK (teacher_id <> student_id)
);

CREATE INDEX IF NOT EXISTS idx_rel_teacher ON public.teacher_student_relationships(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_rel_student ON public.teacher_student_relationships(student_id, status);
CREATE INDEX IF NOT EXISTS idx_rel_status ON public.teacher_student_relationships(status);

-- 3. Granular Relationship Permissions Table
CREATE TABLE IF NOT EXISTS public.relationship_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID UNIQUE NOT NULL REFERENCES public.teacher_student_relationships(id) ON DELETE CASCADE,
  can_view_profile BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_memorization BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_progress BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_lessons BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_assignments BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_revision_history BOOLEAN NOT NULL DEFAULT TRUE,
  can_create_lessons BOOLEAN NOT NULL DEFAULT TRUE,
  can_record_evaluations BOOLEAN NOT NULL DEFAULT TRUE,
  can_create_assignments BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rel_perm_relationship ON public.relationship_permissions(relationship_id);

-- 4. Teacher Invitations Table (Cryptographic Single-Use Invitations)
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_teacher ON public.teacher_invitations(teacher_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_inv_code ON public.teacher_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_inv_token_hash ON public.teacher_invitations(token_hash);

-- 5. Extend Lessons and Assignments with Audit & Ownership Origin
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by_role TEXT DEFAULT 'student' CHECK (created_by_role IN ('student', 'sheikh', 'system')),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.memorization_assignments
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by_role TEXT DEFAULT 'student' CHECK (created_by_role IN ('student', 'sheikh', 'system')),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Backfill ownership origin on existing records
UPDATE public.lessons SET created_by = user_id, created_by_role = 'student' WHERE created_by IS NULL;
UPDATE public.memorization_assignments SET created_by = user_id, created_by_role = 'student' WHERE created_by IS NULL;

-- 6. Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_student ON public.audit_logs(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_teacher ON public.audit_logs(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action, created_at DESC);

-- ====================================================================
-- RLS POLICIES FOR MULTI-ROLE SECURITY
-- ====================================================================

ALTER TABLE public.teacher_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Check Function (Security Definer with empty search path)
CREATE OR REPLACE FUNCTION public.check_is_teacher_of_student(
  p_teacher_id UUID,
  p_student_id UUID,
  p_permission_col TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rel_id UUID;
  v_perm_val BOOLEAN;
BEGIN
  SELECT id INTO v_rel_id
  FROM public.teacher_student_relationships
  WHERE teacher_id = p_teacher_id
    AND student_id = p_student_id
    AND status = 'active';

  IF v_rel_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF p_permission_col IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Verify dynamic granular permission
  EXECUTE format(
    'SELECT %I FROM public.relationship_permissions WHERE relationship_id = $1',
    p_permission_col
  ) INTO v_perm_val USING v_rel_id;

  RETURN COALESCE(v_perm_val, FALSE);
END;
$$;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile or connected partner" ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      -- Sheikh can view student profile if permitted
      SELECT 1 FROM public.teacher_student_relationships r
      JOIN public.relationship_permissions p ON p.relationship_id = r.id
      WHERE r.teacher_id = auth.uid() AND r.student_id = profiles.id AND r.status = 'active' AND p.can_view_profile = true
    )
    OR EXISTS (
      -- Student can view teacher profile
      SELECT 1 FROM public.teacher_student_relationships r
      WHERE r.student_id = auth.uid() AND r.teacher_id = profiles.id AND r.status = 'active'
    )
  );

-- Users can only update their own non-sensitive profile fields
-- (Role and verification_status protected via trigger or column level check)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role <> OLD.role AND (auth.role() <> 'service_role') THEN
    RAISE EXCEPTION 'Cannot modify account role directly.';
  END IF;
  IF NEW.verification_status <> OLD.verification_status AND (auth.role() <> 'service_role') THEN
    RAISE EXCEPTION 'Cannot modify account verification status directly.';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 2. Teacher-Student Relationships Policies
CREATE POLICY "Users can view their own relationships"
  ON public.teacher_student_relationships FOR SELECT
  USING (auth.uid() = teacher_id OR auth.uid() = student_id);

CREATE POLICY "Students can update/revoke their relationships"
  ON public.teacher_student_relationships FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = teacher_id);

-- 3. Relationship Permissions Policies
CREATE POLICY "Participants can view permissions"
  ON public.relationship_permissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.teacher_student_relationships r
    WHERE r.id = relationship_permissions.relationship_id
      AND (r.student_id = auth.uid() OR r.teacher_id = auth.uid())
  ));

CREATE POLICY "Students can modify permissions for their relationship"
  ON public.relationship_permissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.teacher_student_relationships r
    WHERE r.id = relationship_permissions.relationship_id
      AND r.student_id = auth.uid()
  ));

-- 4. Teacher Invitations Policies
CREATE POLICY "Teachers can view their own invitations"
  ON public.teacher_invitations FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert invitations"
  ON public.teacher_invitations FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update/revoke their own invitations"
  ON public.teacher_invitations FOR UPDATE
  USING (teacher_id = auth.uid());

-- 5. Memorization Assignments Multi-Role Policies
DROP POLICY IF EXISTS "Users can view own assignments" ON public.memorization_assignments;
CREATE POLICY "Student or authorized Sheikh can view assignments" ON public.memorization_assignments FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      EXISTS (
        SELECT 1 FROM public.teacher_student_relationships r
        JOIN public.relationship_permissions p ON p.relationship_id = r.id
        WHERE r.teacher_id = auth.uid()
          AND r.student_id = memorization_assignments.user_id
          AND r.status = 'active'
          AND p.can_view_assignments = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own assignments" ON public.memorization_assignments;
CREATE POLICY "Student or authorized Sheikh can create assignments" ON public.memorization_assignments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      EXISTS (
        SELECT 1 FROM public.teacher_student_relationships r
        JOIN public.relationship_permissions p ON p.relationship_id = r.id
        WHERE r.teacher_id = auth.uid()
          AND r.student_id = memorization_assignments.user_id
          AND r.status = 'active'
          AND p.can_create_assignments = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own assignments" ON public.memorization_assignments;
CREATE POLICY "Student or creator Sheikh can update assignments" ON public.memorization_assignments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (created_by = auth.uid())
  );

-- 6. Lessons & Passages Multi-Role Policies
DROP POLICY IF EXISTS "Users can view own lessons" ON public.lessons;
CREATE POLICY "Student or authorized Sheikh can view lessons" ON public.lessons FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      EXISTS (
        SELECT 1 FROM public.teacher_student_relationships r
        JOIN public.relationship_permissions p ON p.relationship_id = r.id
        WHERE r.teacher_id = auth.uid()
          AND r.student_id = lessons.user_id
          AND r.status = 'active'
          AND p.can_view_lessons = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own lessons" ON public.lessons;
CREATE POLICY "Student or authorized Sheikh can insert lessons" ON public.lessons FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      EXISTS (
        SELECT 1 FROM public.teacher_student_relationships r
        JOIN public.relationship_permissions p ON p.relationship_id = r.id
        WHERE r.teacher_id = auth.uid()
          AND r.student_id = lessons.user_id
          AND r.status = 'active'
          AND p.can_create_lessons = true
      )
    )
  );

-- Lesson Passages
DROP POLICY IF EXISTS "Users can view own lesson passages" ON public.lesson_passages;
CREATE POLICY "Student or authorized Sheikh can view lesson passages" ON public.lesson_passages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_passages.lesson_id
        AND (
          l.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.teacher_student_relationships r
            JOIN public.relationship_permissions p ON p.relationship_id = r.id
            WHERE r.teacher_id = auth.uid()
              AND r.student_id = l.user_id
              AND r.status = 'active'
              AND p.can_view_lessons = true
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can insert own lesson passages" ON public.lesson_passages;
CREATE POLICY "Student or authorized Sheikh can insert lesson passages" ON public.lesson_passages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_passages.lesson_id
        AND (
          l.user_id = auth.uid()
          OR (
            l.created_by = auth.uid()
            AND EXISTS (
              SELECT 1 FROM public.teacher_student_relationships r
              JOIN public.relationship_permissions p ON p.relationship_id = r.id
              WHERE r.teacher_id = auth.uid()
                AND r.student_id = l.user_id
                AND r.status = 'active'
                AND p.can_record_evaluations = true
            )
          )
        )
    )
  );

-- 7. Revision Sessions Policies
DROP POLICY IF EXISTS "Users can view own revision sessions" ON public.revision_sessions;
CREATE POLICY "Student or authorized Sheikh can view revision" ON public.revision_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      EXISTS (
        SELECT 1 FROM public.teacher_student_relationships r
        JOIN public.relationship_permissions p ON p.relationship_id = r.id
        WHERE r.teacher_id = auth.uid()
          AND r.student_id = revision_sessions.user_id
          AND r.status = 'active'
          AND p.can_view_revision_history = true
      )
    )
  );

-- 8. Reading Sessions: strictly private to the student!
-- (Sheikhs never get access to private reading sessions)

-- 9. Audit Logs Policies: Read-only for participants, no user modification/deletion
CREATE POLICY "Users can view audit events involving them" ON public.audit_logs FOR SELECT
  USING (auth.uid() = actor_id OR auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "System and authorized users can insert audit logs" ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

-- Revoke UPDATE and DELETE on audit_logs from everyone except superuser
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated, anon, public;

-- ====================================================================
-- SECURE TRANSACTIONAL RPCs FOR INVITATION & RELATIONSHIPS
-- ====================================================================

-- RPC: Verify Invitation Code (Before Acceptance)
CREATE OR REPLACE FUNCTION public.verify_invitation_code(p_code TEXT)
RETURNS TABLE (
  invitation_id UUID,
  teacher_id UUID,
  teacher_name TEXT,
  teacher_verification_status TEXT,
  expires_at TIMESTAMPTZ,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inv public.teacher_invitations%ROWTYPE;
  v_teacher public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_inv
  FROM public.teacher_invitations
  WHERE invite_code = UPPER(TRIM(p_code))
    AND revoked_at IS NULL
    AND accepted_at IS NULL;

  IF v_inv.id IS NULL OR v_inv.expires_at < NOW() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE;
    RETURN;
  END IF;

  SELECT * INTO v_teacher
  FROM public.profiles
  WHERE id = v_inv.teacher_id;

  RETURN QUERY SELECT
    v_inv.id,
    v_teacher.id,
    v_teacher.display_name,
    v_teacher.verification_status,
    v_inv.expires_at,
    TRUE;
END;
$$;

-- RPC: Accept Teacher Invitation
CREATE OR REPLACE FUNCTION public.accept_teacher_invitation(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id UUID;
  v_student_role TEXT;
  v_inv public.teacher_invitations%ROWTYPE;
  v_rel_id UUID;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Ensure caller is a student
  SELECT role INTO v_student_role FROM public.profiles WHERE id = v_student_id;
  IF v_student_role <> 'student' THEN
    RAISE EXCEPTION 'Only students can accept teacher invitations.';
  END IF;

  -- Lookup and lock invitation
  SELECT * INTO v_inv
  FROM public.teacher_invitations
  WHERE invite_code = UPPER(TRIM(p_code))
    AND revoked_at IS NULL
    AND accepted_at IS NULL
  FOR UPDATE;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invalid, revoked, or already accepted invitation.';
  END IF;

  IF v_inv.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invitation has expired.';
  END IF;

  IF v_inv.teacher_id = v_student_id THEN
    RAISE EXCEPTION 'Teacher cannot connect to their own account.';
  END IF;

  -- Create or reactivate relationship
  INSERT INTO public.teacher_student_relationships (
    teacher_id,
    student_id,
    status,
    connected_at,
    accepted_at
  ) VALUES (
    v_inv.teacher_id,
    v_student_id,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (teacher_id, student_id) DO UPDATE SET
    status = 'active',
    revoked_at = NULL,
    accepted_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_rel_id;

  -- Initialize default permissions if not present
  INSERT INTO public.relationship_permissions (
    relationship_id,
    can_view_profile,
    can_view_memorization,
    can_view_progress,
    can_view_lessons,
    can_view_assignments,
    can_view_revision_history,
    can_create_lessons,
    can_record_evaluations,
    can_create_assignments
  ) VALUES (
    v_rel_id,
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
  )
  ON CONFLICT (relationship_id) DO NOTHING;

  -- Mark invitation as accepted
  UPDATE public.teacher_invitations
  SET accepted_at = NOW(),
      accepted_by = v_student_id
  WHERE id = v_inv.id;

  -- Create Audit Log Entry
  INSERT INTO public.audit_logs (
    actor_id,
    actor_role,
    action,
    resource_type,
    resource_id,
    student_id,
    teacher_id,
    metadata
  ) VALUES (
    v_student_id,
    'student',
    'invitation_accepted',
    'teacher_student_relationships',
    v_rel_id::TEXT,
    v_student_id,
    v_inv.teacher_id,
    jsonb_build_object('invite_code', v_inv.invite_code)
  );

  RETURN v_rel_id;
END;
$$;
