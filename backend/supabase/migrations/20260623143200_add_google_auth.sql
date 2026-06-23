-- Migration: Add Google OAuth support columns to users table
-- Thêm 2 cột hỗ trợ đăng nhập Google, an toàn với dữ liệu hiện có:
--   - google_id: NULL cho user cũ (không ảnh hưởng dữ liệu)
--   - auth_provider: DEFAULT 'local' tự điền cho user cũ

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'local'
    CHECK (auth_provider IN ('local', 'google'));

-- Index để tìm kiếm theo google_id nhanh hơn
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

COMMENT ON COLUMN users.google_id IS 'Google OAuth unique identifier. NULL for local accounts.';
COMMENT ON COLUMN users.auth_provider IS 'How the account was created: local (email/password) or google (OAuth).';
