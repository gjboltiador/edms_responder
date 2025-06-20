const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'sql12.freesqldatabase.com',
  user: 'sql12785202',
  password: 'IGkaKLGJxR',
  database: 'sql12785202',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testERTReports() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Testing ERT Reports Responder Display...\n');
    
    // Test 1: Check completed alerts with responder information
    console.log('1. Checking completed alerts with responder information...');
    const [completedAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE a.status = 'Completed' OR a.status = 'completed'
      ORDER BY a.created_at DESC
    `);
    
    if (completedAlerts.length > 0) {
      console.log(`✅ Found ${completedAlerts.length} completed alerts:`);
      completedAlerts.forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type} at ${alert.location}`);
        console.log(`     Status: ${alert.status}`);
        if (alert.responder_name) {
          console.log(`     Responder: ${alert.responder_name} (${alert.responder_username})`);
          console.log(`     Assigned at: ${alert.assigned_at}`);
        } else {
          console.log(`     Responder: Not assigned`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No completed alerts found');
    }
    
    // Test 2: Test the API endpoint for fetching alerts
    console.log('2. Testing API endpoint for fetching alerts...');
    try {
      const response = await fetch('http://localhost:3000/api/alerts');
      if (response.ok) {
        const alerts = await response.json();
        const completedAlertsFromAPI = alerts.filter(alert => 
          alert.status === 'Completed' || alert.status === 'completed'
        );
        console.log(`   ✅ API returned ${alerts.length} total alerts`);
        console.log(`   ✅ Found ${completedAlertsFromAPI.length} completed alerts via API`);
        
        // Check if responder information is included
        const alertsWithResponder = completedAlertsFromAPI.filter(alert => alert.responder_name);
        console.log(`   ✅ ${alertsWithResponder.length} completed alerts have responder information`);
        
        if (alertsWithResponder.length > 0) {
          console.log('   📋 Sample alert with responder info:');
          const sample = alertsWithResponder[0];
          console.log(`      - Alert #${sample.id}: ${sample.type}`);
          console.log(`      - Responder: ${sample.responder_name} (${sample.responder_username})`);
          console.log(`      - Assigned at: ${sample.assigned_at}`);
        }
      } else {
        console.log(`   ❌ API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ API test skipped (server may not be running): ${error.message}`);
    }
    
    // Test 3: Create a test completed alert with responder for UI testing
    console.log('\n3. Creating test completed alert with responder for UI testing...');
    try {
      // First, get an available responder
      const [responders] = await connection.execute(`
        SELECT * FROM responders WHERE status = 'Available' LIMIT 1
      `);
      
      if (responders.length > 0) {
        const responder = responders[0];
        
        // Create a test completed alert
        const [testAlertResult] = await connection.execute(`
          INSERT INTO alerts (type, location, description, severity, status, created_at, latitude, longitude, responder_id, assigned_at)
          VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, NOW())
        `, [
          'ERT Test Emergency',
          'ERT Test Location, Bayawan City',
          'This is a test emergency for ERT Reports responder display testing. This alert should show the assigned responder in the completed reports section.',
          'high',
          'Completed',
          9.3655,
          122.8049,
          responder.id
        ]);
        
        const testAlertId = testAlertResult.insertId;
        console.log(`   ✅ Created test completed alert #${testAlertId} assigned to ${responder.name}`);
        
        // Verify the alert was created with responder info
        const [verifyAlert] = await connection.execute(`
          SELECT a.*, r.name as responder_name, r.username as responder_username
          FROM alerts a
          LEFT JOIN responders r ON a.responder_id = r.id
          WHERE a.id = ?
        `, [testAlertId]);
        
        if (verifyAlert.length > 0) {
          const alert = verifyAlert[0];
          console.log(`   ✅ Verified alert #${alert.id}:`);
          console.log(`      Type: ${alert.type}`);
          console.log(`      Status: ${alert.status}`);
          console.log(`      Responder: ${alert.responder_name} (${alert.responder_username})`);
          console.log(`      Assigned at: ${alert.assigned_at}`);
        }
      } else {
        console.log('   ⚠️ No available responders to assign');
      }
    } catch (error) {
      console.log(`   ❌ Failed to create test alert: ${error.message}`);
    }
    
    // Test 4: Final verification of all completed alerts
    console.log('\n4. Final verification of completed alerts...');
    const [finalAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE a.status = 'Completed' OR a.status = 'completed'
      ORDER BY a.created_at DESC
    `);
    
    if (finalAlerts.length > 0) {
      console.log(`✅ Found ${finalAlerts.length} completed alerts:`);
      const alertsWithResponder = finalAlerts.filter(alert => alert.responder_name);
      const alertsWithoutResponder = finalAlerts.filter(alert => !alert.responder_name);
      
      console.log(`   📊 Summary:`);
      console.log(`      - Total completed alerts: ${finalAlerts.length}`);
      console.log(`      - Alerts with responder: ${alertsWithResponder.length}`);
      console.log(`      - Alerts without responder: ${alertsWithoutResponder.length}`);
      
      if (alertsWithResponder.length > 0) {
        console.log(`   📋 Alerts with responder information:`);
        alertsWithResponder.forEach(alert => {
          console.log(`      - Alert #${alert.id}: ${alert.type} → ${alert.responder_name}`);
        });
      }
    } else {
      console.log('❌ No completed alerts found');
    }
    
    console.log('\n🎉 ERT Reports responder display test completed!');
    console.log('\n💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('   3. Go to the Report tab');
    console.log('   4. Check the "Completed Reports" tab');
    console.log('   5. Verify that responder names appear below the description');
    console.log('   6. Click "View Patients" to see responder info in incident summary');
    console.log('   7. Look for the "ERT Test Emergency" alert to see the new test data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testERTReports(); 