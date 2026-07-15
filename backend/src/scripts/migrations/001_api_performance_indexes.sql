CREATE INDEX IF NOT EXISTS idx_stories_slug
  ON stories(slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_published_created
  ON stories(created_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_stories_published_updated
  ON stories(updated_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_stories_category_published_created
  ON stories(category, created_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_chapters_story_published_number
  ON chapters(story_id, chapter_number) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_comments_story_status_created
  ON comments(story_id, status, created_at DESC);
