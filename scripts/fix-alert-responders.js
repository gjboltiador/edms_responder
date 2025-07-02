const { createConnection } = require('./db-config');

async function fixAlertResponders() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Fixing Alert Responder Assignments...\n');
    
    // Check for alerts with accepted/declined status but no responder
    console.log('1. Checking for alerts with accepted/declined status but no responder...');
    const [orphanedAlerts] = await connection.execute(`
      SELECT * FROM alerts 
      WHERE (status = 'accepted' OR status = 'declined') 
      AND responder_id IS NULL
    `);
    
    if (orphanedAlerts.length > 0) {
      console.log(`Found ${orphanedAlerts.length} alerts with accepted/declined status but no responder:`);
      orphanedAlerts.forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type} at ${alert.location} (${alert.status})`);
      });
      
      // Get available responders to assign
      const [responders] = await connection.execute(`
        SELECT * FROM responders WHERE status = 'Available' LIMIT 1
      `);
      
      if (responders.length > 0) {
        const responder = responders[0];
        console.log(`\n2. Assigning responder ${responder.name} to orphaned alerts...`);
        
        for (const alert of orphanedAlerts) {
          try {
            // Update the alert with responder assignment
            await connection.execute(
              'UPDATE alerts SET responder_id = ?, assigned_at = NOW() WHERE id = ?',
              [responder.id, alert.id]
            );
            
            // Add to alert_assignments table
            await connection.execute(
              'INSERT INTO alert_assignments (alert_id, responder_id, status) VALUES (?, ?, ?)',
              [alert.id, responder.id, alert.status]
            );
            
            console.log(`   ✅ Alert #${alert.id} assigned to ${responder.name}`);
          } catch (error) {
            console.log(`   ❌ Failed to assign Alert #${alert.id}: ${error.message}`);
          }
        }
      } else {
        console.log('   ⚠️ No available responders to assign');
      }
    } else {
      console.log('✅ No orphaned alerts found');
    }
    
    // Test the new functionality
    console.log('\n3. Testing updated alerts with responder information...');
    const [updatedAlerts] = await connection.execute(`
      SELECT a.*, r.name as responder_name, r.username as responder_username
      FROM alerts a
      LEFT JOIN responders r ON a.responder_id = r.id
      WHERE (a.status = 'accepted' OR a.status = 'declined')
      ORDER BY a.created_at DESC
    `);
    
    if (updatedAlerts.length > 0) {
      console.log(`✅ Found ${updatedAlerts.length} accepted/declined alerts with responder info:`);
      updatedAlerts.forEach(alert => {
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
      console.log('❌ No accepted/declined alerts found');
    }
    
    // Create a test alert for UI testing
    console.log('\n4. Creating a test alert for UI testing...');
    try {
      const [testAlertResult] = await connection.execute(`
        INSERT INTO alerts (type, location, description, severity, status, created_at, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
      `, [
        'Test Emergency',
        'Test Location, Bayawan City',
        'This is a test emergency for UI testing',
        'medium',
        'pending',
        9.3655,
        122.8049
      ]);
      
      const testAlertId = testAlertResult.insertId;
      console.log(`   ✅ Created test alert #${testAlertId}`);
      
      // Also create a test responder if needed
      const [existingResponders] = await connection.execute(`
        SELECT * FROM responders WHERE username = 'test_responder'
      `);
      
      if (existingResponders.length === 0) {
        const [testResponderResult] = await connection.execute(`
          INSERT INTO responders (username, name, contact_number, status)
          VALUES (?, ?, ?, ?)
        `, [
          'test_responder',
          'Test Responder',
          '+639123456789',
          'Available'
        ]);
        
        console.log(`   ✅ Created test responder with ID ${testResponderResult.insertId}`);
      } else {
        console.log(`   ℹ️ Test responder already exists`);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to create test data: ${error.message}`);
    }
    
    console.log('\n🎉 Alert responder fix completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder');
    console.log('   3. Go to the Dispatch tab');
    console.log('   4. Accept or decline the test alert');
    console.log('   5. Verify that your name appears below the reported datetime');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixAlertResponders(); 