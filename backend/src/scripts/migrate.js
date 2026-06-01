const fs = require('fs');
const path = require('path');

const db = require('../config/database');

const migrationsDir = path.join(__dirname, 'migrations');

const runMigrations = async () => {
  if (!fs.existsSync(migrationsDir)) {
    console.log('[Migrations] No migrations directory found. Nothing to run.');
    return;
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('[Migrations] No SQL migration files found.');
    return;
  }

  for (const fileName of migrationFiles) {
    const filePath = path.join(migrationsDir, fileName);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`[Migrations] Running ${fileName}`);
    await db.query(sql);
  }

  console.log('[Migrations] Completed successfully.');
};

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[Migrations] Failed:', error);
    process.exit(1);
  });