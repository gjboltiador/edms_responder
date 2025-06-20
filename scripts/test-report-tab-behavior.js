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

async function testReportTabBehavior() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Testing ERT Reports Tab Behavior...\n');
    
    // Test 1: Check completed alerts for testing
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
    
    // Test 2: Check active alerts for testing
    console.log('\n2. Checking active alerts for testing...');
    const [activeAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE a.status = 'accepted' OR a.status = 'Accepted'
      ORDER BY a.created_at DESC
      LIMIT 3
    `);
    
    if (activeAlerts.length > 0) {
      console.log(`✅ Found ${activeAlerts.length} active alerts for testing:`);
      activeAlerts.forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type} (${alert.status})`);
        if (alert.responder_name) {
          console.log(`     Responder: ${alert.responder_name}`);
        }
      });
    } else {
      console.log('❌ No active alerts found for testing');
    }
    
    // Test 3: Test the API endpoint behavior
    console.log('\n3. Testing API endpoint behavior...');
    try {
      const response = await fetch('http://localhost:3000/api/alerts');
      if (response.ok) {
        const alerts = await response.json();
        const completedAlertsFromAPI = alerts.filter(alert => 
          alert.status === 'Completed' || alert.status === 'completed'
        );
        const activeAlertsFromAPI = alerts.filter(alert => 
          alert.status === 'accepted' || alert.status === 'Accepted'
        );
        
        console.log(`   ✅ API returned ${alerts.length} total alerts`);
        console.log(`   ✅ Found ${completedAlertsFromAPI.length} completed alerts`);
        console.log(`   ✅ Found ${activeAlertsFromAPI.length} active alerts`);
        
        if (completedAlertsFromAPI.length > 0) {
          console.log(`   📋 Sample completed alert: Alert #${completedAlertsFromAPI[0].id} - ${completedAlertsFromAPI[0].type}`);
        }
        
        if (activeAlertsFromAPI.length > 0) {
          console.log(`   📋 Sample active alert: Alert #${activeAlertsFromAPI[0].id} - ${activeAlertsFromAPI[0].type}`);
        }
      } else {
        console.log(`   ❌ API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ API test skipped (server may not be running): ${error.message}`);
    }
    
    console.log('\n🎉 Report Tab Behavior test completed!');
    console.log('\n💡 Expected Behavior:');
    console.log('   1. When user clicks Report tab directly (no selectedAlert):');
    console.log('      → Should open "Completed Reports" tab by default');
    console.log('      → Should show list of all completed alerts');
    console.log('      → Should display responder information for each alert');
    console.log('');
    console.log('   2. When user clicks "ERT Report" from Dispatch (with selectedAlert):');
    console.log('      → Should open "Incident Reports" tab by default');
    console.log('      → Should show the selected alert details');
    console.log('      → Should display responder information in incident summary');
    console.log('      → Should allow adding/viewing patients');
    console.log('');
    console.log('💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('   3. Test Scenario 1: Click Report tab directly');
    console.log('      → Should show "Completed Reports" tab');
    console.log('   4. Test Scenario 2: Go to Dispatch tab, click "ERT Report"');
    console.log('      → Should show "Incident Reports" tab with alert details');
    console.log('   5. Test Scenario 3: From Completed Reports, click "View Patients"');
    console.log('      → Should switch to "Incident Reports" tab');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testReportTabBehavior(); 