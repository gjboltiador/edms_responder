import mysql from 'mysql2/promise';
import type { ResultSetHeader } from 'mysql2';

interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
}

interface GpsData {
  dispatch_id: number;
  lat: string;
  lng: string;
  latlng: string;
}

// Validate required environment variables
const validateEnvironmentVariables = () => {
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Secure database connection configuration
const getDbConfig = () => {
  // Validate environment variables in production
  if (process.env.NODE_ENV === 'production') {
    validateEnvironmentVariables();
  }

  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    queueLimit: 0,
    // Security enhancements
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  };
};

// Create a connection pool with secure configuration
let pool: mysql.Pool;

try {
  const dbConfig = getDbConfig();
  pool = mysql.createPool(dbConfig);
} catch (error) {
  console.error('Failed to create database pool:', error instanceof Error ? error.message : 'Unknown error');
  // In production, we should fail fast if database config is invalid
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
  throw error;
}

// Test database connection with secure error handling
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 as test');
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    // Log minimal error information in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Database connection failed');
    } else {
      console.error('Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

// Initialize connection test
testConnection();

// Helper function to execute queries with secure error handling
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results as T[];
  } catch (error) {
    // Log minimal error information in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Database query error occurred');
    } else {
      console.error('Database query error:', error instanceof Error ? error.message : 'Unknown error');
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// GPS Tracking with enhanced error handling and validation
interface GpsValidationError extends Error {
  code: string;
}

const validateGpsData = (data: GpsData): void => {
  const errors: string[] = [];

  if (!data.dispatch_id) errors.push('Dispatch ID is required');
  if (!data.lat) errors.push('Latitude is required');
  if (!data.lng) errors.push('Longitude is required');

  const lat = parseFloat(data.lat);
  const lng = parseFloat(data.lng);

  if (isNaN(lat) || lat < -90 || lat > 90) errors.push('Invalid latitude value');
  if (isNaN(lng) || lng < -180 || lng > 180) errors.push('Invalid longitude value');

  if (errors.length > 0) {
    const error = new Error(errors.join(', ')) as GpsValidationError;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
};

// Example queries for emergency response system
export const db = {
  // Authentication
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const sql = 'SELECT id, username, firstname, lastname FROM users WHERE username = ? AND password = ? LIMIT 1';
    const results = await query<User>(sql, [username, password]);
    return results[0] || null;
  },

  async getUserById(id: number): Promise<User | null> {
    const sql = 'SELECT id, username, firstname, lastname FROM users WHERE id = ?';
    const results = await query<User>(sql, [id]);
    return results[0] || null;
  },

  // Get all emergency alerts
  async getAlerts() {
    return query(`
      SELECT a.*, r.name as responder_name, r.username as responder_username, aa.responder_id, aa.status as assignment_status, aa.assigned_at
      FROM alerts a
      LEFT JOIN (
        SELECT aa1.* FROM alert_assignments aa1
        INNER JOIN (
          SELECT alert_id, MAX(assigned_at) as max_assigned_at
          FROM alert_assignments
          GROUP BY alert_id
        ) aa2 ON aa1.alert_id = aa2.alert_id AND aa1.assigned_at = aa2.max_assigned_at
      ) aa ON a.id = aa.alert_id
      LEFT JOIN responders r ON aa.responder_id = r.id
      ORDER BY a.created_at DESC
    `);
  },

  // Get alerts by status (status in alerts table)
  async getAlertsByStatus(status: string) {
    return query(`
      SELECT a.*, r.name as responder_name, r.username as responder_username, aa.responder_id, aa.status as assignment_status, aa.assigned_at
      FROM alerts a
      LEFT JOIN (
        SELECT aa1.* FROM alert_assignments aa1
        INNER JOIN (
          SELECT alert_id, MAX(assigned_at) as max_assigned_at
          FROM alert_assignments
          GROUP BY alert_id
        ) aa2 ON aa1.alert_id = aa2.alert_id AND aa1.assigned_at = aa2.max_assigned_at
      ) aa ON a.id = aa.alert_id
      LEFT JOIN responders r ON aa.responder_id = r.id
      WHERE a.status = ?
      ORDER BY a.created_at DESC
    `, [status]);
  },

  // Get unassigned alerts (no current assignment or assignment_status is 'unassigned')
  async getUnassignedAlerts() {
    return query(`
      SELECT a.*, r.name as responder_name, r.username as responder_username, aa.responder_id, aa.status as assignment_status, aa.assigned_at
      FROM alerts a
      LEFT JOIN (
        SELECT aa1.* FROM alert_assignments aa1
        INNER JOIN (
          SELECT alert_id, MAX(assigned_at) as max_assigned_at
          FROM alert_assignments
          GROUP BY alert_id
        ) aa2 ON aa1.alert_id = aa2.alert_id AND aa1.assigned_at = aa2.max_assigned_at
      ) aa ON a.id = aa.alert_id
      LEFT JOIN responders r ON aa.responder_id = r.id
      WHERE (aa.responder_id IS NULL OR aa.status = 'unassigned') AND a.status IN ('Pending', 'New')
      ORDER BY a.created_at DESC
    `);
  },

  // Get alerts assigned to a specific responder (current assignment)
  async getAlertsByResponder(responderId: number) {
    return query(`
      SELECT a.*, r.name as responder_name, r.username as responder_username, aa.responder_id, aa.status as assignment_status, aa.assigned_at
      FROM alerts a
      LEFT JOIN (
        SELECT aa1.* FROM alert_assignments aa1
        INNER JOIN (
          SELECT alert_id, MAX(assigned_at) as max_assigned_at
          FROM alert_assignments
          GROUP BY alert_id
        ) aa2 ON aa1.alert_id = aa2.alert_id AND aa1.assigned_at = aa2.max_assigned_at
      ) aa ON a.id = aa.alert_id
      LEFT JOIN responders r ON aa.responder_id = r.id
      WHERE aa.responder_id = ?
      ORDER BY a.created_at DESC
    `, [responderId]);
  },

  // Get available responders (status = 'Available')
  async getAvailableResponders() {
    return query(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM alert_assignments aa 
              WHERE aa.responder_id = r.id 
              AND aa.status IN ('assigned', 'accepted', 'in progress')
              AND aa.unassigned_at IS NULL) as active_assignments
      FROM responders r
      WHERE LOWER(r.status) = 'available'
      ORDER BY active_assignments ASC, r.last_active DESC
    `);
  },

  // Assign a responder to an alert
  async assignResponderToAlert(alertId: number, responderId: number, assignedBy?: number) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if responder is available
      const [responders] = await connection.execute(
        'SELECT status FROM responders WHERE id = ?',
        [responderId]
      ) as [any[], any];

      if (responders.length === 0) {
        throw new Error('Responder not found');
      }

      if (responders[0].status !== 'Available') {
        throw new Error('Responder is not available');
      }

      // Check if alert exists
      const [alerts] = await connection.execute(
        'SELECT id, status FROM alerts WHERE id = ?',
        [alertId]
      ) as [any[], any];

      if (alerts.length === 0) {
        throw new Error('Alert not found');
      }

      // Check if alert is already assigned (has active assignment)
      const [assignments] = await connection.execute(
        'SELECT id FROM alert_assignments WHERE alert_id = ? AND unassigned_at IS NULL',
        [alertId]
      ) as [any[], any];

      if (assignments.length > 0) {
        throw new Error('Alert is already assigned to a responder');
      }

      // Create assignment record
      await connection.execute(
        'INSERT INTO alert_assignments (alert_id, responder_id, assigned_by, status) VALUES (?, ?, ?, ?)',
        [alertId, responderId, assignedBy || null, 'assigned']
      );

      // Update alert status
      await connection.execute(
        'UPDATE alerts SET status = ? WHERE id = ?',
        ['assigned', alertId]
      );

      // Update responder status to Busy
      await connection.execute(
        'UPDATE responders SET status = ? WHERE id = ?',
        ['Busy', responderId]
      );

      await connection.commit();

      return { success: true, message: 'Responder assigned successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Unassign a responder from an alert
  async unassignResponderFromAlert(alertId: number, responderId: number) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if alert is assigned to this responder
      const [assignments] = await connection.execute(
        'SELECT id FROM alert_assignments WHERE alert_id = ? AND responder_id = ? AND unassigned_at IS NULL',
        [alertId, responderId]
      ) as [any[], any];

      if (assignments.length === 0) {
        throw new Error('Alert is not assigned to this responder');
      }

      // Mark assignment as unassigned
      await connection.execute(
        'UPDATE alert_assignments SET unassigned_at = NOW(), status = ? WHERE alert_id = ? AND responder_id = ? AND unassigned_at IS NULL',
        ['unassigned', alertId, responderId]
      );

      // Update alert status back to pending
      await connection.execute(
        'UPDATE alerts SET status = ? WHERE id = ?',
        ['pending', alertId]
      );

      // Update responder status back to Available
      await connection.execute(
        'UPDATE responders SET status = ? WHERE id = ?',
        ['Available', responderId]
      );

      await connection.commit();

      return { success: true, message: 'Responder unassigned successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Accept an alert assignment
  async acceptAlertAssignment(alertId: number, responderId: number) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if alert is assigned to this responder
      const [assignments] = await connection.execute(
        'SELECT id FROM alert_assignments WHERE alert_id = ? AND responder_id = ? AND unassigned_at IS NULL',
        [alertId, responderId]
      ) as [any[], any];

      if (assignments.length === 0) {
        throw new Error('Alert is not assigned to this responder');
      }

      // Update alert status
      await connection.execute(
        'UPDATE alerts SET status = ? WHERE id = ?',
        ['in progress', alertId]
      );

      // Update assignment log
      await connection.execute(
        'UPDATE alert_assignments SET status = ? WHERE alert_id = ? AND responder_id = ? AND unassigned_at IS NULL',
        ['accepted', alertId, responderId]
      );

      await connection.commit();

      return { success: true, message: 'Assignment accepted successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Complete an alert
  async completeAlert(alertId: number, responderId: number) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if alert is assigned to this responder
      const [assignments] = await connection.execute(
        'SELECT id FROM alert_assignments WHERE alert_id = ? AND responder_id = ? AND unassigned_at IS NULL',
        [alertId, responderId]
      ) as [any[], any];

      if (assignments.length === 0) {
        throw new Error('Alert is not assigned to this responder');
      }

      // Update alert status
      await connection.execute(
        'UPDATE alerts SET status = ? WHERE id = ?',
        ['completed', alertId]
      );

      // Update responder status back to Available
      await connection.execute(
        'UPDATE responders SET status = ? WHERE id = ?',
        ['Available', responderId]
      );

      // Update assignment log
      await connection.execute(
        'UPDATE alert_assignments SET status = ? WHERE alert_id = ? AND responder_id = ? AND unassigned_at IS NULL',
        ['completed', alertId, responderId]
      );

      await connection.commit();

      return { success: true, message: 'Alert completed successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Create new emergency alert
  async createAlert(data: { 
    type: string, 
    location: string, 
    description: string, 
    severity: string 
  }) {
    const sql = `
      INSERT INTO alerts (type, location, description, severity, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    return query(sql, [data.type, data.location, data.description, data.severity]);
  },

  // Get responder details
  async getResponder(id: number) {
    return query('SELECT * FROM responders WHERE id = ?', [id]);
  },

  // Update alert status
  async updateAlertStatus(alertId: number, status: string) {
    const sql = 'UPDATE alerts SET status = ? WHERE id = ?';
    return query(sql, [status, alertId]);
  },

  // Update alert status with responder assignment
  async updateAlertStatusWithResponder(alertId: number, status: string, responderId: number) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update alert status
      await connection.execute(
        'UPDATE alerts SET status = ? WHERE id = ?',
        [status, alertId]
      );

      // Create or update assignment record
      await connection.execute(
        'INSERT INTO alert_assignments (alert_id, responder_id, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [alertId, responderId, status.toLowerCase(), status.toLowerCase()]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // GPS Tracking with enhanced error handling
  async saveGpsData(data: GpsData) {
    try {
      validateGpsData(data);

      const sql = `
        INSERT INTO gps_data (dispatch_id, lat, lng, latlng)
        VALUES (?, ?, ?, ?)
      `;

      const result = await query(sql, [
        data.dispatch_id,
        data.lat,
        data.lng,
        data.latlng
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  },

  async getGpsData(dispatch_id: number) {
    try {
      if (!dispatch_id) {
        throw new Error('Dispatch ID is required');
      }

      const sql = `
        SELECT * FROM gps_data 
        WHERE dispatch_id = ? 
        ORDER BY created_date DESC
      `;

      const result = await query(sql, [dispatch_id]);

      return result;
    } catch (error) {
      throw error;
    }
  },

  async getLastLocation(dispatch_id: number) {
    try {
      if (!dispatch_id) {
        throw new Error('Dispatch ID is required');
      }

      const sql = `
        SELECT * FROM gps_data 
        WHERE dispatch_id = ? 
        ORDER BY created_date DESC 
        LIMIT 1
      `;

      const result = await query(sql, [dispatch_id]);

      return result[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Patient-related functions
  async createPatient(patient: any) {
    const patientId = crypto.randomUUID();
    const diagnosticId = crypto.randomUUID();
    const vitalSignsId = crypto.randomUUID();
    const traumaId = crypto.randomUUID();

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert patient
      await connection.query(`
        INSERT INTO patients (id, name, age, gender, address, contact_number, contact_person, incident_id, incident_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        patientId,
        patient.name,
        patient.age,
        patient.gender,
        patient.address,
        patient.contactNumber,
        patient.contactPerson,
        patient.incidentId,
        patient.incidentType
      ]);

      // Insert diagnostic information
      if (patient.chiefComplaint || patient.pertinentSymptoms || patient.allergies || 
          patient.currentMedications || patient.pastMedicalHistory || patient.lastOralIntake || 
          patient.historyOfPresentIllness) {
        await connection.query(`
          INSERT INTO patient_diagnostics (id, patient_id, chief_complaint, pertinent_symptoms, 
            allergies, current_medications, past_medical_history, last_oral_intake, history_of_present_illness)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          diagnosticId,
          patientId,
          patient.chiefComplaint,
          patient.pertinentSymptoms,
          patient.allergies,
          patient.currentMedications,
          patient.pastMedicalHistory,
          patient.lastOralIntake,
          patient.historyOfPresentIllness
        ]);
      }

      // Insert vital signs
      if (patient.vitalSigns) {
        await connection.query(`
          INSERT INTO patient_vital_signs (id, patient_id, blood_pressure, pulse_rate, 
            respiratory_rate, temperature, oxygen_saturation)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          vitalSignsId,
          patientId,
          patient.vitalSigns.bloodPressure,
          patient.vitalSigns.pulseRate,
          patient.vitalSigns.respiratoryRate,
          patient.vitalSigns.temperature,
          patient.vitalSigns.oxygenSaturation
        ]);
      }

      // Insert trauma information with patient status and management
      await connection.query(`
        INSERT INTO patient_trauma (
          id, patient_id, 
          cause_of_injuries, types_of_injuries, location_of_incident, remarks,
          conscious, unconscious, deceased, verbal, pain, alert, lethargic, obtunded, stupor,
          first_aid_dressing, splinting, ambu_bagging, oxygen_therapy, oxygen_liters_per_min,
          cpr, cpr_started, cpr_ended, aed, medications_given, medications_specify,
          others, others_specify, head_immobilization, control_bleeding, ked
        )
        VALUES (
          ?, ?, 
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `, [
        traumaId,
        patientId,
        patient.causeOfInjuries || null,
        patient.typesOfInjuries || null,
        patient.locationOfIncident || null,
        patient.remarks || null,
        patient.patientStatus?.conscious || false,
        patient.patientStatus?.unconscious || false,
        patient.patientStatus?.deceased || false,
        patient.patientStatus?.verbal || false,
        patient.patientStatus?.pain || false,
        patient.patientStatus?.alert || false,
        patient.patientStatus?.lethargic || false,
        patient.patientStatus?.obtunded || false,
        patient.patientStatus?.stupor || false,
        patient.management?.firstAidDressing || false,
        patient.management?.splinting || false,
        patient.management?.ambuBagging || false,
        patient.management?.oxygenTherapy || false,
        patient.management?.oxygenLitersPerMin || null,
        patient.management?.cpr || false,
        patient.management?.cprStarted || null,
        patient.management?.cprEnded || null,
        patient.management?.aed || false,
        patient.management?.medicationsGiven || false,
        patient.management?.medicationsSpecify || null,
        patient.management?.others || false,
        patient.management?.othersSpecify || null,
        patient.management?.headImmobilization || false,
        patient.management?.controlBleeding || false,
        patient.management?.ked || false
      ]);

      await connection.commit();

      // Return the complete patient data
      return this.getPatient(patientId);
    } catch (error) {
      await connection.rollback();
      console.error('Error in createPatient:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  async getPatient(id: string) {
    const [patient] = await query('SELECT * FROM patients WHERE id = ?', [id]);
    if (!patient) return null;

    const [diagnostics] = await query('SELECT * FROM patient_diagnostics WHERE patient_id = ?', [id]);
    const [vitalSigns] = await query('SELECT * FROM patient_vital_signs WHERE patient_id = ?', [id]);
    const [trauma] = await query('SELECT * FROM patient_trauma WHERE patient_id = ?', [id]);

    const isTraumaObject = trauma && typeof trauma === 'object';
    const t = trauma as any;
    const p = patient as any;
    const result = {
      ...patient,
      ...(diagnostics && typeof diagnostics === 'object' ? diagnostics : {}),
      vitalSigns: vitalSigns || {
        bloodPressure: '',
        pulseRate: '',
        respiratoryRate: '',
        temperature: '',
        oxygenSaturation: ''
      },
      patientStatus: isTraumaObject ? {
        conscious: t.conscious || false,
        unconscious: t.unconscious || false,
        deceased: t.deceased || false,
        verbal: t.verbal || false,
        pain: t.pain || false,
        alert: t.alert || false,
        lethargic: t.lethargic || false,
        obtunded: t.obtunded || false,
        stupor: t.stupor || false
      } : {
        conscious: false,
        unconscious: false,
        deceased: false,
        verbal: false,
        pain: false,
        alert: false,
        lethargic: false,
        obtunded: false,
        stupor: false
      },
      management: isTraumaObject ? {
        firstAidDressing: t.first_aid_dressing || false,
        splinting: t.splinting || false,
        ambuBagging: t.ambu_bagging || false,
        oxygenTherapy: t.oxygen_therapy || false,
        oxygenLitersPerMin: t.oxygen_liters_per_min || '',
        cpr: t.cpr || false,
        cprStarted: t.cpr_started || '',
        cprEnded: t.cpr_ended || '',
        aed: t.aed || false,
        medicationsGiven: t.medications_given || false,
        medicationsSpecify: t.medications_specify || '',
        others: t.others || false,
        othersSpecify: t.others_specify || '',
        headImmobilization: t.head_immobilization || false,
        controlBleeding: t.control_bleeding || false,
        ked: t.ked || false
      } : {
        firstAidDressing: false,
        splinting: false,
        ambuBagging: false,
        oxygenTherapy: false,
        oxygenLitersPerMin: '',
        cpr: false,
        cprStarted: '',
        cprEnded: '',
        aed: false,
        medicationsGiven: false,
        medicationsSpecify: '',
        others: false,
        othersSpecify: '',
        headImmobilization: false,
        controlBleeding: false,
        ked: false
      },
      causeOfInjuries: isTraumaObject ? t.cause_of_injuries : null,
      typesOfInjuries: isTraumaObject ? t.types_of_injuries : null,
      locationOfIncident: isTraumaObject ? t.location_of_incident : null,
      remarks: isTraumaObject ? t.remarks : null,
      id: p.id || id
    };

    return result;
  },

  async getPatients() {
    return query('SELECT * FROM patients ORDER BY created_at DESC');
  },

  async updatePatient(id: string, patient: any) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if patient exists
      const [existingPatient] = await connection.query(
        'SELECT * FROM patients WHERE id = ?',
        [id]
      );

      if (!existingPatient) {
        throw new Error(`Patient with ID ${id} not found`);
      }

      // Update patient basic info only if those fields are provided
      if (patient.name || patient.age || patient.gender || patient.address || 
          patient.contactNumber || patient.contactPerson) {
        const [updateResult] = await connection.query(`
          UPDATE patients 
          SET name = COALESCE(?, name),
              age = COALESCE(?, age),
              gender = COALESCE(?, gender),
              address = COALESCE(?, address),
              contact_number = COALESCE(?, contact_number),
              contact_person = COALESCE(?, contact_person),
              updated_at = NOW()
          WHERE id = ?
        `, [
          patient.name,
          patient.age,
          patient.gender,
          patient.address,
          patient.contactNumber,
          patient.contactPerson,
          id
        ]) as [ResultSetHeader, any];

        if (!updateResult) {
          throw new Error(`Failed to update patient with ID ${id}`);
        }
      }

      // Update vital signs if provided
      if (patient.vitalSigns) {
        const [existingVitalSigns] = await connection.query(
          'SELECT * FROM patient_vital_signs WHERE patient_id = ?',
          [id]
        ) as [any[], any];

        if (existingVitalSigns && existingVitalSigns.length > 0) {
          await connection.query(`
            UPDATE patient_vital_signs 
            SET blood_pressure = COALESCE(?, blood_pressure),
                pulse_rate = COALESCE(?, pulse_rate),
                respiratory_rate = COALESCE(?, respiratory_rate),
                temperature = COALESCE(?, temperature),
                oxygen_saturation = COALESCE(?, oxygen_saturation)
            WHERE patient_id = ?
          `, [
            patient.vitalSigns.bloodPressure,
            patient.vitalSigns.pulseRate,
            patient.vitalSigns.respiratoryRate,
            patient.vitalSigns.temperature,
            patient.vitalSigns.oxygenSaturation,
            id
          ]);
        } else {
          await connection.query(`
            INSERT INTO patient_vital_signs 
            (id, patient_id, blood_pressure, pulse_rate, respiratory_rate, temperature, oxygen_saturation)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?)
          `, [
            id,
            patient.vitalSigns.bloodPressure || '',
            patient.vitalSigns.pulseRate || '',
            patient.vitalSigns.respiratoryRate || '',
            patient.vitalSigns.temperature || '',
            patient.vitalSigns.oxygenSaturation || ''
          ]);
        }
      }

      // Update trauma/status/management if provided
      if (patient.patientStatus || patient.management || patient.causeOfInjuries || 
          patient.typesOfInjuries || patient.locationOfIncident || patient.remarks) {
        const [existingTrauma] = await connection.query(
          'SELECT * FROM patient_trauma WHERE patient_id = ?',
          [id]
        ) as [any[], any];

        if (existingTrauma && existingTrauma.length > 0) {
          await connection.query(`
            UPDATE patient_trauma 
            SET conscious = COALESCE(?, conscious),
                unconscious = COALESCE(?, unconscious),
                deceased = COALESCE(?, deceased),
                verbal = COALESCE(?, verbal),
                pain = COALESCE(?, pain),
                alert = COALESCE(?, alert),
                lethargic = COALESCE(?, lethargic),
                obtunded = COALESCE(?, obtunded),
                stupor = COALESCE(?, stupor),
                first_aid_dressing = COALESCE(?, first_aid_dressing),
                splinting = COALESCE(?, splinting),
                ambu_bagging = COALESCE(?, ambu_bagging),
                oxygen_therapy = COALESCE(?, oxygen_therapy),
                oxygen_liters_per_min = COALESCE(?, oxygen_liters_per_min),
                cpr = COALESCE(?, cpr),
                cpr_started = COALESCE(?, cpr_started),
                cpr_ended = COALESCE(?, cpr_ended),
                aed = COALESCE(?, aed),
                medications_given = COALESCE(?, medications_given),
                medications_specify = COALESCE(?, medications_specify),
                others = COALESCE(?, others),
                others_specify = COALESCE(?, others_specify),
                head_immobilization = COALESCE(?, head_immobilization),
                control_bleeding = COALESCE(?, control_bleeding),
                ked = COALESCE(?, ked),
                cause_of_injuries = COALESCE(?, cause_of_injuries),
                types_of_injuries = COALESCE(?, types_of_injuries),
                location_of_incident = COALESCE(?, location_of_incident),
                remarks = COALESCE(?, remarks)
            WHERE patient_id = ?
          `, [
            patient.patientStatus?.conscious,
            patient.patientStatus?.unconscious,
            patient.patientStatus?.deceased,
            patient.patientStatus?.verbal,
            patient.patientStatus?.pain,
            patient.patientStatus?.alert,
            patient.patientStatus?.lethargic,
            patient.patientStatus?.obtunded,
            patient.patientStatus?.stupor,
            patient.management?.firstAidDressing,
            patient.management?.splinting,
            patient.management?.ambuBagging,
            patient.management?.oxygenTherapy,
            patient.management?.oxygenLitersPerMin,
            patient.management?.cpr,
            patient.management?.cprStarted,
            patient.management?.cprEnded,
            patient.management?.aed,
            patient.management?.medicationsGiven,
            patient.management?.medicationsSpecify,
            patient.management?.others,
            patient.management?.othersSpecify,
            patient.management?.headImmobilization,
            patient.management?.controlBleeding,
            patient.management?.ked,
            patient.causeOfInjuries,
            patient.typesOfInjuries,
            patient.locationOfIncident,
            patient.remarks,
            id
          ]);
        } else {
          await connection.query(`
            INSERT INTO patient_trauma 
            (id, patient_id, conscious, unconscious, deceased, verbal, pain, alert, lethargic, obtunded, stupor,
             first_aid_dressing, splinting, ambu_bagging, oxygen_therapy, oxygen_liters_per_min, cpr, cpr_started, cpr_ended,
             aed, medications_given, medications_specify, others, others_specify, head_immobilization, control_bleeding, ked,
             cause_of_injuries, types_of_injuries, location_of_incident, remarks)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            id,
            patient.patientStatus?.conscious || false,
            patient.patientStatus?.unconscious || false,
            patient.patientStatus?.deceased || false,
            patient.patientStatus?.verbal || false,
            patient.patientStatus?.pain || false,
            patient.patientStatus?.alert || false,
            patient.patientStatus?.lethargic || false,
            patient.patientStatus?.obtunded || false,
            patient.patientStatus?.stupor || false,
            patient.management?.firstAidDressing || false,
            patient.management?.splinting || false,
            patient.management?.ambuBagging || false,
            patient.management?.oxygenTherapy || false,
            patient.management?.oxygenLitersPerMin || '',
            patient.management?.cpr || false,
            patient.management?.cprStarted || '',
            patient.management?.cprEnded || '',
            patient.management?.aed || false,
            patient.management?.medicationsGiven || false,
            patient.management?.medicationsSpecify || '',
            patient.management?.others || false,
            patient.management?.othersSpecify || '',
            patient.management?.headImmobilization || false,
            patient.management?.controlBleeding || false,
            patient.management?.ked || false,
            patient.causeOfInjuries || null,
            patient.typesOfInjuries || null,
            patient.locationOfIncident || null,
            patient.remarks || null
          ]);
        }
      }

      // Update diagnostics if provided
      if (patient.chiefComplaint || patient.pertinentSymptoms || patient.allergies || 
          patient.currentMedications || patient.pastMedicalHistory || patient.lastOralIntake || 
          patient.historyOfPresentIllness) {
        const [existingDiagnostics] = await connection.query(
          'SELECT * FROM patient_diagnostics WHERE patient_id = ?',
          [id]
        ) as [any[], any];

        if (existingDiagnostics && existingDiagnostics.length > 0) {
          await connection.query(`
            UPDATE patient_diagnostics 
            SET chief_complaint = COALESCE(?, chief_complaint),
                pertinent_symptoms = COALESCE(?, pertinent_symptoms),
                allergies = COALESCE(?, allergies),
                current_medications = COALESCE(?, current_medications),
                past_medical_history = COALESCE(?, past_medical_history),
                last_oral_intake = COALESCE(?, last_oral_intake),
                history_of_present_illness = COALESCE(?, history_of_present_illness)
            WHERE patient_id = ?
          `, [
            patient.chiefComplaint,
            patient.pertinentSymptoms,
            patient.allergies,
            patient.currentMedications,
            patient.pastMedicalHistory,
            patient.lastOralIntake,
            patient.historyOfPresentIllness,
            id
          ]);
        } else {
          await connection.query(`
            INSERT INTO patient_diagnostics 
            (id, patient_id, chief_complaint, pertinent_symptoms, allergies, current_medications,
             past_medical_history, last_oral_intake, history_of_present_illness)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            id,
            patient.chiefComplaint || '',
            patient.pertinentSymptoms || '',
            patient.allergies || '',
            patient.currentMedications || '',
            patient.pastMedicalHistory || '',
            patient.lastOralIntake || '',
            patient.historyOfPresentIllness || ''
          ]);
        }
      }

      await connection.commit();
      return this.getPatient(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async deletePatient(id: string) {
    // The CASCADE delete will handle related records
    return query('DELETE FROM patients WHERE id = ?', [id]);
  },

  // Get all patients for a specific incident
  async getPatientsByIncident(incidentId: number) {
    let connection;
    try {
      if (!incidentId || isNaN(incidentId)) {
        throw new Error('Invalid incident ID');
      }

      connection = await pool.getConnection();

      const sql = `
        SELECT 
          p.id,
          p.name,
          p.age,
          p.gender,
          p.address,
          p.contact_number as contactNumber,
          p.contact_person as contactPerson,
          p.incident_id as incidentId,
          p.incident_type as incidentType,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          pd.chief_complaint as chiefComplaint,
          pd.pertinent_symptoms as pertinentSymptoms,
          pd.allergies,
          pd.current_medications as currentMedications,
          pd.past_medical_history as pastMedicalHistory,
          pd.last_oral_intake as lastOralIntake,
          pd.history_of_present_illness as historyOfPresentIllness,
          pvs.blood_pressure as bloodPressure,
          pvs.pulse_rate as pulseRate,
          pvs.respiratory_rate as respiratoryRate,
          pvs.temperature as temperature,
          pvs.oxygen_saturation as oxygenSaturation,
          pt.conscious,
          pt.unconscious,
          pt.deceased,
          pt.verbal,
          pt.pain,
          pt.alert,
          pt.lethargic,
          pt.obtunded,
          pt.stupor,
          pt.first_aid_dressing as firstAidDressing,
          pt.splinting,
          pt.ambu_bagging as ambuBagging,
          pt.oxygen_therapy as oxygenTherapy,
          pt.oxygen_liters_per_min as oxygenLitersPerMin,
          pt.cpr,
          pt.cpr_started as cprStarted,
          pt.cpr_ended as cprEnded,
          pt.aed,
          pt.medications_given as medicationsGiven,
          pt.medications_specify as medicationsSpecify,
          pt.others,
          pt.others_specify as othersSpecify,
          pt.head_immobilization as headImmobilization,
          pt.control_bleeding as controlBleeding,
          pt.ked,
          pt.cause_of_injuries as causeOfInjuries,
          pt.types_of_injuries as typesOfInjuries,
          pt.location_of_incident as locationOfIncident,
          pt.remarks
        FROM patients p
        LEFT JOIN patient_diagnostics pd ON p.id = pd.patient_id
        LEFT JOIN patient_vital_signs pvs ON p.id = pvs.patient_id
        LEFT JOIN patient_trauma pt ON p.id = pt.patient_id
        WHERE p.incident_id = ?
        ORDER BY p.created_at DESC
      `;

      const [results] = await connection.query(sql, [incidentId]) as [Record<string, any>[], any];
      
      if (!results || results.length === 0) {
        return [];
      }

      // Transform the flat results into nested objects
      const transformedResults = results.map(row => {
        if (!row.id) {
          return null;
        }

        const patient: Record<string, any> = {
          id: row.id,
          name: row.name || 'Unknown Patient',
          age: row.age || 'N/A',
          gender: row.gender || 'N/A',
          address: row.address || 'N/A',
          contactNumber: row.contactNumber || 'N/A',
          contactPerson: row.contactPerson || 'N/A',
          incidentId: parseInt(row.incidentId) || 0,
          incidentType: row.incidentType || 'Unknown',
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString(),
          chiefComplaint: row.chiefComplaint || null,
          pertinentSymptoms: row.pertinentSymptoms || null,
          allergies: row.allergies || null,
          currentMedications: row.currentMedications || null,
          pastMedicalHistory: row.pastMedicalHistory || null,
          lastOralIntake: row.lastOralIntake || null,
          historyOfPresentIllness: row.historyOfPresentIllness || null,
          causeOfInjuries: row.causeOfInjuries || null,
          typesOfInjuries: row.typesOfInjuries || null,
          locationOfIncident: row.locationOfIncident || null,
          remarks: row.remarks || null,
          vitalSigns: {
            bloodPressure: row.bloodPressure || 'N/A',
            pulseRate: row.pulseRate || 'N/A',
            respiratoryRate: row.respiratoryRate || 'N/A',
            temperature: row.temperature || 'N/A',
            oxygenSaturation: row.oxygenSaturation || 'N/A'
          },
          patientStatus: {
            conscious: Boolean(row.conscious),
            unconscious: Boolean(row.unconscious),
            deceased: Boolean(row.deceased),
            verbal: Boolean(row.verbal),
            pain: Boolean(row.pain),
            alert: Boolean(row.alert),
            lethargic: Boolean(row.lethargic),
            obtunded: Boolean(row.obtunded),
            stupor: Boolean(row.stupor)
          },
          management: {
            firstAidDressing: Boolean(row.firstAidDressing),
            splinting: Boolean(row.splinting),
            ambuBagging: Boolean(row.ambuBagging),
            oxygenTherapy: Boolean(row.oxygenTherapy),
            oxygenLitersPerMin: row.oxygenLitersPerMin || 'N/A',
            cpr: Boolean(row.cpr),
            cprStarted: row.cprStarted || null,
            cprEnded: row.cprEnded || null,
            aed: Boolean(row.aed),
            medicationsGiven: Boolean(row.medicationsGiven),
            medicationsSpecify: row.medicationsSpecify || null,
            others: Boolean(row.others),
            othersSpecify: row.othersSpecify || null,
            headImmobilization: Boolean(row.headImmobilization),
            controlBleeding: Boolean(row.controlBleeding),
            ked: Boolean(row.ked)
          }
        };
        
        return patient;
      }).filter(Boolean); // Remove any null entries

      return transformedResults;
    } catch (error) {
      console.error('Error in getPatientsByIncident:', error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  async updatePatientTrauma(patientId: string, traumaData: any) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      // Check if trauma record exists
      const [existing] = await connection.query(
        'SELECT * FROM patient_trauma WHERE patient_id = ?',
        [patientId]
      ) as [any[], any];

      // Prepare trauma fields
      const fields = [
        'cause_of_injuries', 'types_of_injuries', 'location_of_incident', 'remarks',
        'conscious', 'unconscious', 'deceased', 'verbal', 'pain', 'alert', 'lethargic', 'obtunded', 'stupor',
        'first_aid_dressing', 'splinting', 'ambu_bagging', 'oxygen_therapy', 'oxygen_liters_per_min',
        'cpr', 'cpr_started', 'cpr_ended', 'aed', 'medications_given', 'medications_specify',
        'others', 'others_specify', 'head_immobilization', 'control_bleeding', 'ked'
      ];
      const trauma = {
        cause_of_injuries: traumaData.causeOfInjuries || null,
        types_of_injuries: traumaData.typesOfInjuries || null,
        location_of_incident: traumaData.locationOfIncident || null,
        remarks: traumaData.remarks || null,
        conscious: traumaData.patientStatus?.conscious || false,
        unconscious: traumaData.patientStatus?.unconscious || false,
        deceased: traumaData.patientStatus?.deceased || false,
        verbal: traumaData.patientStatus?.verbal || false,
        pain: traumaData.patientStatus?.pain || false,
        alert: traumaData.patientStatus?.alert || false,
        lethargic: traumaData.patientStatus?.lethargic || false,
        obtunded: traumaData.patientStatus?.obtunded || false,
        stupor: traumaData.patientStatus?.stupor || false,
        first_aid_dressing: traumaData.management?.firstAidDressing || false,
        splinting: traumaData.management?.splinting || false,
        ambu_bagging: traumaData.management?.ambuBagging || false,
        oxygen_therapy: traumaData.management?.oxygenTherapy || false,
        oxygen_liters_per_min: traumaData.management?.oxygenLitersPerMin || null,
        cpr: traumaData.management?.cpr || false,
        cpr_started: traumaData.management?.cprStarted || null,
        cpr_ended: traumaData.management?.cprEnded || null,
        aed: traumaData.management?.aed || false,
        medications_given: traumaData.management?.medicationsGiven || false,
        medications_specify: traumaData.management?.medicationsSpecify || null,
        others: traumaData.management?.others || false,
        others_specify: traumaData.management?.othersSpecify || null,
        head_immobilization: traumaData.management?.headImmobilization || false,
        control_bleeding: traumaData.management?.controlBleeding || false,
        ked: traumaData.management?.ked || false
      };

      if (existing && existing.length > 0) {
        // Update
        await connection.query(
          `UPDATE patient_trauma SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = NOW() WHERE patient_id = ?`,
          [...fields.map(f => trauma[f]), patientId]
        );
      } else {
        // Insert
        const traumaId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : require('crypto').randomUUID();
        await connection.query(
          `INSERT INTO patient_trauma (id, patient_id, ${fields.join(', ')}) VALUES (?, ?, ${fields.map(_ => '?').join(', ')})`,
          [traumaId, patientId, ...fields.map(f => trauma[f])]
        );
      }
      await connection.commit();
      // Return updated trauma info
      const [traumaRow] = await connection.query('SELECT * FROM patient_trauma WHERE patient_id = ?', [patientId]) as [any[], any];
      return traumaRow?.[0] || null;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

export { pool };

export default db; 