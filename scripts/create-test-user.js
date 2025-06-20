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

async function createTestUser() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Creating Test User Account...\n');
    
    // Check if test user already exists
    const [existingUsers] = await connection.execute(`
      SELECT * FROM users WHERE username = 'test_responder'
    `);
    
    if (existingUsers.length > 0) {
      console.log('ℹ️ Test user already exists');
      console.log('   Username: test_responder');
      console.log('   Password: testpassword123');
      console.log('   User ID:', existingUsers[0].id);
    } else {
      // Create test user
      const [userResult] = await connection.execute(`
        INSERT INTO users (username, password, firstname, lastname)
        VALUES (?, ?, ?, ?)
      `, [
        'test_responder',
        'testpassword123',
        'Test',
        'Responder'
      ]);
      
      const userId = userResult.insertId;
      console.log('✅ Created test user:');
      console.log('   Username: test_responder');
      console.log('   Password: testpassword123');
      console.log('   User ID:', userId);
      
      // Update the responder to link to the user
      await connection.execute(`
        UPDATE responders SET user_id = ? WHERE username = 'test_responder'
      `, [userId]);
      
      console.log('✅ Linked responder to user account');
    }
    
    // Verify the setup
    console.log('\n🔍 Verifying test account setup...');
    const [verification] = await connection.execute(`
      SELECT u.id as user_id, u.username, u.firstname, u.lastname,
             r.id as responder_id, r.name as responder_name, r.status
      FROM users u
      JOIN responders r ON u.id = r.user_id
      WHERE u.username = 'test_responder'
    `);
    
    if (verification.length > 0) {
      const account = verification[0];
      console.log('✅ Test account verified:');
      console.log(`   User: ${account.firstname} ${account.lastname} (${account.username})`);
      console.log(`   Responder: ${account.responder_name} - Status: ${account.status}`);
      console.log(`   User ID: ${account.user_id}, Responder ID: ${account.responder_id}`);
    } else {
      console.log('❌ Test account verification failed');
    }
    
    console.log('\n🎉 Test user setup completed!');
    console.log('\n💡 Login credentials:');
    console.log('   Username: test_responder');
    console.log('   Password: testpassword123');
    console.log('\n💡 To test the responder display:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Login with the credentials above');
    console.log('   3. Go to the Dispatch tab');
    console.log('   4. Accept or decline an alert');
    console.log('   5. Check if your name appears below the reported datetime');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

createTestUser(); 