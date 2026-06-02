<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 
require_once '../config/config.php';


try {
	// Test if logging works immediately 
	$token = AuthMiddleware::check();
	//error_log("Full Token Data: " . print_r($token, true));
	
	$tRole = $token->role ?? $token['role'];
	$tprofile_id = $token->profile_id ?? $token['profile_id'];
	$gender = $token->gender ?? $token['gender'];

	$db = Database::getInstance();

	// Get POST data
	$input = json_decode(file_get_contents("php://input"), true);

	$limit = 10;
	$page = isset($input['page']) ? (int)$input['page'] : 1;
	$offset = ($page - 1) * $limit;

    $whereClauses[] = "p.profile_id != ?";
    $params[] = $tprofile_id;

    // 1. Gender Filter
    if (!empty($gender)) {
        $whereClauses[] = "p.gender != ?";
        $params[] = $gender;
    }
     

    // 2. Member Restrictions
    if (!empty($tRole) && $tRole == 'member') { 
                    $whereClauses[] = "p.IsVerified = 1 
                                        AND p.IsActive = 1 
                                        AND p.is_visible = 1  ";
                                        $whereClauses[] = "p.profile_id NOT IN (
        SELECT blocked_id 
        FROM profiles_blocks 
        WHERE blocker_id = ?
    )";
    $params[] = $tprofile_id;
                    
    }
    // 2. Marital Status Filter
    if (!empty($input['marital_status'])) {
        $whereClauses[] = "p.marital_status = ?";
        $params[] = $input['marital_status'];
    }

    // 3. Annual Income Filter (Assuming simple "Greater than or equal to")
    if (!empty($input['annual_income'])) {
        $whereClauses[] = "p.annual_income >= ?";
        $params[] = $input['annual_income'];
    }

    // 4. Age Filter (Calculated from DOB)
    if (!empty($input['min_age']) && !empty($input['max_age'])) {
        $whereClauses[] = "TIMESTAMPDIFF(YEAR, STR_TO_DATE(p.dob, '%d-%m-%Y'), CURDATE())  BETWEEN ? AND ?";
        $params[] = (int)$input['min_age'];
        $params[] = (int)$input['max_age'];
    }
     
    $whereSql = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";
   
   
   
    // Get total count for pagination metadata
    $countStmt = $db->prepare("SELECT COUNT(*) FROM V_Profile p $whereSql");
    $countStmt->execute($params);
    $totalRows = $countStmt->fetchColumn();
    $totalPages = ceil($totalRows / $limit);

    // Fetch paginated and filtered data
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
                ,p.city
                ,p.city_name
                ,p.state
                ,p.state_name
                ,p.country
                ,p.updated_at
                ,p.country_name
                ,p.religion
                ,p.community
                ,p.sub_community
                ,p.mother_tongue
                ,p.mother_tongues_name
                ,p.marital_status
                ,p.marital_status_name
                ,p.family_type
                ,p.father_occupation
                ,p.mother_occupation
                ,p.noof_sibling
                ,p.sister_count
                ,p.kids_details
                ,p.brother_count
                ,p.has_children
                ,p.children_count
                ,p.aboutus
                ,p.hobbies
                ,p.height
                ,p.disability
                ,p.weight
                ,p.blood_group
                ,p.qualification
                ,p.income
                ,p.work_with
				,p.work_with_name
                ,p.company_name
				,p.file_name 
                ,p.IsActive
                ,p.IsVerified
				,p.is_caste_no_bar
				,p.sub_community_name
				,p.religion_name

                ,i_sent.status AS sent_status
            	,i_received.status AS received_status
				
				,IF(l.id IS NULL, 0, 1) AS is_liked_by_me  
            FROM V_Profile p
            -- JOIN 1: Did I send them a request?
            LEFT JOIN profiles_interests i_sent ON i_sent.receiver_id = p.profile_id AND i_sent.sender_id = ?
            -- JOIN 2: Did they send me a request?
            LEFT JOIN profiles_interests i_received ON i_received.sender_id = p.profile_id AND i_received.receiver_id = ?
			LEFT JOIN profile_likes l ON l.profile_id = p.profile_id AND l.sender_id = ? 
              $whereSql   
            ORDER BY p.updated_at DESC 
            LIMIT $limit OFFSET $offset";
	
	 //error_log("SQL Query: " . $sql);
	 //error_log("Params: " . print_r($params, true));

    // Add your ID twice at the beginning for the two JOIN placeholders
	array_unshift($params, $tprofile_id, $tprofile_id, $tprofile_id);
	$stmt = $db->prepare($sql);
    $stmt->execute($params);
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC); 

    // Fetch the subscription status and the date
    $stmt_sub = $db->prepare("SELECT has_active_subscription, last_payment_date FROM profiles WHERE profile_id = ?");
    $stmt_sub->execute([$tprofile_id]);
    $subDetails = $stmt_sub->fetch(PDO::FETCH_ASSOC);

    $is_valid = false;
    if ($subDetails && $subDetails['has_active_subscription'] == 1) {
        // Don't delete the code
        // // 2026 Logic: Check if the payment was made in the last 30 days
        // $last_pay = new DateTime($subDetails['last_payment_date']);
        // $now = new DateTime();
        // $interval = $last_pay->diff($now);
        
        // // If the difference is less than 30 days, it's still valid
        // if ($interval->days <= 30) {
        //     $is_valid = true;
        // } else {
        //     // OPTIONAL: Automatically expire it in the DB if it's too old
        //     $update = $db->prepare("UPDATE profile SET has_active_subscription = 0 WHERE profile_id = ?");
        //     $update->execute([$profile_id]);
        //     $is_valid = false;
        // }
        $is_valid = true;
    }
        $subscription_amount = Config::get('subscription_amount');

    // Check if the array is empty
    if (empty($profiles)) {
        echo json_encode([
            "success" => false, // Set to false to trigger error handling on frontend
            "message" => "Record not found",
            "data" => [],
            "totalPages" => 0,
            "currentPage" => $page,
            "is_subscribed" => $is_valid,
            "subscription_amount" => $subscription_amount
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "data" => $profiles,
            "totalPages" => $totalPages,
            "currentPage" => $page,
            "is_subscribed" => $is_valid,
            "subscription_amount" => $subscription_amount

        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
	error_log($e->getMessage());

    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

?>