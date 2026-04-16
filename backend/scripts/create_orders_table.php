<?php
require_once __DIR__ . '/../config/database.php';
use Backend\Config\Database;

try {
    $database = new Database();
    $db = $database->getConnection();

    $sql = "
    CREATE TABLE IF NOT EXISTS `orders` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT DEFAULT NULL,
        `first_name` VARCHAR(100) NOT NULL,
        `last_name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(150),
        `phone` VARCHAR(20) NOT NULL,
        `address` TEXT NOT NULL,
        `governorate` VARCHAR(50) NOT NULL,
        `city` VARCHAR(100) NOT NULL,
        `postal_code` VARCHAR(20),
        `notes` TEXT,
        `payment_method` VARCHAR(50) NOT NULL,
        `subtotal` DECIMAL(10, 2) NOT NULL,
        `shipping_fee` DECIMAL(10, 2) NOT NULL,
        `cod_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
        `total` DECIMAL(10, 2) NOT NULL,
        `status` ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS `order_items` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `order_id` INT NOT NULL,
        `product_id` INT DEFAULT NULL,
        `product_name` VARCHAR(255) NOT NULL,
        `price` DECIMAL(10, 2) NOT NULL,
        `quantity` INT NOT NULL DEFAULT 1,
        `subtotal` DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    $db->exec($sql);
    echo "Orders tables created successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
