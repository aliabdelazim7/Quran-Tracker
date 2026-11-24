import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

test('1. Two-User Data Isolation Simulation (User A vs User B)', () => {
  const userA = { id: 'usr-1111-aaaa', email: 'userA@example.com' };
  const userB = { id: 'usr-2222-bbbb', email: 'userB@example.com' };

  // Simulated Database Table with RLS rule: (auth.uid() = user_id)
  interface DBRow {
    id: string;
    user_id: string;
    data: string;
    notes?: string;
  }

  const database: DBRow[] = [
    { id: 'rec-1', user_id: userA.id, data: 'سورة البقرة 1-25', notes: 'ملاحظة خاصة بالمستخدم أ' },
    { id: 'rec-2', user_id: userA.id, data: 'سورة آل عمران 1-10', notes: 'سرية للمستخدم أ' },
    { id: 'rec-3', user_id: userB.id, data: 'سورة الكهف 1-10', notes: 'ملاحظة المستخدم ب' }
  ];

  // RLS Filter function representing PostgreSQL RLS policy
  const queryWithRLS = (currentUserId: string): DBRow[] => {
    return database.filter((row) => row.user_id === currentUserId);
  };

  // User A queries data
  const userAResults = queryWithRLS(userA.id);
  assert.strictEqual(userAResults.length, 2);
  assert.ok(userAResults.every((r) => r.user_id === userA.id));

  // User B queries data
  const userBResults = queryWithRLS(userB.id);
  assert.strictEqual(userBResults.length, 1);
  assert.strictEqual(userBResults[0].id, 'rec-3');
  assert.strictEqual(userBResults[0].user_id, userB.id);

  // Cross-tenant access check: User B cannot see any User A records
  const userBSeeingUserA = userBResults.some((r) => r.user_id === userA.id);
  assert.strictEqual(userBSeeingUserA, false, 'User B must never access User A records');

  // Mutation RLS check: User B trying to modify User A's row
  const attemptUpdateRow = (executorId: string, rowId: string, newNotes: string) => {
    const row = database.find((r) => r.id === rowId);
    if (!row || row.user_id !== executorId) {
      throw new Error('RLS Violation: 403 Forbidden - Not owner of row');
    }
    row.notes = newNotes;
  };

  assert.throws(
    () => attemptUpdateRow(userB.id, 'rec-1', 'اختراق ملاحظات أ'),
    /RLS Violation/,
    'User B cannot modify User A data'
  );
});

test('2. RLS Policies and Schema Integrity Verification in SQL Migration', () => {
  const schemaPath = path.resolve('supabase/migrations/20261124_schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  // Verify RLS is enabled on all sensitive tables
  const requiredRlsTables = [
    'profiles',
    'user_ayah_progress',
    'memorization_assignments',
    'lessons',
    'lesson_passages',
    'revision_sessions',
    'reading_sessions',
    'user_settings',
    'user_achievements',
    'user_notifications'
  ];

  for (const table of requiredRlsTables) {
    const rlsCheck = `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`;
    assert.ok(
      schemaSQL.includes(rlsCheck),
      `Table public.${table} must have ENABLE ROW LEVEL SECURITY defined`
    );
  }

  // Verify auth.uid() check in policies
  assert.ok(schemaSQL.includes('auth.uid() = id'), 'Profiles must check auth.uid() = id');
  assert.ok(schemaSQL.includes('auth.uid() = user_id'), 'User tables must check auth.uid() = user_id');
});

test('3. No Service Role Key Leakage in Client Code', () => {
  const clientPath = path.resolve('src/lib/supabase/client.ts');
  const clientCode = fs.readFileSync(clientPath, 'utf8');

  assert.ok(!clientCode.includes('service_role'), 'Client code must NEVER include service_role key');
  assert.ok(
    clientCode.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    'Client code should only reference public anon key'
  );
});
