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

async function testSettingsProfile() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Testing Settings Profile Management...\n');
    
    // Test 1: Check existing responders for profile testing
    console.log('1. Checking existing responders for profile testing...');
    const [responders] = await connection.execute(`
      SELECT r.id, r.username, r.name, r.contact_number, r.status, r.last_active,
             u.firstname, u.lastname
      FROM responders r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.id DESC
      LIMIT 3
    `);
    
    if (responders.length > 0) {
      console.log(`✅ Found ${responders.length} responders for testing:`);
      responders.forEach(responder => {
        console.log(`   - ID: ${responder.id}, Username: ${responder.username}`);
        console.log(`     Name: ${responder.name}, Status: ${responder.status}`);
        console.log(`     Contact: ${responder.contact_number}`);
        console.log(`     First/Last: ${responder.firstname || 'Not set'}/${responder.lastname || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('❌ No responders found for testing');
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
        console.log(`   - ID: ${user.id}, Username: ${user.username}`);
        console.log(`     Name: ${user.firstname || 'Not set'} ${user.lastname || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('❌ No users without responder profiles found');
    }
    
    // Test 3: Test the profile API endpoint
    console.log('3. Testing profile API endpoint...');
    if (responders.length > 0) {
      const testResponder = responders[0];
      console.log(`   Testing with username: ${testResponder.username}`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/responder/profile?username=${encodeURIComponent(testResponder.username)}`);
        if (response.ok) {
          const profile = await response.json();
          console.log(`   ✅ Profile API returned:`);
          console.log(`      - ID: ${profile.id}`);
          console.log(`      - Username: ${profile.username}`);
          console.log(`      - Name: ${profile.name}`);
          console.log(`      - Contact: ${profile.contact_number}`);
          console.log(`      - Status: ${profile.status}`);
          console.log(`      - First/Last: ${profile.firstname || 'Not set'}/${profile.lastname || 'Not set'}`);
        } else {
          console.log(`   ❌ Profile API failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Profile API test skipped (server may not be running): ${error.message}`);
      }
    }
    
    // Test 4: Test profile update API
    console.log('\n4. Testing profile update API...');
    if (responders.length > 0) {
      const testResponder = responders[0];
      console.log(`   Testing update with username: ${testResponder.username}`);
      
      const updateData = {
        username: testResponder.username,
        name: testResponder.name,
        contact_number: testResponder.contact_number,
        firstname: testResponder.firstname || 'Test',
        lastname: testResponder.lastname || 'User'
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/responder/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Profile update successful:`);
          console.log(`      - Message: ${result.message}`);
          console.log(`      - Updated name: ${result.data.name}`);
          console.log(`      - Updated contact: ${result.data.contact_number}`);
        } else {
          console.log(`   ❌ Profile update failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Profile update test skipped (server may not be running): ${error.message}`);
      }
    }
    
    console.log('\n🎉 Settings Profile test completed!');
    console.log('\n💡 Expected Behavior:');
    console.log('   1. When user has a responder profile:');
    console.log('      → Should show "Responder Profile" section by default');
    console.log('      → Should display current profile information');
    console.log('      → Should allow editing profile details');
    console.log('      → Should show "Register New Responder" section');
    console.log('');
    console.log('   2. When user does not have a responder profile:');
    console.log('      → Should show "Responder Registration" form by default');
    console.log('      → Should allow creating new responder account');
    console.log('');
    console.log('   3. Profile editing features:');
    console.log('      → Edit button should switch to edit mode');
    console.log('      → Save button should update profile');
    console.log('      → Cancel button should revert changes');
    console.log('');
    console.log('💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('   3. Navigate to Settings tab');
    console.log('   4. Test profile viewing and editing');
    console.log('   5. Test "Register New Responder" functionality');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testSettingsProfile(); 