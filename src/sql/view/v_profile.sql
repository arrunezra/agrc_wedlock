ALTER VIEW V_Profile as (
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
    ,GetLookupValues(1, pb.religion,'')  AS religion_name

    ,pb.community
    ,GetLookupValues(2, pb.community,'')  AS community_name

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
    
    ,ppf.file_name
    ,us.IsVerified 
    ,us.IsActive 

FROM profiles p
LEFT JOIN users us ON p.userid = us.userid 
LEFT JOIN profiles_background pb ON p.profile_id = pb.profile_id
LEFT JOIN profiles_family pf ON p.profile_id = pf.profile_id
LEFT JOIN profiles_physical pph ON p.profile_id = pph.profile_id
LEFT JOIN profiles_professional ppr ON p.profile_id = ppr.profile_id
LEFT JOIN profile_files ppf ON ppf.file_id = (
    SELECT file_id 
    FROM profile_files 
    WHERE profile_id = p.profile_id 
    AND is_verified = 1 
    ORDER BY is_profile_pic DESC, created_at DESC 
    LIMIT 1
)

WHERE us.Role = 'member'  
                         
)

 