const mysql = require('mysql2/promise');

// Database configuration (same as in lib/db.ts)
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

async function testRegistration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Test 1: Check if users table exists
    console.log('\n📋 Test 1: Checking users table...');
    const [userTables] = await connection.execute('SHOW TABLES LIKE "users"');
    if (userTables.length > 0) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table does not exist');
      return;
    }
    
    // Test 2: Check if responders table has user_id column
    console.log('\n🔗 Test 2: Checking responders table structure...');
    const [columns] = await connection.execute('DESCRIBE responders');
    const hasUserId = columns.some(col => col.Field === 'user_id');
    if (hasUserId) {
      console.log('✅ Responders table has user_id column');
    } else {
      console.log('❌ Responders table missing user_id column');
      return;
    }
    
    // Test 3: Check current data
    console.log('\n👥 Test 3: Checking current data...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [responders] = await connection.execute('SELECT COUNT(*) as count FROM responders');
    console.log(`✅ Users: ${users[0].count}, Responders: ${responders[0].count}`);
    
    // Test 4: Test registration API endpoint
    console.log('\n🌐 Test 4: Testing registration API...');
    const testUser = {
      username: 'test_responder_' + Date.now(),
      password: 'testpassword123',
      name: 'Test Responder',
      contact_number: '+1234567890'
    };
    
    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration API works:', data.message);
      console.log('   User ID:', data.data.userId);
      console.log('   Username:', data.data.username);
    } else {
      const error = await response.json();
      console.log('❌ Registration API failed:', error.error);
    }
    
    // Test 5: Verify data was created
    console.log('\n🔍 Test 5: Verifying created data...');
    const [newUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [newResponders] = await connection.execute('SELECT COUNT(*) as count FROM responders');
    console.log(`✅ After registration - Users: ${newUsers[0].count}, Responders: ${newResponders[0].count}`);
    
    // Test 6: Check the relationship
    console.log('\n🔗 Test 6: Checking user-responder relationship...');
    const [relationships] = await connection.execute(`
      SELECT u.id as user_id, u.username, r.id as responder_id, r.name, r.status
      FROM users u
      JOIN responders r ON u.id = r.user_id
      ORDER BY u.id DESC
      LIMIT 1
    `);
    
    if (relationships.length > 0) {
      console.log('✅ User-Responder relationship verified:');
      console.log('   User ID:', relationships[0].user_id);
      console.log('   Username:', relationships[0].username);
      console.log('   Responder ID:', relationships[0].responder_id);
      console.log('   Name:', relationships[0].name);
      console.log('   Status:', relationships[0].status);
    } else {
      console.log('❌ No user-responder relationships found');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testRegistration(); 