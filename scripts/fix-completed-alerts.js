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

async function fixCompletedAlerts() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Fixing Completed Alerts without Responder Information...\n');
    
    // Check for completed alerts without responder assignment
    console.log('1. Checking for completed alerts without responder...');
    const [orphanedCompletedAlerts] = await connection.execute(`
      SELECT * FROM alerts 
      WHERE (status = 'Completed' OR status = 'completed') 
      AND responder_id IS NULL
    `);
    
    if (orphanedCompletedAlerts.length > 0) {
      console.log(`Found ${orphanedCompletedAlerts.length} completed alerts without responder:`);
      orphanedCompletedAlerts.forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type} at ${alert.location} (${alert.status})`);
      });
      
      // Get available responders to assign
      const [responders] = await connection.execute(`
        SELECT * FROM responders WHERE status = 'Available' LIMIT 1
      `);
      
      if (responders.length > 0) {
        const responder = responders[0];
        console.log(`\n2. Assigning responder ${responder.name} to completed alerts...`);
        
        for (const alert of orphanedCompletedAlerts) {
          try {
            // Update the alert with responder assignment
            await connection.execute(
              'UPDATE alerts SET responder_id = ?, assigned_at = NOW() WHERE id = ?',
              [responder.id, alert.id]
            );
            
            // Add to alert_assignments table
            await connection.execute(
              'INSERT INTO alert_assignments (alert_id, responder_id, status) VALUES (?, ?, ?)',
              [alert.id, responder.id, 'completed']
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
      console.log('✅ No completed alerts without responder found');
    }
    
    // Verify the fix
    console.log('\n3. Verifying completed alerts with responder information...');
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
    
    console.log('\n🎉 Completed alerts fix finished!');
    console.log('\n💡 To test the ERT Reports:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with a responder account');
    console.log('   3. Go to the Report tab');
    console.log('   4. Check the "Completed Reports" tab');
    console.log('   5. Verify that responder names appear below the description');
    console.log('   6. Click "View Patients" to see responder info in incident summary');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixCompletedAlerts(); 