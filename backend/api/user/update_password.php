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
    $current_pass = isset($_POST['current_pass']) ? $_POST['current_pass'] : '';
    $new_pass = isset($_POST['new_pass']) ? $_POST['new_pass'] : '';
    $confirm_pass = isset($_POST['confirm_pass']) ? $_POST['confirm_pass'] : '';

    if (empty($current_pass) || empty($new_pass)) {
        $response["message"] = "Current and new passwords are required.";
    } elseif ($new_pass !== $confirm_pass) {
        $response["message"] = "New passwords do not match.";
    } elseif (strlen($new_pass) < 6) {
        $response["message"] = "New password must be at least 6 characters.";
    } else {
        if ($user->updatePassword($id, $current_pass, $new_pass)) {
            $response["status"] = "success";
            $response["message"] = "Password updated successfully!";
        } else {
            $response["message"] = "Incorrect current password.";
        }
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>
