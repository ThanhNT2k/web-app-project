/**
 * Gán tag từ cột category cho truyện đã có (chạy sau add-tags.sql)
 */
const db = require('../src/config/database');
const Tag = require('../src/models/Tag');

async function sync() {
  const stories = await db.query(
    'SELECT id, category FROM stories WHERE category IS NOT NULL AND category <> \'\''
  );

  for (const story of stories.rows) {
    await Tag.setStoryTags(story.id, [story.category]);
    console.log(`[sync] Story ${story.id} ← tag "${story.category}"`);
  }

  await db.end();
  console.log('[sync] Done.');
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
