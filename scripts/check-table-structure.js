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

async function checkTableStructure() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n📋 Checking alerts table structure...');
    const [alertsColumns] = await connection.execute('DESCRIBE alerts');
    console.log('Alerts table columns:');
    alertsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n📋 Checking responders table structure...');
    const [respondersColumns] = await connection.execute('DESCRIBE responders');
    console.log('Responders table columns:');
    respondersColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n📋 Checking if alert_assignments table exists...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'alert_assignments'");
    if (tables.length > 0) {
      console.log('✅ alert_assignments table exists');
      const [assignmentsColumns] = await connection.execute('DESCRIBE alert_assignments');
      console.log('Alert_assignments table columns:');
      assignmentsColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('❌ alert_assignments table does not exist');
    }
    
    console.log('\n📋 Sample data from alerts table...');
    const [alerts] = await connection.execute('SELECT * FROM alerts LIMIT 3');
    console.log('Alerts:', alerts);
    
    console.log('\n📋 Sample data from responders table...');
    const [responders] = await connection.execute('SELECT * FROM responders LIMIT 3');
    console.log('Responders:', responders);
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkTableStructure(); 