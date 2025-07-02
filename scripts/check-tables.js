const { createConnection } = require('./db-config');

async function checkTables() {
  const connection = await createConnection();

  try {
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables in edms_responder:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkTables(); 