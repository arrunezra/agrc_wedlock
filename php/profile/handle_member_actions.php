<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 



try {
    $token = AuthMiddleware::check();
    $db = Database::getInstance();

    // Get POST data
    $data = json_decode(file_get_contents("php://input"), true);

    $action = $data['action']; // 'block', 'report', or 'hide'
    $user_id = $data['user_id']; // Logged in user
    $target_id = $data['target_id']; // The member being acted upon

    if (!$user_id || !$target_id) {
        echo json_encode(["success" => false, "message" => "Missing IDs"]);
        exit;
    }

    switch ($action) {
        case 'block':
            $stmt = $db->prepare("INSERT INTO profiles_blocks  (blocker_id, blocked_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $target_id]);
            echo json_encode(["success" => true, "message" => "Member blocked"]);
            break;

        case 'hide':
            $stmt = $db->prepare("INSERT INTO member_hides (user_id, target_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $target_id]);
            echo json_encode(["success" => true, "message" => "Member hidden"]);
            break;

        case 'report':
            $reason = $data['reason'];
            $remarks = $data['remarks'];
            $stmt = $db->prepare("INSERT INTO profiles_reports (reporter_id, reported_id, reason_code, remarks) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $target_id, $reason, $remarks]);
            echo json_encode(["success" => true, "message" => "Report submitted"]);
            break;
			
		case 'unblock':
			$stmt = $db->prepare("DELETE FROM profiles_blocks WHERE blocker_id = ? AND blocked_id = ?");
			$stmt->execute([$user_id, $target_id]);
			echo json_encode(["success" => true, "message" => "Report unblocked"]); 
			break;

        default:
            echo json_encode(["success" => false, "message" => "Invalid action"]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
	error_log($e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>