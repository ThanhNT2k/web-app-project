const db = require('../config/database');
const { Story, Comment } = require('../models');
const Tag = require('../models/Tag');

async function getDashboard(req, res) {
  try {
    const [pendingStories, hiddenStories, newReports, totalComments] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS c FROM stories WHERE is_published = false AND hidden_by_admin = false'),
      db.query('SELECT COUNT(*)::int AS c FROM stories WHERE hidden_by_admin = true'),
      db.query("SELECT COUNT(*)::int AS c FROM reports WHERE status = 'NEW'"),
      db.query('SELECT COUNT(*)::int AS c FROM comments'),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        pendingStories: pendingStories.rows[0].c,
        hiddenStories: hiddenStories.rows[0].c,
        reportsPending: newReports.rows[0].c,
        totalComments: totalComments.rows[0].c,
      },
    });
  } catch (error) {
    console.error('[moderatorController.getDashboard]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getPendingStories(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const offset = (page - 1) * limit;

    const query = `
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
        s.hidden_by_admin,
        u.username AS author_username,
        u.full_name AS author_full_name,
        COUNT(*) OVER() AS total_count
      FROM stories s
      LEFT JOIN users u ON u.id = s.author_id
      WHERE s.is_published = false AND s.hidden_by_admin = false
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, [limit, offset]);
    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const stories = result.rows.map(({ total_count, ...story }) => story);

    const storiesWithTags = await Promise.all(
      stories.map(async (story) => ({
        ...story,
        tags: await Tag.getTagsForStory(story.id),
      }))
    );

    return res.status(200).json({
      success: true,
      stories: storiesWithTags,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error('[moderatorController.getPendingStories]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getComments(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 50, 1);
    const offset = (page - 1) * limit;
    const storyId = req.query.story_id ? parseInt(req.query.story_id, 10) : null;
    const chapterId = req.query.chapter_id ? parseInt(req.query.chapter_id, 10) : null;

    const filters = [];
    const values = [limit, offset];

    if (storyId) {
      values.push(storyId);
      filters.push(`c.story_id = $${values.length}`);
    }
    if (chapterId) {
      values.push(chapterId);
      filters.push(`c.chapter_id = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `
      SELECT
        c.id,
        c.user_id,
        c.story_id,
        c.chapter_id,
        c.content,
        c.rating,
        c.created_at,
        c.updated_at,
        u.username AS user_username,
        u.full_name AS user_full_name,
        s.title AS story_title,
        s.slug AS story_slug,
        COUNT(*) OVER() AS total_count
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN stories s ON s.id = c.story_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, values);
    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    return res.status(200).json({
      success: true,
      comments: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error('[moderatorController.getComments]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getDashboard,
  getPendingStories,
  getComments,
};
