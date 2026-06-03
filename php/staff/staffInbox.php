<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';

require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    $db = Database::getInstance();
    // Test if logging works immediately 
	$token = AuthMiddleware::check();

	//error_log("Full Token Data: " . print_r($token, true));
    $input = json_decode(file_get_contents("php://input"), true);
    $search  = !empty($input['search']) ? trim($input['search']) : null;
    $action  = !empty($input['action']) ? trim($input['action']) : null;

    $limit = 50;
	$page =  $input['page']? (int)$input['page'] : 1;
	$offset = $page * $limit;
    //error_log(" page: " . print_r($page, true));
	//error_log("offset: " . print_r($offset, true));
    if($action == "staff-inbox"){
    // 1. Get Counts
        $stmt = $db->prepare("CALL USP_Staff_GetPendingFileVerificationSummary(?, ?, ?)");

        $stmt->execute([
            $search ?: '', // Use empty string if null
            $page, 
            $offset
        ]);
        // 1. Get the Global Count
        $globalCount = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. Move to the next result set (The Profiles)
        $stmt->nextRowset();
        $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Send to React Native
        echo json_encode([
            "success" => true,
            "summaryCount" => $globalCount,
            "data" => $profiles,
            
        ]);
    }else if($action == "staff-doc"){
         $stmt = $db->prepare("CALL USP_Staff_GetDocSummary(?, ?, ?)");

        $stmt->execute([
            $search ?: '', // Use empty string if null
            $page, 
            $offset
        ]);  
        // 1. Get the Global Count
        $globalCount = $stmt->fetch(PDO::FETCH_ASSOC);

        // 2. Move to the next result set (The Profiles)
        $stmt->nextRowset();
        
        $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC); 
        // 3. Send to React Native
        echo json_encode([
            "success" => true,
            "data" => $profiles,
            
        ]);
    }else{
         echo json_encode([
            "success" => false,
            "data" => [],
            "message" =>"Action is missing"
            
        ]);
    }
    

   

} catch (PDOException $e) {
     error_log('staffInbox' . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}