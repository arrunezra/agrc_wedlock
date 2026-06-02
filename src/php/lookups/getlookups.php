<?php
require_once '../config/database.php';
require_once '../helpers/cammon.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
     $db = Database::getInstance(); 
    // Get parameters from URL
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $ids = isset($_GET['ids']) ? $_GET['ids'] : '1'; // Default or comma-separated string

    $data = [];
    $sql = "";

    if ($action === 'qualification') {
        // --- COMPLEX SECTIONED QUERY ---
        $sql = "SELECT * FROM (
                    SELECT 
                        LookupKey AS id, 
                        LookupValue AS label, 
                        LookupValue AS value,
                        LookupParentKey AS parent,
                        Description AS description,
                        'HEADER' AS type, 
                        LookupKey AS sort_group, 
                        1 AS sort_order
                    FROM t_tran_lookup 
                    WHERE LookupParentKey IS NULL AND LookupMasterID = 18 AND is_active = 1

                    UNION ALL

                    SELECT 
                        LookupKey AS value,  
                        LookupValue AS label,
                        LookupParentKey AS parent,
                        Description AS description,
                        'ITEM' AS type, 
                        LookupParentKey AS sort_group, 
                        2 AS sort_order
                    FROM t_tran_lookup 
                    WHERE LookupParentKey IS NOT NULL AND LookupMasterID  = 18 AND is_active = 1
                ) AS combined_data
                ORDER BY sort_group, sort_order, label";
    } else {
        // --- STANDARD FLAT QUERY (Country/State) ---
        // Note: We alias 'key' to 'id' and 'value' to 'label' to match your Dropdown props
        $sql = "SELECT 
                    t.LookupKey AS value, 
                    t.LookupValue AS label,  
                    t.LookupParentKey AS parent,
                    t.Description AS description,
                    'ITEM' AS type -- Countries are usually just items
                FROM t_mas_lookup m
                JOIN t_tran_lookup t ON m.LookupMasterID = t.LookupMasterID
                WHERE m.LookupMasterID IN ($ids) 
                  AND m.IsActive = 1  
                  AND t.is_active = 1
                ORDER BY m.LookupMasterID, t.LookupValue ASC";
    }

    $stmt = $db->prepare($sql);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "action" => $action,
        "data" => $results
    ]);

} catch (Exception $e) {
    error_log("Lookup Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "An internal server error occurred"
    ]);
}