const { db, query } = require('../lib/db');

async function setupAlerts() {
  try {
    // Create alerts table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        severity ENUM('High', 'Medium', 'Low') NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sample data
    const sampleAlerts = [
      {
        type: 'Fire Emergency',
        location: '123 Main St, Bayawan City',
        description: 'Large fire reported at residential building. Multiple units affected.',
        severity: 'High'
      },
      {
        type: 'Medical Emergency',
        location: '456 Santos Ave, Bayawan City',
        description: 'Elderly patient with severe chest pain. Requires immediate assistance.',
        severity: 'High'
      },
      {
        type: 'Traffic Accident',
        location: 'National Highway, Bayawan City',
        description: 'Multi-vehicle collision. Minor injuries reported.',
        severity: 'Medium'
      },
      {
        type: 'Natural Disaster',
        location: 'Coastal Area, Bayawan City',
        description: 'Flooding reported due to heavy rainfall. Several homes affected.',
        severity: 'High'
      },
      {
        type: 'Public Disturbance',
        location: 'Central Market, Bayawan City',
        description: 'Crowd control needed. Large gathering causing safety concerns.',
        severity: 'Low'
      }
    ];

    // Insert sample alerts
    for (const alert of sampleAlerts) {
      await db.createAlert(alert);
    }

    console.log('Alerts table created and sample data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up alerts:', error);
    process.exit(1);
  }
}

setupAlerts(); 