const { createConnection } = require('./db-config');

const dummyAlerts = [
  {
    type: 'Medical Emergency',
    location: '123 Main St, Bayawan City',
    description: 'Patient experiencing chest pain and shortness of breath',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3647,
    longitude: 122.8047
  },
  {
    type: 'Traffic Accident',
    location: '456 Santos Ave, Bayawan City',
    description: 'Two vehicles involved in a rear-end collision',
    severity: 'Medium',
    status: 'Pending',
    latitude: 9.3650,
    longitude: 122.8050
  },
  {
    type: 'Fire Emergency',
    location: '789 Pine Rd, Bayawan City',
    description: 'Smoke reported from apartment building',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3655,
    longitude: 122.8055
  },
  {
    type: 'Medical Emergency',
    location: '321 Elm St, Bayawan City',
    description: 'Elderly patient with severe dehydration',
    severity: 'Medium',
    status: 'Pending',
    latitude: 9.3660,
    longitude: 122.8060
  },
  {
    type: 'Traffic Accident',
    location: '654 Maple Dr, Bayawan City',
    description: 'Motorcycle accident with injuries',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3665,
    longitude: 122.8065
  },
  {
    type: 'Fire Emergency',
    location: '987 Cedar Ln, Bayawan City',
    description: 'Kitchen fire in residential building',
    severity: 'Medium',
    status: 'Pending',
    latitude: 9.3670,
    longitude: 122.8070
  },
  {
    type: 'Medical Emergency',
    location: '147 Birch St, Bayawan City',
    description: 'Child with high fever and seizures',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3675,
    longitude: 122.8075
  },
  {
    type: 'Traffic Accident',
    location: '258 Willow Ave, Bayawan City',
    description: 'Multi-vehicle pileup on highway',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3680,
    longitude: 122.8080
  },
  {
    type: 'Fire Emergency',
    location: '369 Spruce Rd, Bayawan City',
    description: 'Industrial building fire with chemical exposure',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3685,
    longitude: 122.8085
  },
  {
    type: 'Medical Emergency',
    location: '741 Aspen Dr, Bayawan City',
    description: 'Construction worker with severe head injury',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3690,
    longitude: 122.8090
  },
  {
    type: 'Traffic Accident',
    location: '852 Redwood Ln, Bayawan City',
    description: 'Bus accident with multiple passengers',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3695,
    longitude: 122.8095
  },
  {
    type: 'Fire Emergency',
    location: '963 Sequoia St, Bayawan City',
    description: 'Wildfire spreading near residential area',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3700,
    longitude: 122.8100
  },
  {
    type: 'Medical Emergency',
    location: '159 Magnolia Ave, Bayawan City',
    description: 'Pregnant woman in labor',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3705,
    longitude: 122.8105
  },
  {
    type: 'Traffic Accident',
    location: '357 Dogwood Rd, Bayawan City',
    description: 'Pedestrian hit by vehicle',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3710,
    longitude: 122.8110
  },
  {
    type: 'Fire Emergency',
    location: '486 Cherry Ln, Bayawan City',
    description: 'Gas leak with potential explosion risk',
    severity: 'High',
    status: 'Pending',
    latitude: 9.3715,
    longitude: 122.8115
  }
];

async function seedAlerts() {
  const connection = await createConnection();

  try {
    // Clear existing alerts
    await connection.execute('DELETE FROM alerts');
    console.log('Cleared existing alerts');

    // Insert new alerts
    for (const alert of dummyAlerts) {
      await connection.execute(
        'INSERT INTO alerts (type, location, description, severity, status, created_at, latitude, longitude) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)',
        [alert.type, alert.location, alert.description, alert.severity, alert.status, alert.latitude, alert.longitude]
      );
    }
    console.log('Successfully inserted 15 dummy alerts');
  } catch (error) {
    console.error('Error seeding alerts:', error);
  } finally {
    await connection.end();
  }
}

seedAlerts(); 