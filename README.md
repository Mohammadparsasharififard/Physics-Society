# سامانه یادگیری هوشمند انجمن علمی فیزیک
## دبیرستان استعدادهای درخشان شهید بهشتی ۲ (دوره اول)

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passed%20(100%25)-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20NODET-amber.svg)]()

> پلتفرم جامع، تعاملی و برخط آموزش فیزیک برای دانش‌آموزان پایه‌های هفتم، هشتم و نهم، مبتنی بر سرفصل‌های رسمی وزارت آموزش و پرورش و کتب تکمیلی سمپاد (سازمان ملی پرورش استعدادهای درخشان).

---

## 🚀 ویژگی‌های کلیدی سامانه (Key Features)

1. **یادگیری تعاملی به سبک دولینگو (Duolingo-inspired Interactive Learning):**
   - طراحی مراحل یادگیری گام‌به‌گام (مقدمه شهودی، تئوری فیزیکی، آزمایش خانگی، بدفهمی‌های رایج و تمرین‌های تعاملی).
   - بازخورد آنی با افکت‌های صوتی ترکیبی (بدون وابستگی به فایل‌های صوتی خارجی با استفاده از Web Audio API).
   - پاداش XP برای پاسخ‌های صحیح و پایان موفق درس‌ها.

2. **پوشش کامل ۶ کتاب درسی (کتب رسمی + کتب تکمیلی سمپاد):**
   - پایه هفتم: علوم تجربی رسمی (۱۴۵ صفحه) + علوم تکمیلی سمپاد C104-1 (۸۸ صفحه) — ۴ فصل فیزیک.
   - پایه هشتم: علوم تجربی رسمی (۱۵۳ صفحه) + علوم تکمیلی سمپاد C824 (۱۴۲ صفحه) — ۳ فصل فیزیک.
   - پایه نهم: علوم تجربی رسمی (۱۸۵ صفحه) + علوم تکمیلی سمپاد C134-1 (۱۷۶ صفحه) — ۵ فصل فیزیک.
   - استخراج متنی و اتصال دقیق منابع با ارجاع به صفحه و نام کتاب.

3. **بانک سوالات استاندارد و تاییدشده فیزیک (۳۶۰ سوال اختصاصی):**
   - برآورده‌سازی قطعی حداقل ۲۰ سوال چندگزینه‌ای و ۱۰ سوال تشریحی به ازای هر یک از ۱۲ فصل فیزیک (مجموعاً ۲۴۰ تست چهارگزینه‌ای + ۱۲۰ سوال تشریحی سنجه‌دار).
   - سنجه دقیق ارزیابی (Grading Rubric) برای تک‌تک سوالات تشریحی با کلیدواژه‌ها و معیارهای نمره‌دهی تفکیکی.

4. **موتور تصحیح دوگانه (Deterministic MCQ + AI Rubric-Assisted Written Grading):**
   - تصحیح قطعی و بلادرنگ سوالات چندگزینه‌ای در سمت سرور (جلوگیری ۱۰۰٪ از تقلب).
   - ارزیابی پاسخ‌های تشریحی توسط هوش مصنوعی بر اساس سنجه رسمی با ارائه نمره تفکیکی، بازخورد اختصاصی و شناسایی نقاط ضعف.
   - قابلیت بازبینی و تغییر نمره (Override) توسط دبیر با ثبت تاریخچه در جدول ممیزی (Audit Trail).

5. **مسابقات هفتگی علمی («مسابقه هفتگی»):**
   - زمان‌بندی دقیق، مهلت شرکت، محاسبه امتیاز در جدول رتبه‌بندی هفتگی و امکان انتشار پاسخ تشریحی پس از اتمام مسابقه.

6. **گیمیفیکیشن و انگیزش تحصیلی پیشرفته:**
   - دفترکل تراکنش‌های XP (تضمین ضددوباره‌کاری Idempotent).
   - رهگیری استمرار روزانه (Streak) با تقویم خورشیدی جلالی.
   - سیستم نشان‌ها (Badges) و مراحل پیشرفت تحصیلی.
   - تابلوهای رتبه‌بندی بلادرنگ (کل سامانه و تفکیک هر پایه).

7. **پنل مدیریت یکپارچه دبیران و مدیران (Admin Portal):**
   - داشبورد جامع آماری و وضعیت سامانه.
   - مدیریت کتب، فصول، درس‌ها و آپلود و پردازش PDF با پشتیبانی از کدهای امن SSRF.
   - مرکز بازبینی تصحیح هوش مصنوعی با امکان اعمال نمره دستی.
   - تنظیمات ارائه‌دهندگان هوش مصنوعی (Mock، OpenAI، Ollama، OpenRouter، DeepSeek).
   - مدیریت حساب و پایه تحصیلی دانش‌آموزان.

---

## 🛠 معماری فنی و پشته تکنولوژی (Tech Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  Single Page App (HTML5 / Vanilla JS / Tailwind CSS CDN)    │
│  - Lucide Icons   - KaTeX Math (LaTeX)   - Web Audio API    │
│  - Vazirmatn Font - Responsive RTL (Mobile / Tablet / PC)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    Nginx Reverse Proxy                      │
│  - SSL Termination (Let's Encrypt) - Gzip Compression       │
│  - Rate Limiting (Brute-Force Shield) - Security Headers    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Proxy Port 8000
┌──────────────────────────────▼──────────────────────────────┐
│               Backend Service: Python FastAPI                │
│  - Authentication: Argon2id + Stateless JWT                 │
│  - ORM: SQLAlchemy 2.0 (Models for 28+ Relational Tables)   │
│  - AI Engine: Standardized Schema + Partial Credit Rubrics  │
│  - Textbook Processor: PyPDF Ingestion Pipeline             │
│  - Role-Based Access Control (RBAC: Admin / Student)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Database Connection
┌──────────────────────────────▼──────────────────────────────┐
│                  Relational Database Storage                │
│  - Production: PostgreSQL 16 Alpine                         │
│  - Development / Testing: SQLite 3                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 راه‌اندازی سریع در محیط توسعه (Local Development)

### پیش‌نیازها
- Python نسخه 3.11 یا 3.12 یا بالاتر
- Git

### مراحل اجرا:

1. **کلون کردن مخزن و ورود به پوشه:**
   ```bash
   cd "Physics Society"
   ```

2. **ایجاد محیط مجازی و نصب وابستگی‌ها:**
   ```bash
   python -m venv venv
   # در ویندوز:
   venv\Scripts\activate
   # در لینوکس / مک:
   source venv/bin/activate

   pip install -r backend/requirements.txt
   ```

3. **ایجاد مدیر اولیه سامانه (Super-Admin):**
   ```bash
   python -m app.cli create-admin --username admin --email admin@beheshti2.ir --fullname "مدیر سامانه فیزیک"
   ```

4. **تایید سلامت و تعداد محتوا (Content Validation):**
   ```bash
   python -m app.cli validate-content
   ```
   > این دستور بررسی می‌کند که تمامی ۱۲ فصل فیزیک پایه‌های هفتم، هشتم و نهم دارای حداقل ۲۰ تست و ۱۰ سوال تشریحی باشند.

5. **اجرای سرور محلی:**
   ```bash
   cd backend
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - رابط کاربری دانش‌آموزان و دبیران: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - مستندات تعاملی Swagger API: [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)
   - مستندات ReDoc API: [http://127.0.0.1:8000/api/redoc](http://127.0.0.1:8000/api/redoc)

---

## 🧪 اجرای آزمون‌های خودکار (Automated Tests)

مجموعه ۱۹ آزمون جامع شامل احراز هویت، جلوگیری از نشت اطلاعات، موتور آزمون، ارزیابی تصحیح هوش مصنوعی، گیمیفیکیشن و بررسی کفایت سوالات:

```bash
# از پوشه ریشه پروژه:
pytest backend/tests -v
```

خروجی نمونه:
```
backend/tests/test_ai_grading.py::test_ai_connection_test PASSED
backend/tests/test_ai_grading.py::test_ai_written_answer_grading_rubric PASSED
backend/tests/test_ai_grading.py::test_ai_empty_answer_handling PASSED
backend/tests/test_auth.py::test_register_student PASSED
backend/tests/test_auth.py::test_login_success PASSED
backend/tests/test_auth.py::test_student_cannot_access_admin_endpoints PASSED
backend/tests/test_competitions.py::test_weekly_competition_flow PASSED
backend/tests/test_curriculum.py::test_lesson_detail_and_exercise_flow PASSED
backend/tests/test_exam_engine.py::test_exam_engine_deterministic_scoring PASSED
backend/tests/test_exam_engine.py::test_admin_grade_override_workflow PASSED
backend/tests/test_gamification.py::test_xp_award_and_duplicate_prevention PASSED
backend/tests/test_question_counts.py::test_chapter_question_minimums_enforced PASSED
====================== 19 passed in 8.30s =======================
```

---

## 🚢 استقرار روی سرور لینوکس (Linux VPS Production Deployment)

پروژه به صورت کامل با **Docker Compose** برای استقرار تک‌دستوری روی سرور مجازی لینوکس آماده شده است:

```bash
# 1. ورود به پوشه deploy
cd deploy

# 2. تنظیم متغیرهای محیطی
cp ../.env.example ../.env
# فایل .env را با رمزهای عبور امن و دامنه خود ویرایش کنید:
nano ../.env

# 3. بالا آوردن کانتینرها (Nginx + FastAPI + PostgreSQL 16)
docker compose up -d --build

# 4. بررسی وضعیت سلامت سرویس‌ها
docker compose ps
curl http://localhost/api/health
```

برای جزئیات کامل فعال‌سازی گواهی رایگان SSL Let's Encrypt و زمان‌بندی پشتیبان‌گیری خودکار، [راهنمای استقرار سرور](docs/DEPLOYMENT.md) را مطالعه نمایید.

---

## 📚 ساختار مستندات تکمیلی

- [معماری سیستم و مدل داده (ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [راهنمای مدیران و دبیران (ADMIN_GUIDE.md)](docs/ADMIN_GUIDE.md)
- [راهنمای دانش‌آموزان (STUDENT_GUIDE.md)](docs/STUDENT_GUIDE.md)
- [راهنمای جامع استقرار سرور (DEPLOYMENT.md)](docs/DEPLOYMENT.md)

---

## 👥 حقوق مالکیت و سازندگان
این سامانه به طور اختصاصی جهت ارتقای سطح علمی دانش‌آموزان دوره اول متوسطه دبیرستان استعدادهای درخشان شهید بهشتی ۲ طراحی و پیاده‌سازی شده است.
تمامی حقوق متعلق به **انجمن علمی فیزیک دبیرستان شهید بهشتی ۲** می‌باشد.
