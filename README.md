# 🏢 ali-ecom-dash

> **وصف مختصر:** لوحة تحكم وإدارة لمنصة تجارة إلكترونية متخصصة في الأجهزة الإلكترونية المنزلية والكهربائية.

---

## 👥 معلومات العميل (Client Information)
* **اسم العميل:** علي (Ali)  Fadel trading 
* **رقم الهاتف:** `+212653114739`
* **نوع العمل / القطاع:** تجارة إلكترونية (E-commerce)
* **تخصص المتجر:** الأجهزة الإلكترونية المنزلية والكهربائية
* **حالة المشروع:** 🟢 نشط (Active)

---

## 🛠️ تفاصيل المشروع والتقنيات (Project & Technical Info)
* **اسم المستودع الموحد:** `ali-ecom-dash`
* **نوع المشروع:** لوحة تحكم وإدارة (Dashboard)
* **بيئة العمل الأساسية:** Node.js, Express, React, PostgreSQL (PERN Stack)
* **المسؤول التقني (Lead):** [اسم المطور المسؤول]

---

## 🚀 التشغيل الموحد للمشروع (Getting Started)

### المتطلبات الأساسية (Prerequisites)
تأكد من تثبيت الأدوات التالية على جهازك قبل البدء:
* Node.js (الإصدار المستقر الأحدث)
* PostgreSQL

### خطوات الإعداد المحلي (Local Setup)

1. **نسخ المستودع:**
   ```bash
   git clone https://github.com/wndpromorocco/ali_ecom_dash.git
   cd ali_ecom_dash
   ```

2. **تشغيل الواجهة الخلفية (Backend):**
   ```bash
   cd Back-end
   npm install
   # أنشئ ملف .env يحتوي على سطر الاتصال بقاعدة البيانات:
   #   DATABASE_URL="postgresql://USER@localhost:5432/fadel_trading_db?schema=public"
   npx prisma db push                      # إنشاء الجداول (Create tables)
   npx ts-node src/scripts/seedAdmin.ts    # إنشاء حساب المدير (Seed admin)
   npm run dev                             # يعمل على المنفذ 3001 (port 3001)
   ```

3. **تشغيل الواجهة الأمامية (Frontend):**
   ```bash
   cd Front-end
   npm install
   npm run dev                             # http://localhost:8080
   ```

---

## 🔐 لوحة التحكم (Admin Dashboard)

| | |
| --- | --- |
| **رابط لوحة التحكم (Dashboard URL)** | [`http://localhost:8080/admin/login`](http://localhost:8080/admin/login) |
| **البريد الإلكتروني (Email)** | `admin@fadeltrading.com` |
| **كلمة المرور (Password)** | `AdminPassword2026!` |

بعد تسجيل الدخول يتم توجيهك إلى لوحة التحكم على `http://localhost:8080/admin/dashboard`.
After login you are redirected to `http://localhost:8080/admin/dashboard`.

> ⚠️ **ملاحظة أمنية (Security Note):** بيانات الاعتماد أعلاه مخصصة للتطوير المحلي فقط. يجب تغيير كلمة المرور قبل النشر في بيئة الإنتاج.
> The credentials above are for local development only — **change the password before deploying to production.**
