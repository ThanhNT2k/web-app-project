// PostgreSQL connection pool configuration
const { Pool } = require('pg');
const env = require('./environment');

// Build pool config – prefer DATABASE_URL if available, otherwise use individual vars
const poolConfig = env.DATABASE_URL
  ? {
      connectionString: env.DATABASE_URL,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    };

// Common pool settings
poolConfig.max = 20; // Maximum number of connections in the pool
poolConfig.idleTimeoutMillis = 30000; // Close idle connections after 30s
poolConfig.connectionTimeoutMillis = 5000; // Fail fast if connection takes > 5s

const pool = new Pool(poolConfig);

// Log pool-level errors so they don't crash the process silently
pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err.message);
});

// Verify connectivity on first import (non-blocking)
pool.query('SELECT NOW()')
  .then(() => console.log('[Database] Connected to PostgreSQL'))
  .catch((err) => console.error('[Database] Connection failed:', err.message));

module.exports = pool;
