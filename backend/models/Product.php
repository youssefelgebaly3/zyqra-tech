<?php
// backend/models/Product.php
require_once __DIR__ . '/../config/Database.php';

use Backend\Config\Database;

class Product {
    private $db;
    private $table = 'products';

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all products with optional filters
     */
    public function getAll($category = 'all', $max_price = null, $search = null) {
        $query = "SELECT * FROM " . $this->table . " WHERE 1=1";
        $params = [];

        if ($category !== 'all') {
            $query .= " AND category = :category";
            $params['category'] = $category;
        }

        if ($max_price !== null) {
            $query .= " AND price <= :price";
            $params['price'] = $max_price;
        }

        if ($search !== null && trim($search) !== '') {
            $query .= " AND (name LIKE :search OR description LIKE :search)";
            $params['search'] = "%$search%";
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get a single product by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Get count of products in each category for sidebar
     */
    public function getCategoryCounts() {
        $query = "SELECT category, COUNT(*) as count FROM " . $this->table . " GROUP BY category";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
?>
