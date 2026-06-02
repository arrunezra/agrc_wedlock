<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
require_once __DIR__ . '/../error_log_config.php'; 

require_once '../config/database.php';

try {
    $db = Database::getInstance();
    
    // 1. Validate Input
    $action = $_GET['action'] ?? null;  
    $file_id = $_GET['file_id'] ?? '';

    if (!$file_id || $action === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing file ID or action"]);
        exit;
    }

    // 2. Start Transaction (Crucial if you want to use commit)
    $db->beginTransaction();

    $sql = "UPDATE profile_files 
            SET is_verified = ? 
            WHERE file_id = ?";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        $action, 
        $file_id
    ]);

    // 3. Commit the changes
    $db->commit();
    
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Record updated successfully"]);

} catch (Exception $e) {
    // Rollback if something went wrong
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "An internal server error occurred"
    ]);
}