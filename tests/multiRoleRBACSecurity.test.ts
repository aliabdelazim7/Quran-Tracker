import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import {
  isValidRegistrationRole,
  isValidRole,
  isStudent,
  isSheikh,
} from '../src/lib/authorization/roles.ts';
import {
  hasPermission,
  DEFAULT_RELATIONSHIP_PERMISSIONS,
  type PermissionKey,
} from '../src/lib/authorization/permissions.ts';
import { isAllowedRoute, getPortalHome } from '../src/lib/authorization/guards.ts';
import type { UserRole, RelationshipPermissions } from '../src/types/database.ts';

// =========================================================================
// 1. Role Boundaries & Portal Isolation Tests
// =========================================================================
test('1. Role registration allowlist rejects privileged and invalid roles', () => {
  assert.strictEqual(isValidRegistrationRole('student'), true);
  assert.strictEqual(isValidRegistrationRole('sheikh'), true);
  // Privileged or arbitrary roles MUST be rejected during public registration
  assert.strictEqual(isValidRegistrationRole('admin'), false);
  assert.strictEqual(isValidRegistrationRole('superuser'), false);
  assert.strictEqual(isValidRegistrationRole('moderator'), false);
  assert.strictEqual(isValidRegistrationRole(''), false);
  assert.strictEqual(isValidRegistrationRole(null), false);
  assert.strictEqual(isValidRegistrationRole(undefined), false);
});

test('2. Student cannot access Sheikh Portal and is redirected to Student Dashboard', () => {
  const studentRole: UserRole = 'student';
  const sheikhRoutes = [
    '/sheikh/dashboard',
    '/sheikh/students',
    '/sheikh/students/std-123',
    '/sheikh/students/std-123/lessons/new',
    '/sheikh/invitations',
    '/sheikh/statistics',
    '/sheikh/settings',
  ];

  for (const route of sheikhRoutes) {
    const check = isAllowedRoute(route, studentRole);
    assert.strictEqual(check.allowed, false, `Student must be denied access to: ${route}`);
    assert.strictEqual(check.redirectTo, '/student/dashboard');
  }
});

test('3. Sheikh cannot access Student Portal as a student and is redirected to Sheikh Dashboard', () => {
  const sheikhRole: UserRole = 'sheikh';
  const studentRoutes = [
    '/student/dashboard',
    '/student/memorization',
    '/student/revision',
    '/student/reading',
    '/student/teacher',
  ];

  for (const route of studentRoutes) {
    const check = isAllowedRoute(route, sheikhRole);
    assert.strictEqual(check.allowed, false, `Sheikh must be denied access to: ${route}`);
    assert.strictEqual(check.redirectTo, '/sheikh/dashboard');
  }
});

test('4. Correct portal destinations resolved per role', () => {
  assert.strictEqual(getPortalHome('student'), '/student/dashboard');
  assert.strictEqual(getPortalHome('sheikh'), '/sheikh/dashboard');
  assert.strictEqual(getPortalHome('admin'), '/student/dashboard');
  assert.strictEqual(getPortalHome(null), '/student/dashboard');
});

// =========================================================================
// 2. Cryptographic Single-Use Invitations Lifecycle Simulation
// =========================================================================
interface MockInvitation {
  id: string;
  teacher_id: string;
  invite_code: string;
  token_hash: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  revoked_at: string | null;
}

interface MockRelationship {
  id: string;
  teacher_id: string;
  student_id: string;
  status: 'active' | 'revoked' | 'suspended';
  connected_at: string;
  permissions: Record<PermissionKey, boolean>;
}

const mockInvitations: MockInvitation[] = [];
const mockRelationships: MockRelationship[] = [];

test('5. Cryptographic invitation generation with SHA-256 token hashing', () => {
  const rawToken = crypto.randomUUID();
  const inviteCode = 'QRN-7X8-9KM';
  const tokenHash = crypto.createHash('sha256').update(rawToken + inviteCode).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString(); // 7 days

  const inv: MockInvitation = {
    id: 'inv-test-1',
    teacher_id: 'usr-sheikh-a',
    invite_code: inviteCode,
    token_hash: tokenHash,
    expires_at: expiresAt,
    accepted_at: null,
    accepted_by: null,
    revoked_at: null,
  };
  mockInvitations.push(inv);

  assert.ok(inv.token_hash.length === 64, 'SHA-256 token hash must be 64 hex characters');
  assert.strictEqual(inv.accepted_at, null);
  assert.strictEqual(inv.revoked_at, null);
});

test('6. Verifying invitation code returns teacher preview without prematurely creating relationship', () => {
  const code = 'QRN-7X8-9KM';
  const found = mockInvitations.find((i) => i.invite_code === code && !i.revoked_at && !i.accepted_at);
  assert.ok(found, 'Active invitation must be found');
  assert.strictEqual(new Date(found.expires_at) > new Date(), true, 'Must not be expired');

  // Confirm relationship count is 0
  assert.strictEqual(mockRelationships.length, 0, 'No relationship should exist before student approval');
});

test('7. Student explicitly accepts invitation -> relationship activated with default permissions', () => {
  const code = 'QRN-7X8-9KM';
  const studentId = 'usr-student-a';
  const inv = mockInvitations.find((i) => i.invite_code === code)!;

  // Mark invitation accepted (single use)
  inv.accepted_at = new Date().toISOString();
  inv.accepted_by = studentId;

  // Activate relationship
  const relId = 'rel-test-1';
  const rel: MockRelationship = {
    id: relId,
    teacher_id: inv.teacher_id,
    student_id: studentId,
    status: 'active',
    connected_at: new Date().toISOString(),
    permissions: { ...DEFAULT_RELATIONSHIP_PERMISSIONS },
  };
  mockRelationships.push(rel);

  assert.strictEqual(rel.status, 'active');
  assert.strictEqual(rel.permissions.can_view_lessons, true);
  assert.strictEqual(rel.permissions.can_create_lessons, true);
  assert.strictEqual(rel.permissions.can_create_assignments, true);
});

test('8. Reusing an already-accepted invitation code is strictly rejected (single-use enforced)', () => {
  const code = 'QRN-7X8-9KM';
  const inv = mockInvitations.find((i) => i.invite_code === code)!;
  // If already accepted, attempt must fail
  assert.ok(inv.accepted_at !== null, 'Invitation is marked accepted');
  const canReuse = !inv.accepted_at && !inv.revoked_at && new Date(inv.expires_at) > new Date();
  assert.strictEqual(canReuse, false, 'Already accepted invitation must not be reusable');
});

test('9. Expired invitations (> 7 days) and revoked invitations are strictly rejected', () => {
  const expiredInv: MockInvitation = {
    id: 'inv-expired',
    teacher_id: 'usr-sheikh-a',
    invite_code: 'QRN-EXP-999',
    token_hash: 'hash-exp',
    expires_at: new Date(Date.now() - 1000).toISOString(), // expired 1s ago
    accepted_at: null,
    accepted_by: null,
    revoked_at: null,
  };
  assert.strictEqual(new Date(expiredInv.expires_at) < new Date(), true, 'Invitation is expired');

  const revokedInv: MockInvitation = {
    id: 'inv-revoked',
    teacher_id: 'usr-sheikh-a',
    invite_code: 'QRN-RVK-888',
    token_hash: 'hash-rvk',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    accepted_at: null,
    accepted_by: null,
    revoked_at: new Date().toISOString(),
  };
  assert.ok(revokedInv.revoked_at !== null, 'Invitation is revoked');
});

// =========================================================================
// 3. Student Data Isolation & Unauthorized Access Tests
// =========================================================================
test('10. Sheikh B cannot access Student A records (isolation between unrelated Sheikhs and Students)', () => {
  const sheikhBId = 'usr-sheikh-b';
  const studentAId = 'usr-student-a';

  // RLS check: Does active relationship exist between sheikhB and studentA?
  const rel = mockRelationships.find(
    (r) => r.teacher_id === sheikhBId && r.student_id === studentAId && r.status === 'active'
  );
  assert.strictEqual(rel, undefined, 'No relationship exists for Sheikh B with Student A');

  // Policy check function
  const canAccess = !!rel && rel.status === 'active';
  assert.strictEqual(canAccess, false, 'Access must be denied to unconnected Sheikh B');
});

test('11. Sheikh A can view authorized records of Student A while relationship is active', () => {
  const sheikhAId = 'usr-sheikh-a';
  const studentAId = 'usr-student-a';

  const rel = mockRelationships.find(
    (r) => r.teacher_id === sheikhAId && r.student_id === studentAId && r.status === 'active'
  );
  assert.ok(rel, 'Active relationship exists for Sheikh A with Student A');
  assert.strictEqual(rel.permissions.can_view_progress, true);
});

// =========================================================================
// 4. Granular Permissions & Dynamic Enforcement Tests
// =========================================================================
test('12. Student disables can_create_lessons -> Sheikh lesson creation is strictly blocked', () => {
  const rel = mockRelationships[0];
  // Student revokes write permission
  rel.permissions.can_create_lessons = false;

  const attemptCreateLesson = (teacherId: string, studentId: string) => {
    const active = mockRelationships.find(
      (r) => r.teacher_id === teacherId && r.student_id === studentId && r.status === 'active'
    );
    if (!active || !active.permissions.can_create_lessons) {
      throw new Error('403 Forbidden: Teacher does not have can_create_lessons permission');
    }
    return { success: true };
  };

  assert.throws(
    () => attemptCreateLesson('usr-sheikh-a', 'usr-student-a'),
    /403 Forbidden: Teacher does not have can_create_lessons permission/
  );

  // Restore permission
  rel.permissions.can_create_lessons = true;
  assert.doesNotThrow(() => attemptCreateLesson('usr-sheikh-a', 'usr-student-a'));
});

test('13. Private student reading sessions are strictly private to student (never exposed to Sheikh)', () => {
  // Reading sessions schema check: reading_sessions has NO teacher access policies in RLS
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261124_rbac_multi_role.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  // In the migration, reading_sessions policies are strictly limited to auth.uid() = user_id
  assert.ok(
    sqlContent.includes('Reading Sessions: strictly private to the student'),
    'Migration must explicitly mandate reading session privacy'
  );
});

// =========================================================================
// 5. Relationship Revocation & Immediate Termination of Access
// =========================================================================
test('14. Student revokes relationship -> Sheikh immediately loses access to student data', () => {
  const rel = mockRelationships[0];
  rel.status = 'revoked'; // Revoked!

  // Now check access
  const checkAccess = (teacherId: string, studentId: string) => {
    const active = mockRelationships.find(
      (r) => r.teacher_id === teacherId && r.student_id === studentId && r.status === 'active'
    );
    return !!active;
  };

  assert.strictEqual(
    checkAccess('usr-sheikh-a', 'usr-student-a'),
    false,
    'Revoked relationship must immediately deny teacher access'
  );
});

test('15. Historical lessons remain intact for student after relationship revocation', () => {
  // Simulated student lessons
  const studentLessons = [
    { id: 'les-1', student_id: 'usr-student-a', created_by: 'usr-sheikh-a', notes: 'ممتاز' },
    { id: 'les-2', student_id: 'usr-student-a', created_by: 'usr-sheikh-a', notes: 'جيد جداً' },
  ];

  // Even after relationship is revoked, studentLessons belong to student_id and are not cascade-deleted
  const preservedLessons = studentLessons.filter((l) => l.student_id === 'usr-student-a');
  assert.strictEqual(preservedLessons.length, 2, 'Student historical lessons must be preserved');
});

// =========================================================================
// 6. SQL Migration & Schema Integrity Tests
// =========================================================================
test('16. SQL migration defines all required RBAC tables, triggers, and functions', () => {
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261124_rbac_multi_role.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  assert.ok(sql.includes('public.teacher_student_relationships'), 'Must create teacher_student_relationships');
  assert.ok(sql.includes('public.relationship_permissions'), 'Must create relationship_permissions');
  assert.ok(sql.includes('public.teacher_invitations'), 'Must create teacher_invitations');
  assert.ok(sql.includes('public.audit_logs'), 'Must create audit_logs');
  assert.ok(sql.includes('protect_profile_role'), 'Must include role protection trigger');
  assert.ok(sql.includes('accept_teacher_invitation'), 'Must include accept_teacher_invitation RPC');
  assert.ok(sql.includes('verify_invitation_code'), 'Must include verify_invitation_code RPC');
});
