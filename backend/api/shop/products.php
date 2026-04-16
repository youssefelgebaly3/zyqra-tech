<?php
// backend/api/products.php
header('Content-Type: application/json');
require_once '../../models/Product.php';

$productModel = new Product();

// Get filters from URL if any
$category = isset($_GET['category']) ? $_GET['category'] : 'all';
$max_price = isset($_GET['price']) ? floatval($_GET['price']) : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;

try {
    $products = $productModel->getAll($category, $max_price, $search);
    
    // Decode bilingual JSON fields for each product
    foreach ($products as &$p) {
        if (isset($p['name'])) $p['name'] = json_decode($p['name'], true) ?? $p['name'];
        if (isset($p['description'])) $p['description'] = json_decode($p['description'], true) ?? $p['description'];
    }
    
    // Also get category counts for the sidebar
    $counts = $productModel->getCategoryCounts();
    
    echo json_encode([
        'status' => 'success',
        'data' => $products,
        'counts' => $counts
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'حدث خطأ في الخادم أثناء جلب المنتجات: ' . $e->getMessage()
    ]);
}
?>