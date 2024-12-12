const mysql = require('mysql2/promise');
const config = require('../config/database');

async function setupDatabase() {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    console.log('Database created or already exists');

    // Use the database
    await connection.query(`USE ${config.database}`);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'client') DEFAULT 'client',
        status ENUM('active', 'inactive') DEFAULT 'active',
        refresh_token VARCHAR(255),
        refresh_token_expires_at TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Clients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        nationality VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        address JSON NOT NULL,
        profile_photo TEXT,
        social_media JSON,
        mode_of_contact JSON,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Applications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(36) PRIMARY KEY,
        client_id VARCHAR(36) NOT NULL,
        type ENUM('Visitor Visa', 'Student Visa') NOT NULL,
        country VARCHAR(255) NOT NULL,
        document_status ENUM('Not Yet', 'Few Received', 'Fully Received') DEFAULT 'Not Yet',
        documents_to_translate INT DEFAULT 0,
        translation_status ENUM('Under Process', 'Completed') DEFAULT 'Under Process',
        visa_status ENUM('Under Review', 'Under Process', 'Waiting for Payment', 'Completed', 'Approved', 'Rejected') DEFAULT 'Under Review',
        handled_by VARCHAR(255) NOT NULL,
        translation_handler VARCHAR(255) NOT NULL,
        deadline TIMESTAMP NOT NULL,
        payment JSON,
        payment_status ENUM('Due', 'Paid') DEFAULT 'Due',
        notes TEXT,
        family_members JSON,
        todos JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    // Create Documents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        client_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type ENUM('Visa', 'Financial', 'Translation', 'Contract', 'Other') NOT NULL,
        category ENUM('Application', 'Personal', 'Financial', 'Legal') NOT NULL,
        url TEXT NOT NULL,
        size INT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('Active', 'Archived', 'Deleted') DEFAULT 'Active',
        tags JSON,
        permissions JSON,
        metadata JSON,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    // Create Appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(36) PRIMARY KEY,
        client_id VARCHAR(36) NOT NULL,
        type VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        time VARCHAR(5) NOT NULL,
        duration INT DEFAULT 60,
        status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        meeting_type ENUM('physical', 'online') NOT NULL,
        location TEXT,
        meeting_link TEXT,
        notes TEXT,
        is_recurring BOOLEAN DEFAULT false,
        recurring_frequency ENUM('weekly', 'biweekly', 'monthly'),
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        reminder_sent BOOLEAN DEFAULT false,
        reminder_type ENUM('email', 'sms', 'both'),
        handled_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    console.log('All tables created successfully');
    await connection.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();