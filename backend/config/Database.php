<?php
namespace Backend\Config;

use PDO;
use PDOException;

class Database {
    private $host = "localhost";
    private $db_name = "zyqra_db";
    private $username = "root";  // Default XAMPP username
    private $password = "";      // Default XAMPP password is empty
    public $conn;

    /**
     * @return \PDO|null
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4", $this->username, $this->password);
            
            // Set error mode to exception to handle errors properly
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Set default fetch mode to associative arrays
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch(PDOException $exception) {
            // In a real production environment, don't output the raw error to the user structure. Log it instead.
            echo json_encode(["status" => "error", "message" => "Database connection error."]);
            exit;
        }

        return $this->conn;
    }
}
?>
