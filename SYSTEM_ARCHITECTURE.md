# SYSTEM ARCHITECTURE — QURAN TRACKER (رحلتي مع القرآن)

## 1. Executive Summary & Architectural Overview

"رحلتي مع القرآن" (Quran Tracker) is an enterprise-grade, Arabic-first web application designed to guide and track Quran memorization (Hifz), regular revision (Muraja'ah), and lesson management between Students and certified Quran Teachers (Sheikhs).

The system is architected as a **High-Performance Modular Monolith** deployed on modern cloud-native serverless infrastructure:
- **Client & Application Layer**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS, and shadcn/ui.
- **Edge Routing & Security Layer**: Next.js Edge Proxy (`proxy.ts`), enforcing strict OWASP security headers, private route protection, and dynamic origin sanitization.
- **Backend-as-a-Service (BaaS) & Data Layer**: Supabase Enterprise Suite (PostgreSQL 17.12, PostgREST, GoTrue Authentication, Row-Level Security, Storage, and Realtime).
- **Deployment & Hosting**: Vercel Serverless Edge Network (Frankfurt/EU-Central multi-zone deployment).
- **Standalone Background Services (Render Evaluation)**: Formally evaluated as **NOT REQUIRED** for current architecture. Serverless execution combined with PostgreSQL asynchronous triggers and edge route workers efficiently handle all scheduled tasks, audio transcoding, and notification dispatches without persistent process overhead.

---

## 2. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Browsers & PWA)"]
        Browser["User Web Browser (Chrome, Safari, Firefox, Edge)"]
        PWA["Progressive Web App (Service Worker / Manifest)"]
    end

    subgraph EdgeLayer["Edge & CDN Layer (Vercel)"]
        VercelCDN["Vercel Global Edge Network (Anycast CDN)"]
        EdgeProxy["Next.js Edge Proxy (src/proxy.ts)\n- OWASP Security Headers\n- Private Cache-Control\n- Route Protection"]
        StaticAssets["Static Edge Cache (HTML/CSS/JS/WASM)"]
    end

    subgraph AppLayer["Application Layer (Next.js 16 App Router)"]
        direction TB
        AppRouter["Next.js App Router (Turbopack Engine)"]
        HealthRoute["API Health Endpoint (/api/health)\n- Liveness & Readiness Probes\n- Database Connectivity Audit"]
        StudentPortal["Student Portal (/dashboard/*)\n- Memorization Tracker\n- Revision Queue\n- Tilawah Log\n- Sheikh Sessions"]
        SheikhPortal["Sheikh Portal (/sheikh/*)\n- Student Roster\n- Lesson Evaluation\n- Passage Assignment\n- Progress Oversight"]
        PublicRoutes["Public & Auth Routes\n- Landing Page (/)\n- Login & Registration (/auth)\n- Onboarding Wizard (/onboarding)"]
    end

    subgraph DataLayer["Backend-as-a-Service (Supabase EU-West-1)"]
        direction TB
        GoTrue["Supabase Auth (GoTrue)\n- JWT Token Issuance\n- Refresh Token Rotation\n- Role Claim Injection"]
        PostgREST["PostgREST API Engine\n- Auto-generated REST Endpoints\n- Direct SQL Execution"]
        PostgreSQL["PostgreSQL 17.12 Database Engine\n- 17 Relational Tables\n- 6,236 Canonical Ayahs (Hafs)\n- Composite B-Tree Indexes\n- Row-Level Security (RLS)"]
        DBTriggers["Automated Database Functions & Triggers\n- handle_new_user()\n- accept_invitation()\n- update_timestamp()"]
        SupabaseStorage["Supabase Storage (Encrypted S3 Bucket)\n- Student Recitation Audio (MP3/WebM)"]
    end

    Browser -->|HTTPS / TLS 1.3| VercelCDN
    PWA -->|HTTPS / TLS 1.3| VercelCDN
    VercelCDN --> EdgeProxy
    EdgeProxy -->|Static Cache Hit| StaticAssets
    EdgeProxy -->|Dynamic Request| AppRouter
    AppRouter --> StudentPortal
    AppRouter --> SheikhPortal
    AppRouter --> PublicRoutes
    AppRouter --> HealthRoute

    HealthRoute -->|Ping & Latency Check| PostgreSQL
    StudentPortal -->|Supabase Client (Anon/User JWT)| GoTrue
    StudentPortal -->|PostgREST Query / Mutation| PostgreSQL
    SheikhPortal -->|PostgREST Query / Mutation| PostgreSQL
    SheikhPortal -->|Accept Invite / Assign Lesson| DBTriggers
    StudentPortal -->|Upload Recitation Recording| SupabaseStorage
    GoTrue -->|Inject Role (student/teacher)| PostgreSQL
```

---

## 3. Modular Monolith Architecture Rationale

### Why Modular Monolith Over Microservices?
1. **Zero Network Serialization Overhead**: Microservices introduce RPC network hops, distributed tracing overhead, and complex eventual consistency issues. The Quran Tracker domains (Memorization, Revision, Sheikh Sessions, and Statistics) share strict foreign key constraints and transactional boundaries.
2. **Atomic Relational Transactions**: Assigning a new Quran passage, evaluating an existing recitation, and updating the student's mastery status occur within single, atomic ACID PostgreSQL transactions.
3. **Simplified Deployment & Zero Drift**: Next.js App Router allows server components and client UI to be built, tested, and deployed as a single immutable release artifact to Vercel, eliminating contract drift between frontend and backend.
4. **Maintenance Cost Efficiency**: Operates entirely within high-tier serverless limits without running idle EC2 instances or container clusters.

---

## 4. Component Boundaries & Directory Structure

The project follows a clean, decoupled modular structure within `quran-app/`:

```
quran-app/
├── public/                 # PWA icons, manifest, static Quran audio
├── scripts/                # Database migrations, load testing, disaster recovery
├── src/
│   ├── app/                # Next.js 16 App Router
│   │   ├── api/health/     # Liveness & Readiness health probe
│   │   ├── auth/           # Login, registration, password recovery
│   │   ├── dashboard/      # Student Portal routes & sub-pages
│   │   ├── sheikh/         # Sheikh (Teacher) Portal routes & sub-pages
│   │   ├── onboarding/     # Role selection & profile completion
│   │   ├── layout.tsx      # Root layout, theme provider, fonts (Amiri, Cairo)
│   │   └── page.tsx        # Responsive marketing & feature introduction
│   ├── components/         # Reusable UI component modules
│   │   ├── layout/         # Navigation, Sidebar, TopHeader, RoleSwitcher
│   │   ├── student/        # MemorizationTracker, RevisionQueue, AudioRecorder
│   │   ├── sheikh/         # StudentCard, LessonModal, AssignmentDrawer
│   │   └── ui/             # shadcn/ui primitive design system
│   ├── context/            # React context providers (AuthContext, ThemeContext)
│   ├── hooks/              # Custom React hooks (useQuran, useRole, useAudio)
│   ├── lib/                # Core utilities, constants, validation
│   │   ├── quranData.ts    # Canonical Hafs Quran metadata (114 Surahs)
│   │   ├── supabaseClient.ts # Supabase client singleton
│   │   └── validation/     # Zod runtime schemas (schemas.ts)
│   ├── proxy.ts            # Next.js 16 Edge Proxy (Security headers & routing)
│   └── types/              # Comprehensive TypeScript interfaces & database types
├── tests/                  # Automated integration, security, and load tests
└── next.config.ts          # Turbopack, CSP, and HSTS headers configuration
```

---

## 5. Next.js 16 Server Components vs. Client Components Strategy

The application leverages a hybrid rendering model to maximize Core Web Vitals and initial render speeds:

| Component Type | Primary Responsibility | Examples in Quran Tracker |
| :--- | :--- | :--- |
| **Server Components** | Static layout, metadata generation, public marketing views, initial data prefetching, SEO optimization | Root layout, metadata tags, marketing landing page, legal pages |
| **Client Components** | Interactive Quran audio player, dynamic Ayah selection grids, real-time revision queue recalculation, interactive charts, forms | `MemorizationTracker.tsx`, `AudioRecorder.tsx`, `LessonModal.tsx`, `QuranMap.tsx` |

All interactive components declare `'use client'` at the top and encapsulate state transitions, while global fonts and layouts are streamed from the server.

---

## 6. Edge Proxy Architecture (`src/proxy.ts`)

Next.js 16 deprecates legacy `middleware.ts` in favor of `proxy.ts`. The edge proxy executes on the Vercel Edge Runtime prior to reaching route handlers or page rendering:

```typescript
// Architectural Summary of src/proxy.ts
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // 1. Enforce OWASP Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 2. Enforce Private Cache-Control on User Portals
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/sheikh')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }

  return response;
}
```

---

## 7. Render Evaluation & Justification

| Architectural Need | Evaluated on Render | Chosen Native Solution | Justification |
| :--- | :--- | :--- | :--- |
| **Persistent Background Worker** | Containerized Node/Python Worker | Supabase PostgreSQL Triggers & pg_cron | Memorization calculations and revision intervals are computed synchronously upon lesson completion. No persistent daemon required. |
| **WebSocket Connection Server** | Standalone Socket.io server | Supabase Realtime (Elixir Phoenix channels) | Built-in Supabase Realtime provides secure, low-latency live synchronization for lesson updates. |
| **Audio Transcoding Engine** | FFmpeg background container | Client-side MediaRecorder (WebM/MP3) + Direct Storage | Modern browsers transcode audio locally before uploading directly to Supabase Storage, saving compute and bandwidth. |

**Architectural Decision**: Running a separate service on Render would introduce unnecessary operational complexity, cold-start latency, extra costs, and multi-cloud failure modes. The current serverless architecture satisfies all SLA and throughput requirements.
