<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/database.php';
use Backend\Config\Database;

// Security Check: Admin Only
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden: Admin access required"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    $product_id = $data->id ?? null;
    $new_stock = $data->stock ?? null;

    if ($product_id === null || $new_stock === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        exit;
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        // 1. Get current stock for history logging
        $currentQuery = "SELECT stock FROM products WHERE id = :id";
        $currentStmt = $db->prepare($currentQuery);
        $currentStmt->execute(['id' => $product_id]);
        $product = $currentStmt->fetch();
        
        if (!$product) {
            throw new Exception("Product not found");
        }
        $old_stock = (int)$product['stock'];

        // 2. Update stock
        $query = "UPDATE products SET stock = :stock WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':stock', $new_stock, PDO::PARAM_INT);
        $stmt->bindParam(':id', $product_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            // 3. Log to history
            $historyQuery = "INSERT INTO inventory_history (product_id, type, quantity, previous_stock, new_stock, notes) 
                             VALUES (:pid, :type, :qty, :prev, :new, :notes)";
            $historyStmt = $db->prepare($historyQuery);
            
            $diff = $new_stock - $old_stock;
            $type = ($diff >= 0) ? 'in' : 'out';
            $notes = ($data->notes ?? 'تعديل مخزون من لوحة الإدارة');

            $historyStmt->execute([
                'pid' => $product_id,
                'type' => 'adjustment', // We classify manual table edits as adjustments
                'qty' => $diff,
                'prev' => $old_stock,
                'new' => $new_stock,
                'notes' => $notes
            ]);

            echo json_encode(["status" => "success", "message" => "Stock updated successfully"]);
        } else {
            throw new Exception("Failed to update stock");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Server error " . $e->getMessage()]);
    }
}
?>
