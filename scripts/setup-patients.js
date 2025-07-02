const { createConnection } = require('./db-config');
const { v4: uuidv4 } = require('uuid');

async function setupPatients() {
  const connection = await createConnection();

  try {
    // Read and execute the schema file
    const fs = require('fs');
    const schema = fs.readFileSync('./lib/schema.sql', 'utf8');
    
    // Split and execute each statement
    const statements = schema.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Successfully created patient tables!');

    // Insert a sample patient with related data
    const patientId = uuidv4();
    const diagnosticId = uuidv4();
    const vitalSignsId = uuidv4();
    const statusId = uuidv4();
    const managementId = uuidv4();
    const traumaId = uuidv4();

    // Insert patient
    await connection.query(`
      INSERT INTO patients (id, name, age, gender, address, contact_number, contact_person)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [patientId, 'John Doe', '45', 'male', '123 Main St, Bayawan City', '+1234567890', 'Jane Doe']);

    // Insert diagnostic information
    await connection.query(`
      INSERT INTO patient_diagnostics (id, patient_id, chief_complaint, pertinent_symptoms)
      VALUES (?, ?, ?, ?)
    `, [diagnosticId, patientId, 'Chest pain', 'Shortness of breath']);

    // Insert vital signs
    await connection.query(`
      INSERT INTO patient_vital_signs (id, patient_id, blood_pressure, pulse_rate, respiratory_rate, temperature, oxygen_saturation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [vitalSignsId, patientId, '120/80', '72', '16', '37.0', '98']);

    // Insert patient status
    await connection.query(`
      INSERT INTO patient_status (id, patient_id, conscious, alert)
      VALUES (?, ?, ?, ?)
    `, [statusId, patientId, true, true]);

    // Insert management information
    await connection.query(`
      INSERT INTO patient_management (id, patient_id, oxygen_therapy, oxygen_liters_per_min)
      VALUES (?, ?, ?, ?)
    `, [managementId, patientId, true, '2']);

    // Insert trauma information
    await connection.query(`
      INSERT INTO patient_trauma (id, patient_id, mechanism_of_injury, location_of_incident)
      VALUES (?, ?, ?, ?)
    `, [traumaId, patientId, 'Fall from height', 'Construction site']);

    console.log('Successfully inserted sample patient data!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

setupPatients(); 