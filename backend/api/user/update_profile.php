<?php
session_start();
require_once '../../config/Database.php';
require_once '../../models/User.php';

use Backend\Config\Database;
use Backend\Models\User;

$response = ["status" => "error", "message" => "Unauthorized access."];

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    $db = (new Database())->getConnection();
    $user = new User($db);

    $id = $_SESSION['user_id'];
    $fname = isset($_POST['fname']) ? trim($_POST['fname']) : '';
    $lname = isset($_POST['lname']) ? trim($_POST['lname']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';

    if (empty($fname) || empty($email)) {
        $response["message"] = "Name and Email are required.";
    } else {
        $full_name = $fname . ' ' . $lname;
        if ($user->updateProfile($id, $full_name, $email, $phone)) {
            $_SESSION['full_name'] = $full_name; // Update session
            $response["status"] = "success";
            $response["message"] = "Profile updated successfully!";
        } else {
            $response["message"] = "Unable to update profile.";
        }
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>
