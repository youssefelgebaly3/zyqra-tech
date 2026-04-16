<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../config/database.php';
use Backend\Config\Database;

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden: Admin access required"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"));
    
    // Also accept form-data just in case
    $order_id = isset($data->order_id) ? $data->order_id : (isset($_POST['order_id']) ? $_POST['order_id'] : null);
    $status = isset($data->status) ? $data->status : (isset($_POST['status']) ? $_POST['status'] : null);

    if (!$order_id || !$status) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        exit;
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE orders SET status = :status WHERE id = :order_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':order_id', $order_id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Order status updated successfully"]);
        } else {
            throw new Exception("Failed to update status");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Server error " . $e->getMessage()]);
    }
}
?>
