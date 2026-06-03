<?php
// 1. Core Header and Global Config Includes
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST");

require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

try {
    // 2. Initialize Infrastructure & Authentication Safeguards
    $db = Database::getInstance();
    $token = AuthMiddleware::check();

    // Safely resolve user id context from Auth middle layers
    $userId = $token->userid ?? $token['userid'] ?? null;
    	 error_log("Full totken Data: " . print_r($userId, true));

    if (!$userId) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized access: Invalid token context."]);
        exit;
    }

    // Verify file actually exists within standard PHP system arrays
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorCode = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
        throw new Exception("File upload validation failure. Error code: " . $errorCode);
    }

    $file = $_FILES['file'];
    
    // 3. File Meta Calculations and Security Filtering
    $originalName = basename($file['name']);
    $fileSize     = $file['size'];
    $mimeType     = $file['type'];
    $ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    $allowedMimeTypes  = ['image/jpeg', 'image/png', 'image/webp'];

    if (!in_array($ext, $allowedExtensions) || !in_array($mimeType, $allowedMimeTypes)) {
        throw new Exception("Invalid file type. Only JPEG, PNG, and WEBP profiles are permitted.");
    }

    if ($fileSize > 8 * 1024 * 1024) {
        throw new Exception("File size limit breached. Max limit is 8MB.");
    }

    // Define real absolute physical locations on disk
    $targetDir = '../uploads/profiles/';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // Unique filename for the NEW file
    $newfileGuid = bin2hex(random_bytes(16)); 
    $storedFileName = "profile_" . $userId . "_" . time() . "." . $ext;
    $targetPath = $targetDir . $storedFileName;

    // 4. Execute Database Synchronization Transaction Block
    $db->beginTransaction();

    // --- REPLACEMENT LOGIC START ---
    // Look up if this user already has an existing profile file entry
    $selectOld = $db->prepare("SELECT file_name FROM file_repo WHERE userid = ? LIMIT 1");
    $selectOld->execute([$userId]);
    $oldFile = $selectOld->fetch(PDO::FETCH_ASSOC);

    if ($oldFile) {
        $oldFilePath = $targetDir . $oldFile['file_name'];
        
        // Remove the physical file from the disk if it exists
        if (file_exists($oldFilePath) && !is_dir($oldFilePath)) {
            @unlink($oldFilePath);
        }

        // Delete the old record from file_repo to keep data fresh
        $deleteOld = $db->prepare("DELETE FROM file_repo WHERE userid = ?");
        $deleteOld->execute([$userId]);
    }
    // --- REPLACEMENT LOGIC END ---

    // 5. Insert the brand new file record
    $insert = $db->prepare("INSERT INTO file_repo (file_id, file_name, original_name, extension, file_size, mime_type, userid) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $insert->execute([$newfileGuid, $storedFileName, $originalName, $ext, $fileSize, $mimeType, $userId]);

    // 6. Save Physical File to Disk Storage Destination
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to save physical file to storage destination.");
    }

    // Commit changes safely to data schemas
    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Profile photo replaced successfully!",
        "file_id" => $newfileGuid,
        "file_name" => $storedFileName,
        "file_url" => "https://" . $_SERVER['HTTP_HOST'] . "/uploads/profiles/" . $storedFileName
    ]);

} catch (Exception $e) {
    // Error handling recovery
    error_log("Profile Replace Action Error: " . $e->getMessage());
    
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    // Clean up the new file if something failed mid-transaction
    if (isset($targetPath) && file_exists($targetPath)) {
        @unlink($targetPath);
    }

    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>