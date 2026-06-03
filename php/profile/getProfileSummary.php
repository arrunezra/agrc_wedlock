<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    // 1. Auth Check
    $token = AuthMiddleware::check();
    $db = Database::getInstance();

    //error_log("Full Token Data: " . print_r($token, true));


   // 1. Get the raw input
    $input = json_decode(file_get_contents("php://input"), true);

    $role   = $input['role'] ?? 'member';
    $search = $input['search'] ?? '';
    $limit  = (int)($input['limit'] ?? 15);
    $page   = (int)($input['page'] ?? 1);
    $offset = ($page - 1) * $limit; // Page 1 = Offset 0
    error_log("Incoming Request: " . file_get_contents("php://input"));

    // 3. Execution
    $sql = "CALL USP_Profile_Summary(?, ?, ?, ?, @total)";
    $stmt = $db->prepare($sql);

    $stmt->execute([
        $role,    // p_user_role
        $search,  // p_search_query
        $limit,   // p_limit
        $offset  // p_offset
        
    ]);

    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    // 4. Retrieve Pagination Total
    $totalCount = $db->query("SELECT @total AS total")->fetchColumn();
    // 7. Return Response
    echo json_encode([
        "success" => true,
        "data" => $profiles,
        "pagination" => [
            "totalRecords" => (int)$totalCount,
            "totalPages" => ceil($totalCount / $limit),
            "currentPage" => $page,
            "limit" => $limit,
            "hasMore" => ($offset + $limit) < $totalCount
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}