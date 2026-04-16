<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

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

        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id ?? null;

        if (!$id) {
            throw new Exception("Product ID is required");
        }

        // Optional: Delete physical image file if needed
        // For now, just delete from DB
        $query = "DELETE FROM products WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Product deleted successfully"]);
        } else {
            throw new Exception("Failed to delete product");
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
    }
}
?>
