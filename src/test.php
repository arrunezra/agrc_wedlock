<?php
// Include your logging config at the very top!
 require_once __DIR__ . '/../error_log_config.php'; 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../config/database.php';

$db = Database::getInstance();

$StateCode = $_GET['statecode'] ?? '';
$search = $_GET['search'] ?? '';

if (empty($StateCode)) {
    echo json_encode([
        "success" => false,
        "message" => "State code is required",
        "data" => []
    ]);
    exit;
}

try {
    

} catch (PDOException $e) {
    // This will now automatically write to your error_logs.txt via bootstrap/config
    error_log("City Fetch Error: " . $e->getMessage()); 
    
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error occurred",
        "data" => []
    ]);
}
?>