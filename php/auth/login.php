<?php
header("Content-Type: application/json");
require_once '../config/database.php';
require_once '../helpers/JWT.php';
require_once __DIR__ . '/../error_log_config.php'; 

$db = Database::getInstance();
$data = json_decode(file_get_contents("php://input"));

if (empty($data->phoneNumber) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Phone number and password are required"]);
    exit();
}

try {
    // 1. Fetch User details, checking profiles OR staff_details dynamically
    $sql = "SELECT  u.id
                    ,u.userid
                    ,u.phoneNumber
                    ,u.email
                    ,u.PasswordHash
                    ,u.role 
                    ,u.IsActive
                    ,u.IsVerified
                                      
                    -- Dynamic Name Resolution: Checks profile first, then staff_details, then users baseline
                   
                    ,COALESCE(p.profile_id, '') AS profile_id

                    ,COALESCE(p.first_Name, sd.firstname) AS first_name
                    ,COALESCE(p.last_name, sd.lastname, '') AS last_name
                    
                    -- Dynamic Location/Metadata Resolution
                    ,COALESCE(p.city, sd.city) AS city
                    ,COALESCE(p.gender, '') AS gender
                    ,COALESCE(p.is_visible, 1) AS is_visible
                    
                    -- Dynamic Image Resolution: Checks member profile files first, then staff file_repo
                    ,IFNULL(pf.file_name, fr.file_name) AS file_name 

            FROM users u 
            
            -- JOIN 1: Check if the user is a Member
            LEFT JOIN profiles p ON u.userid = p.userid 
            
            -- JOIN 2: Check if the user is Staff/Admin
            LEFT JOIN staff_details sd ON u.userid = sd.userid
            
            -- IMAGE JOIN 1: Member profile image subquery
            LEFT JOIN profile_files pf ON pf.file_id = (
                SELECT file_id 
                FROM profile_files 
                WHERE profile_id = p.profile_id 
                AND is_verified = 1 
                ORDER BY is_profile_pic DESC, created_at DESC 
                LIMIT 1
            )
            
            -- IMAGE JOIN 2: Staff profile image source from file_repo
            LEFT JOIN file_repo fr ON fr.userid = u.userid
            
            WHERE u.IsActive = 1 AND (u.phoneNumber = ? OR u.email = ?)";

    $stmt = $db->prepare($sql);
    $stmt->execute([$data->phoneNumber, $data->phoneNumber]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data->password, $user['PasswordHash'])) {
        
        // 2. Generate Access Token Payload
        $payload = [
            "uid" => $user['userid'],
            "profile_id" => $user['profile_id'],
            "phone" => $user['phoneNumber'],
            "email" => $user['email'],
            "role" => $user['role'],
            "gender" => $user['gender'],
            "is_visible" => $user['is_visible']
        ];
        $accessToken = JWT::encode($payload, 3600);

        // 3. Generate and Save Refresh Token
        $refreshToken = bin2hex(random_bytes(32));
        $updateStmt = $db->prepare("UPDATE users SET refresh_token = ? WHERE id = ?");
        $updateStmt->execute([$refreshToken, $user['id']]);

        // 4. Default Gender-based Avatar Logic
        $defaultAvatar = (strtolower($user['gender']) === 'male') ? 'boy.png' : 'girl.jpg';
        $profilePic = !empty($user['file_name']) ? $user['file_name'] : $defaultAvatar;
         
        echo json_encode([
            "status" => "success",
            "access_token" => $accessToken,
            "refresh_token" => $refreshToken,
            "expires_in" => 3600,
            "user" => [
                "userid" => $user['userid'],
                "profile_id" => $user['profile_id'] ?? '',
                "firstName" => $user['first_name'],
                "lastName" => $user['last_name'],
                "email" => $user['email'],
                "phone" => $user['phoneNumber'],
                "role" => $user['role'],
                "profilePic" => $profilePic,
                "profileThumb" => $profilePic, 
                "city" => $user['city'],
                "isVerified" => $user['IsVerified'] ?? 0,
                "is_visible" => $user['is_visible']
            ]
        ]);
    } else {
        http_response_code(401); 
        echo json_encode(["message" => "Invalid phone number/email or password"]);
    }

} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage()); 
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Internal server error"]);
}
?>