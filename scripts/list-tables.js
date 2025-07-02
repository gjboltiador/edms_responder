const { createConnection } = require('./db-config');

async function listTables() {
  const connection = await createConnection();

  try {
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables in edms:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

listTables(); 