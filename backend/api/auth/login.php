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
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Basic Validation
    if (empty($email) || empty($password)) {
        $response["message"] = "Please enter both email and password.";
    } else {
        // Attempt login
        if ($user->login($email, $password)) {
            // Set session variables
            $_SESSION['user_id'] = $user->id;
            $_SESSION['full_name'] = $user->full_name;
            $_SESSION['user_role'] = $user->role;

            $response["status"] = "success";
            $response["message"] = "Login successful!";
            // Can pass user info or redirect URL as well
            $response["redirect"] = "profile.html";
        } else {
            $response["message"] = "Invalid email or password.";
        }
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>