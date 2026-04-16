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

    // Fetch products and their current stock
    $productsQuery = "SELECT id, name, category, stock, image_url, price FROM products ORDER BY stock ASC";
    $productsStmt = $db->prepare($productsQuery);
    $productsStmt->execute();
    $products = $productsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch sold counts
    $soldQuery = "SELECT product_name, SUM(quantity) as total_sold FROM order_items GROUP BY product_name";
    $soldStmt = $db->prepare($soldQuery);
    $soldStmt->execute();
    $soldData = $soldStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert to name-based map (since product_id might be null in order_items if product was deleted)
    $soldMap = [];
    foreach ($soldData as $row) {
        $soldMap[$row['product_name']] = (int)$row['total_sold'];
    }

    $processedProducts = [];
    $totalStock = 0;
    $lowStockCount = 0;
    $outOfStockCount = 0;
    $totalSold = 0;

    foreach ($products as $p) {
        $decodedName = json_decode($p['name'], true);
        $arName = $decodedName['ar'] ?? 'منتج غير معروف';
        
        $soldCount = $soldMap[$arName] ?? 0;
        $totalSold += $soldCount;
        $totalStock += $p['stock'];

        if ($p['stock'] == 0) $outOfStockCount++;
        elseif ($p['stock'] < 10) $lowStockCount++;

        $processedProducts[] = [
            'id' => $p['id'],
            'name_ar' => $arName,
            'category' => $p['category'],
            'stock' => (int)$p['stock'],
            'sold' => $soldCount,
            'image_url' => $p['image_url']
        ];
    }

    echo json_encode([
        "status" => "success",
        "inventory" => $processedProducts,
        "stats" => [
            "total_stock" => $totalStock,
            "total_sold" => $totalSold,
            "low_stock" => $lowStockCount,
            "out_of_stock" => $outOfStockCount
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
