const db = require('../config/database');

async function getChaptersByStory(storyId, page = 1, limit = 10, sort = 'asc') {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (safePage - 1) * safeLimit;
  const orderDirection = sort === 'desc' ? 'DESC' : 'ASC';

  try {
    const result = await db.query(
      `
        SELECT
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published,
          COUNT(*) OVER() AS total_count
        FROM chapters
        WHERE story_id = $1
        ORDER BY chapter_number ${orderDirection}
        LIMIT $2 OFFSET $3
      `,
      [storyId, safeLimit, offset]
    );

    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    return {
      chapters: result.rows.map(({ total_count, ...chapter }) => chapter),
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

async function getChapterById(chapterId) {
  try {
    const result = await db.query(
      `
        SELECT
          c.id,
          c.story_id,
          c.chapter_number,
          c.title,
          c.content,
          c.created_at,
          c.updated_at,
          c.is_published,
          s.id AS story_id_ref,
          s.title AS story_title,
          s.slug AS story_slug,
          s.description AS story_description,
          s.cover_image_url AS story_cover_image_url,
          s.category AS story_category,
          s.status AS story_status,
          s.total_chapters AS story_total_chapters
        FROM chapters c
        INNER JOIN stories s ON s.id = c.story_id
        WHERE c.id = $1
        LIMIT 1
      `,
      [chapterId]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

async function createChapter(chapterData) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const insertResult = await client.query(
      `
        INSERT INTO chapters (story_id, chapter_number, title, content)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published
      `,
      [chapterData.story_id, chapterData.chapter_number, chapterData.title || null, chapterData.content || null]
    );

    await client.query(
      `
        UPDATE stories
        SET total_chapters = total_chapters + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [chapterData.story_id]
    );

    await client.query('COMMIT');
    return insertResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateChapter(id, chapterData) {
  const { title, content } = chapterData;

  try {
    const result = await db.query(
      `
        UPDATE chapters
        SET
          title = COALESCE($1, title),
          content = COALESCE($2, content),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published
      `,
      [title || null, content || null, id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

async function deleteChapter(id) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const chapterResult = await client.query('SELECT story_id FROM chapters WHERE id = $1 LIMIT 1', [id]);
    const chapter = chapterResult.rows[0];

    if (!chapter) {
      await client.query('ROLLBACK');
      return null;
    }

    const deleteResult = await client.query(
      `
        DELETE FROM chapters
        WHERE id = $1
        RETURNING
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published
      `,
      [id]
    );

    await client.query(
      `
        UPDATE stories
        SET total_chapters = GREATEST(total_chapters - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [chapter.story_id]
    );

    await client.query('COMMIT');
    return deleteResult.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getChapterCount(storyId) {
  try {
    const result = await db.query('SELECT COUNT(*)::int AS count FROM chapters WHERE story_id = $1', [storyId]);
    return result.rows[0] ? result.rows[0].count : 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getChaptersByStory,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterCount,
};