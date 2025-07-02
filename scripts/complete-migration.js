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

async function completeMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📋 Completing alert-responder migration...');
    
    // Add missing columns to alerts table
    console.log('1. Adding responder_id and assigned_at columns to alerts table...');
    try {
      await connection.execute(`
        ALTER TABLE alerts 
        ADD COLUMN responder_id INT NULL,
        ADD COLUMN assigned_at TIMESTAMP NULL
      `);
      console.log('✅ Added responder_id and assigned_at columns');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Columns already exist, skipping...');
      } else {
        throw error;
      }
    }
    
    // Add foreign key constraint
    console.log('2. Adding foreign key constraint...');
    try {
      await connection.execute(`
        ALTER TABLE alerts 
        ADD FOREIGN KEY (responder_id) REFERENCES responders(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Foreign key already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Create alert_assignments table
    console.log('3. Creating alert_assignments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alert_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_id INT NOT NULL,
        responder_id INT NOT NULL,
        assigned_by INT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unassigned_at TIMESTAMP NULL,
        status ENUM('assigned', 'accepted', 'rejected', 'completed', 'unassigned') DEFAULT 'assigned',
        notes TEXT,
        FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
        FOREIGN KEY (responder_id) REFERENCES responders(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES responders(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created alert_assignments table');
    
    // Create indexes
    console.log('4. Creating indexes...');
    try {
      await connection.execute('CREATE INDEX idx_alerts_responder ON alerts(responder_id)');
      console.log('✅ Created idx_alerts_responder index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.execute('CREATE INDEX idx_alerts_status ON alerts(status)');
      console.log('✅ Created idx_alerts_status index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.execute('CREATE INDEX idx_alert_assignments_alert ON alert_assignments(alert_id)');
      console.log('✅ Created idx_alert_assignments_alert index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.execute('CREATE INDEX idx_alert_assignments_responder ON alert_assignments(responder_id)');
      console.log('✅ Created idx_alert_assignments_responder index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    // Update existing alerts status to proper format
    console.log('5. Updating existing alerts status...');
    await connection.execute("UPDATE alerts SET status = 'Pending' WHERE status = 'pending'");
    await connection.execute("UPDATE alerts SET status = 'Completed' WHERE status = 'completed'");
    await connection.execute("UPDATE alerts SET status = 'Declined' WHERE status = 'declined'");
    console.log('✅ Updated alerts status');
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Verify the structure
    console.log('\n📋 Verifying table structure...');
    const [alertsColumns] = await connection.execute('DESCRIBE alerts');
    console.log('Alerts table columns:');
    alertsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

completeMigration(); 