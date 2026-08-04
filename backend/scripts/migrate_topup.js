const db = require('../src/config/database');

async function migrate() {
  try {
    console.log('Adding crystal_earned to users...');
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS crystal_earned INTEGER NOT NULL DEFAULT 0 CHECK (crystal_earned >= 0);`);
    
    console.log('Updating crystal_transactions type check...');
    const constraintQuery = await db.query(`
      SELECT constraint_name
      FROM information_schema.constraint_column_usage
      WHERE table_name = 'crystal_transactions' AND column_name = 'type';
    `);
    
    for (const row of constraintQuery.rows) {
      await db.query(`ALTER TABLE crystal_transactions DROP CONSTRAINT "${row.constraint_name}";`);
    }

    await db.query(`
      ALTER TABLE crystal_transactions 
      ADD CONSTRAINT crystal_transactions_type_check 
      CHECK (type IN ('DEMO_GRANT', 'CHAPTER_UNLOCK', 'TOPUP', 'CHAPTER_REVENUE'));
    `);

    console.log('Creating topup_transactions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS topup_transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          crystal_received INTEGER NOT NULL,
          transfer_content VARCHAR(255) NOT NULL UNIQUE,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.end();
  }
}

migrate();
