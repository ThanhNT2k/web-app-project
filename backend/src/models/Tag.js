const db = require('../config/database');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function findAll() {
  const result = await db.query(
    'SELECT id, name, slug, created_at FROM tags ORDER BY name ASC'
  );
  return result.rows;
}

async function findBySlug(slug) {
  const result = await db.query('SELECT * FROM tags WHERE slug = $1 LIMIT 1', [slug]);
  return result.rows[0] || null;
}

async function create(name) {
  const slug = slugify(name);
  const result = await db.query(
    `
      INSERT INTO tags (name, slug)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, slug, created_at
    `,
    [name.trim(), slug]
  );
  return result.rows[0];
}

async function findOrCreate(name) {
  const slug = slugify(name);
  const existing = await findBySlug(slug);
  if (existing) return existing;
  return create(name);
}

async function getTagsForStory(storyId) {
  const result = await db.query(
    `
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN story_tags st ON st.tag_id = t.id
      WHERE st.story_id = $1
      ORDER BY t.name ASC
    `,
    [storyId]
  );
  return result.rows;
}

async function setStoryTags(storyId, tagNames = []) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM story_tags WHERE story_id = $1', [storyId]);

    const uniqueNames = [...new Set(tagNames.map((n) => String(n).trim()).filter(Boolean))];
    for (const name of uniqueNames) {
      const tag = await findOrCreate(name);
      await client.query(
        'INSERT INTO story_tags (story_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [storyId, tag.id]
      );
    }

    await client.query('COMMIT');
    return getTagsForStory(storyId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  findAll,
  findBySlug,
  create,
  findOrCreate,
  getTagsForStory,
  setStoryTags,
  slugify,
};
