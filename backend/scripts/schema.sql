-- =============================================================================
-- CMC Truyện PostgreSQL Schema
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Shared trigger for updated_at columns
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'User'
        CHECK (role IN ('Admin', 'Uploader', 'User', 'Moderator')),
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- stories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    author_id INTEGER REFERENCES users(id),
    description TEXT,
    cover_image_url VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Ongoing'
        CHECK (status IN ('Ongoing', 'Completed', 'Hiatus')),
    total_chapters INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC(4,2) NOT NULL DEFAULT 0,
    total_rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- chapters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (story_id, chapter_number)
);

-- -----------------------------------------------------------------------------
-- reading_history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reading_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    story_id INTEGER REFERENCES stories(id),
    last_chapter_read INTEGER,
    last_read_position INTEGER NOT NULL DEFAULT 0,
    total_read_time INTEGER NOT NULL DEFAULT 0,
    completion_rate FLOAT NOT NULL DEFAULT 0,
    last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, story_id)
);

-- -----------------------------------------------------------------------------
-- user_follows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_follows (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    story_id INTEGER REFERENCES stories(id),
    followed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, story_id)
);

-- -----------------------------------------------------------------------------
-- comments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    story_id INTEGER REFERENCES stories(id),
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
    content TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- ratings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (story_id, user_id)
);

-- -----------------------------------------------------------------------------
-- user_preferences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    dark_mode BOOLEAN NOT NULL DEFAULT false,
    font_size INTEGER NOT NULL DEFAULT 16,
    line_spacing FLOAT NOT NULL DEFAULT 1.5,
    font_family VARCHAR(100) NOT NULL DEFAULT 'Arial',
    theme_color VARCHAR(50) NOT NULL DEFAULT 'default',
    auto_bookmark BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- ai_summaries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_summaries (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER UNIQUE REFERENCES chapters(id),
    summary TEXT,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- story_collaborators
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS story_collaborators (
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (story_id, user_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_story_id ON reading_history(story_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_story_id ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_ratings_story_id ON ratings(story_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_story_collaborators_story_id ON story_collaborators(story_id);
CREATE INDEX IF NOT EXISTS idx_story_collaborators_user_id ON story_collaborators(user_id);

-- -----------------------------------------------------------------------------
-- Updated-at triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_stories_updated_at ON stories;
CREATE TRIGGER trg_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_chapters_updated_at ON chapters;
CREATE TRIGGER trg_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ratings_updated_at ON ratings;
CREATE TRIGGER trg_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
