<?php
session_start();

header('Content-Type: application/json');

require_once '../../config/Database.php';
require_once '../../models/User.php';

use Backend\Config\Database;
use Backend\Models\User;

if (isset($_SESSION['user_id'])) {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $userData = $user->getUserDetails($_SESSION['user_id']);

    if ($userData) {
        $stmt = $db->prepare('SELECT COUNT(*) as orders_count FROM orders WHERE user_id = :user_id');
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        $ordersStats = $stmt->fetch();
        $real_orders_count = $ordersStats ? $ordersStats['orders_count'] : 0;

        echo json_encode([
            "status" => "success",
            "user_id" => $userData['id'],
            "full_name" => $userData['full_name'],
            "email" => $userData['email'],
            "phone" => $userData['phone'],
            "user_role" => $userData['role'],
            "avatar" => $userData['avatar'],
            "created_at" => $userData['created_at'],
            "stats" => [
                "courses_count" => 0,
                "certificates_count" => 0,
                "orders_count" => $real_orders_count
            ]
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "User record not found."
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Not logged in."
    ]);
}
?>