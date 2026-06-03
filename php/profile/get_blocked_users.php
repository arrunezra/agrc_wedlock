<?php
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try
    {
        $token = AuthMiddleware::check();
        $db = Database::getInstance();

       // error_log("Full Token Data: " . print_r($token, true));
        
        $my_id = $token->profile_id ?? $token['profile_id']; 
 
        $query = "
            SELECT p.profile_id, p.first_name, p.last_name, p.city ,p.file_name,p.city_name, p.state_name
            FROM v_profiles p
            JOIN profiles_blocks b ON p.profile_id = b.blocked_id
            WHERE b.blocker_id = ?
            ORDER BY b.created_at DESC
        ";

        $stmt = $db->prepare($query);
        $stmt->execute([$my_id]);
        $blocked_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
		echo json_encode([
            "success" => true,
            "data" => $blocked_users 
        ]);
 
    } catch (Exception $e) {
        http_response_code(500);
        error_log($e->getMessage()); 
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
     }

?>