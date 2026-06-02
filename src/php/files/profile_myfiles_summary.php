<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php';  

try {

    $db = Database::getInstance();
    $token = AuthMiddleware::check();
    // Read JSON input body
    $input = json_decode(file_get_contents('php://input'), true);
    $profile_id = $token->profile_id ?? $token['profile_id'] ?? $token[0] ?? null;

    $search = $input['search'] ?? '';
    $limit  = isset($input['limit']) ? (int)$input['limit'] : 10;
    $page   = isset($input['page']) ? (int)$input['page'] : 1;
    $offset = ($page - 1) * $limit;

    $action = $input['action'] ?? '';
 
    if($action == "staff_doc"){
        $profile_id = $input['profile_id'] ?? $profile_id;
    }
    if (!$profile_id) {
        echo json_encode(["success" => false, "message" => "Profile id is required"]);
        exit;
    }

	
	// We add a search condition to the SQL for server-side filtering
    $searchQuery = "%$search%";
 
	// Total count for pagination
    $countStmt = $db->prepare("SELECT
								 	COUNT(*) FROM profiles_docs 
							  	WHERE profile_id = ?  AND original_name LIKE ?");
    $countStmt->execute([$profile_id, $searchQuery]);
    $totalFiles = $countStmt->fetchColumn();

    // Fetch paginated slice
    $stmt = $db->prepare("SELECT 
								file_id, file_id, file_name,
								original_name, extension,
								file_size, created_at, mime_type  
							FROM profiles_docs 
							WHERE  
                                original_name LIKE ?
                                AND profile_id = ?
							ORDER BY created_at DESC
							LIMIT ? OFFSET ?");
    $stmt->execute([$searchQuery,$profile_id, $limit, $offset]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "files" => $files,
        "total" => (int)$totalFiles,
        "hasMore" => ($offset + $limit) < $totalFiles
    ]); 
} catch (Exception $e) {
	 error_log("Action Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}