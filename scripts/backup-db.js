const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');

async function backupDatabase() {
  const date = new Date().toISOString().split('T')[0];
  const backupDir = path.join(__dirname, '../backups');
  const backupFile = path.join(backupDir, `backup-${date}.sql`);

  try {
    // Create backups directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });

    // Create connection
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      multipleStatements: true
    });

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    let dump = '';

    // Generate dump for each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      // Get create table statement
      const [createTable] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
      dump += createTable[0]['Create Table'] + ';\n\n';

      // Get table data
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
      if (rows.length > 0) {
        const values = rows.map(row => 
          `(${Object.values(row).map(value => 
            value === null ? 'NULL' : `'${value}'`
          ).join(', ')})`
        ).join(',\n');

        dump += `INSERT INTO ${tableName} VALUES\n${values};\n\n`;
      }
    }

    // Write dump to file
    await fs.writeFile(backupFile, dump);
    console.log(`Database backup created: ${backupFile}`);

    // Clean up old backups (keep last 7 days)
    const files = await fs.readdir(backupDir);
    const oldFiles = files
      .filter(file => file.startsWith('backup-'))
      .sort()
      .slice(0, -7);

    for (const file of oldFiles) {
      await fs.unlink(path.join(backupDir, file));
    }

    await connection.end();
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();