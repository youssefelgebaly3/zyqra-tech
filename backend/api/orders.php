<?php
// backend/api/orders.php
session_start();
header('Content-Type: application/json');
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function requireLogin()
{
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function isAdmin()
{
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

if ($method === 'GET') {
    requireLogin();
    $userId = $_SESSION['user_id'];

    try {
        if (isAdmin()) {
            $stmt = $pdo->query("SELECT orders.*, users.full_name, users.email FROM orders JOIN users ON orders.user_id = users.id ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$userId]);
        }
        $orders = $stmt->fetchAll();

        foreach ($orders as &$order) {
            $stmtItems = $pdo->prepare("SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE order_id = ?");
            $stmtItems->execute([$order['id']]);
            $order['items'] = $stmtItems->fetchAll();
        }

        echo json_encode($orders);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
} elseif ($method === 'POST') {
    requireLogin();
    $userId = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['items'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No items']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $total = 0;
        $orderItems = [];

        foreach ($data['items'] as $item) {
            $stmt = $pdo->prepare("SELECT id, price, stock_quantity FROM products WHERE id = ?");
            $stmt->execute([$item['product_id']]);
            $prod = $stmt->fetch();

            if (!$prod || $prod['stock_quantity'] < $item['quantity']) {
                throw new Exception("Product unavailable");
            }

            $total += $prod['price'] * $item['quantity'];
            $orderItems[] = ['id' => $prod['id'], 'qty' => $item['quantity'], 'price' => $prod['price']];

            $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?")
                ->execute([$item['quantity'], $prod['id']]);
        }

        $stmtOrder = $pdo->prepare("INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, phone) VALUES (?, ?, ?, ?, ?)");
        $stmtOrder->execute([$userId, $total, $data['payment_method'] ?? 'cod', $data['shipping_address'] ?? '', $data['phone'] ?? '']);
        $orderId = $pdo->lastInsertId();

        $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($orderItems as $i) {
            $stmtItem->execute([$orderId, $i['id'], $i['qty'], $i['price']]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'order_id' => $orderId]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    requireLogin();
    if (!isAdmin()) {
        http_response_code(403);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?")->execute([$data['status'], $data['order_id']]);
    echo json_encode(['success' => true]);
}
?>