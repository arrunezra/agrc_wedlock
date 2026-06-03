<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    $token = AuthMiddleware::check();
    $db = Database::getInstance();
    
    // 1. ALWAYS YOU (The logged-in user)
    $my_id = $token->profile_id ?? $token['profile_id'];
    //error_log("Full Token Data: " . print_r([$new_status, $target_id, $my_id], true));


 
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    $response = array();

    if ($action == 'get_churches') {
    
            // Using the aliases you requested for compatibility with your frontend dropdown
            $query = "SELECT 
                        id, 
                        church_id, 
                        church_id AS value, 
                        church_name, 
                        church_name AS label, 
                        denomination, 
                        address, 
                        city, 
                        pastor_name 
                    FROM church_details 
                    WHERE active_status = 'active' 
                    ORDER BY church_name ASC";

            $stmt = $db->prepare($query);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $churches = array();
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $churches[] = $row;
                }
                $response['success'] = true;
                $response['churches'] = $churches;
            } else {
                $response['success'] = false;
                $response['message'] = "No active churches found.";
            }
        
    } else {
        $response['success'] = false;
        $response['message'] = "Invalid action.";
    }

    echo json_encode($response);
    
} catch (Exception $e) {
   
    error_log("Action Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>