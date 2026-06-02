<?php
require_once __DIR__ . '/../error_log_config.php';
require_once '../config/database.php';
require_once '../helpers/AuthMiddleware.php';
header("Content-Type: application/json");

class Config {
    public static function get($key) { 
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT config_value FROM configurations WHERE config_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['config_value'] : null;
    }
}


?>
 