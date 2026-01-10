<?php
// backend/api/courses.php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get progress for all courses
    $stmt = $pdo->prepare("SELECT course_id, lesson_id, completed FROM course_progress WHERE user_id = ?");
    $stmt->execute([$userId]);
    $progress = $stmt->fetchAll();

    // Group by course
    $courses = [];
    foreach ($progress as $p) {
        if (!isset($courses[$p['course_id']])) {
            $courses[$p['course_id']] = ['completed_lessons' => []];
        }
        if ($p['completed']) {
            $courses[$p['course_id']]['completed_lessons'][] = $p['lesson_id'];
        }
    }

    echo json_encode($courses);

} elseif ($method === 'POST') {
    // Mark lesson as completed
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['course_id'], $data['lesson_id'], $data['completed'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO course_progress (user_id, course_id, lesson_id, completed) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE completed = ?");
        $stmt->execute([
            $userId,
            $data['course_id'],
            $data['lesson_id'],
            $data['completed'] ? 1 : 0,
            $data['completed'] ? 1 : 0
        ]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
}
?>