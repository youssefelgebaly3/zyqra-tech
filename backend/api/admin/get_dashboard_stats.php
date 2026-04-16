<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';
use Backend\Config\Database;

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden: Admin access required"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Total Users
    $stmtUsers = $db->prepare("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
    $stmtUsers->execute();
    $totalUsers = $stmtUsers->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Total Orders & Revenue
    $stmtOrders = $db->prepare("SELECT COUNT(*) as count, SUM(total) as revenue FROM orders WHERE status != 'cancelled'");
    $stmtOrders->execute();
    $ordersData = $stmtOrders->fetch(PDO::FETCH_ASSOC);
    $totalOrders = $ordersData['count'];
    $totalRevenue = $ordersData['revenue'] ? $ordersData['revenue'] : 0;

    // 3. Total Products 
    $stmtProducts = $db->prepare("SELECT COUNT(*) as count FROM products");
    $stmtProducts->execute();
    $totalProducts = $stmtProducts->fetch(PDO::FETCH_ASSOC)['count'];

    // 4. New Messages Count (Notifications)
    $stmtNewMsgs = $db->prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'new'");
    $stmtNewMsgs->execute();
    $newMessagesCount = $stmtNewMsgs->fetch(PDO::FETCH_ASSOC)['count'];

    echo json_encode([
        "status" => "success",
        "data" => [
            "total_users" => $totalUsers,
            "total_orders" => $totalOrders,
            "total_revenue" => $totalRevenue,
            "total_products" => $totalProducts,
            "new_messages_count" => $newMessagesCount
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error"]);
}
?>
