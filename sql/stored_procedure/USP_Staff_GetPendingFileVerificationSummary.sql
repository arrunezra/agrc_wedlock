 
DELIMITER //

CREATE OR REPLACE PROCEDURE USP_Staff_GetPendingFileVerificationSummary(
    IN p_SearchQuery VARCHAR(100),
    IN p_PageNumber INT,
    IN p_PageSize INT
)
BEGIN
    -- 1. Protection: Ensure PageNumber is at least 1
    DECLARE v_Page INT;
    DECLARE v_Offset INT;
    
    SET v_Page = IF(p_PageNumber < 1, 1, p_PageNumber);
    SET v_Offset = (v_Page - 1) * p_PageSize;

    -- STEP 1: Global Summary Count (Total unverified files in system)
    SELECT 
        COUNT(file_id) AS GlobalPendingVerifyCount
    FROM profile_files
    WHERE is_verified = 0;

    -- STEP 2: Paginated Data (Profiles having unverified files)
    SELECT 
            p.profile_id
            ,p.userid
            ,p.full_name
            ,p.email
            ,p.phone
            ,p.dob
            ,p.gender
            ,p.phone
            ,p.city_name
            ,p.state_name 
            ,p.file_name
            ,p.IsActive
            ,p.IsVerified
            -- This subquery tells the UI the total count of profiles that match filters
            ,(SELECT COUNT(DISTINCT pf_inner.profile_id) 
              FROM profile_files pf_inner
              INNER JOIN V_Profile p_inner ON p_inner.profile_id = pf_inner.profile_id
              WHERE pf_inner.is_verified = 0 
              AND (p_SearchQuery = '' OR p_inner.full_name LIKE CONCAT('%', p_SearchQuery, '%') OR p.phone LIKE CONCAT('%', p_SearchQuery, '%'))
             ) AS TotalMatchingProfiles
    FROM V_Profile p
    INNER JOIN profile_files pf ON p.profile_id = pf.profile_id
    WHERE pf.is_verified = 0
      AND (p_SearchQuery = '' OR p.full_name LIKE CONCAT('%', p_SearchQuery, '%') OR p.phone LIKE CONCAT('%', p_SearchQuery, '%'))
    
    GROUP BY p.profile_id -- Essential to avoid duplicate rows per file
    ORDER BY p.updated_at DESC
    LIMIT p_PageSize OFFSET v_Offset;

END //

DELIMITER ;


-- -- CALL USP_Staff_GetPendingFileVerificationSummary('', 1, 10);
