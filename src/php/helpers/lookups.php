<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../config/database.php';
require_once '../config/config.php';

try {
    $db = Database::getInstance();

    // 1: Religion, 2: Community, 3. Mother Tongue, 4: Income Range, 5: Country, 6: State, 7: Marital Status, 8: Employment Sector, 
    // 9: Hobbies, 10: Designation, 11: City, 12: Role, 13:sub community, 14: Occupation, 15: Siblings, 16: Financial Status, 17: Financial Details
    $target_masters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    $ids = implode(',', $target_masters);

    $sql = "SELECT 
                m.LookupMasterName, 
                t.LookupKey as 'key', 
                t.LookupValue as 'value', 
                t.LookupParentKey as 'parent',
				t.Description as 'description'
            FROM t_mas_lookup m
            JOIN t_tran_lookup t ON m.LookupMasterID = t.LookupMasterID
            WHERE m.LookupMasterID IN ($ids) AND m.IsActive = 1  AND t.is_active = 1
            ORDER BY m.LookupMasterID, t.LookupValue ASC";

    $stmt = $db->query($sql);
    $bulkData = [ 
		"religion" => [], 
		"community" => [],
        "mother_tongue" => [], 
		"income_range" => [], 
		"country" => [],
		"state" => [],
		"marital_status" => [], 
		"employment_sector" => [], 
		"hobbies" => [],
		"designation" => [],
        "city" => [] ,
		"role" => [],
		"sub_community" => [] ,
		"occupation" => [],
		"siblings" => [],
		"financial_status" => [],
		"financial_details" => []
    ];

    // Correct PDO fetch method
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $category = strtolower(str_replace(' ', '_', $row['LookupMasterName']));
        
        // Ensure we only push to keys defined in our bulkData array
        if (array_key_exists($category, $bulkData)) {
            $bulkData[$category][] = [
                'label' => $row['value'],
                'value' => $row['key'],
                'parent' => $row['parent'],
				'description' => $row['description']
            ];
        }
    }
    $appName = Config::get('DisplayName');
    $appVersion = Config::get('app_version');
    
    echo json_encode([
        "success" => true
        ,"data" => $bulkData
        ,"appName" => $appName
        ,"appVersion" => $appVersion
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}