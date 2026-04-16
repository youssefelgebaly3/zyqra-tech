<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';
use Backend\Config\Database;

// Check if user is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden: Admin access required"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Query to get monthly sales stats for the last 6 months
    // We use COALESCE and a subquery/union approach or just grouping if data exists.
    // To ensure we have 6 data points even if some months have no orders, 
    // we could do a more complex query, but for now, simple grouping is fine.
    
    $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month_key,
                DATE_FORMAT(created_at, '%b %Y') as month_label,
                COUNT(*) as order_count,
                SUM(total) as revenue
              FROM orders 
              WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
              GROUP BY month_key
              ORDER BY month_key ASC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no data yet (new DB), provide dummy data for visualization testing if requested,
    // but here we just return the real stats.
    
    echo json_encode(["status" => "success", "data" => $stats]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
