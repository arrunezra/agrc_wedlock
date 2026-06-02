DELIMITER //

CREATE OR REPLACE PROCEDURE USP_GetFilteredPaymentHistory(
    IN p_church_id VARCHAR(20),
    IN p_from_date DATE,
    IN p_to_date DATE,
    IN p_status VARCHAR(20),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_limit;

    -- RESULT SET 1: Fetch total matching records count for frontend metrics calculations
    SELECT 
      COUNT(pr.id) AS total_records
      ,IFNULL(SUM(pr.amount), 0) AS total_amount -- MASTER OVERALL CALCULATION LOCK
    FROM payments_reciept pr
    INNER JOIN profiles p ON pr.profile_id = p.profile_id
    INNER JOIN profiles_background pb ON p.profile_id = pb.profile_id
    INNER JOIN church_details cd ON pb.church_id = cd.church_id
    WHERE (p_status = 'all' OR pr.status = p_status)
      AND (p_from_date IS NULL OR pr.created_at >= p_from_date)
      AND (p_to_date IS NULL OR pr.created_at <= STR_TO_DATE(CONCAT(p_to_date, ' 23:59:59'), '%Y-%m-%d %H:%i:%s'))
      AND (p_church_id = 'all' OR cd.church_id = p_church_id);

    -- RESULT SET 2: Paginated Dataset
    SELECT 
        pr.id,
        cd.church_name,
        pr.amount,
        pr.status,
        CASE 
            WHEN pr.razorpay_payment_id IS NOT NULL THEN 'UPI/Card'
            ELSE 'Unknown'
        END AS payment_method,
        DATE_FORMAT(pr.created_at, '%Y-%m-%d %H:%i') AS created_at
    FROM payments_reciept pr
    INNER JOIN profiles p ON pr.profile_id = p.profile_id
    INNER JOIN profiles_background pb ON p.profile_id = pb.profile_id
    INNER JOIN church_details cd ON pb.church_id = cd.church_id
    WHERE (p_status = 'all' OR pr.status = p_status)
      AND (p_from_date IS NULL OR pr.created_at >= p_from_date)
      AND (p_to_date IS NULL OR pr.created_at <= STR_TO_DATE(CONCAT(p_to_date, ' 23:59:59'), '%Y-%m-%d %H:%i:%s'))
      AND (p_church_id = 'all' OR cd.church_id = p_church_id)
    ORDER BY pr.created_at DESC
    LIMIT p_limit OFFSET v_offset;
END //

DELIMITER ;