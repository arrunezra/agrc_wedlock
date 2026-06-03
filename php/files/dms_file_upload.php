<?php
header("Content-Type: application/json");
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 

$db = Database::getInstance();
$token = AuthMiddleware::check();

// 1. Context Information
$profile_id = $token->profile_id ?? $token['profile_id'] ?? null;
$tempParamProfile_id = $_POST['profile_id'] ?? null;
if ($tempParamProfile_id) {
    $profile_id = $tempParamProfile_id;
}

$userId    = $_POST['userid'] ?? null; 
$fileGuid  = $_POST['file_id'] ?? null; 
$module    = $_POST['module'] ?? null;
$action    = $_POST['action'] ?? null;

// 2. Comprehensive Validation Block
if ($action == "dms_delete") {
    if (!$profile_id || !$fileGuid) {
        error_log("Validation Failed for Delete - Profile: $profile_id, GUID: $fileGuid");
        echo json_encode(["success" => false, "message" => "Invalid delete request details."]);
        exit;
    }
} else {
    if (!$profile_id || !$userId || !isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $fileErr = isset($_FILES['file']) ? $_FILES['file']['error'] : 'Missing';
        error_log("Validation Failed - Profile: $profile_id, User: $userId, File status: " . $fileErr);
        echo json_encode(["success" => false, "message" => "Invalid file upload details."]);
        exit;
    }
}

// 3. Extract File Metadata Globally (Fixes crashing in new upload mode)
$file = null;
$originalName = '';
$fileSize = 0;
$mimeType = '';
$ext = '';

if ($action !== "dms_delete") {
    $file         = $_FILES['file'];
    $originalName = $file['name'];
    $fileSize     = $file['size'];
    $mimeType     = $file['type'];
    $ext          = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
}

$tempGuid = '';
$fileToDelete = null; // Staged deletion to execute ONLY after commit passes

try {
    $db->beginTransaction();

    if ($fileGuid) {
        // Define target table contextualized by module
        $targetTable = ($module == "profile") ? "profiles_docs" : "file_repo";
        $idColumn    = ($module == "profile") ? "profile_id" : "userid";
        $idValue     = ($module == "profile") ? $profile_id : $userId;

        // --- MODE: DELETE EXISTING FILE ---
        if ($action == "dms_delete") {
            $stmt = $db->prepare("SELECT file_name FROM {$targetTable} WHERE file_id = ? AND {$idColumn} = ?");
            $stmt->execute([$fileGuid, $idValue]);
            $oldFileName = $stmt->fetchColumn();

            if (!$oldFileName) {
                throw new Exception("File with provided GUID not found.");
            }

            // Stage tracking info for the physical asset
            $fileToDelete = '../uploads/dms/' . $oldFileName;

            $update = $db->prepare("DELETE FROM {$targetTable} WHERE file_id = ? AND {$idColumn} = ?");
            $update->execute([$fileGuid, $idValue]);
            
            $db->commit();

            // Perform disk operations cleanly out-of-transaction
            if ($fileToDelete && file_exists($fileToDelete)) {
                unlink($fileToDelete);
            }

            echo json_encode([
                "success" => true,
                "message" => "File deleted successfully",
                "data" => ["guid" => $fileGuid]
            ]);
            exit;
        }

        // --- MODE: REPLACE EXISTING FILE ---
        if ($action == "dms_replace") {
            $stmt = $db->prepare("SELECT file_name FROM {$targetTable} WHERE file_id = ? AND {$idColumn} = ?");
            $stmt->execute([$fileGuid, $idValue]);
            $oldFileName = $stmt->fetchColumn();

            if (!$oldFileName) {
                throw new Exception("Target replacement file not found.");
            }

            $fileToDelete = '../uploads/dms/' . $oldFileName;
            $storedFileName = $fileGuid . '.' . $ext;
            $tempGuid = $fileGuid;

            if ($module == "profile") {
                $update = $db->prepare("UPDATE profiles_docs SET file_name = ?, original_name = ?, extension = ?, file_size = ?, mime_type = ? WHERE file_id = ? AND profile_id = ?");
                $update->execute([$storedFileName, $originalName, $ext, $fileSize, $mimeType, $fileGuid, $profile_id]);
            } else {
                $update = $db->prepare("UPDATE file_repo SET file_name = ?, original_name = ?, extension = ?, file_size = ?, mime_type = ? WHERE file_id = ? AND userid = ?");
                $update->execute([$storedFileName, $originalName, $ext, $fileSize, $mimeType, $fileGuid, $userId]);
            }
        }
    } else {
        // --- MODE: NEW UPLOAD ---
        $newfileGuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $storedFileName = $newfileGuid . '.' . $ext;
        $tempGuid = $newfileGuid;

        if ($module == "profile") {
            $insert = $db->prepare("INSERT INTO profiles_docs (file_id, profile_id, file_name, original_name, extension, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $insert->execute([$newfileGuid, $profile_id, $storedFileName, $originalName, $ext, $fileSize, $mimeType]);
        } else {
            $insert = $db->prepare("INSERT INTO file_repo (file_id, file_name, original_name, extension, file_size, mime_type, userid) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $insert->execute([$newfileGuid, $storedFileName, $originalName, $ext, $fileSize, $mimeType, $userId]);
        }
    }

    // 4. Save Physical File
    $targetPath = '../uploads/dms/' . $storedFileName;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to save physical file to storage destination.");
    }

    // Everything went perfect, commit changes
    $db->commit();

    // Safely remove the unlinked old file since the new payload took over cleanly
    if ($fileToDelete && file_exists($fileToDelete)) {
        unlink($fileToDelete);
    }

    echo json_encode([
        "success" => true,
        "message" => $fileGuid ? "File replaced successfully" : "New file uploaded successfully",
        "data" => [
            "guid" => $tempGuid,
            "file_name" => $storedFileName,
            "original_name" => $originalName
        ]
    ]);

} catch (Exception $e) {
    error_log("Action Error structural handling: " . $e->getMessage());
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>