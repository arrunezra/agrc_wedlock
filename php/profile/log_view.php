 
<?php
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    // 1. Authenticate the user
    $token = AuthMiddleware::check();
    $db = Database::getInstance();
    
    // 2. Get Input Data
    $data = json_decode(file_get_contents("php://input"), true);
    $viewer_id = $token->profile_id ?? $token['profile_id']; 
    $viewed_id = $data['viewed_profile_id'] ?? ''; // The person being looked at

    // 3. Validation
    if (empty($viewed_id)) {
        throw new Exception("Profile ID is missing.");
    }

    if ($viewer_id === $viewed_id) {
        // Don't log if a user views their own profile
        echo json_encode(["success" => true, "message" => "Self-view ignored"]);
        exit;
    }

    /**
     * 4. UPSERT LOGIC
     * If the pair (viewer_id, viewed_profile_id) doesn't exist, it INSERTS.
     * If it DOES exist, it UPDATES 'viewed_at' ONLY if the last view was 
     * more than 24 hours ago.
     */
    $sql = "INSERT INTO profiles_views (viewer_id, viewed_profile_id, viewed_at)
            VALUES (:viewer, :viewed, NOW())
            ON DUPLICATE KEY UPDATE 
            viewed_at = IF(viewed_at < NOW() - INTERVAL 1 DAY, NOW(), viewed_at)";

    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':viewer' => $viewer_id,
        ':viewed' => $viewed_id
    ]);

    echo json_encode([
        "success" => true, 
        "message" => "View logged successfully"
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());

    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}