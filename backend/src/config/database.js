// PostgreSQL connection pool configuration
const { Pool } = require('pg');
const env = require('./environment');

// Xây dựng cấu hình kết nối cho Pool:
// - Nếu có DATABASE_URL (thường do Render/Heroku inject), dùng connection string đó
// - Ngược lại, dùng các biến riêng lẻ (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
// Trong production, ssl.rejectUnauthorized = false cho phép kết nối tới các
// PostgreSQL được host trên cloud mà không cần verify SSL certificate
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

// Tạo connection pool - Pool tái sử dụng các kết nối DB thay vì tạo mới mỗi lần
// giúp tiết kiệm tài nguyên và tăng hiệu suất đáng kể với nhiều request đồng thời
const pool = new Pool(poolConfig);

// Lắng nghe sự kiện lỗi ở cấp pool để log lỗi những client đang idle bị disconnect bất ngờ
// Tránh để lỗi này âm thầm gây crash process mà không có thông báo
pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err.message);
});

// Kiểm tra kết nối DB khi module được load lần đầu (non-blocking)
// Chạy query SELECT NOW() đơn giản để xác nhận pool kết nối thành công
// Lỗi ở đây không làm dừng server nhưng giúp phát hiện sự cố DB sớm
pool.query('SELECT NOW()')
  .then(async () => {
    console.log('[Database] Connected to PostgreSQL');
    try {
      await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS hidden_by_admin BOOLEAN NOT NULL DEFAULT false');
      console.log('[Database] Verified stories table has hidden_by_admin column');
    } catch (err) {
      console.error('[Database] Failed to verify/add hidden_by_admin column:', err.message);
    }

    try {
      await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_story ON reports(story_id)');
      console.log('[Database] Verified reports table has story_id column');
    } catch (err) {
      console.error('[Database] Failed to verify/add reports.story_id column:', err.message);
    }
  })
  .catch((err) => console.error('[Database] Connection failed:', err.message));

module.exports = pool;
