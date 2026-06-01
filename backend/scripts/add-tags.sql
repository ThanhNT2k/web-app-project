-- Tags for stories (run after main schema)
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_tags (
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (story_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_story_tags_story_id ON story_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag_id ON story_tags(tag_id);
