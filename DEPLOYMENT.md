# دليل نشر وتشغيل تطبيق "رحلتي مع القرآن"
# Production Deployment & Operations Guide

يوثق هذا الدليل حالة النشر الإنتاجي الفعلي لتطبيق **"رحلتي مع القرآن"** (Rehlaty Ma'a Al-Quran)، وربط منصات **GitHub** و **Vercel** و **Supabase** وحالة خادم **Render**.

---

## 1. روابط وبيانات البيئة الإنتاجية الحية (Live Production Endpoints)

| المنصة | الخاصية | الرابط / المعرف الإنتاجي |
|---|---|---|
| **Vercel Production** | الرابط المباشر للإنتاج | [https://quran-tracker-gamma.vercel.app](https://quran-tracker-gamma.vercel.app) |
| **Vercel Production** | نطاق الفريق البديل | [https://quran-tracker-ali-abdelazim-s-projects.vercel.app](https://quran-tracker-ali-abdelazim-s-projects.vercel.app) |
| **Vercel Project** | اسم المشروع / المعرف | `quran-tracker` (`prj_RBRV6HshdC2hGOZCzNrHMMhfoXA3`) |
| **GitHub Repository** | المستودع الأصلي المعتمد | [https://github.com/aliabdelazim7/Quran-Tracker.git](https://github.com/aliabdelazim7/Quran-Tracker.git) |
| **GitHub Branch** | الفرع الإنتاجي | `main` (Automatic CD on Push) |
| **Supabase Database** | رابط قاعدة البيانات | `https://ycdaunpbtwxofbnakeek.supabase.co` |
| **Supabase Project** | اسم ومعرف المشروع | `Quran-Tracker` (`ycdaunpbtwxofbnakeek`) |
| **Supabase Region** | المنطقة الجغرافية | `eu-west-1` (Europe - Ireland) |
| **Render Service** | حالة الخدمة | **غير مطلوب (Not Required)** - معمارية خادمة بدون خادم (Serverless Next.js + Managed Postgres) |

---

## 2. المعمارية التقنية (Production Architecture)

- **Frontend & App Engine**: Next.js 16.4.6 (App Router مع Turbopack)، React 19، TypeScript Strict، Tailwind CSS.
- **Database & Auth**: Supabase PostgreSQL 17.12 مع تفعيل كامل لسياسات حماية البيانات على مستوى الصفوف (Row Level Security - RLS).
- **Multi-Role RBAC**: بوابتان مستقلتان ومنفصلتان تماماً:
  - بوابة الطالب (`/student/*`): متابعة الحفظ، التكرار، الورد القرآني، وإدارة صلاحيات المشايخ.
  - بوابة الشيخ (`/sheikh/*`): إدارة الطلاب، رصد الجلسات، التقييمات، والتكاليف المباشرة.
- **Security & Integrity**:
  - دعوات أحادية الاستخدام (`teacher_invitations`) مع تشفير التوكن.
  - صلاحيات دقيقة (`relationship_permissions`) يتحكم بها الطالب.
  - سجل تدقيق غير قابل للتعديل (`audit_logs`).
  - عزل الجلسات الشخصية وقراءات الورد المستقلة عن رؤية المعلم.
- **Quranic Reference Engine**:
  - 114 سورة كاملة مع أسماء السور والنوع وعدد الآيات وبداية الأجزاء.
  - 6,236 آية كنسخة معيارية مطابقة لمصحف مجمع الملك فهد برواية حفص عن عاصم.
- **PWA & Offline First**:
  - دعم كامل للتثبيت على Android و iOS عبر [`public/manifest.json`](file:///public/manifest.json).
  - مشغل الخدمة [`public/sw.js`](file:///public/sw.js) للعمل دون اتصال بالإنترنت وتخزين السور محلياً.

---

## 3. متغيرات البيئة الإنتاجية (Environment Variables)

تم ضبط وتشفير المتغيرات الإنتاجية التالية داخل لوحة تحكم Vercel Production لجميع البيئات (`Production`, `Preview`, `Development`):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://ycdaunpbtwxofbnakeek.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # (مشفر)
NEXT_PUBLIC_APP_NAME="رحلتي مع القرآن"
```

> [!CAUTION]
> لا يتم تضمين `SUPABASE_SERVICE_ROLE_KEY` في أي من متغيرات الواجهة الأمامية أو مستودع Git العام؛ فهذا المفتاح مخصص حصرياً للعمليات الإدارية الآمنة.

---

## 4. إعدادات التكامل المستمر والنشر التلقائي (CI/CD Pipeline)

- تم إعداد خط سير عمل GitHub Actions عبر [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml):
  1. فحص الكود البرمجي عبر ESLint 9.
  2. تشغيل 36 اختباراً تلقائياً للأمان والمنطق القرآني والصلاحيات (Node Test Runner).
  3. التحقق من سلامة البناء الشامل (`next build`).
- يتم ربط المستودع تلقائياً بـ Vercel؛ فبمجرد دمج أو دفع أي كود جديد إلى فرع `main`، يتم تشغيل البناء واختبارات الجودة ونشر التحديث مباشرة إلى الرابط الإنتاجي دون انقطاع في الخدمة (Zero-Downtime Deployment).

---

## 5. النسخ الاحتياطي وإدارة الكوارث (Disaster Recovery)

1. **النسخ الاحتياطي في Supabase**:
   - لقطات يومية آلية لقاعدة بيانات PostgreSQL.
   - إمكانية التصدير اليدوي الفوري للمخطط والبيانات عبر Supabase CLI أو Management API.
2. **النسخ الاحتياطي للشيفرة المصدرية**:
   - الشيفرة محفوظة بالكامل ومحمية في مستودع GitHub المعتمد: `https://github.com/aliabdelazim7/Quran-Tracker.git`.
