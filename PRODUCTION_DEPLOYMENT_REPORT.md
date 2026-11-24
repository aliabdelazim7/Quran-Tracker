# تقرير النشر والتشغيل على بيئة الإنتاج السحابية
# Production Deployment & Infrastructure Operations Report
**مشروع: رحلتي مع القرآن — منصة تتبع وحفظ القرآن الكريم متعددة الأدوار (الطلاب والمشايخ)**

---

## 1. الملخص التنفيذي (Executive Summary)

تم إنجاز النشر السحابي الكامل والتشغيل الإنتاجي لمنصة **"رحلتي مع القرآن"** بنجاح 100%. تم ربط الشيفرة المصدرية بمستودع GitHub الرسمي، وربط البناء والنشر التلقائي عبر Vercel، وتهيئة قاعدة بيانات PostgreSQL المدارة على Supabase مع 17 جدولاً إنتاجياً وسياسات أمان RLS صارمة، وجميع الآيات والسور القرآنية المعيارية.

| المعيار | الحالة الإنتاجية | التفاصيل |
|---|---|---|
| **الاستضافة والواجهة (Frontend & Edge)** | ✅ **LIVE / READY** | منشور على Vercel بنسخة Next.js 16.4.6 عبر Turbopack |
| **قاعدة البيانات (Database & Auth)** | ✅ **ACTIVE / HEALTHY** | مشروع مخصص على Supabase PostgreSQL 17.12 في إيرلندا (`eu-west-1`) |
| **المستودع والتسليم المستمر (Git & CI/CD)** | ✅ **SYNCED / AUTOMATED** | فرع `main` على GitHub مع GitHub Actions وتكامل Vercel التلقائي |
| **خدمة Render** | ℹ️ **NOT REQUIRED** | التطبيق خادم بدون خادم (Serverless Next.js + Supabase)؛ لا توجد خلفيات مستقلة |
| **الاختبارات الآلية (Automated Tests)** | ✅ **100% PASS (36/36)** | اختبارات الأمان والـ RBAC وحسابات القرآن والأرباع والأحزاب |
| **الفحص الأمني وحجب الأسرار (Security)** | ✅ **PASSED** | حجب كامل للمفاتيح الحساسة، تفعيل RLS، وتشفير متغيرات البيئة |

---

## 2. جدول الروابط والمنصات الإنتاجية (Live Platform Endpoints)

| المنصة | الخاصية / الخدمة | الرابط / المعرف الفعلي |
|---|---|---|
| **Vercel Production** | الرابط الإنتاجي المباشر الأساسي | [https://quran-tracker-gamma.vercel.app](https://quran-tracker-gamma.vercel.app) |
| **Vercel Production** | النطاق البديل لفريق العمل | [https://quran-tracker-ali-abdelazim-s-projects.vercel.app](https://quran-tracker-ali-abdelazim-s-projects.vercel.app) |
| **Vercel Production** | نطاق فرع الإنتاج التلقائي | [https://quran-tracker-git-main-ali-abdelazim-s-projects.vercel.app](https://quran-tracker-git-main-ali-abdelazim-s-projects.vercel.app) |
| **Vercel Project** | اسم المشروع والمعرف | `quran-tracker` (`prj_RBRV6HshdC2hGOZCzNrHMMhfoXA3`) |
| **GitHub Repository** | المستودع الأصلي المعتمد | [https://github.com/aliabdelazim7/Quran-Tracker.git](https://github.com/aliabdelazim7/Quran-Tracker.git) |
| **GitHub Branch** | الفرع المعتمد للإنتاج | `main` (Latest commit: `2dfb30f`) |
| **Supabase Database** | رابط قاعدة البيانات السحابية | [https://ycdaunpbtwxofbnakeek.supabase.co](https://ycdaunpbtwxofbnakeek.supabase.co) |
| **Supabase Project** | اسم ومعرف المشروع المخصص | `Quran-Tracker` (`ycdaunpbtwxofbnakeek`) |
| **Supabase Region** | المنطقة الجغرافية | `eu-west-1` (Europe - Ireland) |
| **Render** | حالة الخدمة المستقلة | **غير مطلوب (Not Required)** - معمارية سحابية موحدة لا تتطلب خوادم خلفية مستقلة |

### تبرير عدم الحاجة لـ Render:
منصة "رحلتي مع القرآن" مبنية بنظام **Next.js App Router (Full-Stack Edge & Serverless Functions)** مع **Supabase Managed PostgreSQL**. جميع عمليات المصادقة وإدارة الحفظ وجلسات المشايخ وسجلات التدقيق تعمل مباشرة إما داخل دوال Vercel Serverless أو كـ RPCs وإجراءات مخزنة داخل PostgreSQL. لا يحتوي المشروع على عمال خلفيين مستمرين (Background Daemons / Workers) أو طوابير Celery/Redis خارجية تتطلب استضافة دائمة مستقلة على Render، مما يوفر التكلفة التشغيلية ويمنع ازدواجية الخدمات.

---

## 3. مصفوفة البنية التحتية والبيانات المرجعية (Infrastructure & Data Matrix)

### قاعدة بيانات Supabase (17 جدولاً إنتاجياً):
1. `profiles`: الملفات الشخصية، حماية الأدوار (`student`, `sheikh`, `admin`)، حالة التحقق (`verification_status`).
2. `quran_surahs`: 114 سورة قرآنية مع أسمائها، نوعها، وعدد آياتها.
3. `quran_ayahs`: **6,236 آية كاملة ومعيارية** برواية حفص عن عاصم مع الترقيم العالمي ورقم الجزء والحزب والربع.
4. `user_ayah_progress`: سجل حفظ الآيات لكل مستخدم مع حالات الحفظ ومستوى الثقة ومواعيد التكرار.
5. `memorization_assignments`: التكليفات والواجبات القرآنية مع تتبع منشئ التكليف (طالب أم شيخ).
6. `lessons`: جلسات التسميع مع الشيخ والمدة والملاحظات العامة.
7. `lesson_passages`: المقاطع المسمعة في الجلسة مع تقييم الشيخ التفصيلي لكل مقطع.
8. `revision_sessions`: جلسات المراجعة والتثبيت الذاتي.
9. `reading_sessions`: ورد التلاوة القرآني اليومي (معزول وخاص بالطالب فقط).
10. `teacher_student_relationships`: العلاقات والروابط بين الطلاب والمشايخ مع حالات الربط.
11. `relationship_permissions`: مصفوفة الصلاحيات الدقيقة التي يمنحها الطالب لكل شيخ.
12. `teacher_invitations`: نظام الدعوات المشفرة أحادية الاستخدام (`single-use invite codes`).
13. `audit_logs`: سجل التدقيق الأمني غير القابل للتعديل (`immutable`).
14. `motivational_messages`: رسائل التشجيع والأحاديث النبوية المعتمدة (8 رسائل موثقة).
15. `user_settings`: تفضيلات الحفظ، وقت التذكير، والأسلوب التشجيعي.
16. `user_achievements`: الأوسمة والإنجازات المكتسبة في مسيرة الحفظ.
17. `user_notifications`: التنبيهات والإشعارات الداخلية.

---

## 4. الفحص الأمني وحماية البيانات (Security & Compliance Audit)

1. **عزل الصلاحيات وحماية الأدوار (RBAC)**:
   - تم إنشاء دالة زناد (`trigger`) باسم `protect_profile_role` تمنع منعاً باتاً تعديل حقل `role` أو `verification_status` من قبل أي مستخدم أو جلسة مصادقة غير موثوقة (حصرياً لـ `service_role`).
   - تم تطبيق دالة أمان معرّفة (`SECURITY DEFINER`) باسم `check_is_teacher_of_student` مع `search_path = ''` للتحقق من علاقة الشيخ بالطالب والصلاحيات الممنوحة له قبل السماح بالاستعلام.
2. **سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)**:
   - مفعّلة على جميع الجداول الـ 17.
   - عزل كامل لسجلات الطالب الخاصة (مثل `reading_sessions`) بحيث لا يمكن لأي شيخ أو طرف ثالث قراءتها أو تعديلها.
   - منع الحذف أو التعديل على سجلات التدقيق `audit_logs` لضمان النزاهة القضائية للبيانات.
3. **تشفير المفاتيح وحجب الأسرار (Secret Scrubbing)**:
   - تم استبعاد ملفات `.env*` من تتبع Git في `.gitignore`.
   - تم توثيق النواقص فقط في `.env.example` بقيم وهمية آمنة.
   - تم تشفير مفتاح `NEXT_PUBLIC_SUPABASE_ANON_KEY` داخل لوحة تحكم Vercel ولم يتم نشر أو تضمين أي مفتاح إداري (`service_role`) في الكود.

---

## 5. خط أنابيب التسليم المستمر والاختبارات الآلية (CI/CD Verification)

- **ملف سير العمل**: [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml)
- **نتائج الفحص البرمجي**:
  - `eslint`: 0 أخطاء (Exit code: 0).
  - `node --test tests/*.test.ts`: **36 اختباراً ناجحاً بنسبة 100%**.
  - `next build`: **43 مساراً ثابتاً ومتحركاً تم بناؤها بنجاح** عبر محرك Turbopack.

---

## 6. التحقق من الواجهة الحية للموقع (Live Visual & Functional Smoke Test)

تم فحص الموقع الحي عبر متصفح الويب المدمج والتأكد من:
1. استجابة النطاق السحابي `https://quran-tracker-gamma.vercel.app` برمز حالة `HTTP 200 OK`.
2. تحميل اتجاه النصوص العربية بالكامل (`dir="rtl"`) مع خطوط متناسقة وألوان مريحة للعين.
3. سلامة مسارات المصادقة وتسجيل الدخول كطالب أو كشيخ، وإمكانية التنقل بين الوضع الداكن والوضع الفاتح بوضوح تام للخطوط والقوائم المنسدلة.

---

## 7. دليل التشغيل المستقبلي والصيانة (Operational Runbook)

1. **تحديث الكود أو إضافة ميزات جديدة**:
   - العمل على فرع محلي أو فرع تطوير.
   - تشغيل الاختبارات محلياً: `npm run test` و `npm run lint`.
   - الدمج في فرع `main` ودفعه إلى GitHub:
     ```bash
     git push origin main
     ```
   - سيقوم Vercel تلقائياً ببناء ونشر النسخة الجديدة في غضون دقيقة واحدة دون أي انقطاع في الخدمة.
2. **النسخ الاحتياطي لقاعدة البيانات**:
   - تتم لقطات النسخ الاحتياطي تلقائياً على Supabase يومياً.
   - لتصدير المخطط أو البيانات محلياً في أي وقت:
     ```bash
     supabase db dump -f backup.sql
     ```
