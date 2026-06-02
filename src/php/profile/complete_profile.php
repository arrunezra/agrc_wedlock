<?php
 header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

 
require_once '../config/database.php';
require_once '../helpers/cammon.php';
require_once __DIR__ . '/../error_log_config.php';

$db = Database::getInstance();
$data = json_decode(file_get_contents("php://input"), true);

// 1. Initial Checks
$step = (int)($data['step'] ?? 1);
$phone = trim($data['phoneNumber'] ?? $data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$password = 'asdfghjkl';
$profile_id = 0;
try {
    

    // 3. Start Transaction
    $db->beginTransaction(); 

    // 4. Handle Profile Logic
    if ($step === 11) {
		$targetprofile_id = $data['profile_id'] ?? null;
        if (!$targetprofile_id) {
            throw new Exception("Profile ID is required for step 10");
        }

        $sql = "UPDATE profiles_family SET hobbies = ?, aboutus = ? WHERE profile_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $data['hobbies'] ?? null, 
			$data['aboutus'] ?? null,
            $targetprofile_id
        ]);

        $db->commit();
        
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Hobbies updated"]);

    } else 
    {
        // --- INITIAL INSERT / PROGRESS (Step 1-8) ---
        if (empty($phone) || empty($password)) {
            throw new Exception("Phone and Password are required for registration.");
        }

        // Check if phone exists in users
        $checkUser = $db->prepare("SELECT id FROM users WHERE phoneNumber = ? OR email = ?");
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


 
        // 1. CREATE USER (remains the same)
        $generatedUid = $userId = generateFormattedID($db, 'users', 'userid','RCST');
        $profile_id = generateFormattedID($db, 'profiles', 'profile_id','RCPF');  
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $role = $data['role'] ?? 'member';
        $isActive = 1;
        $stmtUser = $db->prepare("INSERT INTO users (userid, phoneNumber, email, PasswordHash, role,IsActive) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtUser->execute([$generatedUid, $phone, $email, $hashedPassword, $role,$isActive] );

        // 2. INSERT INTO MAIN PROFILE TABLE
        $dob = ($data['dobYear'] ?? '1900') . "-" . ($data['dobMonth'] ?? '01') . "-" . ($data['dobDay'] ?? '01');
        
        $sqlProfile = "INSERT INTO profiles (profile_id,userid, first_name, last_name, dob, gender, email, phone, address, city, state, country) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), city=VALUES(city)";
        
        $stmtProfile = $db->prepare($sqlProfile);
        $stmtProfile->execute([
            $profile_id,$generatedUid, $data['firstName'], $data['lastName'], $dob, $data['gender'], 
            $data['email'], $data['phone'], $data['address'], $data['city'], $data['state'], $data['country']
        ]);

    
        // 3. INSERT INTO PROFILES_BACKGROUND
        $sqlBg = "INSERT INTO profiles_background (profile_id, religion, community, sub_community, mother_tongue, is_caste_no_bar) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $db->prepare($sqlBg)->execute([
            $profile_id, $data['religion'], $data['community'], $data['sub_community'], 
            $data['mother_tongue'] ?? '', $data['is_caste_no_bar'] ?? 'No'
        ]);

        // 4. INSERT INTO PROFILES_FAMILY
        $kids_json = isset($data['kids_details']) ? json_encode($data['kids_details']) : '[]';
        $sqlFamily = "INSERT INTO profiles_family (profile_id, marital_status, has_children, children_count, kids_details, aboutus, hobbies) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
        $db->prepare($sqlFamily)->execute([
            $profile_id, $data['maritalStatus'], $data['has_children'] ?? 'No', 
            $data['children_count'] ?? 0, $kids_json, $data['aboutus'] ?? '', $data['hobbies'] ?? ''
        ]);

        // 5. INSERT INTO PROFILES_PHYSICAL
        $sqlPhys = "INSERT INTO profiles_physical (profile_id, height, weight) VALUES (?, ?, ?)";
        $db->prepare($sqlPhys)->execute([ $profile_id, $data['height'], $data['weight'] ]);

        // 6. INSERT INTO PROFILES_PROFESSIONAL
        $sqlProf = "INSERT INTO profiles_professional (profile_id, qualification, college, income, work_with,others, company_name) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
        $db->prepare($sqlProf)->execute([
            $profile_id, $data['qualification'], $data['college'], $data['income'], 
            $data['work_details'],$data['others'], $data['company_name']
        ]);

        // 7. INITIAL PARTNER PREFERENCES (Setting "all" as default)
        $sqlPrefs = "INSERT INTO partner_preferences 
                    (profile_id, min_age, max_age, min_height, max_height, religions, communities, mother_tongues, marital_status, min_income, max_income, education, working_with, country, state, city) 
                    VALUES (?, 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all', 'all')";
        $db->prepare($sqlPrefs)->execute([$profile_id]);

        $db->commit();
        echo json_encode(["success" => true, "profile_id" => $profile_id, "userid" => $generatedUid]);
    }
} catch (Exception $e) {
        error_log("complete_profile Error: " . $e->getMessage()); 

    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>