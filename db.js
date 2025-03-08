require("dotenv").config();
const mysql = require("mysql2/promise");

// Test database connection
const db = mysql.createPool({
  uri: process.env.DB_URI,
});

db.getConnection()
  .then(() => console.log("Connected to MySQL"))
  .catch((err) => console.error("MySQL Connection Error:", err));

async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    //   await db.query("CREATE DATABASE IF NOT EXISTS school_management");

    // Switch to the database
    await db.query("USE school_management");

    // Create the schools table if it doesn't exist
    await db.query(`
          CREATE TABLE IF NOT EXISTS schools (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              address VARCHAR(255) NOT NULL,
              latitude FLOAT NOT NULL,
              longitude FLOAT NOT NULL
          )
        `);

    console.log("Database and table initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDatabase();

module.exports = { db };
