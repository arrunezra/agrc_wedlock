<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 



try {
	
	$token = AuthMiddleware::check();
	$tRole = $token->role ?? $token['role'];
	$tprofile_id = $token->profile_id ?? $token['profile_id']; 
	
 	$senderId = $tprofile_id;
	
	$db = Database::getInstance();
	$db->beginTransaction();
	
	$data = json_decode(file_get_contents("php://input"));
	$receiverId = $data->receiver_id;

	if (!$receiverId) {
		echo json_encode(["success" => false, "message" => "Receiver ID missing"]);
		exit;
	}
	
	
    // 1. Check if the OTHER person already sent YOU a request
    $check = $db->prepare("SELECT id FROM interests WHERE sender_id = ? AND receiver_id = ? AND status = 'Pending' LIMIT 1");
    $check->execute([$receiverId, $senderId]);
    $incomingRequest = $check->fetch();

    if ($incomingRequest) {
        // 2. AUTO-ACCEPT: They already requested you, so just move to 'Accepted'
        $update = $db->prepare("UPDATE interests SET status = 'Accepted' WHERE id = ?");
        $update->execute([$incomingRequest['id']]);
        
        $db->commit();
        echo json_encode(["success" => true, "message" => "It's a Match!", "status" => "Accepted"]);
    } else {
        // 3. NORMAL SEND: No existing request, so create a new 'Pending' one
        // Use IGNORE or a check to prevent duplicate rows if you click twice
        $stmt = $db->prepare("INSERT INTO interests (sender_id, receiver_id, status) VALUES (?, ?, 'Pending')");
        $stmt->execute([$senderId, $receiverId]);
        
        $db->commit();
        echo json_encode(["success" => true, "message" => "Interest sent!", "status" => "Pending"]);
    }
} catch (PDOException $e) {
    $errorInfo = $e->errorInfo;
    $sqlState = $e->getCode();
		error_log($e->getMessage());

    $mysqlErrorCode = $errorInfo[1] ?? null;
	if ($db->inTransaction()) $db->rollBack();
    // 1062 is the specific MySQL code for Duplicate Entry
    if ($mysqlErrorCode == 1062) {
        echo json_encode(["success" => false, "message" => "Already sent interest"]);
    } 
    // If it's 23000 but NOT 1062, it's likely a Foreign Key issue (User doesn't exist)
    elseif ($sqlState == 23000) {
        echo json_encode(["success" => false, "message" => "Constraint violation: Check if both IDs exist."]);
    } 
    else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}