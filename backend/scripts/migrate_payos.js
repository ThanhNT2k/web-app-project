const db = require('../src/config/database');

async function migrate() {
  try {
    console.log('Adding order_code to topup_transactions...');
    await db.query(`
      ALTER TABLE topup_transactions 
      ADD COLUMN IF NOT EXISTS order_code BIGINT UNIQUE;
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.end();
  }
}

migrate();
