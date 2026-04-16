<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';
use Backend\Config\Database;

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $user_id = $_SESSION['user_id'];

    // Get orders
    $query = "SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($orders) > 0) {
        $itemQuery = "SELECT oi.*, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = :order_id";
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
    echo json_encode(["status" => "error", "message" => "Server error " . $e->getMessage()]);
}
?>
