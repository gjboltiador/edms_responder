const { createConnection } = require('./db-config');

async function testConnection() {
  const connection = await createConnection();

  try {
    // Test the connection
    await connection.query('SELECT 1');
    console.log('Successfully connected to MySQL!');

    // Drop the foreign key constraint on response_logs.alert_id if it exists
    try {
      // Get the constraint name
      const [fkRows] = await connection.query(`
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = 'response_logs' AND COLUMN_NAME = 'alert_id' AND REFERENCED_TABLE_NAME = 'alerts';
      `);
      if (fkRows.length > 0) {
        const constraintName = fkRows[0].CONSTRAINT_NAME;
        await connection.query(`ALTER TABLE response_logs DROP FOREIGN KEY ${constraintName}`);
        console.log(`Dropped foreign key constraint: ${constraintName}`);
      }
    } catch (fkErr) {
      console.warn('Warning (foreign key drop):', fkErr.message);
    }

    // Drop existing tables in correct order
    await connection.query('DROP TABLE IF EXISTS response_logs');
    await connection.query('DROP TABLE IF EXISTS alerts');
    await connection.query('DROP TABLE IF EXISTS responders');
    console.log('Dropped existing tables');

    // Create alerts table
    await connection.query(`
      CREATE TABLE alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        severity ENUM('High', 'Medium', 'Low') NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8)
      )
    `);
    console.log('Created alerts table');

    // Create responders table
    await connection.query(`
      CREATE TABLE responders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20),
        status VARCHAR(20) DEFAULT 'available',
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created responders table');

    // Create response_logs table with both foreign keys
    await connection.query(`
      CREATE TABLE response_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_id INT,
        responder_id INT,
        action VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
        FOREIGN KEY (responder_id) REFERENCES responders(id)
      )
    `);
    console.log('Created response_logs table');

    // Recreate alerts table and insert sample data
    const fs = require('fs');
    const sql = fs.readFileSync('./scripts/setup-alerts.sql', 'utf8');
    // Split and execute each statement
    const statements = sql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Successfully created alerts table and inserted sample data!');

    // Verify the data
    const [rows] = await connection.query('SELECT * FROM alerts');
    console.log('Current alerts in database:', rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testConnection(); 