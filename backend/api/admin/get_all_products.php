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

    $query = "SELECT * FROM products ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON fields for easier frontend consumption
    foreach ($products as &$product) {
        $product['name'] = json_decode($product['name'], true);
        $product['subtitle'] = json_decode($product['subtitle'], true);
        $product['description'] = json_decode($product['description'], true);
        $product['discount_label'] = json_decode($product['discount_label'], true);
        $product['features'] = json_decode($product['features'], true);
        $product['specs'] = json_decode($product['specs'], true);
        $product['faqs'] = json_decode($product['faqs'], true);
    }

    echo json_encode([
        "status" => "success",
        "count" => count($products),
        "products" => $products
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
