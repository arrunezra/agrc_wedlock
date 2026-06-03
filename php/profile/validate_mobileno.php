<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../config/database.php';
require_once '../helpers/cammon.php';
require_once __DIR__ . '/../error_log_config.php'; 


  try { 
        $db = Database::getInstance();
$data = json_decode(file_get_contents("php://input"), true);

// 1. Initial Checks
 $phone = trim($data['phoneNumber'] ?? $data['phone'] ?? '');
$email = trim($data['email'] ?? ''); 
        // Check if phone exists in users
        $checkUser = $db->prepare("SELECT ID FROM users WHERE phoneNumber = ? OR email = ?");
        $checkUser->execute([$phone, $email]);
        if ($checkUser->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "An account already exists with this email or mobile number. Would you like to log in instead?"]);
            exit;
        }

        // Check if phone exists in profiles
        $checkProfile = $db->prepare("SELECT profile_id FROM profiles WHERE phone = ? OR email = ?");
        $checkProfile->execute([$phone, $email]);
        if ($checkProfile->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "An account already exists with this email or mobile number. Would you like to log in instead?"]);
            exit;
        }
        http_response_code(200); 
        echo json_encode([
        "success" => true, 
        "message" => "Valid mobile number/email", 

        ]); 
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
	    error_log($e->getMessage());
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
?>