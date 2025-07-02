const { createConnection } = require('./db-config');

async function setup() {
  const connection = await createConnection();

  try {
    // First, delete existing data
    await connection.query('DELETE FROM alerts');
    console.log('Cleared existing alerts data');

    // Insert sample data
    const insertQuery = `
      INSERT INTO alerts (type, location, description, severity, status) VALUES
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?)
    `;

    const values = [
      'Fire Emergency', '123 Main St, Bayawan City', 'Large fire reported at residential building. Multiple units affected.', 'High', 'Pending',
      'Medical Emergency', '456 Santos Ave, Bayawan City', 'Elderly patient with severe chest pain. Requires immediate assistance.', 'High', 'Pending',
      'Traffic Accident', 'National Highway, Bayawan City', 'Multi-vehicle collision. Minor injuries reported.', 'Medium', 'Pending',
      'Natural Disaster', 'Coastal Area, Bayawan City', 'Flooding reported due to heavy rainfall. Several homes affected.', 'High', 'Pending',
      'Public Disturbance', 'Central Market, Bayawan City', 'Crowd control needed. Large gathering causing safety concerns.', 'Low', 'Pending'
    ];

    await connection.query(insertQuery, values);
    console.log('Inserted sample data');

    // Verify the data
    const [rows] = await connection.query('SELECT * FROM alerts');
    console.log('Current alerts in database:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

setup(); 