# دليل نشر وتشغيل تطبيق "رحلتي مع القرآن"
# Production Deployment & Operations Guide

يوثق هذا الدليل الخطوات الكاملة لنشر تطبيق **"رحلتي مع القرآن"** (Rehlaty Ma'a Al-Quran) على بيئة الإنتاج السحابية، وربط قاعدة بيانات **Supabase PostgreSQL**، وإعدادات الاستضافة على **Vercel** وتفعيل تطبيق الويب التقدمي (**PWA**).

---

## 1. البنية التقنية (Architecture Overview)

- **Frontend & App Engine**: Next.js 16 (App Router), React 19, TypeScript Strict, Tailwind CSS.
- **Database & Auth**: Supabase PostgreSQL مع تطبيق سياسات حماية البيانات على مستوى الصفوف (Row Level Security - RLS).
- **Offline & Cache Layer**: Service Worker + LocalStorage Optimistic UI + PWA Manifest.
- **Quranic Data Engine**: مصحف حفص عن عاصم المعتمد برواية مجمع الملك فهد (6,236 آية، 114 سورة، 30 جزء، 240 ربع حزب).

---

## 2. إعداد قاعدة بيانات Supabase (Database Setup)

### الخطوة 1: إنشاء مشروع جديد في Supabase
1. سجّل الدخول إلى [Supabase Dashboard](https://supabase.com/dashboard).
2. أنشئ مشروعاً جديداً (`New Project`) باسم: `rehlaty-quran-prod`.
3. اختر المنطقة الجغرافية الأقرب للمستخدمين (مثال: `Frankfurt (eu-central-1)` أو `Middle East / Bahrain`).
4. احفظ كلمة مرور قاعدة البيانات (`Database Password`) بأمان.

### الخطوة 2: تطبيق ملفات الترحيل البرمجية (SQL Migrations)
توجه إلى **SQL Editor** في لوحة تحكم Supabase ونفذ الملفات التالية بالترتيب الدقيق:

#### أ. تنفيذ المخطط العام وسياسات الأمان:
قم بنسخ محتوى ملف `supabase/migrations/20261124_schema.sql` ولصقه في محرر الاستعلامات وتشغيله (`Run`).
ينشئ هذا الملف:
- جدول `profiles` المرتبط مباشرة بـ `auth.users`.
- الجداول المرجعية للقرآن: `quran_surahs` و `quran_ayahs`.
- جداول المستخدمين: `user_ayah_progress`, `memorization_assignments`, `lessons`, `lesson_passages`, `revision_sessions`, `reading_sessions`, `user_settings`, `user_achievements`, `user_notifications`.
- الفهارس المسرعة (`Indexes`) على حقول البحث وتاريخ التسميع.
- تفعيل RLS وسياسات العزل الكاملة لكل مستخدم.

#### ب. توليد فهرس الآيات الـ 6236 آية بدقة:
قم بنسخ محتوى ملف `supabase/migrations/20261124_ayahs_population.sql` وتشغيله لملء جدول `quran_ayahs` بالأرقام المرجعية العالمية وبيانات الأجزاء والأحزاب والأرباع.

#### ج. إدخال البيانات المرجعية الأولية:
قم بتشغيل ملف `supabase/seed.sql` لإدخال أسماء السور الـ 114 وبياناتها والأحاديث النبوية المعتمدة.

### الخطوة 3: ضبط إعدادات المصادقة (Auth Settings)
1. في تبويب **Authentication -> Providers -> Email**:
   - تفعيل `Enable Email provider`.
   - تفعيل `Confirm email` (أو إيقافه مؤقتاً لتسهيل تسجيل المستخدمين الجدد بدون انتظار رابط التفعيل).
2. في تبويب **Authentication -> URL Configuration**:
   - `Site URL`: رابط موقعك المباشر (مثال: `https://rehlaty-quran.vercel.app`).
   - `Redirect URLs`: أضف:
     - `https://rehlaty-quran.vercel.app/**`
     - `https://rehlaty-quran.vercel.app/login`
     - `http://localhost:3000/**`

---

## 3. إعداد ونشر المشروع على Vercel (Vercel Deployment)

### الخطوة 1: استيراد المشروع في Vercel
1. ادخل إلى [Vercel Dashboard](https://vercel.com) واختر `Add New... -> Project`.
2. اختر مستودع Git الخاص بالمشروع (`quran-app`).
3. اختر الإطار: `Next.js`.

### الخطوة 2: تكوين متغيرات البيئة (Environment Variables)
في قسم **Environment Variables** على Vercel، أضف المفاتيح التالية:

| المتغير | القيمة | الوصف |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | رابط مشروع Supabase العام |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | المفتاح المجهول العام (Safe for Client) |

> [!CAUTION]
> لا تقم أبداً بإضافة `SUPABASE_SERVICE_ROLE_KEY` إلى متغيرات البيئة في واجهة المتصفح أو رفعه لمستودع Git العام؛ فهذا المفتاح مخصص فقط للعمليات الإدارية الخلفية متجاوزاً سياسات RLS.

### الخطوة 3: البناء والتشغيل (Build & Deploy)
- انقر على **Deploy**.
- سيقوم Vercel بتشغيل `npm run build` وتوليد جميع المسارات الـ 24 الثابتة والديناميكية مع دعم التحميل الجزئي (Partial Prerendering).

---

## 4. إعدادات تطبيق الويب التقدمي (PWA & Offline Support)

التطبيق مهيأ بالكامل ليعمل كتطبيق هاتف محمول أصيل:
- ملف التعريف: [`public/manifest.json`](file:///public/manifest.json)
- مشغل الخدمة: [`public/sw.js`](file:///public/sw.js)
- أيقونات التطبيق بدقة فائقة:
  - `public/icons/icon-192x192.png`
  - `public/icons/icon-512x512.png`

### متطلبات التثبيت على أجهزة المستخدمين:
1. **شهادة أمان SSL/HTTPS إجبارية**: مشغل الخدمة (Service Worker) وميزات التثبيت لا تعمل إلا عبر اتصال مشفر `https://` (أو `localhost` في بيئة التطوير).
2. **على أجهزة Android / Chrome**: سيظهر تلقائياً إشعار "إضافة رحلتي مع القرآن إلى الشاشة الرئيسية".
3. **على أجهزة iOS / Safari**: يضغط المستخدم على أيقونة المشاركة (Share) ثم "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).

---

## 5. النسخ الاحتياطي واستعادة البيانات (Backup & Recovery)

1. **النسخ التلقائي في Supabase**:
   - خدمة Supabase Pro توفر نسخاً احتياطياً يومياً لقاعدة بيانات PostgreSQL واستعادة في نقطة زمنية محددة (Point-in-Time Recovery).
2. **تصدير المستخدم الذاتي (User Self-Export)**:
   - يتيح التطبيق لكل مستخدم من صفحة الإعدادات تصدير كافة بياناته وسجلاته وحلقاته بصيغة `JSON` أو `CSV` بضغطة زر واحدة.

---

## 6. أوامر الصيانة والاختبار (Verification Commands)

للتحقق من سلامة البناء وتكامل الاختبارات محلياً قبل إرسال أي تحديث للإنتاج:

```bash
# تشغيل كامل حزمة الاختبارات المؤتمتة (20 اختبار)
npm test

# فحص أنواع TypeScript وبناء حزمة الإنتاج
npm run build
```
