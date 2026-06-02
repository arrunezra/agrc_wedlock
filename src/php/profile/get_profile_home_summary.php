<?php
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php';
require_once '../config/config.php'; 

try {
    $token = AuthMiddleware::check();
    $db = Database::getInstance();
    $user = json_decode(file_get_contents("php://input"), true);

    // Secure call parameters 
    $profile_id = $user['profile_id'] ?? '';
    $mode       = $user['role'] ?? 'Profile'; 
    $view_mode  = $user['view_mode'] ?? 'COUNT';
    $filter_by  = strtolower($user['filter_by'] ?? '');

    $limit_val  = isset($user['limit'])  ? (int)$user['limit']  : 20;
    $offset_val = isset($user['offset']) ? (int)$user['offset'] : 0;

    // 1. Call the Stored Procedure
    $stmt = $db->prepare("CALL GetProfileDashboardSummary(?, ?, ?, ?, ?, ?)");
    $stmt->execute([$profile_id, $mode, $view_mode, $filter_by, $limit_val, $offset_val]);
    
    if ($view_mode == 'COUNT') {
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        // FIX 3: Close the SP rowset buffer immediately here! 
        // This frees up the PDO database line so it can safely execute a new SELECT query next.
        $stmt->nextRowset();
        $stmt->closeCursor();

        // FIX 1: Changed typo $tprofile_id to the actual $profile_id variable
        $stmt_sub = $db->prepare("SELECT has_active_subscription, last_payment_date FROM profiles WHERE profile_id = ?");
        $stmt_sub->execute([$profile_id]);
        $subDetails = $stmt_sub->fetch(PDO::FETCH_ASSOC);
        $stmt_sub->closeCursor();

        $is_valid = false;
        if ($subDetails && (int)($subDetails['has_active_subscription'] ?? 0) === 1) { 
            $is_valid = true;
        }

        // FIX 2: Added a safe fallback variable check in case your Config class fails to mount
        $subscription_amount = class_exists('Config') ? Config::get('subscription_amount') : 499;

        echo json_encode([
            "success" => true,
            "mode_accessed" => $mode,
            "filter_applied" => $filter_by,
            "subscription_amount" => $subscription_amount,
            "is_subscribed" => $is_valid,
            "summary" => [
                "requests" => (int)($summary['requests_count'] ?? 0),
                "accepted" => (int)($summary['accepted_count'] ?? 0),
                "likes"    => (int)($summary['likes_count'] ?? 0),
                "views"    => (int)($summary['views_count'] ?? 0)
            ]
        ]);
    } else {
        $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Free connection for this branch too
        $stmt->nextRowset();
        $stmt->closeCursor();

        echo json_encode([
            "success" => true,
            "mode_accessed" => $mode,
            "summary" => [
                "type" => $view_mode,
                "filter" => $filter_by,
                "items" => $summary ? $summary : []
            ]
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    // This logs the precise file and line number that broke to your server log dashboard
    error_log("Dashboard Processing Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    
    echo json_encode([
        "success" => false, 
        "error" => "Internal Server Error",
        "debug_message" => $e->getMessage() // Temporary string: remove this specific key when pushing to live production app stores
    ]);
}