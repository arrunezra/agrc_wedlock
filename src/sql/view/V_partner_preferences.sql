CREATE OR REPLACE VIEW V_partner_preferences AS
SELECT pp.profile_id,
       pp.min_age,
       pp.max_age,
       pp.min_height,
       pp.max_height,
       pp.religions,
       COALESCE(pp.communities, '') AS communities,
       COALESCE(GetLookupValuesWithStringSplit(13, pp.communities), '') AS communitiesName,
       COALESCE(pp.mother_tongues, '') AS mother_tongues,
       COALESCE(GetLookupValuesWithStringSplit(3, pp.mother_tongues), '') AS mother_tonguesName,
       COALESCE(pp.marital_status, '') AS marital_status,
       COALESCE(GetLookupValuesWithStringSplit(7, pp.marital_status), '') AS marital_statusName,
       COALESCE(pp.children, '') AS children,
       CASE 
           WHEN pp.children = 'Yes' THEN 'Yes means they live separate'
           ELSE COALESCE(pp.children, '')
       END AS childrenDetails,
       COALESCE(pp.min_income, '') AS min_income,
       COALESCE(pp.max_income, '') AS max_income,
       COALESCE(pp.education, '') AS education,
       COALESCE(pp.working_with, '') AS working_with,
       COALESCE(pp.country, '') AS country,
       COALESCE(GetLookupValuesWithStringSplit(5, pp.country), '') AS countryName,
       COALESCE(pp.state, '') AS state,
       COALESCE(GetLookupValuesWithStringSplit(6, pp.state), '') AS stateName,
       COALESCE(pp.city, '') AS city,
       COALESCE(GetLookupValuesWithStringSplit(11, pp.city), '') AS cityName,
       pp.created_at,
       pp.updated_at
FROM partner_preferences pp;