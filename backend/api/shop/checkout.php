<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/database.php';

use Backend\Config\Database;

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if tables exist, if not create them (for development convenience)
    $db->exec("
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
    ");

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->customer) && !empty($data->items)) {
        // Get user session if logged in
        session_start();
        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

        $db->beginTransaction();

        $query = "INSERT INTO orders 
                 (user_id, first_name, last_name, email, phone, address, governorate, city, postal_code, notes, payment_method, subtotal, shipping_fee, cod_fee, total) 
                 VALUES 
                 (:user_id, :first_name, :last_name, :email, :phone, :address, :governorate, :city, :postal_code, :notes, :payment_method, :subtotal, :shipping_fee, :cod_fee, :total)";

        $stmt = $db->prepare($query);

        // Calculate totals server side to prevent tampering
        $subtotal = 0;
        foreach ($data->items as $item) {
            $subtotal += floatval($item->price) * intval($item->quantity ?: 1);
        }

        $shipping_fee = 50;
        $cod_fee = ($data->paymentMethod === 'cod') ? 50 : 0;
        $total = $subtotal + $shipping_fee + $cod_fee;

        // Bind parameters
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':first_name', $data->customer->firstName);
        $stmt->bindParam(':last_name', $data->customer->lastName);
        $stmt->bindParam(':email', $data->customer->email);
        $stmt->bindParam(':phone', $data->customer->phone);
        $stmt->bindParam(':address', $data->customer->address);
        $stmt->bindParam(':governorate', $data->customer->governorate);
        $stmt->bindParam(':city', $data->customer->city);
        $stmt->bindParam(':postal_code', $data->customer->postalCode);
        $stmt->bindParam(':notes', $data->customer->notes);
        $stmt->bindParam(':payment_method', $data->paymentMethod);
        $stmt->bindParam(':subtotal', $subtotal);
        $stmt->bindParam(':shipping_fee', $shipping_fee);
        $stmt->bindParam(':cod_fee', $cod_fee);
        $stmt->bindParam(':total', $total);

        if ($stmt->execute()) {
            $order_id = $db->lastInsertId();

            // Insert items
            $itemQuery = "INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES (:order_id, :product_id, :product_name, :price, :quantity, :subtotal)";
            $stmtItem = $db->prepare($itemQuery);

            foreach ($data->items as $item) {
                $item_subtotal = floatval($item->price) * intval($item->quantity ?: 1);
                $qty = intval($item->quantity ?: 1);
                $productId = isset($item->id) ? $item->id : null;

                // 1. Fetch current stock for validation and logging
                if ($productId) {
                    $stockQuery = "SELECT stock FROM products WHERE id = :pid FOR UPDATE";
                    $stockStmt = $db->prepare($stockQuery);
                    $stockStmt->execute(['pid' => $productId]);
                    $prodData = $stockStmt->fetch();

                    if ($prodData) {
                        $currentStock = (int) $prodData['stock'];
                        if ($currentStock < $qty) {
                            throw new Exception("الكمية المطلوبة من المنتج '{$item->name}' غير متوفرة حالياً.");
                        }

                        // 2. Deduct Stock
                        $newStock = $currentStock - $qty;
                        $updateQuery = "UPDATE products SET stock = :ns WHERE id = :pid";
                        $updateStmt = $db->prepare($updateQuery);
                        $updateStmt->execute(['ns' => $newStock, 'pid' => $productId]);

                        // 3. Log to Inventory History
                        $histQuery = "INSERT INTO inventory_history (product_id, type, quantity, previous_stock, new_stock, notes) 
                                      VALUES (:pid, 'out', :qty, :prev, :new, :notes)";
                        $histStmt = $db->prepare($histQuery);
                        $histStmt->execute([
                            'pid' => $productId,
                            'qty' => -$qty,
                            'prev' => $currentStock,
                            'new' => $newStock,
                            'notes' => "خصم تلقائي لطلب رقم #ZYQ-" . str_pad($order_id, 6, "0", STR_PAD_LEFT)
                        ]);
                    }
                }

                $stmtItem->bindParam(':order_id', $order_id);
                $stmtItem->bindParam(':product_id', $productId);
                $stmtItem->bindParam(':product_name', $item->name);
                $stmtItem->bindParam(':price', $item->price);
                $stmtItem->bindValue(':quantity', $qty);
                $stmtItem->bindParam(':subtotal', $item_subtotal);

                $stmtItem->execute();
            }

            $db->commit();
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Order was created.", "order_id" => $order_id]);
        } else {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "Unable to create order."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete order data."]);
    }
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>