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
        await pool.query('ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_name VARCHAR(255)');
        await pool.query(`
          UPDATE stories s
          SET author_name = COALESCE(NULLIF(TRIM(u.full_name), ''), u.username, 'Không rõ tác giả')
          FROM users u
          WHERE s.author_id = u.id
            AND (s.author_name IS NULL OR TRIM(s.author_name) = '')
        `);
        await pool.query("UPDATE stories SET author_name = 'Không rõ tác giả' WHERE author_name IS NULL OR TRIM(author_name) = ''");
        await pool.query('ALTER TABLE stories ALTER COLUMN author_name SET NOT NULL');
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
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS reported_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution_action VARCHAR(50)');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution_note TEXT');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_story ON reports(story_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_comment ON reports(comment_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id)');
        console.log('[Database] Verified reports table has story_id and comment_id columns');
      } catch (err) {
        console.error('[Database] Failed to verify/add reports target columns:', err.message);
      }

      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id BIGSERIAL PRIMARY KEY,
            actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            actor_role VARCHAR(30) NOT NULL,
            action VARCHAR(80) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id VARCHAR(100),
            details JSONB NOT NULL DEFAULT '{}'::jsonb,
            ip_address VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_role ON audit_logs(actor_role)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)');
        await pool.query('ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS affected_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_affected_user ON audit_logs(affected_user_id)');
        console.log('[Database] Verified audit_logs table exists');
      } catch (err) {
        console.error('[Database] Failed to verify/create audit_logs table:', err.message);
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

      try {
        // Add moderation_status column to story_tags for tracking tag moderation
        await pool.query('ALTER TABLE story_tags ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(30) NOT NULL DEFAULT \'approved\'');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_story_tags_moderation_status ON story_tags(story_id, moderation_status) WHERE moderation_status != \'approved\'');
        console.log('[Database] Verified story_tags has moderation_status column');
      } catch (err) {
        console.error('[Database] Failed to verify/add moderation_status to story_tags:', err.message);
      }
    })
    .catch((err) => console.error('[Database] Connection failed:', err.message));
}

module.exports = pool;
