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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $database = new Database();
        $db = $database->getConnection();

        // Handle JSON fields (AR/EN)
        $name = json_encode([
            "ar" => $_POST['name_ar'] ?? "",
            "en" => $_POST['name_en'] ?? ""
        ], JSON_UNESCAPED_UNICODE);

        $subtitle = json_encode([
            "ar" => $_POST['subtitle_ar'] ?? "",
            "en" => $_POST['subtitle_en'] ?? ""
        ], JSON_UNESCAPED_UNICODE);

        $description = json_encode([
            "ar" => $_POST['description_ar'] ?? "",
            "en" => $_POST['description_en'] ?? ""
        ], JSON_UNESCAPED_UNICODE);

        $discount_label = json_encode([
            "ar" => $_POST['discount_ar'] ?? "",
            "en" => $_POST['discount_en'] ?? ""
        ], JSON_UNESCAPED_UNICODE);

        // Basic numeric fields
        $price = $_POST['price'] ?? 0;
        $old_price = !empty($_POST['old_price']) ? $_POST['old_price'] : null;
        $category = $_POST['category'] ?? "other";
        $stock = $_POST['stock'] ?? 0;

        // Image Upload handling
        $image_url = 'assets/img/product-placeholder.jpg';
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $target_dir = "../../../assets/img/products/";
            
            // Create directory if not exists
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
            $new_filename = uniqid() . '.' . $file_extension;
            $target_file = $target_dir . $new_filename;

            if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                $image_url = "assets/img/products/" . $new_filename;
            }
        }

        $query = "INSERT INTO products (name, subtitle, description, price, old_price, discount_label, category, image_url, stock) 
                  VALUES (:name, :subtitle, :description, :price, :old_price, :discount_label, :category, :image_url, :stock)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':subtitle', $subtitle);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':old_price', $old_price);
        $stmt->bindParam(':discount_label', $discount_label);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':stock', $stock);

        if ($stmt->execute()) {
            $product_id = $db->lastInsertId();
            
            // Log to history if stock > 0
            if ($stock > 0) {
                $historyQuery = "INSERT INTO inventory_history (product_id, type, quantity, previous_stock, new_stock, notes) 
                                 VALUES (:pid, 'in', :qty, 0, :new, 'رصيد عند البداية')";
                $historyStmt = $db->prepare($historyQuery);
                $historyStmt->execute([
                    'pid' => $product_id,
                    'qty' => $stock,
                    'new' => $stock
                ]);
            }

            echo json_encode(["status" => "success", "message" => "Product added successfully", "id" => $product_id]);
        } else {
            throw new Exception("Failed to insert product");
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    }
}
?>
