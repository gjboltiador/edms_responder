const { createConnection } = require('./db-config');

async function testERTReports() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Testing ERT Reports Responder Display...\n');
    
    // Test 1: Check database schema first
    console.log('1. Checking database schema...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Test 2: Check alerts table structure
    console.log('\n2. Checking alerts table structure...');
    const [alertColumns] = await connection.execute('DESCRIBE alerts');
    console.log('📋 Alerts table columns:');
    alertColumns.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type}`);
    });
    
    // Test 3: Check completed alerts with correct schema
    console.log('\n3. Checking completed alerts...');
    const [completedAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username, aa.assigned_at
      FROM alerts a
      LEFT JOIN alert_assignments aa ON a.id = aa.alert_id AND aa.unassigned_at IS NULL
      LEFT JOIN responders r ON aa.responder_id = r.id
      WHERE a.status = 'completed' OR a.status = 'Completed'
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
    
    // Test 4: Check all alert statuses
    console.log('\n4. Checking all alert statuses...');
    const [allAlerts] = await connection.execute(`
      SELECT id, type, status, created_at
      FROM alerts
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total alerts: ${allAlerts.length}`);
    const statusCounts = {};
    allAlerts.forEach(alert => {
      statusCounts[alert.status] = (statusCounts[alert.status] || 0) + 1;
    });
    
    console.log('📋 Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} alerts`);
    });
    
    // Test 5: Test the API endpoint for fetching alerts
    console.log('\n5. Testing API endpoint for fetching alerts...');
    try {
      const response = await fetch('http://localhost:3000/api/alerts');
      if (response.ok) {
        const alerts = await response.json();
        const completedAlertsFromAPI = alerts.filter(alert => 
          alert.status === 'Completed' || alert.status === 'completed'
        );
        console.log(`   ✅ API returned ${alerts.length} total alerts`);
        console.log(`   ✅ Found ${completedAlertsFromAPI.length} completed alerts via API`);
        
        if (completedAlertsFromAPI.length > 0) {
          console.log('   📋 Completed alerts from API:');
          completedAlertsFromAPI.forEach(alert => {
            console.log(`      - Alert #${alert.id}: ${alert.type} (${alert.status})`);
          });
        }
      } else {
        console.log(`   ❌ API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ API test skipped (server may not be running): ${error.message}`);
    }
    
    console.log('\n🎉 ERT Reports test completed!');
    console.log('\n💡 Key findings:');
    console.log('   - Check the status distribution above');
    console.log('   - Verify that completed alerts exist');
    console.log('   - Test the UI with the actual data');
    
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