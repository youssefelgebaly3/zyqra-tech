<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';
use Backend\Config\Database;

// Security Check: Admin Only
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden: Admin access required"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT h.*, p.name as product_name_json 
              FROM inventory_history h 
              JOIN products p ON h.product_id = p.id 
              ORDER BY h.created_at DESC 
              LIMIT 50";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $history = [];
    foreach ($rows as $row) {
        $name_data = json_decode($row['product_name_json'], true);
        $history[] = [
            'id' => $row['id'],
            'date' => $row['created_at'],
            'product_name' => $name_data['ar'] ?? 'منتج غير معروف',
            'type' => $row['type'],
            'quantity' => $row['quantity'],
            'previous_stock' => $row['previous_stock'],
            'new_stock' => $row['new_stock'],
            'notes' => $row['notes']
        ];
    }

    echo json_encode([
        "status" => "success",
        "history" => $history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
