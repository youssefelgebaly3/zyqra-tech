<?php
session_start();
require_once '../../config/Database.php';
require_once '../../models/User.php';

use Backend\Config\Database;
use Backend\Models\User;

$response = ["status" => "error", "message" => "Unauthorized access."];

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id']) && isset($_FILES['avatar'])) {
    $db = (new Database())->getConnection();
    $user = new User($db);
    $id = $_SESSION['user_id'];

    $file = $_FILES['avatar'];
    $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
    $max_size = 2 * 1024 * 1024; // 2MB

    if (!in_array($file['type'], $allowed_types)) {
        $response["message"] = "Invalid file type. Only JPG, PNG, and WebP are allowed.";
    } elseif ($file['size'] > $max_size) {
        $response["message"] = "File size too large. Maximum is 2MB.";
    } else {
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = "avatar_" . $id . "_" . time() . "." . $ext;
        $target_dir = "../../uploads/avatars/";
        $target_path = $target_dir . $filename;
        $db_path = "uploads/avatars/" . $filename;

        // Create directory if not exists (already done but good practice)
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $target_path)) {
            if ($user->updateAvatar($id, $db_path)) {
                $response["status"] = "success";
                $response["message"] = "Avatar updated successfully!";
                $response["avatar_url"] = $db_path;
            } else {
                $response["message"] = "Unable to update database with new avatar.";
            }
        } else {
            $response["message"] = "Unable to upload file to server.";
        }
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>
