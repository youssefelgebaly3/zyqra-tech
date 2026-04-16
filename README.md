# ZYQRA Tech - Project Structure

## 📁 Frontend

```
├── index.html                  # الصفحة الرئيسية
├── about.html                  # من نحن
├── contact.html                # تواصل معنا
├── products.html               # صفحة المنتجات
├── product-details.html        # تفاصيل المنتج
├── cart.html                   # سلة المشتريات
├── checkout.html               # إتمام الشراء
├── courses.html                # الدورات التعليمية
├── course-*.html               # صفحات الدورات الفردية
├── profile.html                # الملف الشخصي
├── signin.html                 # تسجيل الدخول
├── signup.html                 # إنشاء حساب
├── admin.html                  # لوحة التحكم
├── terms.html                  # الشروط والأحكام
├── privacy.html                # سياسة الخصوصية
│
├── assets/
│   ├── css/
│   │   ├── main.css            # CSS الرئيسي (imports)
│   │   ├── components/         # ستايلات المكونات المشتركة (header, footer, etc.)
│   │   └── pages/              # ستايلات خاصة بالصفحات
│   │
│   ├── js/
│   │   ├── main.js             # الجافاسكريبت الرئيسي المشترك
│   │   ├── lang-config.js      # إعدادات اللغة (AR/EN)
│   │   ├── pages/              # سكربتات خاصة بكل صفحة
│   │   │   ├── signin.js
│   │   │   ├── signup.js
│   │   │   ├── profile.js
│   │   │   ├── products.js
│   │   │   ├── product-details.js
│   │   │   ├── checkout.js
│   │   │   ├── courses.js
│   │   │   └── admin.js
│   │   ├── modules/            # وحدات مشتركة قابلة لإعادة الاستخدام
│   │   │   ├── auth.js         # التحقق من تسجيل الدخول
│   │   │   ├── cart.js         # منطق سلة المشتريات
│   │   │   ├── search.js       # البحث
│   │   │   ├── template.js     # القوالب المشتركة
│   │   │   └── ui.js           # عناصر واجهة المستخدم
│   │   ├── translations/       # ملفات الترجمة
│   │   └── data/               # بيانات ثابتة
│   │
│   ├── img/                    # الصور
│   └── vendor/                 # مكتبات خارجية (Bootstrap, AOS, etc.)
│
└── uploads/                    # ملفات المستخدمين المرفوعة
```

## 📁 Backend

```
backend/
├── api/                        # نقاط الوصول (API Endpoints)
│   ├── auth/                   # 🔐 المصادقة
│   │   ├── login.php           # تسجيل الدخول
│   │   ├── register.php        # إنشاء حساب
│   │   ├── logout.php          # تسجيل الخروج
│   │   └── check_session.php   # التحقق من الجلسة
│   │
│   ├── user/                   # 👤 إدارة المستخدم
│   │   ├── update_profile.php  # تحديث البيانات الشخصية
│   │   ├── update_password.php # تغيير كلمة المرور
│   │   └── update_avatar.php   # تغيير الصورة الشخصية
│   │
│   ├── shop/                   # 🛒 المتجر
│   │   ├── products.php        # قائمة المنتجات
│   │   ├── product_details.php # تفاصيل منتج
│   │   ├── checkout.php        # إتمام الشراء
│   │   ├── orders.php          # الطلبات (CRUD)
│   │   └── get_orders.php      # جلب طلبات المستخدم
│   │
│   ├── courses/                # 📚 الدورات
│   │   ├── courses.php         # إدارة الدورات
│   │   └── tasks.php           # المهام والتقدم
│   │
│   └── admin/                  # ⚙️ لوحة التحكم
│       ├── get_dashboard_stats.php
│       ├── get_orders.php
│       ├── get_users.php
│       ├── get_all_products.php
│       ├── get_inventory.php
│       ├── get_inventory_history.php
│       ├── add_product.php
│       ├── update_product.php
│       ├── delete_product.php
│       ├── update_order_status.php
│       ├── update_user_role.php
│       ├── update_stock.php
│       └── delete_user.php
│
├── config/                     # ⚙️ إعدادات (محمي بـ .htaccess)
│   ├── Database.php            # OOP Database Connection Class
│   └── db.php                  # Procedural $pdo wrapper
│
├── models/                     # 📦 الموديلات (محمي بـ .htaccess)
│   ├── User.php
│   └── Product.php
│
├── scripts/                    # 🔧 سكربتات التهجير (محمي بـ .htaccess)
│   ├── create_orders_table.php
│   ├── migrate_avatar.php
│   ├── migrate_products.php
│   └── setup_inventory.php
│
└── sql/                        # 🗄️ ملفات SQL (محمي بـ .htaccess)
    └── schema.sql
```

## 🔒 Security

- مجلدات `config/`, `models/`, `scripts/`, `sql/` محمية بملفات `.htaccess` تمنع الوصول المباشر من المتصفح.
- API Endpoints فقط هي المتاحة للوصول العام.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5 RTL
- **Backend**: PHP 8+, PDO
- **Database**: MySQL (via XAMPP)
- **Libraries**: AOS (Animate on Scroll), Bootstrap Icons
