<?php
require_once __DIR__ . '/../error_log_config.php'; 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../config/database.php';

$db = Database::getInstance();

$profile_id = $_GET['profile_id'] ?? '';
// Note: Search might not be needed if you are only fetching one user's preferences
$search = $_GET['search'] ?? '';

if (empty($profile_id)) {
    echo json_encode(["success" => false, "message" => "Profile ID is required", "data" => []]);
    exit;
}

try {
    $sql = "SELECT * FROM V_partner_preferences WHERE profile_id = :profile_id";
    $params = [':profile_id' => $profile_id];

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetch(PDO::FETCH_ASSOC); // Fetch one row since profile_id is unique

    if ($result) {
        // --- IMPORTANT: CONVERT STRINGS TO ARRAYS FOR FRONTEND BADGES ---
        $arrayFields = [
            'religions', 'communities', 'communitiesName', 
            'mother_tongues', 'mother_tonguesName', 
            'marital_status', 'marital_statusName', 
            'education', 'working_with', 'country', 'state', 'city'
        ];

        foreach ($arrayFields as $field) {
            if (isset($result[$field]) && !empty($result[$field])) {
                // Convert "Value1,Value2" into ["Value1", "Value2"]
                $result[$field] = explode(',', $result[$field]);
            } else {
                // Ensure it's an empty array if null/empty to prevent frontend .includes() crash
                $result[$field] = ['all'];
            }
        }

        echo json_encode([
            "success" => true,
            "message" => "Data retrieved successfully",
            "data" => $result
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "No preferences found", "data" => null]);
    }
    
} catch (PDOException $e) {
    error_log("get_partner_preferences Error: " . $e->getMessage()); 
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}