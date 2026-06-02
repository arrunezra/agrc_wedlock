<?php
header("Content-Type: application/json");
require_once '../config/database.php';
require_once '../helpers/JWT.php';
require_once __DIR__ . '/../error_log_config.php'; 

$data = json_decode(file_get_contents("php://input"));

try {
    if (!empty($data->refresh_token)) {
        $db = Database::getInstance();
        
        // 1. Dynamic Check on both profiles and staff_details tables via COALESCE
        $sql = "SELECT u.id
                      ,u.userid
                      ,u.phoneNumber
                      ,u.email
                      ,u.role
                      ,p.profile_id
                      ,COALESCE(p.gender, sd.gender, '') AS gender
                      ,COALESCE(p.is_visible, 1) AS is_visible
                FROM users u
                -- Join checking if user is a Member
                LEFT JOIN profiles p ON u.userid = p.userid
                -- Join checking if user is Staff/Admin
                LEFT JOIN staff_details sd ON u.userid = sd.userid
                WHERE u.refresh_token = ? AND u.IsActive = 1
                LIMIT 1";
                
        $stmt = $db->prepare($sql);
        $stmt->execute([$data->refresh_token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // 2. Generate a new Access Token with the updated contextual payload
            $newPayload = [
                "uid" => $user['userid'],
                "phone" => $user['phoneNumber'],
                "email" => $user['email'],
                "role" => $user['role'],
                "profile_id" => $user['profile_id'] ?? null, // Will be null cleanly if staff
                "gender" => $user['resolved_gender'],
                "is_visible" => $user['is_visible']
            ];
            
            // Generate token
            $newAccessToken = JWT::encode($newPayload, 3600); 

            echo json_encode([
                "success" => true,
                "access_token" => $newAccessToken,
                "message" => "Token refreshed"
            ]);
        } else {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Invalid Refresh Token. Please login again."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Refresh token is required."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log("Refresh Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Internal Server Error"]);
}
?>