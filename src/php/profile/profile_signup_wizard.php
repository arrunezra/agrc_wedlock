<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../config/database.php';
require_once '../helpers/cammon.php';

$db = Database::getInstance();
$data = json_decode(file_get_contents("php://input"), true);

$step = (int)($data['step'] ?? 1);
$phone = trim($data['phoneNumber'] ?? $data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = 'asdfghjkl'; // Placeholder as per your previous code

try {
    $db->beginTransaction(); 

    if ($step === 10) {
        // --- STEP 10: PROFESSIONAL DETAILS ---
        $targetUserId = $data['userid'];

        $sql = "INSERT INTO profiles_professional (userid, qualification, college, income, work_with, working_as, company_name) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                qualification=VALUES(qualification), college=VALUES(college), income=VALUES(income), company_name=VALUES(company_name)";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $targetUserId,
            $data['qualification'] ?? null, 
            $data['college'] ?? null, 
            $data['income'] ?? null, 
            $data['workWith'] ?? null, 
            $data['workingAs'] ?? null,
            $data['companyName'] ?? null
        ]);

    } else {
        // --- INITIAL REGISTRATION / PROGRESS (Steps 1-9) ---
        
        // Use existing userid if available, otherwise generate new
        $targetUserId = $data['userid'] ?? null;

        if (!$targetUserId) {
            // New Registration Logic
            if (empty($phone) || empty($password)) {
                throw new Exception("Phone and Password are required.");
            }

            // 1. Check if user exists
            $checkUser = $db->prepare("SELECT id FROM users WHERE phoneNumber = ? OR email = ?");
            $checkUser->execute([$phone, $email]);
            if ($checkUser->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["success" => false, "message" => "Account already exists."]);
                exit;
            }

            $targetUserId = generateFormattedUserID($db);
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // 2. Insert into Core Users
            $stmtUser = $db->prepare("INSERT INTO users (userid, phoneNumber, email, PasswordHash) VALUES (?, ?, ?, ?)");
            $stmtUser->execute([$targetUserId, $phone, $email, $hashedPassword]);

            // 3. Insert into Core Profiles
            $dob = ($data['dobYear'] ?? '1900') . "-" . ($data['dobMonth'] ?? '01') . "-" . ($data['dobDay'] ?? '01');
            $sqlProfile = "INSERT INTO profiles (userid, first_name, last_name, dob, gender, email, phone, country, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtProfile = $db->prepare($sqlProfile);
            $stmtProfile->execute([
                $targetUserId, $data['firstName'] ?? '', $data['lastName'] ?? '', $dob, 
                $data['gender'] ?? '', $email, $phone, $data['country'] ?? '', $data['city'] ?? '', $data['state'] ?? ''
            ]);
        }

        // 4. Handle Background/Religion Data (The screen we just built)
        if (isset($data['religion']) || isset($data['community'])) {
            $sqlBg = "INSERT INTO profiles_background (userid, religion, community, sub_community, mother_tongue, is_caste_no_bar) 
                      VALUES (?, ?, ?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE 
                      religion=VALUES(religion), community=VALUES(community), sub_community=VALUES(sub_community), mother_tongue=VALUES(mother_tongue), is_caste_no_bar=VALUES(is_caste_no_bar)";
            $stmtBg = $db->prepare($sqlBg);
            $stmtBg->execute([
                $targetUserId,
                $data['religion'] ?? null,
                $data['community'] ?? null,
                $data['subCommunity'] ?? null, // Note: camelCase from React matches SQL
                $data['motherTongue'] ?? null,
                isset($data['isCasteNoBar']) ? (int)$data['isCasteNoBar'] : 0
            ]);
        }
    }

    $db->commit();
    echo json_encode([
        "success" => true, 
        "message" => "Step $step completed", 
        "userid" => $targetUserId
    ]);

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>