const { createConnection } = require('./db-config');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await createConnection();
    
    console.log('📋 Running alert-responder migration...');
    
    // Add responder_id column to alerts table
    console.log('1. Adding responder_id column to alerts table...');
    await connection.execute(`
      ALTER TABLE alerts 
      ADD COLUMN responder_id INT NULL,
      ADD COLUMN assigned_at TIMESTAMP NULL,
      ADD COLUMN latitude DECIMAL(10, 8) NULL,
      ADD COLUMN longitude DECIMAL(11, 8) NULL
    `);
    console.log('✅ Added responder_id, assigned_at, latitude, longitude columns');
    
    // Add foreign key constraint
    console.log('2. Adding foreign key constraint...');
    await connection.execute(`
      ALTER TABLE alerts 
      ADD FOREIGN KEY (responder_id) REFERENCES responders(id) ON DELETE SET NULL
    `);
    console.log('✅ Added foreign key constraint');
    
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
    await connection.execute('CREATE INDEX idx_alerts_responder ON alerts(responder_id)');
    await connection.execute('CREATE INDEX idx_alerts_status ON alerts(status)');
    await connection.execute('CREATE INDEX idx_alert_assignments_alert ON alert_assignments(alert_id)');
    await connection.execute('CREATE INDEX idx_alert_assignments_responder ON alert_assignments(responder_id)');
    console.log('✅ Created indexes');
    
    // Update existing alerts status
    console.log('5. Updating existing alerts status...');
    await connection.execute("UPDATE alerts SET status = 'Pending' WHERE status = 'pending'");
    console.log('✅ Updated alerts status');
    
    // Update responders status
    console.log('6. Updating responders status...');
    await connection.execute("UPDATE responders SET status = 'Available' WHERE status = 'available'");
    await connection.execute("UPDATE responders SET status = 'Busy' WHERE status = 'busy'");
    await connection.execute("UPDATE responders SET status = 'Offline' WHERE status = 'offline'");
    console.log('✅ Updated responders status');
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if columns already exist
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Some columns already exist, continuing...');
    } else if (error.code === 'ER_DUP_KEYNAME') {
      console.log('ℹ️  Some indexes already exist, continuing...');
    } else {
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

runMigration(); 