const { createConnection } = require('./db-config');

async function testUserDisplay() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Testing User Display and Responder Lookup...\n');
    
    // Test 1: Check all users
    console.log('1. Checking all users in the system...');
    const [users] = await connection.execute('SELECT * FROM users ORDER BY id');
    
    if (users.length > 0) {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Username: ${user.username}, Name: ${user.firstname} ${user.lastname}`);
      });
    } else {
      console.log('❌ No users found');
    }
    
    // Test 2: Check all responders
    console.log('\n2. Checking all responders...');
    const [responders] = await connection.execute('SELECT * FROM responders ORDER BY id');
    
    if (responders.length > 0) {
      console.log(`✅ Found ${responders.length} responders:`);
      responders.forEach(responder => {
        console.log(`   - ID: ${responder.id}, Username: ${responder.username}, Name: ${responder.name}, Status: ${responder.status}`);
      });
    } else {
      console.log('❌ No responders found');
    }
    
    // Test 3: Check user-responder mapping
    console.log('\n3. Checking user-responder mapping...');
    const [mappings] = await connection.execute(`
      SELECT u.id as user_id, u.username as user_username, u.firstname, u.lastname,
             r.id as responder_id, r.username as responder_username, r.name as responder_name, r.status
      FROM users u
      LEFT JOIN responders r ON u.id = r.user_id
      ORDER BY u.id
    `);
    
    if (mappings.length > 0) {
      console.log(`✅ Found ${mappings.length} user-responder mappings:`);
      mappings.forEach(mapping => {
        if (mapping.responder_id) {
          console.log(`   - User: ${mapping.user_username} (${mapping.firstname} ${mapping.lastname}) → Responder: ${mapping.responder_name} (${mapping.responder_username}) - Status: ${mapping.status}`);
        } else {
          console.log(`   - User: ${mapping.user_username} (${mapping.firstname} ${mapping.lastname}) → No responder assigned`);
        }
      });
    } else {
      console.log('❌ No user-responder mappings found');
    }
    
    // Test 4: Simulate API calls for a specific user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n4. Testing API simulation for user: ${testUser.username}`);
      
      // Simulate GET /api/responder/status?username=...
      const [responderStatus] = await connection.execute(`
        SELECT r.*, 
               (SELECT COUNT(*) FROM alerts a WHERE a.responder_id = r.id AND a.status IN ('Assigned', 'In Progress')) as active_assignments
        FROM responders r
        WHERE r.username = ?
      `, [testUser.username]);
      
      if (responderStatus.length > 0) {
        console.log(`   ✅ Found responder for ${testUser.username}:`);
        console.log(`      - ID: ${responderStatus[0].id}`);
        console.log(`      - Name: ${responderStatus[0].name}`);
        console.log(`      - Status: ${responderStatus[0].status}`);
        console.log(`      - Active assignments: ${responderStatus[0].active_assignments}`);
      } else {
        console.log(`   ❌ No responder found for ${testUser.username}`);
        console.log(`   💡 This user needs to register as a responder`);
      }
    }
    
    console.log('\n🎉 User display test completed!');
    console.log('\n💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with one of the users above');
    console.log('   3. Check if the HomeScreen shows the correct user name');
    console.log('   4. Check if the responder status is loaded correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testUserDisplay(); 