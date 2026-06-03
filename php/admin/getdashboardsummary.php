<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    // 1. Auth Check & Payload Extraction
    $token = AuthMiddleware::check();
    
    // Extracting user identity attributes directly from the authenticated token session
    $role = isset($token['role']) ? $token['role'] : null;
    $profile_id = isset($token['profile_id']) ? $token['profile_id'] : null;

    $db = Database::getInstance();
    
    error_log("Incoming Request: " . file_get_contents("php://input") . " | User Role: {$role} | Profile ID: {$profile_id}");

    // 2. Prepare & Bind updated Stored Procedure inputs
    // The SP signature expects: IN p_role, IN p_profile_id, IN p_debug_mode
    $stmt = $db->prepare("CALL USP_Admin_Dashboard(:role, :profile_id, 0)"); // 0 for production
    
    $stmt->bindParam(':role', $role, PDO::PARAM_STR);
    $stmt->bindParam(':profile_id', $profile_id, PDO::PARAM_STR);
    
    $stmt->execute();

    // 3. Extract Card & Revenue totals
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);

    // Move to the next result set for the filtered Church List matrix
    $stmt->nextRowset();
    $church_list = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Return formatted data payload
    echo json_encode([
        "success" => true, 
        "summary" => $summary ? $summary : [],
        "churches" => $church_list ? $church_list : []
    ]);

} catch (Exception $e) {
    error_log("Dashboard Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "An internal system error occurred while loading dashboard metrics."
    ]);
}
?>