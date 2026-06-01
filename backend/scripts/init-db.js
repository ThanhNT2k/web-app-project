const fs = require('fs');
const path = require('path');

const db = require('../src/config/database');

const schemaPath = path.resolve(__dirname, 'schema.sql');
const tagsSchemaPath = path.resolve(__dirname, 'add-tags.sql');
const requiredTables = [
  'users',
  'stories',
  'chapters',
  'reading_history',
  'user_follows',
  'comments',
  'user_preferences',
  'ai_summaries',
];

async function getExistingTables() {
  const result = await db.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1)
    `,
    [requiredTables]
  );

  return new Set(result.rows.map((row) => row.table_name));
}

async function initDatabase() {
  try {
    console.log('[init-db] Reading schema file...');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[init-db] Checking existing tables...');
    const existingTables = await getExistingTables();
    const missingTables = requiredTables.filter((table) => !existingTables.has(table));

    if (missingTables.length > 0) {
      console.log(`[init-db] Creating missing tables: ${missingTables.join(', ')}`);
      await db.query(sql);
      console.log('[init-db] Schema applied successfully.');
    } else {
      console.log('[init-db] All required tables already exist. Skipping main schema.');
    }

    const tagsSql = fs.readFileSync(tagsSchemaPath, 'utf8');
    await db.query(tagsSql);
    console.log('[init-db] Tags schema applied.');
  } catch (err) {
    console.error('[init-db] Failed to initialize database:', err.message);
    if (err.position) {
      console.error('[init-db] SQL position:', err.position);
    }
    process.exitCode = 1;
  } finally {
    await db.end();
    console.log('[init-db] Database pool closed.');
  }
}

initDatabase();
