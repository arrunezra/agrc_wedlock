<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../config/database.php';

try {
    $db = Database::getInstance();

    // 1. Get Counts
    $statsSql = "SELECT 
                    SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active_count,
                    SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive_count,
                    SUM(CASE WHEN IsVerified = 1 THEN 1 ELSE 0 END) as verified_count,
                    SUM(CASE WHEN IsVerified = 0 THEN 1 ELSE 0 END) as unverified_count,
                    COUNT(*) as total_count
                 FROM users where role = 'member'";
    $statsStmt = $db->query($statsSql);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // 2. Get Last 10 Records
    $recentSql = "SELECT 
						 profile_id
                        ,userid
                        ,first_name
                        ,last_name
                        ,full_name
                        ,dob
                        ,age
                        ,gender
                        ,email
                        ,phone
                        ,address
                        ,city
                        ,city_name
                        ,state
                        ,state_name
                        
                        ,country_name
                        
                        ,marital_status
                        ,marital_status_name
                         
                        ,others
                        ,file_name
                        ,IsActive
                        ,IsVerified
                    
                FROM
					V_Profile
				ORDER BY updated_at DESC 
				LIMIT 10";
    $recentStmt = $db->query($recentSql);
    $recent = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
       "data" => [
        "summary" => $stats,
        "profile" => $recent
    ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}