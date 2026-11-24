# OPERATIONS & SRE RUNBOOK — QURAN TRACKER (رحلتي مع القرآن)

## 1. Incident Response Framework & Severity Levels

When an operational disruption occurs, engineering on-call responders must adhere to this protocol:

| Severity Level | Definition | Target Response (MTTD) | Target Resolution (MTTR) | Escalation Chain |
| :---: | :--- | :---: | :---: | :--- |
| **P1 — Critical** | Total outage: `/api/health` failing, database unreachable, all users blocked. | < 5 minutes | < 30 minutes | Lead SRE + DevOps + Database Admin |
| **P2 — Major** | Core feature impaired: Logins failing, Sheikh cannot evaluate lessons, audio upload broken. | < 15 minutes | < 2 hours | Full-Stack Engineer + On-Call SRE |
| **P3 — Moderate** | Degraded performance: Latency > 3000ms, badges not updating, non-critical styling bug. | < 1 hour | < 8 hours | Application Engineer |
| **P4 — Minor** | Cosmetic issue, typo in encouragement message, minor documentation discrepancy. | Next business day | Next Sprint | Frontend Developer |

---

## 2. Production Health & Log Verification Commands

### Check Live API Health & Latency:
```bash
curl -i https://quran-tracker-gamma.vercel.app/api/health
```

### Inspect Vercel Runtime Logs:
```bash
# Using Vercel CLI
vercel logs https://quran-tracker-gamma.vercel.app
```

### Query Database Active Connections & Locks (via Supabase SQL Editor):
```sql
-- Check active database connections
SELECT count(*), state, usename 
FROM pg_stat_activity 
GROUP BY state, usename;

-- Check blocked queries / locks
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
   AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
   AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
   AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
   AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
   AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
   AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
   AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
   AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
   AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
   AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
WHERE NOT blocked_locks.granted;
```

---

## 3. Incident Runbooks

### Runbook 1: Database Disconnection or Pooler Exhaustion
**Symptoms**: `/api/health` reports `"database": "fail"`, HTTP 500 errors across user portals.
**Procedure**:
1. Check Supabase Dashboard project status for `ycdaunpbtwxofbnakeek`.
2. Verify if connection spikes exceeded the pool limit (port 5432 direct vs 6543 pooler).
3. If connections are orphaned, run:
   ```sql
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE state = 'idle' AND state_change < current_timestamp - INTERVAL '5 minutes';
   ```
4. If the database is unresponsive, trigger an instance restart from Supabase Project Settings -> Restart Services.
5. Verify `/api/health` returns HTTP 200 and latency < 1000ms.

---

### Runbook 2: Authentication Service Degradation
**Symptoms**: Users receive `Invalid Refresh Token` or cannot log in via `/auth`.
**Procedure**:
1. Check Supabase Auth service status at `https://status.supabase.com`.
2. Validate client environment variables:
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` matches `https://ycdaunpbtwxofbnakeek.supabase.co`.
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` has not expired or been rotated.
3. Test direct auth token exchange via curl:
   ```bash
   curl -X POST 'https://ycdaunpbtwxofbnakeek.supabase.co/auth/v1/token?grant_type=password' \
     -H "apikey: <ANON_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"valid_password"}'
   ```
4. If issue persists, check JWT expiry settings in Supabase Auth Configuration.

---

### Runbook 3: Production Deployment Failure & Fast Rollback
**Symptoms**: New git push introduces a regression or build artifact error on Vercel.
**Procedure**:
1. Identify the previous working deployment ID on Vercel.
2. Rollback immediately using Vercel CLI:
   ```bash
   vercel rollback <PREVIOUS_DEPLOYMENT_URL_OR_ID>
   ```
3. Alternatively, in the Vercel Dashboard -> Deployments -> Click the previous stable deployment (`dpl_...`) -> Select **Promote to Production**.
4. Lock the production branch in GitHub while investigating the regression locally:
   ```bash
   git revert HEAD
   git push origin main
   ```

---

### Runbook 4: Database Migration Failure & Schema Repair
**Symptoms**: Migration script errors out leaving schema in a partial or locked state.
**Procedure**:
1. Inspect `app_audit_logs` or PostgreSQL logs for the exact failed DDL statement.
2. Never drop tables directly in production!
3. Re-run schema verification from `scripts/apply_migration.ts`.
4. Apply the corresponding rollback script or fix forward using standard idempotent DDL (`ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

---

### Runbook 5: Unauthorized Access or Compromised Invitation Code
**Symptoms**: Student reports unexpected Sheikh connection or suspicious lesson evaluations.
**Procedure**:
1. Terminate the active relationship immediately:
   ```sql
   UPDATE sheikh_students 
   SET status = 'terminated' 
   WHERE teacher_id = '<SUSPECT_TEACHER_ID>' AND student_id = '<STUDENT_ID>';
   ```
2. Expire all outstanding invitations created by the suspicious teacher:
   ```sql
   UPDATE sheikh_invitations 
   SET status = 'expired' 
   WHERE teacher_id = '<SUSPECT_TEACHER_ID>';
   ```
3. Audit recent modifications in `sheikh_evaluations` and `sheikh_assignments`.
