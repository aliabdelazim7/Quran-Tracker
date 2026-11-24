# DATA FLOW & LIFECYCLE ARCHITECTURE — QURAN TRACKER (رحلتي مع القرآن)

## 1. System Data Flow Overview

This document outlines the end-to-end data lifecycles across client applications, Next.js Edge Proxy, Supabase Auth (GoTrue), PostgreSQL database engine, and encrypted media storage. Every critical user interaction adheres to zero-trust principles, cryptographic validation, and atomic database transactions.

---

## 2. Authentication, Role Injection & Onboarding Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Student or Sheikh)
    participant Client as Next.js Web App
    participant Edge as Edge Proxy (proxy.ts)
    participant GoTrue as Supabase Auth (GoTrue)
    participant DB as PostgreSQL Database
    participant Trigger as DB Trigger: handle_new_user()

    User->>Client: Enters Email & Password on /auth
    Client->>GoTrue: signInWithPassword({ email, password })
    GoTrue-->>Client: Returns Session (Access Token JWT + Refresh Token)
    Client->>Client: Stores JWT in secure HttpOnly cookie & memory
    Client->>Edge: Request /dashboard or /sheikh
    Edge->>Edge: Validate session & inject security headers
    Client->>DB: Query user_roles WHERE user_id = auth.uid()
    DB-->>Client: Returns role ('student' or 'teacher')
    
    alt User has no role or uncompleted profile
        Client->>User: Redirects to /onboarding
        User->>Client: Selects Role & Submits Profile
        Client->>DB: Upsert user_roles & profiles
        DB-->>Client: Success confirmation
        Client->>User: Redirects to role-specific Portal
    else Role is 'student'
        Client->>User: Navigates to /dashboard
    else Role is 'teacher'
        Client->>User: Navigates to /sheikh
    end
```

---

## 3. Student Memorization & Revision Tracking Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as Student Portal UI
    participant Store as Local Storage & Audio API
    participant API as Supabase Client (PostgREST)
    participant Storage as Supabase Audio Storage
    participant DB as PostgreSQL (RLS Enforced)

    Student->>UI: Selects Surah & Ayah Range (e.g., Al-Baqarah 1-10)
    UI->>UI: Validates range with Zod (start_ayah <= end_ayah)
    
    opt Optional Audio Recording
        Student->>UI: Clicks "Record Recitation"
        UI->>Store: Captures microphone stream via MediaRecorder API
        Student->>UI: Stops recording
        UI->>Storage: Uploads audio blob to bucket 'recitations/{user_id}/{timestamp}.webm'
        Storage-->>UI: Returns signed asset URL
    end

    Student->>UI: Submits Memorization Session
    UI->>API: POST /rest/v1/memorization_records
    API->>DB: INSERT INTO memorization_records (user_id, surah_id, start_ayah, end_ayah, audio_url)
    
    par Update Ayah Progress
        API->>DB: UPSERT INTO user_ayah_progress (status='memorized', mastery_level=1)
    and Schedule Next Revision
        API->>DB: INSERT INTO revision_queue (due_date = CURRENT_DATE + interval '3 days')
    end

    DB-->>API: 201 Created (ACID Transaction Complete)
    API-->>UI: Refreshes Progress State
    UI->>Student: Displays updated percentage & spiritual encouragement badge
```

---

## 4. Single-Use Invitation & Sheikh-Student Connection Lifecycle

To ensure total privacy and prevent unauthorized student surveillance, connections are established exclusively via cryptographically generated, single-use invitation codes.

```mermaid
sequenceDiagram
    autonumber
    actor Sheikh as Sheikh (Teacher)
    actor Student as Student
    participant SheikhUI as Sheikh Portal
    participant StudentUI as Student Portal
    participant DB as PostgreSQL Engine
    participant RPC as RPC: accept_invitation()

    Sheikh->>SheikhUI: Clicks "Generate Student Invite Code"
    SheikhUI->>DB: INSERT INTO sheikh_invitations (teacher_id, invite_code, expires_at)
    Note over DB: Code generated: SHK-XXXXXX (Valid 48h)
    DB-->>SheikhUI: Returns Invite Code
    Sheikh->>Student: Shares Code via WhatsApp / Email

    Student->>StudentUI: Navigates to /dashboard/sheikh & enters Code
    StudentUI->>StudentUI: Validates format /^[A-Z0-9-]{6,12}$/
    StudentUI->>RPC: POST /rpc/accept_invitation({ invite_code: 'SHK-XXXXXX' })
    
    critical Atomic Validation & Redemption
        RPC->>DB: Check invite exists, status = 'pending', and not expired
        RPC->>DB: Verify teacher_id != auth.uid()
        RPC->>DB: INSERT INTO sheikh_students (teacher_id, student_id, status='active')
        RPC->>DB: UPDATE sheikh_invitations SET status='accepted' WHERE id = invite_id
    end

    RPC-->>StudentUI: Returns success: { connected_teacher_name, connected_at }
    StudentUI->>Student: Shows Sheikh Connected Badge
    SheikhUI->>Sheikh: Realtime update reflects new student in roster
```

---

## 5. Sheikh Lesson Evaluation & Passage Assignment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Sheikh as Sheikh
    participant UI as Sheikh Portal UI
    participant DB as PostgreSQL Engine
    actor Student as Student
    participant StudentUI as Student Portal UI

    Sheikh->>UI: Opens Student Profile & Clicks "New Lesson"
    Sheikh->>UI: Records recitation scores (Tajweed: 5/5, Hifz: 4/5, Notes: "مراجعة ممتازة")
    Sheikh->>UI: Assigns Next Passage (Surah Ali 'Imran 1-20, Due: Thursday)
    
    critical Atomic Lesson & Assignment Transaction
        UI->>DB: INSERT INTO sheikh_lessons (teacher_id, student_id, lesson_type, sheikh_notes)
        UI->>DB: INSERT INTO sheikh_evaluations (lesson_id, evaluation_type, score)
        UI->>DB: INSERT INTO sheikh_assignments (teacher_id, student_id, surah_id, start_ayah, end_ayah, due_date)
    end

    DB-->>UI: 201 Created
    UI->>Sheikh: Confirmation message displayed

    Student->>StudentUI: Opens Dashboard
    StudentUI->>DB: SELECT * FROM sheikh_assignments WHERE student_id = auth.uid()
    DB-->>StudentUI: Returns active assignment
    StudentUI->>Student: Highlights assigned passage in Quran Map & Daily Tasks
```

---

## 6. Privacy Boundaries & Data Segregation Guarantees

The application enforces cryptographic and relational privacy boundaries:

1. **Student Personal Privacy**:
   - A Sheikh **CANNOT** view a student's profile, logs, or memorization progress unless an active record exists in `sheikh_students` with `status = 'active'`.
   - If a student terminates or pauses the connection, all Sheikh read access is revoked instantaneously at the database level.
2. **Teacher Isolation**:
   - Sheikhs cannot view students assigned to other Sheikhs.
   - Invitation codes are single-use; once claimed, replay attacks fail with an explicit `INVITATION_ALREADY_USED` exception.
3. **No Unauthenticated Snooping**:
   - All REST queries through PostgREST require a valid Bearer JWT. Anonymous users receive `401 Unauthorized` for all non-public tables.
