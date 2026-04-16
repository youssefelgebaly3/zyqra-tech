-- 
-- Database Schema for ZYQRA Platform
-- 
-- Instructions: 
-- 1. Create a database in phpMyAdmin named `zyqra_db`.
-- 2. Run this SQL code inside `zyqra_db` to create the initial tables.
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'customer', 'installer', 'admin') DEFAULT 'customer',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 
-- Products Table
--
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` JSON NOT NULL,
  `subtitle` JSON DEFAULT NULL,
  `description` JSON DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `old_price` DECIMAL(10, 2) DEFAULT NULL,
  `discount_label` JSON DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT 'assets/img/product-placeholder.jpg',
  `stock` INT DEFAULT 0,
  `rating` DECIMAL(2, 1) DEFAULT 0.0,
  `reviews_count` INT DEFAULT 0,
  `features` JSON DEFAULT NULL,
  `specs` JSON DEFAULT NULL,
  `faqs` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Additional tables like courses, orders, and devices will be added as we progress through those modules.
