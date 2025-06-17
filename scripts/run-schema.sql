-- Create the database
CREATE DATABASE IF NOT EXISTS edms_responder;
USE edms_responder;

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create responders table
CREATE TABLE IF NOT EXISTS responders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'available',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create response_logs table
CREATE TABLE IF NOT EXISTS response_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT,
    responder_id INT,
    action VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(id),
    FOREIGN KEY (responder_id) REFERENCES responders(id)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(10) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    incident_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create patient_diagnostics table
CREATE TABLE IF NOT EXISTS patient_diagnostics (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36),
    chief_complaint TEXT,
    pertinent_symptoms TEXT,
    allergies TEXT,
    current_medications TEXT,
    past_medical_history TEXT,
    last_oral_intake TEXT,
    history_of_present_illness TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create patient_vital_signs table
CREATE TABLE IF NOT EXISTS patient_vital_signs (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36),
    blood_pressure VARCHAR(20),
    pulse_rate VARCHAR(10),
    respiratory_rate VARCHAR(10),
    temperature VARCHAR(10),
    oxygen_saturation VARCHAR(10),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create patient_status table
CREATE TABLE IF NOT EXISTS patient_status (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36),
    conscious BOOLEAN DEFAULT FALSE,
    unconscious BOOLEAN DEFAULT FALSE,
    deceased BOOLEAN DEFAULT FALSE,
    verbal BOOLEAN DEFAULT FALSE,
    pain BOOLEAN DEFAULT FALSE,
    alert BOOLEAN DEFAULT FALSE,
    lethargic BOOLEAN DEFAULT FALSE,
    obtunded BOOLEAN DEFAULT FALSE,
    stupor BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create patient_management table
CREATE TABLE IF NOT EXISTS patient_management (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36),
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
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create patient_trauma table
CREATE TABLE IF NOT EXISTS patient_trauma (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36),
    mechanism_of_injury TEXT,
    trauma_score VARCHAR(10),
    body_region_assessment TEXT,
    trauma_interventions TEXT,
    cause_of_injuries TEXT,
    types_of_injuries TEXT,
    location_of_incident TEXT,
    remarks TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Insert sample responder
INSERT INTO responders (username, name, contact_number) 
VALUES ('gjboltiador', 'Godfrey Boltiador', '+1234567890'); 