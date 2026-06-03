<?php
require_once '../helpers/AuthMiddleware.php';
require_once '../config/database.php';
require_once __DIR__ . '/../error_log_config.php'; 


try {
    $db = Database::getInstance();
    $token = AuthMiddleware::check();
	$my_id =  $token->profile_id ?? $token['profile_id'];
	$type = $_GET['type'] ?? 'liked'; // 'liked' or 'accepted'
	
    // --- PART 1: ALWAYS FETCH RECENT VIEWERS ---
    $viewerSql = "SELECT p.profile_id, p.full_name, p.file_name, v.viewed_at 
                  FROM profiles_views v
                  INNER JOIN V_Profile p ON v.viewer_id = p.profile_id
                  WHERE v.viewed_profile_id = ?
                  ORDER BY v.viewed_at DESC LIMIT 10";
    $vStmt = $db->prepare($viewerSql);
    $vStmt->execute([$my_id]);
    $recentViewers = $vStmt->fetchAll(PDO::FETCH_ASSOC);

	
    if ($type === 'accepted') {
        // Matches: Either I sent and they accepted, OR they sent and I accepted
       $sql = "	SELECT p.*, 'Accepted' as connection_status, 1 as is_liked_by_me
				FROM profiles_interests i
				INNER JOIN V_Profile p ON (i.sender_id = p.profile_id OR i.receiver_id = p.profile_id)

				-- JOIN to the blocks table: Match if current user has blocked the person
				-- OR if that person has blocked the current user
				LEFT JOIN profiles_blocks pb ON 
					(pb.blocker_id = ? AND pb.blocked_id = p.profile_id) OR 
					(pb.blocker_id = p.profile_id AND pb.blocked_id = ?)

				WHERE (i.sender_id = ? OR i.receiver_id = ?) 
				AND i.status = 'Accepted' 
				AND p.profile_id != ?
				AND p.profile_id IS NOT NULL

				-- CRITICAL: Only show rows where NO entry was found in the blocks table
				AND pb.id IS NULL";	 
		$params = [
						$my_id, $my_id, // For the LEFT JOIN (Blocks)
						$my_id, $my_id, // For the WHERE (Interests)
						$my_id                // For the profile_id != check
				 ];
		
    } else {
        // Shortlisted: Only people I have clicked the Heart icon on
        $sql = "		SELECT p.*, 
						   i_sent.status AS sent_status, 
						   i_received.status AS received_status, 
						   1 as is_liked_by_me
						FROM profile_likes l
						INNER JOIN V_Profile p ON l.profile_id = p.profile_id

						-- JOIN 1: Check for interests sent by me
						LEFT JOIN profiles_interests i_sent ON i_sent.receiver_id = p.profile_id AND i_sent.sender_id = ?

						-- JOIN 2: Check for interests received by me
						LEFT JOIN profiles_interests i_received ON i_received.sender_id = p.profile_id AND i_received.receiver_id = ?

						-- JOIN 3: Check for blocks (Mutual)
						LEFT JOIN profiles_blocks pb ON 
							(pb.blocker_id = ? AND pb.blocked_id = p.profile_id) OR 
							(pb.blocker_id = p.profile_id AND pb.blocked_id = ?)

						WHERE l.sender_id = ?
						  -- Only show if no block record exists in either direction
						  AND pb.id IS NULL";
       $params = [
						$my_id, $my_id, // For the LEFT JOIN (Blocks)
						$my_id, $my_id, // For the WHERE (Interests)
						$my_id                // For the profile_id != check
				 ];
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $tabData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- FINAL JSON OUTPUT ---
    echo json_encode([
        "success" => true, 
        "recent_viewers" => $recentViewers, // Added this
        "data" => $tabData
    ]);


 } catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}