const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config();

const url = process.env.TURSO_URL || "file:safespace.db";
const authToken = process.env.TURSO_AUTH_TOKEN || "";

const db = createClient({
  url: url,
  authToken: authToken,
});

async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 1,
      username TEXT,
      user_id INTEGER,
      likes INTEGER DEFAULT 0,
      is_reported INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_reported INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (story_id) REFERENCES stories(id)
    );
  `);

  // Fixed default for is_reported
  await db.execute(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Turso Database initialized');
}

module.exports = { db, initDB };
