const { createConnection } = require('./db-config');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connection = await createConnection();

  try {
    // Ensure database exists and is selected
    /*await connection.query('CREATE DATABASE IF NOT EXISTS edms_responder;');
    await connection.query('USE edms_responder;');*/
    await connection.query('CREATE DATABASE IF NOT EXISTS sql12785202;');
    await connection.query('USE sql12785202;');

    // Read and execute the schema file, skipping CREATE DATABASE and USE statements
    const schema = fs.readFileSync(path.join(__dirname, '../lib/schema.sql'), 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE') && !s.startsWith('--'));
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Successfully created all tables!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase(); 