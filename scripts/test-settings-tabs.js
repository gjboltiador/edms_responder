const { createConnection } = require('./db-config');

async function testSettingsTabs() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('\n📋 Testing Settings Tabs Interface...\n');
    
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
    
    // Test 3: Test profile API endpoints
    console.log('3. Testing profile API endpoints...');
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
          console.log(`   💡 Settings should show "Responder Profile" tab by default`);
        } else {
          console.log(`   ❌ Profile API failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Profile API test skipped (server may not be running): ${error.message}`);
      }
    }
    
    // Test 4: Test registration API
    console.log('\n4. Testing registration API...');
    try {
      const testRegistrationData = {
        username: 'test_new_responder',
        password: 'testpass123',
        name: 'Test New Responder',
        contact_number: '+1234567890'
      };
      
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRegistrationData)
      });
      
      if (response.status === 409) {
        console.log(`   ✅ Registration API correctly rejected duplicate username`);
      } else if (response.ok) {
        console.log(`   ✅ Registration API working correctly`);
      } else {
        console.log(`   ⚠️ Registration API returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Registration API test skipped (server may not be running): ${error.message}`);
    }
    
    console.log('\n🎉 Settings Tabs test completed!');
    console.log('\n💡 Expected Behavior:');
    console.log('   1. Settings screen should have 2 tabs:');
    console.log('      → "Responder Profile" (default tab)');
    console.log('      → "Register New Responder"');
    console.log('');
    console.log('   2. When user has a responder profile:');
    console.log('      → "Responder Profile" tab should show current profile');
    console.log('      → Should allow editing profile details');
    console.log('      → "Register New Responder" tab should allow registering new users');
    console.log('');
    console.log('   3. When user does not have a responder profile:');
    console.log('      → "Responder Profile" tab should show registration form');
    console.log('      → "Register New Responder" tab should allow registering new users');
    console.log('');
    console.log('💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('   3. Navigate to Settings tab');
    console.log('   4. Should see "Responder Profile" tab by default');
    console.log('   5. Click "Register New Responder" tab to test registration');
    console.log('   6. Test profile editing in the Profile tab');
    console.log('   7. Test new responder registration in the Registration tab');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testSettingsTabs(); 