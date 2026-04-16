<?php
// backend/api/product_details.php
header('Content-Type: application/json');
require_once '../../models/Product.php';

$productModel = new Product();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid ID']);
    exit;
}

try {
    $product = $productModel->getById($id);

    if ($product) {
        // Decode all bilingual JSON fields
        $jsonFields = ['name', 'subtitle', 'description', 'features', 'specs', 'faqs', 'discount_label'];
        foreach ($jsonFields as $field) {
            if (isset($product[$field])) {
                $product[$field] = json_decode($product[$field], true) ?? $product[$field];
            }
        }

        echo json_encode([
            'status' => 'success',
            'data' => $product
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Product not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server Error']);
}
?>
