<?php
// backend/scripts/migrate_products.php
require_once '../config/Database.php';
use Backend\Config\Database;

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Utility function: Add column if missing
    function addCol($conn, $table, $column, $definition) {
        $check = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($check->rowCount() == 0) {
            $conn->exec("ALTER TABLE `$table` ADD `$column` $definition");
            echo "✅ Created column: $column <br>";
        }
    }

    // Utility function: Modify column type
    function modifyCol($conn, $table, $column, $definition) {
        $conn->exec("ALTER TABLE `$table` MODIFY `$column` $definition");
        echo "🔄 Updated column type: $column <br>";
    }

    // 1. Repair Schema Dynamically
    modifyCol($conn, 'products', 'name', 'JSON NOT NULL');
    modifyCol($conn, 'products', 'description', 'JSON DEFAULT NULL');
    addCol($conn, 'products', 'subtitle', 'JSON DEFAULT NULL AFTER name');
    addCol($conn, 'products', 'old_price', 'DECIMAL(10, 2) DEFAULT NULL AFTER price');
    addCol($conn, 'products', 'discount_label', 'JSON DEFAULT NULL AFTER old_price');
    addCol($conn, 'products', 'features', 'JSON DEFAULT NULL AFTER reviews_count');
    addCol($conn, 'products', 'specs', 'JSON DEFAULT NULL AFTER features');
    addCol($conn, 'products', 'faqs', 'JSON DEFAULT NULL AFTER specs');

    // 2. Clear and Refill
    $conn->exec("DELETE FROM products");

    $products = [
        [
            'name' => json_encode(['ar' => 'MotoLock', 'en' => 'MotoLock']),
            'subtitle' => json_encode(['ar' => 'موتوسيكلِك في جيبك.', 'en' => 'Your Motorcycle in Your Pocket.']),
            'description' => json_encode([
                'ar' => 'نظام أمان ذكي يحول موبايلك لمفتاح كامل، مع تنبيهات فورية وتحكم كامل من تطبيق واحد.',
                'en' => 'A smart security system converting your phone into a full-fledged key, featuring instant alerts and complete control via a single app.'
            ]),
            'price' => 1000.00,
            'old_price' => 1500.00,
            'discount_label' => json_encode(['ar' => ' خصم لفترة محدودة – 33%', 'en' => ' Limited Time Offer – 33% OFF']),
            'category' => 'security',
            'image_url' => 'assets/img/products/motolock.png',
            'stock' => 50,
            'rating' => 4.9,
            'reviews_count' => 52,
            'features' => json_encode([
                'ar' => ['تحكم كامل عبر التطبيق', 'تحكم صوتي باللغة العربية أو الإنجليزية', 'تنبيهات فورية عند أي محاولة حركة أو عبث', 'قفل وتشغيل الموتوسيكل من الموبايل', 'تركيب سهل بدون أي تعديل', 'ضمان سنة كاملة'],
                'en' => ['Full app-based control', 'Voice control in Arabic and English', 'Instant alerts on movement or tampering', 'Lock and start your motorcycle via phone', 'Easy installation with no modifications', 'Full 1-year warranty']
            ]),
            'specs' => json_encode([
                'ar' => [
                    ['icon' => 'bi-battery-charging', 'label' => 'بطارية', 'value' => 'ليثيوم 3.7V 2000mAh'],
                    ['icon' => 'bi-bluetooth', 'label' => 'اتصال', 'value' => 'Bluetooth 5.0 + GSM'],
                    ['icon' => 'bi-geo-alt', 'label' => 'تتبع', 'value' => 'GPS عالي الدقة'],
                    ['icon' => 'bi-droplet-half', 'label' => 'مقاومة', 'value' => 'IP67 (مقاوم للماء والغبار)'],
                    ['icon' => 'bi-phone', 'label' => 'التوافق', 'value' => 'Android 6.0+ / iOS 12+']
                ],
                'en' => [
                    ['icon' => 'bi-battery-charging', 'label' => 'Battery', 'value' => 'Lithium 3.7V 2000mAh'],
                    ['icon' => 'bi-bluetooth', 'label' => 'Connectivity', 'value' => 'Bluetooth 5.0 + GSM'],
                    ['icon' => 'bi-geo-alt', 'label' => 'Tracking', 'value' => 'High Precision GPS'],
                    ['icon' => 'bi-droplet-half', 'label' => 'Resistance', 'value' => 'IP67 (Water and Dust Resistant)'],
                    ['icon' => 'bi-phone', 'label' => 'Compatibility', 'value' => 'Android 6.0+ / iOS 12+']
                ]
            ]),
            'faqs' => json_encode([
                'ar' => [
                    ['icon' => 'bi-shield-check', 'q' => 'هل MotoLock آمن فعلاً؟', 'a' => 'نعم. يعمل MotoLock فقط مع الموبايل المسجّل على التطبيق، ولا يمكن تشغيل الموتوسيكل بدون إذن المستخدم، مما يقلل بشكل كبير خطر السرقة أو التشغيل غير المصرح به.'],
                    ['icon' => 'bi-phone', 'q' => 'هل يمكن تشغيل الموتوسيكل بدون الموبايل؟', 'a' => 'يمكن تشغيل الموتوسيكل بشكل مزدوج: من خلال الموبايل أو المفتاح التقليدي، مع أن الأولوية دائمًا تكون للهاتف لضمان أقصى درجات الأمان والتحكم الذكي.'],
                    ['icon' => 'bi-tools', 'q' => 'هل يحتاج لتركيب معقد؟', 'a' => 'لا. يمكن تركيب MotoLock بنفسك بسهولة دون أي تعديل أو قطع في الأسلاك.'],
                    ['icon' => 'bi-mic', 'q' => 'هل يدعم التحكم الصوتي؟', 'a' => 'نعم. يدعم التحكم الصوتي باللغتين العربية والإنجليزية عبر التطبيق.'],
                    ['icon' => 'bi-exclamation-triangle', 'q' => 'ماذا يحدث عند محاولة السرقة؟', 'a' => 'في حال أي محاولة حركة أو عبث، يرسل MotoLock تنبيهًا فوريًا إلى موبايلك.'],
                    ['icon' => 'bi-globe', 'q' => 'هل يعمل في جميع الأماكن؟', 'a' => 'نعم. يعمل بكفاءة في المدن والمناطق المزدحمة.'],
                    ['icon' => 'bi-geo-alt', 'q' => 'هل يوجد نظام تتبع GPS؟', 'a' => 'حالياً، نظام التتبع غير متاح في هذا الإصدار. لكن سيتم إطلاق إصدار مستقبلي يتضمن إضافة GPS.'],
                    ['icon' => 'bi-battery-charging', 'q' => 'هل يؤثر على بطارية الموتوسيكل؟', 'a' => 'لا. مصمم ليعمل باستهلاك طاقة منخفض جدًا.'],
                    ['icon' => 'bi-patch-check', 'q' => 'هل يوجد ضمان؟', 'a' => 'نعم. يأتي الجهاز مع ضمان سنة كاملة.'],
                    ['icon' => 'bi-bicycle', 'q' => 'هل يناسب كل أنواع الموتوسيكلات؟', 'a' => 'MotoLock مناسب لمعظم الموتوسيكلات الشائعة، خاصة الموديلات الصينية.'],
                    ['icon' => 'bi-google-play', 'q' => 'ما هي متطلبات التطبيق؟', 'a' => 'يتوفر تطبيق MotoLock حاليًا على Android فقط.'],
                    ['icon' => 'bi-arrow-repeat', 'q' => 'ماذا يحدث لو فقدت الهاتف؟', 'a' => 'يمكن إعادة ربط MotoLock من خلال الدعم الفني لضمان استمرار التحكم.'],
                    ['icon' => 'bi-arrow-clockwise', 'q' => 'هل يحصل الجهاز على تحديثات؟', 'a' => 'نعم. يحصل MotoLock على تحديثات منتظمة.'],
                    ['icon' => 'bi-lock', 'q' => 'حماية البيانات والخصوصية', 'a' => 'نحن نحترم خصوصيتك. التطبيق لا يشارك بياناتك الشخصية.'],
                    ['icon' => 'bi-headset', 'q' => 'كيف أحصل على الدعم؟', 'a' => 'يتوفر دعم فني مباشر من خلال الموقع الإلكتروني لضمان حصولك على المساعدة.']
                ],
                'en' => [
                    ['icon' => 'bi-shield-check', 'q' => 'Is MotoLock really secure?', 'a' => 'Yes. MotoLock only operates with the registered phone...'],
                    ['icon' => 'bi-phone', 'q' => 'Can the motorcycle be started without the phone?', 'a' => 'Dual start is supported via mobile or traditional key.']
                ]
            ])
        ],
        [
            'name' => json_encode(['ar' => 'Arduino Camera Kit', 'en' => 'Arduino Camera Kit']),
            'subtitle' => json_encode(['ar' => 'طقم الكاميرا الذكي.', 'en' => 'Smart Camera Kit.']),
            'description' => json_encode(['ar' => 'طقم تعليمي للذكاء الاصطناعي.', 'en' => 'AI Educational Kit.']),
            'price' => 1250.00,
            'old_price' => null,
            'discount_label' => null,
            'category' => 'iot',
            'image_url' => 'assets/img/products/product-1.jpg',
            'stock' => 15,
            'rating' => 4.5,
            'reviews_count' => 10,
            'features' => json_encode(['ar' => [], 'en' => []]),
            'specs' => json_encode(['ar' => [], 'en' => []]),
            'faqs' => json_encode(['ar' => [], 'en' => []])
        ]
    ];

    $stmt = $conn->prepare("INSERT INTO products (name, subtitle, description, price, old_price, discount_label, category, image_url, stock, rating, reviews_count, features, specs, faqs) 
                            VALUES (:name, :subtitle, :description, :price, :old_price, :discount_label, :category, :image_url, :stock, :rating, :reviews_count, :features, :specs, :faqs)");

    foreach ($products as $p) {
        $stmt->execute($p);
    }

    echo "✅ Success! Columns were auto-repaired and data was migrated with full bilingual content.";

} catch (Exception $e) {
    die("❌ Error during migration: " . $e->getMessage());
}
?>
