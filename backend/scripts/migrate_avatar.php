<?php
require_once dirname(__DIR__) . '/config/Database.php';
use Backend\Config\Database;

try {
    $db = (new Database())->getConnection();
    $sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT NULL AFTER role";
    $db->exec($sql);
    echo "Successfully updated users table schema.";
} catch (Exception $e) {
    echo "Error updating schema: " . $e->getMessage();
}
?>
