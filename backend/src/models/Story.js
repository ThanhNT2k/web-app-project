const db = require('../config/database');
const Tag = require('./Tag');

async function attachTagsToStories(stories) {
  if (!stories.length) return stories;
  const ids = stories.map((s) => s.id);
  const result = await db.query(
    `
      SELECT st.story_id, t.id, t.name, t.slug
      FROM story_tags st
      INNER JOIN tags t ON t.id = st.tag_id
      WHERE st.story_id = ANY($1::int[])
      ORDER BY t.name ASC
    `,
    [ids]
  );
  const map = {};
  for (const row of result.rows) {
    if (!map[row.story_id]) map[row.story_id] = [];
    map[row.story_id].push({ id: row.id, name: row.name, slug: row.slug });
  }
  return stories.map((s) => ({ ...s, tags: map[s.id] || [] }));
}

async function getAllStories(page = 1, limit = 10) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (safePage - 1) * safeLimit;

  try {
    const result = await db.query(
      `
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.created_at,
          s.updated_at,
          s.is_published,
          COUNT(*) OVER() AS total_count
        FROM stories s
        WHERE s.is_published = true
        ORDER BY s.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [safeLimit, offset]
    );

    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    const stories = result.rows.map(({ total_count, ...story }) => story);
    return {
      stories: await attachTagsToStories(stories),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
  } catch (error) {
    throw error;
  }
}

async function getStoryById(id) {
  try {
    const result = await db.query(
      `
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.created_at,
          s.updated_at,
          s.is_published,
          COUNT(c.id)::int AS chapter_count,
          u.id AS author_user_id,
          u.username AS author_username,
          u.full_name AS author_full_name,
          u.avatar_url AS author_avatar_url
        FROM stories s
        LEFT JOIN users u ON u.id = s.author_id
        LEFT JOIN chapters c ON c.story_id = s.id
        WHERE s.id = $1
        GROUP BY
          s.id,
          u.id,
          u.username,
          u.full_name,
          u.avatar_url
        LIMIT 1
      `,
      [id]
    );

    const story = result.rows[0] || null;
    if (!story) return null;
    const tags = await Tag.getTagsForStory(story.id);
    return { ...story, tags };
  } catch (error) {
    throw error;
  }
}

async function createStory(storyData) {
  const { title, slug, author_id, description, cover_image_url, category } = storyData;

  try {
    const result = await db.query(
      `
        INSERT INTO stories (
          title,
          slug,
          author_id,
          description,
          cover_image_url,
          category
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          title,
          slug,
          author_id,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published
      `,
      [title, slug, author_id, description || null, cover_image_url || null, category || null]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

async function updateStory(id, storyData) {
  const { title, description, cover_image_url, category, status } = storyData;

  try {
    const result = await db.query(
      `
        UPDATE stories
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          cover_image_url = COALESCE($3, cover_image_url),
          category = COALESCE($4, category),
          status = COALESCE($5, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING
          id,
          title,
          slug,
          author_id,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published
      `,
      [title || null, description || null, cover_image_url || null, category || null, status || null, id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

async function deleteStory(id) {
  try {
    const result = await db.query(
      `
        UPDATE stories
        SET is_published = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
          id,
          title,
          slug,
          author_id,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

async function searchStories(query, category = null, tag = null, page = 1, limit = 10) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (safePage - 1) * safeLimit;
  const q = (query || '').trim();
  const searchTerm = q ? `%${q}%` : null;
  const tagSlug = tag ? Tag.slugify(tag) : null;

  try {
    const result = await db.query(
      `
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.created_at,
          s.updated_at,
          s.is_published,
          COUNT(*) OVER() AS total_count
        FROM stories s
        WHERE s.is_published = true
          AND (
            $1::text IS NULL
            OR s.title ILIKE $1
            OR s.description ILIKE $1
          )
          AND ($2::text IS NULL OR s.category = $2)
          AND (
            $3::text IS NULL
            OR EXISTS (
              SELECT 1 FROM story_tags st
              INNER JOIN tags t ON t.id = st.tag_id
              WHERE st.story_id = s.id AND t.slug = $3
            )
          )
        ORDER BY s.created_at DESC
        LIMIT $4 OFFSET $5
      `,
      [searchTerm, category, tagSlug, safeLimit, offset]
    );

    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const stories = result.rows.map(({ total_count, ...story }) => story);

    return {
      stories: await attachTagsToStories(stories),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
  } catch (error) {
    throw error;
  }
}

async function getStoriesByAuthor(authorId, page = 1, limit = 20) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 20, 1);
  const offset = (safePage - 1) * safeLimit;

  const result = await db.query(
    `
      SELECT
        s.*,
        COUNT(*) OVER() AS total_count
      FROM stories s
      WHERE s.author_id = $1
      ORDER BY s.updated_at DESC
      LIMIT $2 OFFSET $3
    `,
    [authorId, safeLimit, offset]
  );

  const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    stories: result.rows.map(({ total_count, ...story }) => story),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit),
    },
  };
}

module.exports = {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  searchStories,
  getStoriesByAuthor,
};