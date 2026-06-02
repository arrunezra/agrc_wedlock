<?php
header("Content-Type: application/json");
//require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php'; 
require_once '../helpers/cammon.php';
require_once __DIR__ . '/../error_log_config.php';

//AuthMiddleware::check();

try {
	$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            handleGetRequest($db);
            break;
        case 'POST':
            handlePostRequest($db);
            break;
        case 'PUT':
            handlePutRequest($db);
            break;
        case 'DELETE':
            handleDeleteRequest($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Method not allowed"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

function handleGetRequest($db) {

    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'details':
            fetchSingleStaff($db);
            break;
         case 'byid':
            fetchSingleStaffById($db);
            break;
        case 'list':
        default:
            fetchStaffList($db);
            break;
    } 
}

function handlePostRequest($db) {


    $input = json_decode(file_get_contents("php://input"), true);
    $action = isset($input['action']) ? $input['action'] : 'add';

    // --- CASE 1: PAGINATED FETCH ---
   if ($action === 'fetch') {
        // Prepare inputs (Ensure they are null if empty so the SP works correctly)
        $searchTerm  = !empty($input['search']) ? trim($input['search']) : null;
        $status      = !empty($input['activeStatus']) ? $input['activeStatus'] : null;
        $designation = !empty($input['designation']) ? $input['designation'] : null;
        
        $page   = isset($input['page']) ? (int)$input['page'] : 1;
        $limit  = isset($input['limit']) ? (int)$input['limit'] : 10;
        $offset = ($page - 1) * $limit;

            try {
                    // 1. Call the Stored Procedure
                    // Parameters match: p_search_term, p_status, p_designation, p_limit, p_offset
                    $stmt = $db->prepare("CALL USP_Staff_Summary(?, ?, ?, ?, ?)");
                    $stmt->execute([$searchTerm, $status, $designation, $limit, $offset]);

                    // 2. Get RESULT SET 1 (Total Count)
                    $countRow = $stmt->fetch(PDO::FETCH_ASSOC);
                    $totalRecords = (int)$countRow['total_records'];

                    // 3. Move to RESULT SET 2 (Staff Data)
                    $stmt->nextRowset();
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // 4. Return unified JSON response
                    echo json_encode([
                        "success" => true,
                        "data" => $data,
                        "pagination" => [
                            "total_records" => $totalRecords,
                            "total_pages" => ceil($totalRecords / $limit),
                            "current_page" => $page
                        ]
                        ]);
            } catch (PDOException $e) {
                  error_log("complete_profile Error: " . $e->getMessage()); 

                echo json_encode([
                    "success" => false,
                    "message" => "Database error: " . $e->getMessage()
                ]);
            }
            return;
    }
   
    // --- STAFF INSERTION WITH PRE-CHECK ---
    try {
            // 1. First, check if the mobile number already exists in staff_details
            $checkMobile = $db->prepare("SELECT id FROM staff_details WHERE mobileNo = ?");
            $checkMobile->execute([trim($input['mobileNo'])]);

            if ($checkMobile->rowCount() > 0) {
                http_response_code(409); // Conflict
            echo json_encode([
                "success" => false, 
                "message" => "This mobile number is already registered to a staff member."
            ]);
            return;
            }
  
        // 2. Proceed with checking the 'users' table (Auth table)
        $checkUser = $db->prepare("SELECT id FROM users WHERE phoneNumber = ? OR email = ?");
        $checkUser->execute([trim($input['mobileNo']), trim($input['email'])]);

        if ($checkUser->rowCount() > 0) {
            http_response_code(409);
            echo json_encode([
                "success" => false, 
                "message" => "A user account with this mobile or email already exists."
            ]);
            return;
        }

        // 3. Start Transaction (since we are inserting into two tables)
    
            $db->beginTransaction();
			
            // Generate Staff ID
            $churchCode = getChurchCode($db, $input['church_Id']);

            $staffId = generateStaffId($db, $churchCode);
		
            $userid = generateFormattedID($db, 'users', 'userid','RCST');
							
			//$hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

            $hashedPassword = password_hash($input['asdfghjkl'], PASSWORD_DEFAULT);
	
            // 4. Insert into 'users' for Login
            $stmtUser = $db->prepare("INSERT INTO users (userid, phoneNumber, email, PasswordHash, role) VALUES (?, ?, ?, ?, ?)");
            $stmtUser->execute([
                $userid, 
                trim($input['mobileNo']), 
                trim($input['email']), 
                $hashedPassword, 
                $input['role'] ?? 'staff'
            ]);

            // 5. Insert into 'staff_details' for Profile
            $sqlStaff = "INSERT INTO staff_details 
                        (staff_id,userid, firstName, lastName,   designation, 
                        church_Id, mobileNo, alrenativeMobileNo, address, activeStatus,state,city,joiningDate) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmtStaff = $db->prepare($sqlStaff);
            $stmtStaff->execute([
                $staffId,
                $userid,
                trim($input['firstName']),
                trim($input['lastName']), 
                $input['designation'] ?? null,
                $input['church_id'],
                trim($input['mobileNo']),
                $input['altMobileNo'] ?? null,
                $input['address'] ?? null,
                $input['activeStatus'] ?? 'Active',
                $input['state'] ?? null,
                $input['city'] ?? null,
                $input['joiningDate'] ?? null,
            ]);

            $db->commit();
            echo json_encode(["success" => true, "message" => "Staff created successfully", "staff_id" => $staffId]);
            exit;

        } catch (Exception $e) {
			
              error_log("complete_profile Error: " . $e->getMessage()); 

            $db->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Transaction failed: " . $e->getMessage()]);
        }
}

function handlePutRequest($db) {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = isset($input['id']) ? (int)$input['id'] : null;
    $userid = isset($input['userid']) ? $input['userid'] : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid staff ID is required"]);
        return;
    }

    try {
        // Start Transaction - Crucial for dual-table updates
        $db->beginTransaction();

        // 1. Check if staff exists and get their user_id (assuming they are linked)
        // If staff_details.id and users.id are the same, use $id. 
        // If staff_details has a user_id column, fetch that instead.
        $checkStmt = $db->prepare("SELECT id FROM staff_details WHERE id = ?");
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Staff not found"]);
            return;
        }

        $mobile = trim($input['mobileNo'] ?? '');
        $email = trim($input['email'] ?? '');

        // 2. Validate Mobile/Email uniqueness (EXCLUDING current user)
        // We add "AND id != ?" so it doesn't conflict with its own current record
        $checkMobile = $db->prepare("SELECT id FROM staff_details WHERE mobileNo = ? AND id != ?");
        $checkMobile->execute([$mobile, $id]);
        if ($checkMobile->fetch()) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Mobile number is already used by another staff member."]);
            return;
        }

        $checkUser = $db->prepare("SELECT id FROM users WHERE (phoneNumber = ? OR email = ?) AND userid != ?");
        $checkUser->execute([$mobile, $email, $userid]);
        if ($checkUser->fetch()) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "User account with this mobile/email already exists."]);
            return;
        }

        // 3. Update 'users' table (Fixed trailing comma in your SQL)
        $usersql = "UPDATE users SET 
                    email = ?,            
                    phoneNumber = ?,  
                    role = ?,
                    updatedAt = CURRENT_TIMESTAMP 
                    WHERE id = ?";
        $db->prepare($usersql)->execute([
            $email,
            $mobile, 
            $input['role'] ?? null,
            $id
        ]); 

        // 4. Update 'staff_details' table
        $staffSql = "UPDATE staff_details SET 
                    firstName = ?, 
                    lastName = ?,   
                    mobileNo = ?, 
                    alrenativeMobileNo = ?,
                    joiningDate = ?,
                    address = ?,  
                    state = ?,  
                    city = ?,  
                    designation = ?, 
                    church_id = ?, 
                    activeStatus = ?, 
                    updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";
        
        $db->prepare($staffSql)->execute([
            trim($input['firstName'] ?? ''),
            trim($input['lastName'] ?? ''), 
            $mobile,
            $input['altMobileNo'] ?? null,
            $input['address'] ?? null,
            $input['state'] ?? null,
            $input['city'] ?? null,
            $input['designation'] ?? null,
            $input['church_id'] ?? null,
            $input['activeStatus'] ?? 'Active', 
            $id,
            $input['joiningDate'] ?? null,
        ]);

        // Commit changes
        $db->commit();

        echo json_encode(["success" => true, "message" => "Staff updated successfully"]);

    } catch (Exception $e) {
        $db->rollBack(); // Undo everything if something goes wrong
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
}

function handleDeleteRequest($db) {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input['id']) || !is_numeric($input['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid staff ID is required"]);
        return;
    }
    
    // Soft delete (recommended)
    $sql = "UPDATE staff_details SET activeStatus = 'Inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    
    // Or hard delete (uncomment if needed)
    // $sql = "DELETE FROM staff_details WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $success = $stmt->execute([$input['id']]);
    
    if ($success && $stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Staff deleted successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Staff not found or already deleted"]);
    }
}

 function generateStaffId($db, $churchCode = 'STF') {
    $year = date('Y');
    // Ensure church code is uppercase and clean
    $cleanPrefix = strtoupper(trim($churchCode)) . '-' . $year . '-';
    
    // 1. Find the highest current ID for this prefix
    $stmt = $db->prepare("SELECT staff_id FROM staff_details 
                          WHERE staff_id LIKE ? 
                          ORDER BY staff_id DESC LIMIT 1");
    
    // We search for anything starting with CHURCHCODE-2026-
    $stmt->execute([$cleanPrefix . '%']);
    $lastId = $stmt->fetchColumn();
    
    if ($lastId) {
        // 2. Extract the number after the last hyphen
        // Using strrchr or explode is safer if the prefix length varies
        $parts = explode('-', $lastId);
        $lastNumber = intval(end($parts)); 
        
        // 3. Increment and pad with zeros (e.g., 1 -> 002)
        $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
    } else {
        // 4. If no records exist for this year/church, start at 001
        $newNumber = '001';
    }
    
    return $cleanPrefix . $newNumber;
}

function getChurchCode($db, $churchId) {
    // Get church code from churches table
    $stmt = $db->prepare("SELECT church_id FROM church_details WHERE id = ?");
    $stmt->execute([$churchId]);
    $churchCode = $stmt->fetchColumn();
    
    return $churchCode ?: 'AGRC'; // Default to STF if no church code
}
//For information view
function fetchSingleStaff($db) {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "id is required"]);
        return;
    }

    $sql = "SELECT 
        s.firstName,
        s.lastName,
        ds.LookupValue AS designation,
        s.mobileNo,
        s.alrenativeMobileNo AS altMobileNo,
        s.address,
        s.activeStatus,
        s.updated_at,
        c.church_name, 
        c.pastor_name, 
        c.address AS church_address,
        st.LookupValue AS state_name, 
        ct.LookupValue AS city_name 
    FROM staff_details s
    LEFT JOIN church_details c ON s.church_id = c.church_id
    LEFT JOIN t_tran_lookup st ON c.state = st.LookupKey AND st.LookupMasterID = 6
    LEFT JOIN t_tran_lookup ct ON c.city = ct.LookupKey AND ct.LookupMasterID = 11
    LEFT JOIN t_tran_lookup ds ON s.designation = ds.LookupKey AND ds.LookupMasterID = 10
    WHERE s.id = ?
    LIMIT 1;";

    $stmt = $db->prepare($sql);
    $stmt->execute([$_GET['id']]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        echo json_encode(["success" => true, "data" => $data]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Staff not found"]);
    }
}
//For edit details
function fetchSingleStaffById($db) {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "id is required"]);
        return;
    }

    $sql = "SELECT 
                s.id,
                s.staff_id,
                s.userid,
                s.firstName,
                s.lastName,
                s.designation,
                s.church_Id,
                s.mobileNo,
                s.alrenativeMobileNo as altMobileNo,
                s.address,
                s.state,
                s.city,
                s.activeStatus,
                s.church_id, 
                S.joiningDate
                us.role,
                us.email
            FROM staff_details s 
            LEFT JOIN users us ON s.userid = us.userid
            WHERE s.id = ?
            LIMIT 1;";

            $stmt = $db->prepare($sql);
            $stmt->execute([$_GET['id']]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($data) {
                echo json_encode(["success" => true, "data" => $data]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Staff not found"]);
            }
}
function fetchStaffList($db) {
    if (!isset($_GET['church_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "church_id parameter is required"]);
        return;
    }
    
    $churchId = filter_var($_GET['church_id'], FILTER_VALIDATE_INT);
    $params = [$churchId];
    $sql = "SELECT * FROM staff_details WHERE church_Id = ?";
    
    if (isset($_GET['search']) && !empty(trim($_GET['search']))) {
        $search = "%" . trim($_GET['search']) . "%";
        $sql .= " AND (firstName LIKE ? OR lastName LIKE ? OR designation LIKE ? OR role LIKE ? OR staff_id LIKE ?)";
        $params = array_merge($params, [$search, $search, $search, $search, $search]);
    }
    
    if (isset($_GET['status']) && in_array($_GET['status'], ['Active', 'Inactive'])) {
        $sql .= " AND activeStatus = ?";
        $params[] = $_GET['status'];
    }
    
    $sql .= " ORDER BY COALESCE(updated_at, created_at) DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $data]);
}
?>