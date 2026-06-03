DELIMITER //

CREATE OR REPLACE PROCEDURE USP_Profile_Summary(
    IN p_user_role VARCHAR(20),
    IN p_search_query VARCHAR(100),
    IN p_limit INT,
    IN p_offset INT, 
    OUT p_total_count INT
)
BEGIN
    -- ==========================================
    -- 1. INITIALIZATION & FILTERING
    -- ==========================================
    DECLARE p_debug_mode INT DEFAULT 0; -- Set to 1 to debug, 0 for production

    -- Fixed: Removed '#' from table name
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_FilteredIDs (
        profile_id VARCHAR(20) PRIMARY KEY,
        userid VARCHAR(20),
        sort_idx INT AUTO_INCREMENT,
        KEY(sort_idx)
    ) ENGINE=MEMORY; -- Optional: Faster performance for small sets

    IF p_search_query IS NOT NULL AND p_search_query != '' THEN
        INSERT INTO temp_FilteredIDs (profile_id, userid)
        SELECT p.profile_id, p.userid
        FROM profiles p
        INNER JOIN users us ON p.userid = us.userid
        WHERE us.Role = p_user_role
        AND (
            p.profile_id LIKE CONCAT('%', p_search_query, '%') OR
            p.first_name LIKE CONCAT('%', p_search_query, '%') OR
            p.last_name LIKE CONCAT('%', p_search_query, '%') OR
            p.phone LIKE CONCAT('%', p_search_query, '%')
        )
        ORDER BY p.updated_at DESC;
    ELSE
        INSERT INTO temp_FilteredIDs (profile_id, userid)
        SELECT p.profile_id, p.userid
        FROM profiles p
        INNER JOIN users us ON p.userid = us.userid
        WHERE us.Role = p_user_role AND us.IsActive = 1
        ORDER BY p.updated_at DESC;
    END IF;

    SELECT COUNT(*) INTO p_total_count FROM temp_FilteredIDs;

    IF p_debug_mode = 1 THEN
        SELECT 'DEBUG: temp_FilteredIDs' AS Stage, f.* FROM temp_FilteredIDs f;
    END IF;

    -- ==========================================
    -- 2. DATA HYDRATION (Step 3: Temp Tables)
    -- ==========================================

    CREATE TEMPORARY TABLE temp_Users AS 
    SELECT userid, IsVerified, IsActive FROM users 
    WHERE userid IN (SELECT userid FROM temp_FilteredIDs);

    CREATE TEMPORARY TABLE temp_Background AS 
    SELECT * FROM profiles_background 
    WHERE profile_id IN (SELECT profile_id FROM temp_FilteredIDs);

    CREATE TEMPORARY TABLE temp_Family AS 
    SELECT * FROM profiles_family 
    WHERE profile_id IN (SELECT profile_id FROM temp_FilteredIDs);

    CREATE TEMPORARY TABLE temp_Physical AS 
    SELECT * FROM profiles_physical 
    WHERE profile_id IN (SELECT profile_id FROM temp_FilteredIDs);

    CREATE TEMPORARY TABLE temp_Professional AS 
    SELECT * FROM profiles_professional 
    WHERE profile_id IN (SELECT profile_id FROM temp_FilteredIDs);

    CREATE TEMPORARY TABLE temp_Files AS 
    SELECT pf.profile_id, pf.file_name 
    FROM profile_files pf
    WHERE pf.is_verified = 1 
    AND pf.profile_id IN (SELECT profile_id FROM temp_FilteredIDs)
    AND pf.file_id = (
        SELECT f2.file_id FROM profile_files f2 
        WHERE f2.profile_id = pf.profile_id 
        ORDER BY f2.is_profile_pic DESC, f2.created_at DESC LIMIT 1
    );

    -- ==========================================
    -- 3. FINAL OUTPUT
    -- ==========================================

    SELECT 
        p.profile_id
        ,p.userid
        ,p.first_name 
        ,p.last_name
        ,CONCAT(p.first_name, ' ', p.last_name) AS full_name
        ,DATE_FORMAT(p.dob, '%d-%m-%Y') AS dob
        ,calculate_age(p.dob) AS age
        ,p.gender 
        ,p.email
        ,p.phone 
        ,p.address
        ,p.city
        ,GetLookupValues(11, p.city,'') AS city_name
        ,p.state
        ,GetLookupValues(6, p.state,'') AS state_name
        ,p.country
        ,GetLookupValues(5, p.country,'') AS country_name
        ,p.updated_at
        ,p.is_visible
        ,p.has_active_subscription
        ,p.last_payment_date 
        -- Background Details
        ,pb.religion
        ,GetLookupValues(1, pb.religion,'') AS religion_name
        ,pb.community
        ,GetLookupValues(2, pb.community,'') AS community_name
        ,pb.sub_community
        ,GetLookupValues(13, pb.sub_community,'')  AS sub_community_name
        ,pb.mother_tongue 
        ,GetLookupValues(3, pb.mother_tongue,'')  AS mother_tongues_name
        ,pb.is_caste_no_bar
        -- Family Details
        ,pf.marital_status
        ,GetLookupValues(7, pf.marital_status,'') AS marital_status_name
        ,pf.family_type
        ,pf.father_occupation
        ,GetLookupValues(14, pf.father_occupation,'') AS father_occupation_name
        ,pf.mother_occupation
        ,GetLookupValues(14, pf.mother_occupation,'') AS mother_occupation_name
        ,pf.noof_sibling
        ,COALESCE(pf.sister_count, 0) AS sister_count
        ,COALESCE(pf.brother_count, 0) AS brother_count
        ,pf.kids_details 
        ,pf.has_children
        ,pf.children_count
        ,pf.aboutus
        ,pf.hobbies
        ,GetLookupValuesWithStringSplit(9, pf.hobbies) AS hobbies_name
        -- Physical Details

        ,pph.height
        ,pph.weight
        ,pph.blood_group
        ,pph.health_info
        ,pph.disability
        -- Professional Details 
        ,ppr.qualification
        ,GetLookupValues(18, ppr.qualification,'desc') AS qualification_name
        ,ppr.college
        ,ppr.income
        ,GetLookupValues(4, ppr.income,'') AS income_name 
        ,ppr.work_with
        ,GetLookupValues(8, ppr.work_with,'') AS work_with_name  
        ,ppr.working_as
        ,ppr.company_name
        ,ppr.others

        ,tf.file_name
        ,tu.IsVerified 
        ,tu.IsActive

    FROM temp_FilteredIDs f
    INNER JOIN profiles p ON f.profile_id = p.profile_id
    LEFT JOIN temp_Users tu ON p.userid = tu.userid
    LEFT JOIN temp_Background pb ON p.profile_id = pb.profile_id
    LEFT JOIN temp_Family pf ON p.profile_id = pf.profile_id
    LEFT JOIN temp_Physical pph ON p.profile_id = pph.profile_id
    LEFT JOIN temp_Professional ppr ON p.profile_id = ppr.profile_id
    LEFT JOIN temp_Files tf ON p.profile_id = tf.profile_id
    
    WHERE f.sort_idx > p_offset
    ORDER BY f.sort_idx ASC
    LIMIT p_limit;

    -- ==========================================
    -- 4. CLEANUP
    -- ==========================================
    DROP TEMPORARY TABLE IF EXISTS temp_FilteredIDs;
    DROP TEMPORARY TABLE IF EXISTS temp_Users;
    DROP TEMPORARY TABLE IF EXISTS temp_Background;
    DROP TEMPORARY TABLE IF EXISTS temp_Family;
    DROP TEMPORARY TABLE IF EXISTS temp_Physical;
    DROP TEMPORARY TABLE IF EXISTS temp_Professional;
    DROP TEMPORARY TABLE IF EXISTS temp_Files;

END //

DELIMITER ;