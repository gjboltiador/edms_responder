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

async function testSettingsPassword() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Testing Settings Password Functionality...\n');
    
    // Test 1: Check current user passwords
    console.log('1. Checking current user passwords...');
    const [users] = await connection.execute(`
      SELECT u.id, u.username, u.password, u.firstname, u.lastname,
             r.id as responder_id, r.name as responder_name
      FROM users u
      LEFT JOIN responders r ON u.id = r.user_id
      ORDER BY u.id
    `);
    
    if (users.length > 0) {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - User: ${user.username} (${user.firstname} ${user.lastname})`);
        console.log(`     Password: ${user.password ? 'Set' : 'Not set'}`);
        console.log(`     Responder: ${user.responder_id ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No users found');
    }
    
    // Test 2: Test profile update without password change
    console.log('2. Testing profile update without password change...');
    if (users.length > 0) {
      const testUser = users.find(u => u.responder_id) || users[0];
      console.log(`   Testing with user: ${testUser.username}`);
      
      const updateData = {
        username: testUser.username,
        name: testUser.responder_name || 'Test Responder',
        contact_number: '+1234567890',
        firstname: testUser.firstname || 'Test',
        lastname: testUser.lastname || 'User'
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/responder/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Profile update successful (no password change):`);
          console.log(`      - Message: ${result.message}`);
          console.log(`      - Updated name: ${result.data.name}`);
        } else {
          console.log(`   ❌ Profile update failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Profile update test skipped (server may not be running): ${error.message}`);
      }
    }
    
    // Test 3: Test password change with incorrect old password
    console.log('\n3. Testing password change with incorrect old password...');
    if (users.length > 0) {
      const testUser = users.find(u => u.responder_id) || users[0];
      console.log(`   Testing with user: ${testUser.username}`);
      
      const passwordChangeData = {
        username: testUser.username,
        name: testUser.responder_name || 'Test Responder',
        contact_number: '+1234567890',
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/responder/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(passwordChangeData)
        });
        
        if (response.status === 400) {
          const errorData = await response.json();
          console.log(`   ✅ Correctly rejected incorrect old password:`);
          console.log(`      - Error: ${errorData.error}`);
        } else if (response.ok) {
          console.log(`   ⚠️ Unexpected: Password change succeeded with wrong old password`);
        } else {
          console.log(`   ❌ Password change failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Password change test skipped (server may not be running): ${error.message}`);
      }
    }
    
    // Test 4: Test password change with correct old password
    console.log('\n4. Testing password change with correct old password...');
    if (users.length > 0) {
      const testUser = users.find(u => u.responder_id) || users[0];
      console.log(`   Testing with user: ${testUser.username}`);
      
      const passwordChangeData = {
        username: testUser.username,
        name: testUser.responder_name || 'Test Responder',
        contact_number: '+1234567890',
        oldPassword: testUser.password,
        newPassword: 'newpassword123'
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/responder/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(passwordChangeData)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Password change successful:`);
          console.log(`      - Message: ${result.message}`);
          console.log(`      - Profile updated: ${result.data.name}`);
        } else {
          const errorData = await response.json();
          console.log(`   ❌ Password change failed:`);
          console.log(`      - Status: ${response.status}`);
          console.log(`      - Error: ${errorData.error}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Password change test skipped (server may not be running): ${error.message}`);
      }
    }
    
    console.log('\n🎉 Settings Password test completed!');
    console.log('\n💡 Expected Behavior:');
    console.log('   1. Profile editing should follow same design as registration:');
    console.log('      → Full-width form with icons');
    console.log('      → Consistent spacing and styling');
    console.log('      → Same button layout (Cancel/Save)');
    console.log('');
    console.log('   2. Password change functionality:');
    console.log('      → Current password field (required)');
    console.log('      → New password field (min 6 characters)');
    console.log('      → Confirm new password field');
    console.log('      → Validation for old password correctness');
    console.log('      → Validation for password matching');
    console.log('');
    console.log('   3. Form validation:');
    console.log('      → Old password required if changing password');
    console.log('      → New passwords must match');
    console.log('      → New password minimum length');
    console.log('      → Clear error messages');
    console.log('');
    console.log('💡 To test the UI:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with username: test_responder, password: testpassword123');
    console.log('   3. Navigate to Settings tab');
    console.log('   4. Click "Edit Profile" button');
    console.log('   5. Test password change with correct/incorrect old password');
    console.log('   6. Test form validation and error messages');
    console.log('   7. Verify the design matches the registration form');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testSettingsPassword(); 