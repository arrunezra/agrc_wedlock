<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    $token = AuthMiddleware::check();
    $my_id = $token->profile_id ?? $token['profile_id'];
    
    $data = json_decode(file_get_contents("php://input"));
    $sender_id = $data->sender_id; // The person who sent the request
    $action = $data->action; // Expected: 'Accepted' or 'Rejected'

    if (!in_array($action, ['Accepted', 'Rejected'])) {
        throw new Exception("Invalid action");
    }

    $db = Database::getInstance();
    
    // Update the row where YOU are the receiver and THEY are the sender
    $sql = "UPDATE interests 
            SET status = ? 
            WHERE sender_id = ? AND receiver_id = ? AND status = 'Pending'";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([$action, $sender_id, $my_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Request $action successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Request not found or already processed."]);
    }

} catch (Exception $e) {
	error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}