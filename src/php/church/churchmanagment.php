<?php
header("Content-Type: application/json");
require_once '../config/database.php'; // Your DB connection file

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);
 
try {
    if ($method === 'POST') {
        $action = $input['action'] ?? 'add';

        // --- ACTION: FETCH (READ with Pagination & Filters) ---
        if ($action === 'fetch') {
            $page = (int)($input['page'] ?? 1);
            $limit = (int)($input['limit'] ?? 10);
            $offset = ($page - 1) * $limit;
            
            $where = ["1=1"];
            $params = [];
			//$where = ["deleted_at IS NULL"]; // Base condition: Only show non-deleted records
            if (!empty($input['church_name'])) {
                $where[] = "church_name LIKE ?";
                $params[] = "%".$input['church_name']."%";
            }
            if (!empty($input['city'])) {
                $where[] = "city = ?";
                $params[] = $input['city'];
            }
           
			if (!empty($input['active_status'])) {
				if ($input['active_status'] === 'Inactive') {
					// Special Case: Inactive AND not deleted
					$where[] = "active_status = 'Inactive' AND deleted_at IS NOT NULL";
				} else {
					// Just filter by status (Active)
					$where[] = "active_status = ?";
					$params[] = $input['active_status'];
				}
			}

            $whereSql = implode(" AND ", $where);
            
            // Get total count
            $countStmt = $db->prepare("SELECT COUNT(*) FROM church_details WHERE $whereSql");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();

            // Get data
            $sql = "SELECT * FROM church_details WHERE $whereSql ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => $data,
                "pagination" => ["total_pages" => ceil($total / $limit), "current_page" => $page]
            ]);
        } 
		elseif ($action === 'fetch_stats') { //for dashbord
			try {
				// 1. Count by Status
				 
				$activeCount = $db->query("SELECT COUNT(*) FROM church_details WHERE active_status = 'Active'")->fetchColumn();
				$inactiveCount = $db->query("SELECT COUNT(*) FROM church_details WHERE active_status = 'Inactive'")->fetchColumn();
				
				// 2. Count by Denomination 
				$denomSql = "SELECT denomination as label, COUNT(*) as value FROM church_details WHERE active_status = 'Active' GROUP BY 									denomination";
				$denomData = $db->query($denomSql)->fetchAll(PDO::FETCH_ASSOC);

				// 3. Total Count
				$total = $db->query("SELECT COUNT(*) FROM church_details")->fetchColumn();

				// 4. NEW: Fetch Last 10 Records
				// Change 'id' to 'created_at' if you prefer to order by date
				$recentSql = "SELECT * FROM church_details WHERE active_status = 'Active' ORDER BY id DESC LIMIT 5";
				$recentChurches = $db->query($recentSql)->fetchAll(PDO::FETCH_ASSOC);

				echo json_encode([
					"success" => true,
					"total" => $total, 
					"active_count" => (int)$activeCount,
    				"inactive_count" => (int)$inactiveCount,
					"by_denomination" => $denomData,
					"recent_churches" => $recentChurches // This will be used by your FlatList
				]);
				exit;
			} catch (Exception $e) {
				echo json_encode(["success" => false, "message" => $e->getMessage()]);
				exit;
			}
		}
        elseif ($_POST['action'] === 'upload_gallery') {
            $churchId = $_POST['church_id'];
            $uploadedFiles = $_FILES['images'];
            $results = [];

            foreach ($uploadedFiles['tmp_name'] as $key => $tmpName) {
                $fileName = "gal_" . uniqid() . ".jpg";
                $targetPath = "../uploads/gallery/" . $fileName;

                if (move_uploaded_file($tmpName, $targetPath)) {
                    $url = "https://yourdomain.com/uploads/gallery/" . $fileName;
                    
                    // Insert record into gallery table
                    $stmt = $db->prepare("INSERT INTO church_gallery (church_id, image_url) VALUES (?, ?)");
                    $stmt->execute([$churchId, $url]);
                    
                    $results[] = $url;
                }
            }

            echo json_encode(["success" => true, "data" => $results]);
        }
		elseif ($action === 'delete') {
			// Read from the JSON input decoded at the top of your file
			$id = $input['id'] ?? null;

			if (!$id) {
				echo json_encode(["success" => false, "message" => "Missing ID"]);
				exit;
			}

			$stmt = $db->prepare("UPDATE church_details SET deleted_at = NOW(), active_status = 'Inactive' WHERE id = ?");
			$stmt->execute([$id]);

			// Check if any row was actually changed
			if ($stmt->rowCount() > 0) {
				echo json_encode(["success" => true, "message" => "Archived"]);
			} else {
				echo json_encode(["success" => false, "message" => "Record not found"]);
			}
			exit;
		}
		elseif ($action === 'restore') {
			$stmt = $db->prepare("UPDATE church_details SET deleted_at = NULL WHERE id = ?");
			$stmt->execute([$input['id']]);

			echo json_encode(["success" => true, "message" => "Record restored"]);
			exit;
		}
       elseif ($action === 'getChurchBranches') {
            $city = isset($input['cityCode']) ? $input['cityCode'] : null;
            
            $sql = "SELECT 
                        church_id, 
                        church_name, 
                        address, 
                        city, 
                        state, 
                        country, 
                        postal_code, 
                        pastor_name 
                    FROM church_details 
                    WHERE active_status = 1"; // Base condition: only active churches

            // If city is provided, append it as an additional filter
            if ($city) {
                $sql .= " AND city = :city";
            }

            $sql .= " ORDER BY church_name ASC";

            $stmt = $db->prepare($sql);
            
            if ($city) {
                $stmt->bindParam(':city', $city);
            }

            $stmt->execute();
            $churches = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => $churches
            ]);
            exit;
        }
        else {
			$formData = $input['data'];
            //$isUpdate = !empty($formData['church_id']);
            $id = !empty($input['id']);

            if ($id) {
                // UPDATE existing record
                $churchId = $formData['church_id'];
                $sql = "UPDATE church_details 
                        SET church_name = ?, denomination = ?, address = ?, city = ?, 
                            state = ?, country = ?, postal_code = ?, pastor_name = ?, 
                            pastor_phone = ?, church_phone = ?, church_email = ?, active_status = ? 
                        WHERE church_id = ?";
                
                $params = [
                    $formData['church_name'], $formData['denomination'], $formData['address'], $formData['city'], 
                    $formData['state'], $formData['country'], $formData['postal_code'], $formData['pastor_name'], 
                    $formData['pastor_phone'], $formData['church_phone'], $formData['church_email'], 
                    $formData['active_status'], $churchId
                ];
                $message = "Successfully updated ID: $churchId"; 
            } else {
                $churchId = generateChurchId($formData['church_name'], $formData['city']);
                $sql = "INSERT INTO church_details (church_id, church_name, denomination, address, city, state, country, postal_code, pastor_name, pastor_phone, church_phone, church_email, active_status) 
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                
                $params = [
                    $churchId, $formData['church_name'], $formData['denomination'], $formData['address'], $formData['city'], 
                    $formData['state'], $formData['country'], $formData['postal_code'], $formData['pastor_name'], 
                    $formData['pastor_phone'], $formData['church_phone'], $formData['church_email'], $formData['active_status']
                ];
                $message = "Successfully created new ID: $churchId";
                }
            // Single execution point
            $db->prepare($sql)->execute($params);

            echo json_encode(["success" => true, "message" => $message, "church_id" => $churchId]);
            exit;   
        }
    } 

    elseif ($method === 'PUT') {
        $sql = "UPDATE church_details SET church_name=?, city=?, active_status=? WHERE id=?";
        $db->prepare($sql)->execute([$input['church_name'], $input['city'], $input['active_status'], $input['id']]);
        echo json_encode(["success" => true, "message" => "Updated"]);
    }
    elseif ($method === 'DELETE') {
		if (empty($input['id'])) {
        throw new Exception("ID is required.");
    }
		// Set the timestamp instead of deleting the row
    $stmt = $db->prepare("UPDATE church_details SET deleted_at = NOW(), active_status = 'Inactive' WHERE id = ?");
    $stmt->execute([$input['id']]);

    echo json_encode(["success" => true, "message" => "Record archived"]);
    exit; 
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

function generateChurchId($churchName, $city) {
    // 1. Get first char of every word in Church Name
    $nameParts = explode(' ', trim($churchName));
    $initials = '';
    foreach ($nameParts as $word) {
        $initials .= strtoupper(substr($word, 0, 1));
    }

    // 2. Get first few chars of City (e.g., first 3 letters)
    $cityCode = strtoupper(substr(trim($city), 0, 3));

    // 3. Combine: INITIALS-CITY
    // Example: Rock City Church + Trichy -> RCC-TRI
    return $initials . "-" . $cityCode;
}