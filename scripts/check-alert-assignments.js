const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: '34.95.212.100',
  user: 'edms-responder',
  password: 'EDMS@dm1n',
  database: 'edms',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function checkAlertAssignments() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Checking Alert Assignments...\n');
    
    // Check alert_assignments table structure
    console.log('1. Alert Assignments table structure:');
    const [assignmentColumns] = await connection.execute('DESCRIBE alert_assignments');
    assignmentColumns.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type}`);
    });
    
    // Check all alert assignments
    console.log('\n2. All alert assignments:');
    const [assignments] = await connection.execute(`
      SELECT aa.*, a.type, a.location, r.name as responder_name
      FROM alert_assignments aa
      LEFT JOIN alerts a ON aa.alert_id = a.id
      LEFT JOIN responders r ON aa.responder_id = r.id
      ORDER BY aa.alert_id
    `);
    
    if (assignments.length > 0) {
      console.log(`✅ Found ${assignments.length} alert assignments:`);
      assignments.forEach(assignment => {
        console.log(`   - Alert #${assignment.alert_id}: ${assignment.type} at ${assignment.location}`);
        console.log(`     Status: ${assignment.status}`);
        console.log(`     Responder: ${assignment.responder_name || 'Unknown'}`);
        console.log(`     Assigned at: ${assignment.assigned_at}`);
        console.log(`     Unassigned at: ${assignment.unassigned_at || 'Still assigned'}`);
        console.log('');
      });
    } else {
      console.log('❌ No alert assignments found');
    }
    
    // Check which alerts have no assignments
    console.log('3. Alerts without assignments:');
    const [unassignedAlerts] = await connection.execute(`
      SELECT a.id, a.type, a.location, a.status
      FROM alerts a
      LEFT JOIN alert_assignments aa ON a.id = aa.alert_id AND aa.unassigned_at IS NULL
      WHERE aa.id IS NULL
      ORDER BY a.id
    `);
    
    if (unassignedAlerts.length > 0) {
      console.log(`⚠️ Found ${unassignedAlerts.length} alerts without assignments:`);
      unassignedAlerts.forEach(alert => {
        console.log(`   - Alert #${alert.id}: ${alert.type} at ${alert.location} (${alert.status})`);
      });
    } else {
      console.log('✅ All alerts have assignments');
    }
    
    // Check responders table
    console.log('\n4. Available responders:');
    const [responders] = await connection.execute('SELECT id, name, username, status FROM responders');
    
    if (responders.length > 0) {
      console.log(`✅ Found ${responders.length} responders:`);
      responders.forEach(responder => {
        console.log(`   - ID ${responder.id}: ${responder.name} (${responder.username}) - ${responder.status}`);
      });
    } else {
      console.log('❌ No responders found');
    }
    
    console.log('\n🎉 Alert assignments check completed!');
    console.log('\n💡 Summary:');
    console.log('   - Null values appear because alerts have no entries in alert_assignments table');
    console.log('   - Only alerts with assignments will show responder information');
    console.log('   - To fix nulls, assign responders to alerts via the assignment system');
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkAlertAssignments(); 