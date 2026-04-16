<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';
require_once '../../models/User.php';
use Backend\Config\Database;
use Backend\Models\User;

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden: Admin access required"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Fetch all orders with user names
    $query = "SELECT o.*, u.full_name as customer_name 
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              ORDER BY o.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch items for each order
    if (count($orders) > 0) {
        $itemQuery = "SELECT * FROM order_items WHERE order_id = :order_id";
        $itemStmt = $db->prepare($itemQuery);

        foreach ($orders as &$order) {
            $itemStmt->bindParam(':order_id', $order['id']);
            $itemStmt->execute();
            $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    echo json_encode(["status" => "success", "orders" => $orders]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
