<?php
require_once __DIR__ . '/../config/database.php';
use Backend\Config\Database;

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Ensure order_items table exists (needed for Sold count calculations)
    $sqlOrderItems = "
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
    $db->exec($sqlOrderItems);
    echo "Check: order_items table ready.<br>";

    // 2. Create inventory_history table
    $sqlHistory = "
    CREATE TABLE IF NOT EXISTS `inventory_history` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `product_id` INT NOT NULL,
        `type` ENUM('in', 'out', 'adjustment') NOT NULL,
        `quantity` INT NOT NULL,
        `previous_stock` INT NOT NULL,
        `new_stock` INT NOT NULL,
        `notes` TEXT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlHistory);
    echo "Check: inventory_history table ready.<br>";

    echo "<strong>Success: Inventory system tables initialized.</strong>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
