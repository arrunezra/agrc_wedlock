SELECT pp.profile_id,
       pp.min_age,
       pp.max_age,
       pp.min_height,
       pp.max_height,
       pp.religions,
       pp.communities,
       (SELECT GROUP_CONCAT(LookupValue ORDER BY LookupValue) 
        FROM t_tran_lookup 
        WHERE LookupMasterID = 13 
        AND FIND_IN_SET(LookupKey, REPLACE(pp.communities, ' ', '')) > 0) AS communitiesName,
       pp.mother_tongues,
       (SELECT GROUP_CONCAT(LookupValue ORDER BY LookupValue) 
        FROM t_tran_lookup 
        WHERE LookupMasterID = 3 
        AND FIND_IN_SET(LookupKey, REPLACE(pp.mother_tongues, ' ', '')) > 0) AS mother_tonguesName,
       pp.marital_status,
       (SELECT GROUP_CONCAT(LookupValue ORDER BY LookupValue) 
        FROM t_tran_lookup 
        WHERE LookupMasterID = 7 
        AND FIND_IN_SET(LookupKey, REPLACE(pp.marital_status, ' ', '')) > 0) AS marital_statusName,
       pp.children,
       pp.min_income,
       pp.max_income,
       pp.education,
       pp.working_with,
       pp.country,
        (SELECT GROUP_CONCAT(LookupValue ORDER BY LookupValue) 
        FROM t_tran_lookup 
        WHERE LookupMasterID = 5 
        AND FIND_IN_SET(LookupKey, REPLACE(pp.country, ' ', '')) > 0) AS countryName,
       pp.state,
       (SELECT GROUP_CONCAT(LookupValue ORDER BY LookupValue) 
        FROM t_tran_lookup 
        WHERE LookupMasterID = 6 
        AND FIND_IN_SET(LookupKey, REPLACE(pp.state, ' ', '')) > 0) AS stateName,
       pp.city,
       (SELECT GROUP_CONCAT(LookupValue ORDER BY LookupValue) 
        FROM t_tran_lookup 
        WHERE LookupMasterID = 11 
        AND FIND_IN_SET(LookupKey, REPLACE(pp.city, ' ', '')) > 0) AS cityName,
       pp.created_at,
       pp.updated_at
FROM partner_preferences pp;