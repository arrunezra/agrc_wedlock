<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST"); // Changed from GET to POST
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../error_log_config.php'; 
require_once '../config/database.php';

// 1. Get the Database Connection via your Singleton
$pdo = Database::getInstance();   

// Get the posted data
$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;
$profile_id = $data['profile_id'] ?? null;
$image_id = $data['image_id'] ?? null;
if($action != "get_default"){
    if (!$action || !$profile_id || !$image_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required parameters"]);
        error_log("Missing required parameters -> set_default_or_delete_profile_image.php");
    exit;
}else {
    if (!$action == "get_default" && !$profile_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required parameters"]);
        error_log("Missing required parameters -> get_default - set_default_or_delete_profile_image.php");
    }
}
}


 

try {
    switch ($action) {
        case 'set_default':
            $pdo->beginTransaction();
            
            // 1. Reset current default
            $stmt1 = $pdo->prepare("UPDATE profile_files SET is_profile_pic = 0 WHERE profile_id = ?");
            $stmt1->execute([$profile_id]);

            // 2. Set new default
            $stmt2 = $pdo->prepare("UPDATE profile_files SET is_profile_pic = 1 WHERE file_id = ? AND profile_id = ?");
            $stmt2->execute([$image_id, $profile_id]);
            
            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Primary photo updated"]);
            break;

        case 'delete':
            // 1. Fetch the image to check if it's the current profile picture
            $stmt = $pdo->prepare("SELECT file_id, is_profile_pic FROM profile_files WHERE file_id = ? AND profile_id = ?");
            $stmt->execute([$image_id, $profile_id]);
            $image = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$image) throw new Exception("Image not found");

            $pdo->beginTransaction();
            try {
                // 2. Remove the image from the database
                $delStmt = $pdo->prepare("DELETE FROM profile_files WHERE file_id = ? AND profile_id = ?");
                $delStmt->execute([$image_id, $profile_id]);

                // 3. If the deleted image was the profile pic, promote the next one
                if ((int)$image['is_profile_pic'] === 1) {
                    // Find the "new" 0th index (the oldest remaining image or next in line)
                    $nextImgStmt = $pdo->prepare("SELECT file_id FROM profile_files WHERE profile_id = ? ORDER BY created_at ASC LIMIT 1");
                    $nextImgStmt->execute([$profile_id]);
                    $nextImage = $nextImgStmt->fetch(PDO::FETCH_ASSOC);

                    if ($nextImage) {
                        // Set the new 0th index image as the profile pic
                        $updateStmt = $pdo->prepare("UPDATE profile_files SET is_profile_pic = 1 WHERE file_id = ?");
                        $updateStmt->execute([$nextImage['file_id']]);
                    }
                }

                $pdo->commit();

                // 4. Remove the physical file from storage
                $filePath = __DIR__ . '/../uploads/profiles/' . $image['uri'];
                if (!empty($image['uri']) && file_exists($filePath)) {
                    unlink($filePath);
                }

                echo json_encode(["success" => true, "message" => "Image deleted and profile updated"]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'get_default':
            $stmt = $pdo->prepare("SELECT 
										file_id
										,file_name
										,is_profile_pic
										,is_verified
									FROM 
										profile_files 
									WHERE is_profile_pic = 1 AND profile_id = ?");
            $stmt->execute([$profile_id]);
            $profiles = $stmt->fetch(PDO::FETCH_ASSOC);

             // Check if the array is empty
            if (empty($profiles)) {
                echo json_encode([
                    "success" => false, // Set to false to trigger error handling on frontend
                    "message" => "Record not found",
                    "data" => null
                ]);
            } else {
                echo json_encode([
                    "success" => true,
                    "data" => $profiles 
                ]);
            }
    
            break;
        default:
        throw new Exception("Invalid action requested");
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>