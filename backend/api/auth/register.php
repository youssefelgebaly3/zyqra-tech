<?php
session_start();

// Include classes
require_once '../../config/Database.php';
require_once '../../models/User.php';

use Backend\Config\Database;
use Backend\Models\User;

// Initialize response array
$response = ["status" => "error", "message" => "Invalid request."];

// Check if request is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Initialize User object
    $user = new User($db);

    // Get POST data
    // In a real application, consider using filter_input or similar
    $user->full_name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $user->email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $user->password_hash = isset($_POST['password']) ? $_POST['password'] : '';
    $password_confirm = isset($_POST['password_confirm']) ? $_POST['password_confirm'] : '';
    // Optional phone
    $user->phone = isset($_POST['phone']) ? trim($_POST['phone']) : null;

    // Basic Validation
    if(empty($user->full_name) || empty($user->email) || empty($user->password_hash)) {
        $response["message"] = "All fields are required.";
    } elseif (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
         $response["message"] = "Invalid email format.";
    } elseif ($user->password_hash !== $password_confirm && !empty($password_confirm)) {
        $response["message"] = "Passwords do not match.";
    } elseif (strlen($user->password_hash) < 6) {
         $response["message"] = "Password must be at least 6 characters long.";
    } else {
        // Check if email already exists
        if ($user->emailExists()) {
             $response["message"] = "Email already registered. Please login.";
        } else {
            // Register user
            if ($user->register()) {
                $response["status"] = "success";
                $response["message"] = "Registration successful! You can now login.";
                // Optional: Auto login after registration
            } else {
                $response["message"] = "Unable to register. Please try again later.";
            }
        }
    }
}

// Return JSON response (useful if using AJAX) or redirect
header('Content-Type: application/json');
echo json_encode($response);
?>
