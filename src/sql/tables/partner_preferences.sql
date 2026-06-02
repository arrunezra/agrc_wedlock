
DROP TABLE partner_preferences;

CREATE TABLE partner_preferences (
    profile_id INTEGER PRIMARY KEY REFERENCES profiles(profile_id) ON DELETE CASCADE,
    -- Age & Physical
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 50,
    min_height FLOAT,
    max_height FLOAT,
    
    -- Cultural (Store as comma-separated or JSON for multiple selections)
    religions TEXT, 
    communities TEXT,
    mother_tongues TEXT,
    
    -- Professional & Social
    marital_status VARCHAR(255),
    income_min VARCHAR(100),
    education TEXT,
    working_with TEXT,
    
    -- Location
    country TEXT,
    state TEXT,
    city TEXT,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);