const mysql = require('mysql2/promise');
require('dotenv').config();

// Validate required environment variables
const validateEnvironmentVariables = () => {
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Get secure database configuration
const getDbConfig = () => {
  // Validate environment variables
  validateEnvironmentVariables();

  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    queueLimit: 0,
    // Security enhancements
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  };
};

// Create database connection
const createConnection = async () => {
  try {
    const dbConfig = getDbConfig();
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established successfully');
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    throw error;
  }
};

// Create database pool
const createPool = () => {
  try {
    const dbConfig = getDbConfig();
    const pool = mysql.createPool(dbConfig);
    console.log('✅ Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('❌ Failed to create database pool:', error.message);
    throw error;
  }
};

module.exports = {
  createConnection,
  createPool,
  getDbConfig,
  validateEnvironmentVariables
}; 