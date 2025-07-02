const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'GF@dm1n',
    database: 'edms_responder'
  });

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