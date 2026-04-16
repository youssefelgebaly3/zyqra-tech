<?php
require_once __DIR__ . '/../config/Database.php';
use Backend\Config\Database;

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $sql = file_get_contents(__DIR__ . '/../sql/create_contact_table.sql');
    
    $db->exec($sql);
    
    echo "Table 'contact_messages' created successfully!\n";
} catch (Exception $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
