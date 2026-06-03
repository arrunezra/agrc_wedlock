<?php
header("Content-Type: application/json");
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

$pdo = Database::getInstance(); 
$input = json_decode(file_get_contents("php://input"), true);

// 1. Initial Validation
if (!isset($input['action']) || !isset($input['id'])) {
    echo json_encode(["success" => false, "message" => "Missing action or ID"]);
    exit;
}

$action = $input['action'];
$profileId = $input['id'];

// Data containers
$updates = [
    'profiles' => [],
    'profiles_family' => [],
    'profiles_physical' => [],
    'profiles_background' => [],
    'profiles_professional' => [] // Renamed from 'education' to match table
];

// 2. Map actions to specific tables and columns
switch ($action) {
    case 'aboutus':
        $updates['profiles_family'] = ['aboutus' => $input['aboutus']];
        break;

    case 'basicdetails':
        $updates['profiles'] = [
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'dob'        => $input['dob'],
            'gender'     => $input['gender']
        ];
        $updates['profiles_physical'] = [
            'height'      => $input['height'],
            'weight'      => $input['weight'],
            'blood_group' => $input['blood_group'], // Fixed typo from 'boold'
            'disability'  => $input['disability'],
            'health_info' => $input['health_info']
        ];
        $kidsDetailsJson = isset($input['kids_details']) ? json_encode($input['kids_details']) : '[]';
        $updates['profiles_family'] = [
            'marital_status' => $input['marital_status'],
            'has_children'   => $input['has_children'],
            'kids_details'   => $kidsDetailsJson,
			'children_count' => $input['children_count']
        ];
        break;

    case 'religion&community':
        $updates['profiles_background'] = [
            'religion'        => $input['religion'],
            'community'       => $input['community'],
            'sub_community'   => $input['sub_community'],
            'mother_tongue'   => $input['mother_tongue'],
            'is_caste_no_bar' => $input['is_caste_no_bar'] 
        ];
        break;

    case 'familydetails': 


        $updates['profiles_family'] = [
            'family_type'       => $input['family_type'],
            'father_occupation' => $input['father_occupation'],
            'mother_occupation' => $input['mother_occupation'], 
            'sister_count'      => $input['sister_count'],
            'brother_count'     => $input['brother_count'] 
        ];
        $updates['profiles'] = [
            'address' => $input['address'],
            'city'    => $input['city'],
            'state'   => $input['state'],
            'country' => $input['country']
        ];
        break;

    case 'education':
        $updates['profiles_professional'] = [
            'qualification' => $input['qualification'],
            'college'       => $input['college'],
            'work_with'     => $input['work_with'],
            'working_as'    => $input['working_as'],
            'company_name'  => $input['company_name'],
            'others'        => $input['others'],
            'income'        => $input['income']
        ];
        break;

    case 'location':
        $updates['profiles'] = [
            'address' => $input['address'],
            'city'    => $input['city'],
            'state'   => $input['state'],
            'country' => $input['country']
        ];
        break;
 case 'hobbies':
        $updates['familydetails'] = [
            'hobbies' => $input['hobbies'] 
        ];
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        exit;
}

// 3. Helper function for dynamic SQL
function updateTable($pdo, $tableName, $data, $id) {
    if (empty($data)) return;

    $fields = "";
    foreach ($data as $key => $value) {
        $fields .= "$key = :$key, ";
    }
    
    // Add updated_at if it's the main profile table
    if ($tableName === 'profiles') {
        $fields .= "updated_at = NOW(), ";
    }

    $fields = rtrim($fields, ", ");
    $sql = "UPDATE $tableName SET $fields WHERE profile_id = :profile_id_param";
    
    $stmt = $pdo->prepare($sql);
    $data['profile_id_param'] = $id; // Unique param name to avoid conflicts
    $stmt->execute($data);
}

// 4. Execution
try {
    $pdo->beginTransaction();

    $hasUpdates = false;
    foreach ($updates as $table => $data) {
        if (!empty($data)) {
            updateTable($pdo, $table, $data, $profileId);
            $hasUpdates = true;
        }
    }

    if (!$hasUpdates) throw new Exception("No data provided for update.");

    $pdo->commit();

    echo json_encode([
        "success" => true, 
        "message" => "Profile updated successfully",
        "action" => $action
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log("Update Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
}
?>