<?php 
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed: Enforce POST signature rules."]);
    exit();
}

try {
   $token = AuthMiddleware::check();
    $db = Database::getInstance();
    
    // Debugging print_r to verify structure layout
    error_log("Full Token Data: " . print_r($token, true));

    // FIX: Check array keys using isset() instead of object properties
    if (!isset($token['role'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized: Authentication parameters missing."]);
        exit();
    }

    // Decode Raw POST Body Payload 
    $rawInput = file_get_contents("php://input");
    $requestData = json_decode($rawInput, true); 

    // Extract parameters safely...
    $input_church_id = isset($requestData['church_id']) ? trim($requestData['church_id']) : 'all';
    $status          = isset($requestData['status'])    ? trim($requestData['status'])    : 'all';
    $from_date       = (!empty($requestData['from_date'])) ? $requestData['from_date'] : null;
    $to_date         = (!empty($requestData['to_date']))   ? $requestData['to_date']   : null;
    $page            = isset($requestData['page'])  ? max(1, (int)$requestData['page'])  : 1;
    $limit           = isset($requestData['limit']) ? max(1, (int)$requestData['limit']) : 20;

    // 3. ROLE-BASED SEGREGATION LOGIC (ARRAY SYNTAX)
    $final_church_id = 'all';

    if ($token['role'] === 'super_admin' || $token['role'] === 'root_admin') {
        $final_church_id = $input_church_id;
    } elseif ($token['role'] === 'admin') {
        
        $churchQuery = $db->prepare("
            SELECT pb.church_id 
            FROM profiles_background pb 
            WHERE pb.profile_id = :profile_id 
            LIMIT 1
        ");
        // FIX: Using array syntax here as well
        $churchQuery->execute([':profile_id' => $token['profile_id']]); 
        $profileContext = $churchQuery->fetch(PDO::FETCH_ASSOC);

        if (!$profileContext || empty($profileContext['church_id'])) {
            http_response_code(403);
            echo json_encode([
                "success" => false, 
                "message" => "Access Denied: Your admin profile is not mapped to a church structure."
            ]);
            exit();
        }
        
        $final_church_id = $profileContext['church_id'];
    } else {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden: Insufficient privileges."]);
        exit();
    }

    // Logging tracking with updated array selectors
    error_log(sprintf(
        "Ledger Execution Trace | Role: %s | Profile: %s | Target Church: %s",
        $token['role'],
        $token['profile_id'] ?? 'N/A',
        $final_church_id
    ));

    // 4. Stored Procedure Dynamic Calls Routing
    $stmt = $db->prepare("CALL USP_GetFilteredPaymentHistory(:church_id, :from_date, :to_date, :status, :page, :limit)");
    
    $stmt->bindValue(':church_id', $final_church_id, PDO::PARAM_STR);
    $stmt->bindValue(':from_date', $from_date, $from_date === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':to_date', $to_date, $to_date === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    $stmt->bindValue(':page', $page, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    
    $stmt->execute();

    $meta = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_records = $meta ? (int)$meta['total_records'] : 0;
    $total_amount  = $meta ? (float)$meta['total_amount'] : 0.00; 

    $stmt->nextRowset();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "total_records" => $total_records,
        "total_amount"  => $total_amount, 
        "page" => $page,
        "limit" => $limit,
        "data" => $transactions
    ]);

} catch (Exception $e) {
    error_log("Ledger Pagination Endpoint Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An internal backend processing error occurred."]);
}
?>