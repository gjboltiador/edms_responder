-- Drop the existing patient_trauma table
DROP TABLE IF EXISTS patient_trauma;

-- Create the updated patient_trauma table
CREATE TABLE patient_trauma (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36),
    cause_of_injuries TEXT,
    types_of_injuries TEXT,
    location_of_incident TEXT,
    remarks TEXT,
    -- Patient Status fields
    conscious BOOLEAN DEFAULT FALSE,
    unconscious BOOLEAN DEFAULT FALSE,
    deceased BOOLEAN DEFAULT FALSE,
    verbal BOOLEAN DEFAULT FALSE,
    pain BOOLEAN DEFAULT FALSE,
    alert BOOLEAN DEFAULT FALSE,
    lethargic BOOLEAN DEFAULT FALSE,
    obtunded BOOLEAN DEFAULT FALSE,
    stupor BOOLEAN DEFAULT FALSE,
    -- Management fields
    first_aid_dressing BOOLEAN DEFAULT FALSE,
    splinting BOOLEAN DEFAULT FALSE,
    ambu_bagging BOOLEAN DEFAULT FALSE,
    oxygen_therapy BOOLEAN DEFAULT FALSE,
    oxygen_liters_per_min VARCHAR(10),
    cpr BOOLEAN DEFAULT FALSE,
    cpr_started TIME,
    cpr_ended TIME,
    aed BOOLEAN DEFAULT FALSE,
    medications_given BOOLEAN DEFAULT FALSE,
    medications_specify TEXT,
    others BOOLEAN DEFAULT FALSE,
    others_specify TEXT,
    head_immobilization BOOLEAN DEFAULT FALSE,
    control_bleeding BOOLEAN DEFAULT FALSE,
    ked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
); 