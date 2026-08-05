require('dotenv').config();
const { Client } = require('pg');
const pool = require('../src/config/database');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  try {
    console.log('Running migration...');
    const sql = `
      CREATE TABLE IF NOT EXISTS payout_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crystal_amount INTEGER NOT NULL,
        vnd_amount INTEGER NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        account_holder VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(sql);
    console.log('Migration done.');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

migrate();
