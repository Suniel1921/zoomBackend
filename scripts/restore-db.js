const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');

async function restoreDatabase(backupFile) {
  try {
    // Read backup file
    const dump = await fs.readFile(backupFile, 'utf8');

    // Create connection
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
      multipleStatements: true
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await connection.query(`USE ${config.database}`);

    // Execute dump
    await connection.query(dump);

    console.log('Database restored successfully');
    await connection.end();
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  }
}

// Get backup file path from command line argument
const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Please provide backup file path');
  process.exit(1);
}

restoreDatabase(path.resolve(backupFile));