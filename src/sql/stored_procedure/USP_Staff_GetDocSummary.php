 
DELIMITER //

CREATE OR REPLACE PROCEDURE USP_Staff_GetDocSummary(
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

    

    -- STEP 1: Paginated Data (Profiles having unverified files)
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
            
    FROM V_Profile p
     
    WHERE 
        p.IsActive = 1
        AND p.IsVerified = 1
        AND (p_SearchQuery = '' OR p.full_name LIKE CONCAT('%', p_SearchQuery, '%') OR p.phone LIKE CONCAT('%', p_SearchQuery, '%'))
    ORDER BY p.updated_at DESC
    LIMIT p_PageSize OFFSET v_Offset;

END //

DELIMITER ;


-- -- CALL USP_Staff_GetDocSummary('', 1, 10);
