<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

$db = Database::getInstance(); 

// Parameters from FormData
$userId = $_POST['userid'] ?? null;
$profileId = $_POST['profile_id'] ?? null;
$fileId = $_POST['file_id'] ?? null; // If present, we UPDATE. If null, we INSERT.
$isProfilePic = isset($_POST['is_profile_pic']) ? (int)$_POST['is_profile_pic'] : 0;

if (!$userId || !isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "No valid file or User ID."]);
    exit;
}

// 1. Generate NEW GUID (UUID v4) for the new file
$newFileGuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

$file = $_FILES['file'];
$physicalBaseDir = '../uploads/profiles/';
$physicalThumbDir = '../uploads/profiles/thumbs/';

// 2. Prepare File Metadata
$originalName = $file['name'];
$extension = pathinfo($originalName, PATHINFO_EXTENSION);

// We use the GUID as the filename to prevent collisions and improve security
$targetDbPath = $newFileGuid . '.' . $extension;
$thumbDbPath = $newFileGuid . '_thumb.jpg';

$targetPhysicalPath = $physicalBaseDir . $targetDbPath;
$thumbPhysicalPath = $physicalThumbDir . $thumbDbPath;

if (move_uploaded_file($file['tmp_name'], $targetPhysicalPath)) {
    try {
        // --- 3. Thumbnail Generation ---
        
        list($w, $h) = getimagesize($targetPhysicalPath);
        $newW = 400;
        
        // Fix: Explicitly round and cast to int to prevent precision loss warnings in PHP 8.1+
        $newH = (int)round(($h / $w) * $newW);
        
        $src = (strtolower($extension) === 'png') ? imagecreatefrompng($targetPhysicalPath) : imagecreatefromjpeg($targetPhysicalPath);
        
        // Line 51: Now receives a clean integer (e.g., 533), eliminating the deprecation error
        $tmp = imagecreatetruecolor($newW, $newH);
        
        // Handle transparency for PNGs
        if (strtolower($extension) === 'png') {
            imagealphablending($tmp, false);
            imagesavealpha($tmp, true);
        }

        imagecopyresampled($tmp, $src, 0, 0, 0, 0, $newW, $newH, $w, $h);
        imagejpeg($tmp, $thumbPhysicalPath, 85);
        imagedestroy($src); 
        imagedestroy($tmp);

        $db->beginTransaction();
        $oldFiles = [];

        if ($fileId) {
            // --- 4. UPDATE LOGIC (REPLACE EXISTING SLOT) ---
            // Fetch old filenames before updating DB for physical cleanup
            $getOld = $db->prepare("SELECT file_name FROM profile_files WHERE file_id = :fid AND userid = :uid");
            $getOld->execute(['fid' => $fileId, 'uid' => $userId]);
            $oldFiles = $getOld->fetch(PDO::FETCH_ASSOC);

            // Update the existing record with the new GUID-based filename and metadata
            $update = $db->prepare("UPDATE profile_files SET 
                file_name = :fname, 
                original_name = :oname, 
                extension = :ext, 
                file_size = :fsize, 
                mime_type = :mime,
                is_verified = 0 ,
                updated_at = CURRENT_TIMESTAMP
                WHERE file_id = :fid AND userid = :uid");
            
            $update->execute([
                'fname' => $targetDbPath,
                'oname' => $originalName,
                'ext'   => $extension,
                'fsize' => $file['size'],
                'mime'  => $file['type'], 
                'fid'   => $fileId,
                'uid'   => $userId
            ]);
        } else {
            // --- 5. INSERT LOGIC (NEW SLOT) ---
            if ($isProfilePic === 1) {
                $reset = $db->prepare("UPDATE profile_files SET is_profile_pic = 0 WHERE userid = :uid");
                $reset->execute(['uid' => $userId]);
            }

            // Insert new record using the generated GUID as the file_id
            $insert = $db->prepare("INSERT INTO profile_files 
                (file_id, profile_id, userid, file_name, original_name, extension, file_size, mime_type, is_profile_pic, is_verified, created_at, updated_at ) 
                VALUES (:fid, :pid, :uid, :fname, :oname, :ext, :fsize, :mime, :ipp, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
            
            $insert->execute([
                'fid'   => $newFileGuid, // Use the new GUID as primary key
                'pid'   => $profileId,
                'uid'   => $userId,
                'fname' => $targetDbPath,
                'oname' => $originalName,
                'ext'   => $extension,
                'fsize' => $file['size'],
                'mime'  => $file['type'],
                'ipp'   => $isProfilePic
                
            ]);
        }

        $db->commit();

        // --- 6. PHYSICAL CLEANUP ---
        if (!empty($oldFiles)) {
            $oldFull = $physicalBaseDir . $oldFiles['file_name'];
            // Detect extension of old file to correctly find its thumbnail
            $oldExt = pathinfo($oldFiles['file_name'], PATHINFO_EXTENSION);
            $oldThumb = $physicalThumbDir . str_replace('.'.$oldExt, '_thumb.jpg', $oldFiles['file_name']);
            
            if (file_exists($oldFull)) unlink($oldFull);
            if (file_exists($oldThumb)) unlink($oldThumb);
        }

        echo json_encode([
            "success" => true, 
            "file_id" => $fileId ? $fileId : $newFileGuid,
            "full_url" => $targetDbPath, 
            "thumb_url" => $thumbDbPath
        ]);

    } catch (Exception $e) {
        error_log($e->getMessage());
        if ($db->inTransaction()) $db->rollBack();
        
        // Cleanup the new file if DB fails
        if (file_exists($targetPhysicalPath)) unlink($targetPhysicalPath);
        if (file_exists($thumbPhysicalPath)) unlink($thumbPhysicalPath);
        
        echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
    }
} else {
            error_log("Failed to move uploaded file. profile_gallery_upload.php");

    echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
}