<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    $token = AuthMiddleware::check();
    $db = Database::getInstance();
    
    // 1. ALWAYS YOU (The logged-in user)
    $my_id = $token->profile_id ?? $token['profile_id'];

    $data = json_decode(file_get_contents("php://input"), true);
    $action = strtolower($data['action'] ?? ''); // Convert to lowercase for safety
    
    // 2. ALWAYS THE OTHER PERSON (The one you are interacting with)
    $target_id = $data['target_id'] ?? $data['sender_id'] ?? $data['receiver_id'] ?? null;
    
    $status_val = $data['status'] ?? null;

    if (!$action || !$target_id) {
        throw new Exception("Action and Target ID are required.");
    }

    switch ($action) {
        // --- SENDING OR MATCHING --- 
        case 'send_request':
            $db->beginTransaction();
            // Did THEY (target) already send YOU (my_id) a request?
            $check = $db->prepare("SELECT id FROM profiles_interests WHERE sender_id = ? AND receiver_id = ? AND status = 'Pending' LIMIT 1");
            $check->execute([$target_id, $my_id]);
            $incoming = $check->fetch();

            if ($incoming) {
                // AUTO-MATCH
                $update = $db->prepare("UPDATE profiles_interests SET status = 'Accepted' WHERE id = ?");
                $update->execute([$incoming['id']]);
                $db->commit();
                echo json_encode(["success" => true, "message" => "It's a Match!", "status" => "Accepted"]);
            } else {
                // FRESH REQUEST: YOU (my_id) are the sender, THEY (target) are the receiver
                $stmt = $db->prepare("INSERT IGNORE INTO profiles_interests (sender_id, receiver_id, status) VALUES (?, ?, 'Pending')");
                $stmt->execute([$my_id, $target_id]);
                $db->commit();
                echo json_encode(["success" => true, "message" => "Interest sent!", "status" => "Pending"]);
            }
            break;
         
        // --- RESPONDING TO AN INCOMING REQUEST ---
        case 'accepted':
        case 'rejected':
            // Logic: THEY (target) sent it, YOU (my_id) are responding.
            $new_status = ($action === 'accepted') ? 'Accepted' : 'Rejected';
            
            $sql = "UPDATE profiles_interests 
                    SET status = ? 
                    WHERE sender_id = ? AND receiver_id = ? AND status = 'Pending'";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([$new_status, $target_id, $my_id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Request $new_status.", "status" => $new_status]);
            } else {
                echo json_encode(["success" => false, "message" => "Request not found."]);
            }
            //error_log("Full Token Data: " . print_r([$new_status, $target_id, $my_id], true));
             break;
        case "disconnect":
             
            $sql = "UPDATE profiles_interests 
                    SET status = 'Rejected'
                    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([$my_id, $target_id, $target_id, $my_id]);

            if ($stmt->rowCount() > 0) { 
                echo json_encode(["success" => true, "message" => "Request $new_status.", "status" => $new_status]);
            } else {
                echo json_encode(["success" => false, "message" => "Request not found."]);
            }
            error_log("Full Token Data: " . print_r([$my_id, $target_id, $target_id, $my_id], true));
             break;
        case 'likes': 
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
            break;

        // --- WITHDRAWING / DELETING --- 
        case 'cancel_request':
            // Delete regardless of who sent it to reset the state
            $stmt = $db->prepare("DELETE FROM profiles_interests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)");
            $stmt->execute([$my_id, $target_id, $target_id, $my_id]);
            
            // Also clean up from profile_likes table if you use both
            $stmt2 = $db->prepare("DELETE FROM profile_likes WHERE (sender_id = ? AND profile_id = ?) OR (sender_id = ? AND profile_id = ?)");
            $stmt2->execute([$my_id, $target_id, $target_id, $my_id]);

            echo json_encode(["success" => true, "message" => "Interaction removed.", "status" => null]);
            break;

        case 'block':
            $stmt = $db->prepare("INSERT IGNORE INTO profiles_blocks (blocker_id, blocked_id) VALUES (?, ?)");
            $stmt->execute([$my_id, $target_id]);
            echo json_encode(["success" => true, "message" => "Member blocked."]);
            break;

        case 'unblock':
            $stmt = $db->prepare("DELETE FROM profiles_blocks WHERE blocker_id = ? AND blocked_id = ?");
            $stmt->execute([$my_id, $target_id]);
            echo json_encode(["success" => true, "message" => "Member unblocked."]);
            break;

        case 'visible':
            $stmt = $db->prepare("UPDATE profiles SET is_visible = ? WHERE profile_id = ?");
            $stmt->execute([$status_val, $my_id]);
            echo json_encode(["success" => true, "message" => "Visibility updated."]);
            break;

        default:
            throw new Exception("Invalid action: " . $action);
    }
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log("Action Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}