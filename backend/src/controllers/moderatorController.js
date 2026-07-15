const db = require('../config/database');
const { Story, Comment } = require('../models');
const Tag = require('../models/Tag');
const Notification = require('../models/Notification');

async function getDashboard(req, res) {
  try {
    const [pendingStories, hiddenStories, newReports, totalComments] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS c FROM stories WHERE is_published = false AND hidden_by_admin = false AND COALESCE(moderation_status, 'pending') = 'pending'"),
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
        s.author_name,
        s.description,
        s.cover_image_url,
        s.category,
        s.status,
        s.total_chapters,
        s.created_at,
        s.updated_at,
        s.is_published,
        s.hidden_by_admin,
        s.moderation_status,
        s.moderation_note,
        u.username AS author_username,
        u.full_name AS author_full_name,
        COUNT(*) OVER() AS total_count
      FROM stories s
      LEFT JOIN users u ON u.id = s.author_id
      WHERE s.is_published = false
        AND s.hidden_by_admin = false
        AND COALESCE(s.moderation_status, 'pending') = 'pending'
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, [limit, offset]);
    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const stories = result.rows.map(({ total_count, ...story }) => story);

    const storiesWithTags = await Promise.all(
      stories.map(async (story) => ({
        ...story,
        tags: await Tag.getTagsForStory(story.id, true), // Include pending tags for moderator review
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

async function approvePendingStory(req, res) {
  try {
    const storyId = parseInt(req.params.id, 10);
    if (!storyId) return res.status(400).json({ success: false, message: 'Mã truyện không hợp lệ' });

    const result = await db.query(
      `UPDATE stories
       SET is_published = true,
           moderation_status = 'approved',
           moderation_note = NULL,
           reviewed_by = $2,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND is_published = false
         AND hidden_by_admin = false
       RETURNING id, title, slug, is_published, moderation_status`,
      [storyId, req.user?.id || null]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy truyện đang chờ duyệt' });
    }

    // Also approve all pending tags for this story
    await Tag.updateStoryTagsModeration(storyId, 'approved');

    return res.status(200).json({ success: true, message: 'Đã duyệt và hiển thị truyện', story: result.rows[0] });
  } catch (error) {
    console.error('[moderatorController.approvePendingStory]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const STORY_REVIEW_ACTIONS = {
  approve: {
    status: 'approved',
    published: true,
    message: 'Đã duyệt và hiển thị truyện',
    notification: 'Truyện của bạn đã được duyệt và hiển thị công khai.',
  },
  request_changes: {
    status: 'changes_requested',
    published: false,
    message: 'Đã gửi yêu cầu chỉnh sửa',
    notification: 'Truyện của bạn cần được chỉnh sửa trước khi có thể xuất bản.',
  },
  reject: {
    status: 'rejected',
    published: false,
    message: 'Đã từ chối truyện',
    notification: 'Truyện của bạn đã bị từ chối xuất bản.',
  },
};

async function processPendingStory(req, res) {
  try {
    const storyId = parseInt(req.params.id, 10);
    const action = typeof req.body?.action === 'string' ? req.body.action : '';
    const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
    const option = STORY_REVIEW_ACTIONS[action];

    if (!storyId || !option) {
      return res.status(400).json({ success: false, message: 'Mã truyện hoặc phương án xử lý không hợp lệ' });
    }
    if (note.length > 1000) {
      return res.status(400).json({ success: false, message: 'Ghi chú xử lý không được vượt quá 1000 ký tự' });
    }
    if (action !== 'approve' && !note) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do cho phương án này' });
    }

    const result = await db.query(
      `UPDATE stories
       SET is_published = $2,
           moderation_status = $3,
           moderation_note = $4,
           reviewed_by = $5,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND is_published = false
         AND hidden_by_admin = false
         AND COALESCE(moderation_status, 'pending') = 'pending'
       RETURNING id, title, slug, author_id, is_published, moderation_status, moderation_note, reviewed_at`,
      [storyId, option.published, option.status, note || null, req.user?.id || null]
    );

    const story = result.rows[0];
    if (!story) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy truyện đang chờ duyệt' });
    }

    // Update tag moderation status to match story status
    await Tag.updateStoryTagsModeration(storyId, option.status);

    if (story.author_id) {
      const detail = note ? ` Lý do: ${note}` : '';
      try {
        await Notification.create(
          story.author_id,
          story.id,
          null,
          `${option.notification}${detail}`,
          '/dashboard',
          'system'
        );
      } catch (notificationError) {
        console.error('[moderatorController.processPendingStory.notification]', notificationError);
      }
    }

    return res.status(200).json({ success: true, message: option.message, story });
  } catch (error) {
    console.error('[moderatorController.processPendingStory]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getComments(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const storyId = req.query.story_id ? parseInt(req.query.story_id, 10) : null;
    const chapterId = req.query.chapter_id ? parseInt(req.query.chapter_id, 10) : null;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const allowedStatuses = ['approved', 'rejected', 'masked', 'flagged'];
    const status = allowedStatuses.includes(req.query.status) ? req.query.status : null;

    const filters = [];
    const values = [];

    if (storyId) {
      values.push(storyId);
      filters.push(`c.story_id = $${values.length}`);
    }
    if (chapterId) {
      values.push(chapterId);
      filters.push(`c.chapter_id = $${values.length}`);
    }
    if (status) {
      values.push(status);
      filters.push(`c.status = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      filters.push(`(
        c.content ILIKE $${values.length}
        OR u.username ILIKE $${values.length}
        OR u.full_name ILIKE $${values.length}
        OR s.title ILIKE $${values.length}
      )`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    values.push(limit);
    const limitPosition = values.length;
    values.push(offset);
    const offsetPosition = values.length;
    const query = `
      SELECT
        c.id,
        c.user_id,
        c.story_id,
        c.chapter_id,
        c.parent_comment_id,
        c.content,
        c.rating,
        c.created_at,
        c.updated_at,
        c.status,
        c.is_spam,
        u.username AS user_username,
        u.full_name AS user_full_name,
        u.avatar_url AS user_avatar_url,
        s.title AS story_title,
        s.slug AS story_slug,
        ch.chapter_number,
        ch.title AS chapter_title,
        COUNT(*) OVER() AS total_count
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN stories s ON s.id = c.story_id
      LEFT JOIN chapters ch ON ch.id = c.chapter_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${limitPosition} OFFSET $${offsetPosition}
    `;

    const [result, statsResult] = await Promise.all([
      db.query(query, values),
      db.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
          COUNT(*) FILTER (WHERE status = 'masked')::int AS masked,
          COUNT(*) FILTER (WHERE status = 'flagged')::int AS flagged,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
        FROM comments
      `),
    ]);
    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const comments = result.rows.map(({ total_count, ...comment }) => comment);

    return res.status(200).json({
      success: true,
      comments,
      stats: statsResult.rows[0] || { total: 0, approved: 0, masked: 0, flagged: 0, rejected: 0 },
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

async function getReportedProfiles(req, res) {
  try {
    const status = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'].includes(req.query.status)
      ? req.query.status
      : null;
    const values = [];
    let statusFilter = '';
    if (status) {
      values.push(status);
      statusFilter = `AND r.status = $${values.length}`;
    }

    const result = await db.query(`
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.is_active,
        COUNT(r.id)::int AS report_count,
        COUNT(r.id) FILTER (WHERE r.status IN ('NEW', 'IN_PROGRESS'))::int AS active_report_count,
        MAX(r.created_at) AS last_reported_at,
        (ARRAY_AGG(r.status ORDER BY r.created_at DESC))[1] AS latest_status,
        (ARRAY_AGG(r.resolution_action ORDER BY r.created_at DESC))[1] AS latest_resolution_action,
        (ARRAY_AGG(r.resolution_note ORDER BY r.created_at DESC))[1] AS latest_resolution_note,
        (ARRAY_AGG(r.resolved_at ORDER BY r.created_at DESC))[1] AS latest_resolved_at,
        (ARRAY_AGG(resolver.username ORDER BY r.created_at DESC))[1] AS latest_resolver_username,
        (ARRAY_AGG(resolver.full_name ORDER BY r.created_at DESC))[1] AS latest_resolver_full_name
      FROM reports r
      LEFT JOIN comments c ON c.id = r.comment_id
      JOIN users u ON u.id = COALESCE(r.reported_user_id, c.user_id)
      LEFT JOIN users resolver ON resolver.id = r.resolved_by
      WHERE r.reason = 'AVATAR_INAPPROPRIATE'
        ${statusFilter}
      GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.is_active
      ORDER BY MAX(r.created_at) DESC
    `, values);

    return res.status(200).json({ success: true, profiles: result.rows });
  } catch (error) {
    console.error('[moderatorController.getReportedProfiles]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function processProfileAvatar(req, res) {
  const allowedActions = ['START_REVIEW', 'REMOVE_AVATAR', 'KEEP_AVATAR'];
  const userId = parseInt(req.params.id, 10);
  const action = req.body?.action;
  const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';

  if (!userId || !allowedActions.includes(action) || note.length > 500) {
    return res.status(400).json({ success: false, message: 'Phương án xử lý profile không hợp lệ.' });
  }

  let client;
  try {
    client = await db.connect();
    await client.query('BEGIN');

    const profileResult = await client.query(
      'SELECT id, username, avatar_url FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    if (!profileResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy profile.' });
    }

    const nextStatus = action === 'START_REVIEW'
      ? 'IN_PROGRESS'
      : action === 'KEEP_AVATAR' ? 'DISMISSED' : 'RESOLVED';
    const resolutionAction = action === 'REMOVE_AVATAR'
      ? 'REMOVE_REPORTED_AVATAR'
      : action;
    const isResolved = nextStatus === 'RESOLVED' || nextStatus === 'DISMISSED';

    if (action === 'REMOVE_AVATAR') {
      await client.query(
        'UPDATE users SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
    }

    const reportsResult = await client.query(`
      UPDATE reports
      SET status = $1,
          resolution_action = $2,
          resolution_note = NULLIF($3, ''),
          resolved_by = $4,
          resolved_at = CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE reason = 'AVATAR_INAPPROPRIATE'
        AND reported_user_id = $5
        AND status IN ('NEW', 'IN_PROGRESS')
      RETURNING id
    `, [nextStatus, resolutionAction, note, req.user.id, userId, isResolved]);

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      message: action === 'REMOVE_AVATAR'
        ? 'Đã gỡ avatar và hoàn tất các báo cáo liên quan.'
        : action === 'KEEP_AVATAR'
          ? 'Đã giữ avatar và bác các báo cáo liên quan.'
          : 'Đã chuyển các báo cáo avatar sang trạng thái đang xem xét.',
      processedReports: reportsResult.rowCount,
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[moderatorController.processProfileAvatar]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  getDashboard,
  getPendingStories,
  approvePendingStory,
  processPendingStory,
  getComments,
  getReportedProfiles,
  processProfileAvatar,
  async updateCommentStatus(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const allowed = ['approved', 'rejected', 'masked', 'flagged'];
      if (!id || !allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid id or status' });
      }

      const updated = await Comment.updateStatus(id, status);
      if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });

      return res.status(200).json({ success: true, comment: updated });
    } catch (error) {
      console.error('[moderatorController.updateCommentStatus]', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
};
