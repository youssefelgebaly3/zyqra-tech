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
    $data = json_decode(file_get_contents("php://input"));
    
    $target_user_id = $data->user_id ?? null;
    $new_role = $data->role ?? null;

    if (!$target_user_id || !$new_role) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing parameters"]);
        exit;
    }

    // Protection: Prevent admin from changing their own role (optional but recommended)
    if ($target_user_id == $_SESSION['user_id']) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "You cannot change your own role to prevent lockout"]);
        exit;
    }

    // Validate role enum
    $allowed_roles = ['student', 'customer', 'installer', 'admin'];
    if (!in_array($new_role, $allowed_roles)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid role"]);
        exit;
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE users SET role = :role WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':role', $new_role);
        $stmt->bindParam(':id', $target_user_id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "User role updated successfully"]);
        } else {
            throw new Exception("Failed to update user role");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Server error " . $e->getMessage()]);
    }
}
?>
