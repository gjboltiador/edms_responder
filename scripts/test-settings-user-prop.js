const { createConnection } = require('./db-config');

async function testSettingsUserProp() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Testing Settings Screen User Prop...\n');
    
    // Test 1: Check users with responder profiles
    console.log('1. Checking users with responder profiles...');
    const [usersWithResponders] = await connection.execute(`
      SELECT u.id, u.username, u.firstname, u.lastname,
             r.id as responder_id, r.name as responder_name, r.contact_number, r.status
      FROM users u
      INNER JOIN responders r ON u.id = r.user_id
      ORDER BY u.id DESC
      LIMIT 3
    `);
    
    if (usersWithResponders.length > 0) {
      console.log(`✅ Found ${usersWithResponders.length} users with responder profiles:`);
      usersWithResponders.forEach(user => {
        console.log(`   - User: ${user.username} (${user.firstname} ${user.lastname})`);
        console.log(`     Responder ID: ${user.responder_id}, Name: ${user.responder_name}`);
        console.log(`     Contact: ${user.contact_number}, Status: ${user.status}`);
        console.log('');
      });
    } else {
      console.log('❌ No users with responder profiles found');
    }
    
    // Test 2: Check users without responder profiles
    console.log('2. Checking users without responder profiles...');
    const [usersWithoutResponders] = await connection.execute(`
      SELECT u.id, u.username, u.firstname, u.lastname
      FROM users u
      LEFT JOIN responders r ON u.id = r.user_id
      WHERE r.id IS NULL
      ORDER BY u.id DESC
      LIMIT 3
    `);
    
    if (usersWithoutResponders.length > 0) {
      console.log(`✅ Found ${usersWithoutResponders.length} users without responder profiles:`);
      usersWithoutResponders.forEach(user => {
        console.log(`   - User: ${user.username} (${user.firstname} ${user.lastname})`);
        console.log(`     Status: Not registered as responder`);
        console.log('');
      });
    } else {
      console.log('❌ No users without responder profiles found');
    }
    
    // Test 3: Test profile API with users who have responder profiles
    console.log('3. Testing profile API with users who have responder profiles...');
    if (usersWithResponders.length > 0) {
      const testUser = usersWithResponders[0];
      console.log(`   Testing with user: ${testUser.username}`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/responder/profile?username=${encodeURIComponent(testUser.username)}`);
        if (response.ok) {
          const profile = await response.json();
          console.log(`   ✅ Profile API returned profile for ${testUser.username}:`);
          console.log(`      - ID: ${profile.id}`);
          console.log(`      - Name: ${profile.name}`);
          console.log(`      - Contact: ${profile.contact_number}`);
          console.log(`      - Status: ${profile.status}`);
          console.log(`   💡 Settings screen should show "Responder Profile" section`);
        } else {
          console.log(`   ❌ Profile API failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Profile API test skipped (server may not be running): ${error.message}`);
      }
    }
    
    // Test 4: Test profile API with users who don't have responder profiles
    console.log('\n4. Testing profile API with users who don\'t have responder profiles...');
    if (usersWithoutResponders.length > 0) {
      const testUser = usersWithoutResponders[0];
      console.log(`   Testing with user: ${testUser.username}`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/responder/profile?username=${encodeURIComponent(testUser.username)}`);
        if (response.status === 404) {
          console.log(`   ✅ Profile API correctly returned 404 for ${testUser.username}`);
          console.log(`   💡 Settings screen should show "Responder Registration" form`);
        } else if (response.ok) {
          console.log(`   ⚠️ Unexpected: Profile API returned profile for non-responder user`);
        } else {
          console.log(`   ❌ Profile API failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Profile API test skipped (server may not be running): ${error.message}`);
      }
    }
    
    console.log('\n🎉 Settings User Prop test completed!');
    console.log('\n💡 Expected Behavior:');
    console.log('   1. When user has a responder profile (e.g., test_responder):');
    console.log('      → Settings screen should show "Responder Profile" section');
    console.log('      → Should display current profile information');
    console.log('      → Should allow editing profile details');
    console.log('      → Should show "Register New Responder" section');
    console.log('');
    console.log('   2. When user does not have a responder profile (e.g., gjboltiador):');
    console.log('      → Settings screen should show "Responder Registration" form');
    console.log('      → Should allow creating new responder account');
    console.log('');
    console.log('💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('      → Should show Responder Profile in Settings');
    console.log('   3. Logout and login with username: gjboltiador, password: 12345');
    console.log('      → Should show Responder Registration form in Settings');
    console.log('   4. Test profile editing and registration functionality');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testSettingsUserProp(); 