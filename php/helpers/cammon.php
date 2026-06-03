<?php
/**
 * Utility functions for the Christian Matrimony App
 */

function generateFormattedID($db, $table, $column,$prefix) {
    $isUnique = false;
    $finalID = "";

    while (!$isUnique) {
        //$prefix = "AG";
        $monthYear = date('my'); // e.g., 0326
        $separator = "-";
        
        $randomPart = '';
        for ($i = 0; $i < 5; $i++) {
            $randomPart .= random_int(0, 9);
        }

        $finalID = $prefix . $monthYear . $separator . $randomPart;

        // Verify uniqueness dynamically based on table and column passed
        $stmt = $db->prepare("SELECT COUNT(*) FROM $table WHERE $column = ?");
        $stmt->execute([$finalID]);
        
        if ($stmt->fetchColumn() == 0) {
            $isUnique = true; 
        }
    }
    return $finalID;
}

// How to use it:
// $userId = generateFormattedID($db, 'users', 'userid','RCST'); rock city staff
// $profileId = generateFormattedID($db, 'profiles', 'profile_id','RCPF');  rock city profile
?>