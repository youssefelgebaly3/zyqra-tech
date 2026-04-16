<?php
/**
 * db.php - Procedural Database Connection
 * 
 * Provides a simple $pdo variable for files that use procedural style.
 * This is a wrapper around the OOP Database class for backward compatibility.
 */

require_once __DIR__ . '/Database.php';

use Backend\Config\Database;

$database = new Database();
$pdo = $database->getConnection();
