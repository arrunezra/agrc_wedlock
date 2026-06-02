<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 



try {
	
		$token = AuthMiddleware::check();
		$db = Database::getInstance();
		
		$data = json_decode(file_get_contents("php://input"), true);
		
		$my_id = $token->profile_id ?? $token['profile_id']; 
		$target_id = $data->profile_id ?? $data['profile_id'];
		//echo json_encode(["success" => true, "isLiked" => $target_id]);
        // exit;
		// Check if already liked
		$check = $db->prepare("SELECT id FROM profile_likes WHERE sender_id = ? AND profile_id = ?");
		$check->execute([$my_id, $target_id]);

		if ($check->fetch()) {
			// Already liked, so UNLIKE
			$stmt = $db->prepare("DELETE FROM profile_likes WHERE sender_id = ? AND profile_id = ?");
			$stmt->execute([$my_id, $target_id]);
			echo json_encode(["success" => true, "isLiked" => false]);
		} else {
			// Not liked, so LIKE
			$stmt = $db->prepare("INSERT INTO profile_likes (sender_id, profile_id) VALUES (?, ?)");
			$stmt->execute([$my_id, $target_id]);
			echo json_encode(["success" => true, "isLiked" => true]);
		}
	} catch (PDOException $e) {
 		http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
	}