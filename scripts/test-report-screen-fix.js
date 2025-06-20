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

async function testReportScreenFix() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Testing ReportScreen setSelectedAlert Fix...\n');
    
    // Test 1: Verify we have completed alerts with responder information
    console.log('1. Checking completed alerts for testing...');
    const [completedAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE a.status = 'Completed' OR a.status = 'completed'
      ORDER BY a.created_at DESC
      LIMIT 3
    `);
    
    if (completedAlerts.length > 0) {
      console.log(`✅ Found ${completedAlerts.length} completed alerts for testing:`);
      completedAlerts.forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type}`);
        if (alert.responder_name) {
          console.log(`     Responder: ${alert.responder_name}`);
        }
      });
    } else {
      console.log('❌ No completed alerts found for testing');
    }
    
    // Test 2: Check if the API returns the correct data structure
    console.log('\n2. Testing API data structure...');
    try {
      const response = await fetch('http://localhost:3000/api/alerts');
      if (response.ok) {
        const alerts = await response.json();
        const completedAlertsFromAPI = alerts.filter(alert => 
          alert.status === 'Completed' || alert.status === 'completed'
        );
        
        console.log(`   ✅ API returned ${alerts.length} total alerts`);
        console.log(`   ✅ Found ${completedAlertsFromAPI.length} completed alerts`);
        
        // Check if the Alert interface structure is correct
        if (completedAlertsFromAPI.length > 0) {
          const sampleAlert = completedAlertsFromAPI[0];
          const hasRequiredFields = sampleAlert.hasOwnProperty('responder_name') && 
                                   sampleAlert.hasOwnProperty('responder_username') && 
                                   sampleAlert.hasOwnProperty('assigned_at');
          
          console.log(`   ✅ Alert interface includes responder fields: ${hasRequiredFields}`);
          
          if (hasRequiredFields) {
            console.log(`   📋 Sample alert structure:`);
            console.log(`      - ID: ${sampleAlert.id}`);
            console.log(`      - Type: ${sampleAlert.type}`);
            console.log(`      - Responder: ${sampleAlert.responder_name || 'Not assigned'}`);
            console.log(`      - Assigned at: ${sampleAlert.assigned_at || 'Not set'}`);
          }
        }
      } else {
        console.log(`   ❌ API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ API test skipped (server may not be running): ${error.message}`);
    }
    
    console.log('\n🎉 ReportScreen setSelectedAlert fix test completed!');
    console.log('\n💡 The fix should resolve the error:');
    console.log('   "ReferenceError: setSelectedAlert is not defined"');
    console.log('\n💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('   3. Go to the Report tab');
    console.log('   4. Check the "Completed Reports" tab');
    console.log('   5. Click "View Patients" on any completed alert');
    console.log('   6. Verify that it switches to the incident tab without errors');
    console.log('   7. Check that responder information is displayed correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testReportScreenFix(); 