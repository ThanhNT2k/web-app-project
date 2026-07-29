ALTER TABLE users
  ADD COLUMN IF NOT EXISTS crystal_balance INTEGER NOT NULL DEFAULT 50;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_crystal_balance_check;
ALTER TABLE users
  ADD CONSTRAINT users_crystal_balance_check CHECK (crystal_balance >= 0);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'is_paid'
  ) THEN
    ALTER TABLE chapters ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT false;
    UPDATE chapters SET is_paid = (chapter_number > 3);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS chapter_unlocks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  crystal_cost INTEGER NOT NULL CHECK (crystal_cost >= 0),
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS crystal_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL CHECK (type IN ('DEMO_GRANT', 'CHAPTER_UNLOCK')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO crystal_transactions (user_id, type, amount, balance_after, description)
SELECT u.id, 'DEMO_GRANT', 50, u.crystal_balance, 'Cấp Tinh thạch demo'
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM crystal_transactions ct
  WHERE ct.user_id = u.id AND ct.type = 'DEMO_GRANT'
);

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS auto_unlock_next_chapter BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_user ON chapter_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_chapter ON chapter_unlocks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_user_created
  ON crystal_transactions(user_id, created_at DESC);
