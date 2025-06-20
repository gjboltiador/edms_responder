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

async function fixTestResponderUserId() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n🔧 Fixing test_responder user_id...\n');
    
    // Check current state
    console.log('1. Checking current responder table state...');
    const [responders] = await connection.execute(`
      SELECT r.id, r.username, r.name, r.user_id, r.contact_number, r.status
      FROM responders r
      ORDER BY r.id
    `);
    
    console.log(`✅ Found ${responders.length} responders:`);
    responders.forEach(responder => {
      console.log(`   - ID: ${responder.id}, Username: ${responder.username}`);
      console.log(`     Name: ${responder.name}, User ID: ${responder.user_id || 'NULL'}`);
      console.log(`     Contact: ${responder.contact_number}, Status: ${responder.status}`);
      console.log('');
    });
    
    // Check users table
    console.log('2. Checking users table...');
    const [users] = await connection.execute(`
      SELECT id, username, firstname, lastname
      FROM users
      ORDER BY id
    `);
    
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Username: ${user.username}`);
      console.log(`     Name: ${user.firstname} ${user.lastname}`);
      console.log('');
    });
    
    // Find the test_responder user
    const testResponderUser = users.find(u => u.username === 'test_responder');
    const testResponderRecord = responders.find(r => r.username === 'test_responder');
    
    if (testResponderUser && testResponderRecord) {
      console.log('3. Fixing test_responder user_id...');
      console.log(`   - User ID: ${testResponderUser.id}`);
      console.log(`   - Responder ID: ${testResponderRecord.id}`);
      console.log(`   - Current user_id in responder: ${testResponderRecord.user_id || 'NULL'}`);
      
      if (!testResponderRecord.user_id) {
        // Update the responder record to link to the user
        await connection.execute(`
          UPDATE responders 
          SET user_id = ? 
          WHERE id = ?
        `, [testResponderUser.id, testResponderRecord.id]);
        
        console.log(`   ✅ Updated responder ${testResponderRecord.id} with user_id ${testResponderUser.id}`);
      } else {
        console.log(`   ℹ️ Responder already has user_id ${testResponderRecord.user_id}`);
      }
    } else {
      console.log('❌ Could not find test_responder user or responder record');
      if (!testResponderUser) {
        console.log('   - test_responder user not found in users table');
      }
      if (!testResponderRecord) {
        console.log('   - test_responder record not found in responders table');
      }
    }
    
    // Verify the fix
    console.log('\n4. Verifying the fix...');
    const [updatedResponders] = await connection.execute(`
      SELECT r.id, r.username, r.name, r.user_id, r.contact_number, r.status,
             u.firstname, u.lastname
      FROM responders r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.id
    `);
    
    console.log(`✅ Updated responder table:`);
    updatedResponders.forEach(responder => {
      console.log(`   - ID: ${responder.id}, Username: ${responder.username}`);
      console.log(`     Name: ${responder.name}, User ID: ${responder.user_id || 'NULL'}`);
      console.log(`     User Name: ${responder.firstname || 'N/A'} ${responder.lastname || 'N/A'}`);
      console.log(`     Contact: ${responder.contact_number}, Status: ${responder.status}`);
      console.log('');
    });
    
    console.log('🎉 Fix completed!');
    console.log('\n💡 Now the Settings screen should work correctly:');
    console.log('   1. Login with username: test_responder, password: testpassword123');
    console.log('   2. Navigate to Settings tab');
    console.log('   3. Should show "Responder Profile" section instead of registration form');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixTestResponderUserId(); 