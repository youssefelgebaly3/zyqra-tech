<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
use Backend\Config\Database;

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->firstname) &&
        !empty($data->lastname) &&
        !empty($data->email) &&
        !empty($data->subject) &&
        !empty($data->message)
    ) {
        $query = "INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message) 
                  VALUES (:firstname, :lastname, :email, :phone, :subject, :message)";

        $stmt = $db->prepare($query);

        // Sanitize and bind
        $firstname = htmlspecialchars(strip_tags($data->firstname));
        $lastname = htmlspecialchars(strip_tags($data->lastname));
        $email = htmlspecialchars(strip_tags($data->email));
        $phone = !empty($data->phone) ? htmlspecialchars(strip_tags($data->phone)) : null;
        $subject = htmlspecialchars(strip_tags($data->subject));
        $message = htmlspecialchars(strip_tags($data->message));

        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':message', $message);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Message was sent successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "Unable to send message."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete data."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
