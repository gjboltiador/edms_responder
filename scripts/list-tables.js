const mysql = require('mysql2/promise');

async function listTables() {
  const connection = await mysql.createConnection({
  host: '34.95.212.100',
  user: 'edms-responder',
  password: 'EDMS@dm1n',
  database: 'edms'
});

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