<?php
// backend/api/tasks.php
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
    // Get tasks for a specific lesson or all tasks for user
    $courseId = $_GET['course_id'] ?? null;
    $lessonId = $_GET['lesson_id'] ?? null;

    if ($courseId && $lessonId) {
        $stmt = $pdo->prepare("SELECT * FROM student_tasks WHERE user_id = ? AND course_id = ? AND lesson_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId, $courseId, $lessonId]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM student_tasks WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
    }
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'POST') {
    // Submit a task
    // Support JSON or Form Data (for files later, but assume text/link for now via JSON)
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        // Fallback for form data
        $data = $_POST;
    }

    if (!isset($data['course_id'], $data['lesson_id'], $data['type'], $data['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO student_tasks (user_id, course_id, lesson_id, submission_type, content, status) VALUES (?, ?, ?, ?, ?, 'pending')");
        $stmt->execute([
            $userId,
            $data['course_id'],
            $data['lesson_id'],
            $data['type'],
            $data['content']
        ]);

        echo json_encode(['success' => true, 'message' => 'Task submitted successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}
?>