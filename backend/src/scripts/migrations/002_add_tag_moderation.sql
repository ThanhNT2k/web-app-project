-- Add moderation status tracking for story tags
ALTER TABLE story_tags ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(30) NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'changes_requested', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_story_tags_moderation_status 
    ON story_tags(story_id, moderation_status) WHERE moderation_status != 'approved';
