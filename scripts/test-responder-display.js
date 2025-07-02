const { createConnection } = require('./db-config');

async function testResponderDisplay() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Testing Responder Display in Dispatch Alerts...\n');
    
    // Test 1: Check alerts with responder information
    console.log('1. Checking alerts with responder information...');
    const [alerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);
    
    if (alerts.length > 0) {
      console.log(`✅ Found ${alerts.length} alerts:`);
      alerts.forEach(alert => {
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
      console.log('❌ No alerts found');
    }
    
    // Test 2: Simulate accepting an alert
    console.log('2. Testing alert acceptance...');
    const [pendingAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE a.status = 'Pending' OR a.status = 'pending'
      LIMIT 1
    `);
    
    const [availableResponders] = await connection.execute(`
      SELECT * FROM responders WHERE status = 'Available' LIMIT 1
    `);
    
    if (pendingAlerts.length > 0 && availableResponders.length > 0) {
      const alert = pendingAlerts[0];
      const responder = availableResponders[0];
      
      console.log(`   Testing with Alert #${alert.id} and Responder ${responder.name}`);
      
      // Simulate the API call
      const response = await fetch('http://localhost:3000/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: alert.id,
          status: 'accepted',
          responderId: responder.id
        })
      });
      
      if (response.ok) {
        console.log('   ✅ Alert accepted successfully');
        
        // Verify the update
        const [updatedAlert] = await connection.execute(`
          SELECT a.*, r.name as responder_name, r.username as responder_username
          FROM alerts a
          LEFT JOIN responders r ON a.responder_id = r.id
          WHERE a.id = ?
        `, [alert.id]);
        
        if (updatedAlert.length > 0) {
          console.log(`   Alert #${alert.id} is now assigned to ${updatedAlert[0].responder_name}`);
          console.log(`   Status: ${updatedAlert[0].status}`);
          console.log(`   Assigned at: ${updatedAlert[0].assigned_at}`);
        }
      } else {
        const error = await response.json();
        console.log(`   ❌ Failed to accept alert: ${error.error}`);
      }
    } else {
      console.log('   ⚠️ No pending alerts or available responders for testing');
    }
    
    // Test 3: Check alert_assignments table
    console.log('\n3. Checking alert_assignments table...');
    const [assignments] = await connection.execute(`
      SELECT aa.*, a.type as alert_type, r.name as responder_name
      FROM alert_assignments aa
      JOIN alerts a ON aa.alert_id = a.id
      JOIN responders r ON aa.responder_id = r.id
      ORDER BY aa.assigned_at DESC
      LIMIT 5
    `);
    
    if (assignments.length > 0) {
      console.log(`✅ Found ${assignments.length} assignments:`);
      assignments.forEach(assignment => {
        console.log(`   - Alert #${assignment.alert_id} (${assignment.alert_type}) assigned to ${assignment.responder_name}`);
        console.log(`     Status: ${assignment.status}, Assigned: ${assignment.assigned_at}`);
      });
    } else {
      console.log('❌ No assignments found');
    }
    
    console.log('\n🎉 Responder display test completed!');
    console.log('\n💡 To test the UI:');
    console.log('   1. Make sure the dev server is running: npm run dev');
    console.log('   2. Login with a responder account');
    console.log('   3. Go to the Dispatch tab');
    console.log('   4. Accept or decline an alert');
    console.log('   5. Check if the responder name appears below the reported datetime');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testResponderDisplay(); 