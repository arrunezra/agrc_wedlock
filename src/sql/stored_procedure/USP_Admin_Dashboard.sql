DELIMITER //

CREATE OR REPLACE PROCEDURE USP_Admin_Dashboard(
    IN p_role VARCHAR(50),       -- New Input: Role name ('admin', 'super_admin', etc.)
    IN p_profile_id VARCHAR(50), -- New Input: User profile ID mapping
    IN p_debug_mode INT          -- Set to 1 to debug, 0 for production
)
BEGIN
    -- Local tracking variable for scoped admin lookups
    DECLARE v_admin_church_id VARCHAR(50) DEFAULT NULL;

    -- MariaDB handles temp tables best when we ensure they are clean at the start
    DROP TEMPORARY TABLE IF EXISTS temp_DashboardSummary;
    DROP TEMPORARY TABLE IF EXISTS temp_ChurchBreakdown;

    -- 1. ROLE RESOLUTION RESOLVING STEP
    -- If role is 'admin', locate the respective church boundary marker from background data
    IF p_role = 'admin' AND p_profile_id IS NOT NULL THEN
        SELECT church_id INTO v_admin_church_id 
        FROM profiles_background 
        WHERE profile_id = p_profile_id 
        LIMIT 1;
    END IF;

    -- 2. CREATE SUMMARY TABLE
    CREATE TEMPORARY TABLE temp_DashboardSummary (
        total_staff INT,
        total_churches INT,
        total_profiles INT,
        overall_revenue DECIMAL(15,2),
        monthly_revenue DECIMAL(15,2),
        yearly_revenue DECIMAL(15,2)
    ) ENGINE=MEMORY;

    -- 3. CALCULATE SUMMARY METRICS (Conditional Scoping Logic Applied)
    INSERT INTO temp_DashboardSummary (total_staff, total_churches, total_profiles, overall_revenue, monthly_revenue, yearly_revenue)
    VALUES (
        -- Staff Metric Scoping
        (SELECT COUNT(*) FROM staff_details 
         WHERE activeStatus = 'active' 
           AND (v_admin_church_id IS NULL OR church_id = v_admin_church_id)),
        
        -- Church Metric Scoping
        (SELECT COUNT(*) FROM church_details 
         WHERE active_status = 'active' AND deleted_at IS NULL 
           AND (v_admin_church_id IS NULL OR church_id = v_admin_church_id)),
        
        -- Profile Metric Scoping
        (SELECT COUNT(DISTINCT p.profile_id) 
         FROM profiles p
         INNER JOIN profiles_background pb ON p.profile_id = pb.profile_id
         WHERE p.is_visible = 1 
           AND (v_admin_church_id IS NULL OR pb.church_id = v_admin_church_id)),
        
        -- Overall Revenue Scoping
        (SELECT IFNULL(SUM(pr.amount), 0) 
         FROM payments_reciept pr
         INNER JOIN profiles_background pb ON pr.profile_id = pb.profile_id
         WHERE pr.status = 'completed'
           AND (v_admin_church_id IS NULL OR pb.church_id = v_admin_church_id)),
        
        -- Monthly Revenue Scoping
        (SELECT IFNULL(SUM(pr.amount), 0) 
         FROM payments_reciept pr
         INNER JOIN profiles_background pb ON pr.profile_id = pb.profile_id
         WHERE pr.status = 'completed' 
           AND MONTH(pr.created_at) = MONTH(CURRENT_DATE()) 
           AND YEAR(pr.created_at) = YEAR(CURRENT_DATE())
           AND (v_admin_church_id IS NULL OR pb.church_id = v_admin_church_id)),
        
        -- Yearly Revenue Scoping
        (SELECT IFNULL(SUM(pr.amount), 0) 
         FROM payments_reciept pr
         INNER JOIN profiles_background pb ON pr.profile_id = pb.profile_id
         WHERE pr.status = 'completed' 
           AND YEAR(pr.created_at) = YEAR(CURRENT_DATE())
           AND (v_admin_church_id IS NULL OR pb.church_id = v_admin_church_id))
    );

    -- 4. CREATE CHURCH BREAKDOWN TABLE
    CREATE TEMPORARY TABLE temp_ChurchBreakdown (
        church_id VARCHAR(50),
        church_name VARCHAR(255),
        profile_count INT,
        total_amount DECIMAL(15,2),
        trend VARCHAR(10)
    ) ENGINE=MEMORY;

    -- 5. POPULATE CHURCH BREAKDOWN 
    INSERT INTO temp_ChurchBreakdown (church_id, church_name, profile_count, total_amount, trend)
    SELECT 
        cd.church_id
        ,cd.church_name
        ,COUNT(DISTINCT p.profile_id) as profile_count
        ,IFNULL(SUM(pr.amount), 0) as total_amount
        ,CASE WHEN SUM(pr.amount) > 5000 THEN 'up' ELSE 'stable' END as trend
    FROM church_details cd
    LEFT JOIN profiles_background pb ON cd.church_id = pb.church_id
    LEFT JOIN profiles p ON pb.profile_id = p.profile_id
    LEFT JOIN payments_reciept pr ON p.profile_id = pr.profile_id AND pr.status = 'completed'
    WHERE cd.deleted_at IS NULL
      -- If admin, restricts the result tracking matrix solely to their matching venue assignment parameter block
      AND (v_admin_church_id IS NULL OR cd.church_id = v_admin_church_id)
    GROUP BY cd.id, cd.church_name
    ORDER BY total_amount DESC
    LIMIT 50;

    -- 6. FINAL OUTPUTS
    -- Result Set 1
    SELECT * FROM temp_DashboardSummary;

    -- Result Set 2
    SELECT * FROM temp_ChurchBreakdown;

    -- 7. DEBUGGING
    IF p_debug_mode = 1 THEN
        SELECT 'DEBUG: Summary' as stage, s.* FROM temp_DashboardSummary s;
        SELECT 'DEBUG: Church List' as stage, b.* FROM temp_ChurchBreakdown b;
    END IF;

    -- Cleanup at the end of the execution scope
    DROP TEMPORARY TABLE IF EXISTS temp_DashboardSummary;
    DROP TEMPORARY TABLE IF EXISTS temp_ChurchBreakdown;

END //

DELIMITER ;