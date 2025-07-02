const { createConnection } = require('./db-config');

async function testAlertAssignment() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Testing Alert Assignment Functionality...\n');
    
    // Test 1: Check available responders
    console.log('1. Checking available responders...');
    const [responders] = await connection.execute(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM alerts a WHERE a.responder_id = r.id AND a.status IN ('Assigned', 'In Progress')) as active_assignments
      FROM responders r
      WHERE r.status = 'Available'
      ORDER BY active_assignments ASC, r.last_active DESC
    `);
    
    if (responders.length > 0) {
      console.log(`✅ Found ${responders.length} available responders:`);
      responders.forEach(r => {
        console.log(`   - ${r.name} (${r.username}) - ${r.active_assignments} active assignments`);
      });
    } else {
      console.log('❌ No available responders found');
    }
    
    // Test 2: Check unassigned alerts
    console.log('\n2. Checking unassigned alerts...');
    const [unassignedAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE a.responder_id IS NULL AND a.status IN ('Pending', 'New')
      ORDER BY a.created_at DESC
    `);
    
    if (unassignedAlerts.length > 0) {
      console.log(`✅ Found ${unassignedAlerts.length} unassigned alerts:`);
      unassignedAlerts.slice(0, 3).forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type} (${alert.severity}) - ${alert.location}`);
      });
    } else {
      console.log('❌ No unassigned alerts found');
    }
    
    // Test 3: Assign a responder to an alert (if both exist)
    if (responders.length > 0 && unassignedAlerts.length > 0) {
      console.log('\n3. Testing responder assignment...');
      const responder = responders[0];
      const alert = unassignedAlerts[0];
      
      console.log(`   Assigning ${responder.name} to Alert #${alert.id}...`);
      
      // Start transaction
      await connection.beginTransaction();
      
      try {
        // Check if responder is available
        const [responderCheck] = await connection.execute(
          'SELECT status FROM responders WHERE id = ?',
          [responder.id]
        );
        
        if (responderCheck[0].status !== 'Available') {
          throw new Error('Responder is not available');
        }
        
        // Check if alert is already assigned
        const [alertCheck] = await connection.execute(
          'SELECT responder_id, status FROM alerts WHERE id = ?',
          [alert.id]
        );
        
        if (alertCheck[0].responder_id) {
          throw new Error('Alert is already assigned to a responder');
        }
        
        // Update alert with responder assignment
        await connection.execute(
          'UPDATE alerts SET responder_id = ?, assigned_at = NOW(), status = ? WHERE id = ?',
          [responder.id, 'Assigned', alert.id]
        );
        
        // Update responder status to Busy
        await connection.execute(
          'UPDATE responders SET status = ? WHERE id = ?',
          ['Busy', responder.id]
        );
        
        // Log the assignment
        await connection.execute(
          'INSERT INTO alert_assignments (alert_id, responder_id, status) VALUES (?, ?, ?)',
          [alert.id, responder.id, 'assigned']
        );
        
        await connection.commit();
        console.log('   ✅ Assignment successful!');
        
        // Verify the assignment
        const [updatedAlert] = await connection.execute(`
          SELECT a.*, r.name as responder_name, r.username as responder_username
          FROM alerts a
          LEFT JOIN responders r ON a.responder_id = r.id
          WHERE a.id = ?
        `, [alert.id]);
        
        console.log(`   Alert #${alert.id} is now assigned to ${updatedAlert[0].responder_name}`);
        
      } catch (error) {
        await connection.rollback();
        console.log(`   ❌ Assignment failed: ${error.message}`);
      }
    } else {
      console.log('\n3. Skipping assignment test (no responders or alerts available)');
    }
    
    // Test 4: Check alert_assignments table
    console.log('\n4. Checking alert_assignments table...');
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
        console.log(`   - Alert #${assignment.alert_id} (${assignment.alert_type}) assigned to ${assignment.responder_name} - Status: ${assignment.status}`);
      });
    } else {
      console.log('❌ No assignments found');
    }
    
    console.log('\n🎉 Alert assignment functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testAlertAssignment(); 