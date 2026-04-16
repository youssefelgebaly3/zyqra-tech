<?php
namespace Backend\Models;

use PDO;

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $full_name;
    public $email;
    public $phone;
    public $password_hash;
    public $role;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register a new user
    public function register() {
        // Sanitize name and phone, trim email
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = trim($this->email);
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        
        // Hash password
        $this->password_hash = password_hash($this->password_hash, PASSWORD_DEFAULT);

        // SQL Query
        $query = "INSERT INTO " . $this->table_name . " 
                  SET full_name = :full_name, email = :email, phone = :phone, password_hash = :password_hash";

        $stmt = $this->conn->prepare($query);

        // Bind data
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":password_hash", $this->password_hash);

        try {
            return $stmt->execute();
        } catch (\PDOException $e) {
            return false;
        }
    }

    // Login user
    public function login($email, $password) {
        $query = "SELECT id, full_name, email, password_hash, role 
                  FROM " . $this->table_name . " 
                  WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        
        // Trim email for exact match
        $email = trim($email);
        $stmt->bindParam(":email", $email);

        $stmt->execute();
        
        // Check if user exists
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verify password
            if(password_verify($password, $row['password_hash'])) {
                $this->id = $row['id'];
                $this->full_name = $row['full_name'];
                $this->email = $row['email'];
                $this->role = $row['role'];
                return true;
            }
        }
        return false;
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $this->email = trim($this->email);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Get user details by ID
    public function getUserDetails($id) {
        $query = "SELECT id, full_name, email, phone, role, avatar, created_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id LIMIT 1";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return null;
    }

    // Update user profile info
    public function updateProfile($id, $full_name, $email, $phone) {
        $query = "UPDATE " . $this->table_name . "
                  SET full_name = :full_name, email = :email, phone = :phone
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":full_name", $full_name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    // Update user password
    public function updatePassword($id, $current_password, $new_password) {
        // First check current password
        $query = "SELECT password_hash FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && password_verify($current_password, $row['password_hash'])) {
            $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
            $query = "UPDATE " . $this->table_name . " SET password_hash = :hash WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":hash", $new_hash);
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        }
        return false;
    }

    // Update user avatar
    public function updateAvatar($id, $avatar_path) {
        $query = "UPDATE " . $this->table_name . " SET avatar = :avatar WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":avatar", $avatar_path);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
