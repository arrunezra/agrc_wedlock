<?php
require_once '../helpers/AuthMiddleware.php'; 
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php';  
require_once '../config/config.php';

try {
        $token = AuthMiddleware::check();
        $tRole = $token->role ?? $token['role'];
        $tprofile_id = $token->profile_id ?? $token['profile_id'];

        $db = Database::getInstance();
    
        // 1. Validate Input
        $id = $_GET['id'];  
        $action = $_GET['action'] ?? 'view'; 
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid or missing Profile ID"]);
            error_log("Invalid or missing Profile ID");

            exit;
        }

        
        $sql = "SELECT 
                    p.profile_id
                    ,p.userid
                    ,p.first_name
                    ,p.last_name
                    ,p.full_name
                    ,p.dob
                    ,p.age
                    ,p.gender
                    ,p.email
                    ,p.phone
                    ,p.address
                    ,p.city
                    ,p.city_name
                    ,p.state
                    ,p.state_name
                    ,p.country
                    ,p.updated_at
                    ,p.country_name
                    ,p.religion
                    ,p.religion_name
                    ,p.community
                    ,p.community_name
                    ,p.sub_community
                    ,p.sub_community_name
                    ,p.mother_tongue
                    ,p.mother_tongues_name
                    ,p.is_caste_no_bar
                    ,p.marital_status
                    ,p.marital_status_name
                    ,p.family_type
                    ,p.father_occupation
                    ,p.father_occupation_name
                    ,p.mother_occupation
                    ,p.mother_occupation_name
                    ,p.noof_sibling
                    ,p.sister_count
                    ,p.kids_details
                    ,p.brother_count
                    ,p.has_children
                    ,p.children_count
                    ,p.aboutus
                    ,p.hobbies
                    ,p.hobbies_name
                    ,p.height
                    ,p.weight
                    ,p.blood_group
                    ,p.qualification
                    ,p.qualification_name
                    ,p.college
                    ,p.income
                    ,p.income_name
                    ,p.work_with
                    ,p.work_with_name
                    ,p.working_as
                    ,p.company_name
                    ,p.others
                    ,p.file_name
                    ,p.IsActive
                    ,p.IsVerified
                    ,p.disability
                    ,p.has_active_subscription
                    ,p.last_payment_date 
                    ,IF(l.id IS NULL, 0, 1) AS is_liked_by_me  
                FROM 
                    V_Profile p
                LEFT JOIN profile_likes l ON l.profile_id = p.profile_id AND l.sender_id = :profile_id  

			    WHERE 
                    p.profile_id =   :sender_id
			    LIMIT 1"; 

        $stmt = $db->prepare($sql);
        $stmt->execute([
            'profile_id' => $tprofile_id ,
            'sender_id' => $id 
        ]);
        
        // 3. Use fetch() for a single record
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        // 1. Determine the WHERE clause based on the role
        $profileWhere = "";
        if ($tRole === "member") {
            // Members only see Approved (1) or Rejected (3) photos
            // Note: Usually members shouldn't see Rejected photos, 
            // but I kept '3' based on your logic.
            if($tprofile_id == $id){
                $profileWhere = "profile_id = :id";

            }else 
            $profileWhere = "profile_id = :id AND is_verified IN (1, 3)";
        } else {
            // Staff/Admins see everything (Pending, Approved, Rejected)
            $profileWhere = "profile_id = :id";
        }

        // 2. Build the SQL string using PHP double quotes
        $statsSql = "SELECT file_id, profile_id, file_name, is_profile_pic, is_verified, created_at 
                    FROM profile_files 
                    WHERE $profileWhere"; 

        // 3. Prepare and Execute
        $statsStmt = $db->prepare($statsSql); 
        $statsStmt->execute(['id' => $id]);

        // 4. Fetch all results
        $images = $statsStmt->fetchAll(PDO::FETCH_ASSOC);
		$amount = Config::get('subscription_amount');

        if ($profile) {
            echo json_encode([
                "success" => true,
                "data" => $profile,
                "images" => $images,
                "subscription_amount" => $amount
            ]);
        } else {
            http_response_code(404);
                error_log("Profile not found");

            echo json_encode([
                "success" => false, 
                "message" => "Profile not found"
            ]);
        }

    } catch (Exception $e) {
        // 4. Log the actual error internally, but show a clean message to the user
        error_log($e->getMessage());
        http_response_code(500);
        
        echo json_encode([
            "success" => false, 
            "message" => "An internal server error occurred"
        ]);
}