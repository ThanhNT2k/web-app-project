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
// Skip verification queries during tests to avoid async logging after tests complete
if (process.env.NODE_ENV !== 'test') {
  pool.query('SELECT NOW()')
    .then(async () => {
      console.log('[Database] Connected to PostgreSQL');
      try {
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS hidden_by_admin BOOLEAN NOT NULL DEFAULT false');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS average_rating NUMERIC(4,2) NOT NULL DEFAULT 0');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS total_rating_count INTEGER NOT NULL DEFAULT 0');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS weekly_views INTEGER NOT NULL DEFAULT 0');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS monthly_views INTEGER NOT NULL DEFAULT 0');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS total_views INTEGER NOT NULL DEFAULT 0');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(30)');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS moderation_note TEXT');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL');
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP');
        await pool.query(`
          UPDATE stories
          SET moderation_status = CASE
            WHEN is_published = true THEN 'approved'
            WHEN hidden_by_admin = true THEN 'rejected'
            ELSE 'pending'
          END
          WHERE moderation_status IS NULL
        `);
        await pool.query("ALTER TABLE stories ALTER COLUMN moderation_status SET DEFAULT 'pending'");
        await pool.query('ALTER TABLE stories ALTER COLUMN moderation_status SET NOT NULL');
        await pool.query('ALTER TABLE stories ALTER COLUMN is_published SET DEFAULT false');
        console.log('[Database] Verified stories table has hidden_by_admin column');
      } catch (err) {
        console.error('[Database] Failed to verify/add hidden_by_admin column:', err.message);
      }

      try {
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution_action VARCHAR(50)');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution_note TEXT');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_story ON reports(story_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_comment ON reports(comment_id)');
        console.log('[Database] Verified reports table has story_id and comment_id columns');
      } catch (err) {
        console.error('[Database] Failed to verify/add reports target columns:', err.message);
      }

      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (story_id, user_id)
          )
        `);
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ratings_story_id ON ratings(story_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_reading_history_story_last_read_at ON reading_history(story_id, last_read_at)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_follows_story_id ON user_follows(story_id)');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_chapter_reads (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
            chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
            read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, chapter_id)
          )
        `);
        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_chapter_reads_user_story ON user_chapter_reads(user_id, story_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_chapter_reads_chapter_id ON user_chapter_reads(chapter_id)');
        await pool.query(`
          INSERT INTO user_chapter_reads (user_id, story_id, chapter_id, read_at, created_at)
          SELECT
            rh.user_id,
            rh.story_id,
            rh.last_chapter_read,
            rh.last_read_at,
            rh.created_at
          FROM reading_history rh
          INNER JOIN chapters c ON c.id = rh.last_chapter_read
          WHERE rh.user_id IS NOT NULL
            AND rh.story_id IS NOT NULL
            AND rh.last_chapter_read IS NOT NULL
          ON CONFLICT (user_id, chapter_id) DO NOTHING
        `);
        console.log('[Database] Verified ratings and user_chapter_reads tables exist');
      } catch (err) {
        console.error('[Database] Failed to verify/create ratings or user_chapter_reads table:', err.message);
      }
    })
    .catch((err) => console.error('[Database] Connection failed:', err.message));
}

module.exports = pool;
