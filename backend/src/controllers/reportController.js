const { z } = require('zod');

const db = require('../config/database');

const reportSchema = z.object({
  reason: z.string().min(1).max(50),
  description: z.string().max(500).default(''),
  story_id: z.number().int().positive().nullable().optional().default(null),
  chapter_id: z.number().int().positive().nullable().optional().default(null),
  comment_id: z.number().int().positive().nullable().optional().default(null),
}).refine(
  (data) => data.story_id || data.chapter_id || data.comment_id,
  { message: 'Báo cáo phải gắn với truyện, chương hoặc bình luận.' }
);

const REPORT_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'];
const REPORT_ACTIONS = [
  'START_REVIEW',
  'RESOLVE_NO_ACTION',
  'DISMISS',
  'REJECT_COMMENT',
  'FLAG_COMMENT_SPAM',
  'UNPUBLISH_CHAPTER',
  'HIDE_STORY',
  'REMOVE_REPORTED_AVATAR',
];

const processReportSchema = z.object({
  action: z.enum(REPORT_ACTIONS),
  note: z.string().max(500).optional().default(''),
});

const createReport = async (req, res) => {
  try {
    const data = reportSchema.parse(req.body);
    const userId = req.user.id;

    const { rows: spamCheck } = await db.query(
      "SELECT COUNT(*) FROM reports WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'",
      [userId]
    );

    if (parseInt(spamCheck[0].count, 10) >= 10) {
      return res.status(429).json({ error: 'Bạn đã báo cáo quá nhiều lần.' });
    }

    let reportedUserId = null;
    if (data.reason === 'AVATAR_INAPPROPRIATE') {
      if (!data.comment_id) {
        return res.status(400).json({ error: 'Báo cáo avatar phải được gửi từ một bình luận.' });
      }
      const commentResult = await db.query(
        'SELECT user_id FROM comments WHERE id = $1 LIMIT 1',
        [data.comment_id]
      );
      reportedUserId = commentResult.rows[0]?.user_id || null;
      if (!reportedUserId) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng của bình luận.' });
      }
    }

    await db.query(
      `INSERT INTO reports
         (user_id, story_id, chapter_id, comment_id, reported_user_id, reason, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, data.story_id, data.chapter_id, data.comment_id, reportedUserId, data.reason, data.description]
    );

    if (data.chapter_id) {
      const { rows: countCheck } = await db.query(
        "SELECT COUNT(*) FROM reports WHERE chapter_id = $1 AND status = 'NEW'",
        [data.chapter_id]
      );

      if (parseInt(countCheck[0].count, 10) >= 10) {
        await db.query('UPDATE chapters SET is_published = false WHERE id = $1', [data.chapter_id]);
      }
    }

    return res.status(201).json({ message: 'Báo cáo đã được ghi nhận!' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error('[reportController.createReport] error', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};

const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT r.*, u.username AS reporter_username,
             ch.chapter_number, ch.title AS chapter_title,
             c.content AS comment_content,
             c.status AS comment_status,
             comment_author.username AS comment_author_username,
             comment_author.avatar_url AS comment_author_avatar_url,
             COALESCE(profile_user.id, comment_author.id) AS reported_user_id,
             COALESCE(profile_user.username, comment_author.username) AS reported_username,
             COALESCE(profile_user.full_name, comment_author.full_name) AS reported_full_name,
             COALESCE(profile_user.avatar_url, comment_author.avatar_url) AS reported_avatar_url,
             resolver.username AS resolved_by_username,
             COALESCE(report_story.title, chapter_story.title) AS story_title,
             COALESCE(report_story.slug, chapter_story.slug) AS story_slug,
             COALESCE(report_story.id, chapter_story.id) AS story_id
      FROM reports r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN chapters ch ON ch.id = r.chapter_id
      LEFT JOIN comments c ON c.id = r.comment_id
      LEFT JOIN users comment_author ON comment_author.id = c.user_id
      LEFT JOIN users profile_user ON profile_user.id = r.reported_user_id
      LEFT JOIN users resolver ON resolver.id = r.resolved_by
      LEFT JOIN stories report_story ON report_story.id = r.story_id
      LEFT JOIN stories chapter_story ON chapter_story.id = COALESCE(ch.story_id, c.story_id)
    `;
    const values = [];

    if (status && status !== 'ALL') {
      query += ' WHERE r.status = $1';
      values.push(status);
    }

    query += ' ORDER BY r.created_at DESC';
    const result = await db.query(query, values);
    return res.status(200).json({ reports: result.rows });
  } catch (error) {
    console.error('[reportController.getReports] error', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!REPORT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái báo cáo không hợp lệ.' });
    }

    const result = await db.query(
      'UPDATE reports SET status = $1 WHERE id = $2',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo.' });
    }

    return res.status(200).json({ message: 'Trạng thái báo cáo đã được cập nhật!' });
  } catch (error) {
    console.error('[reportController.updateReportStatus] error', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};

const processReport = async (req, res) => {
  let client;
  try {
    const reportId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({ message: 'Mã báo cáo không hợp lệ.' });
    }

    const { action, note } = processReportSchema.parse(req.body);
    client = await db.connect();
    await client.query('BEGIN');

    const reportResult = await client.query(
      `SELECT r.id, r.story_id, r.chapter_id, r.comment_id, r.reported_user_id,
              r.reason, r.status, c.user_id AS comment_user_id
       FROM reports r
       LEFT JOIN comments c ON c.id = r.comment_id
       WHERE r.id = $1
       FOR UPDATE`,
      [reportId]
    );
    const report = reportResult.rows[0];

    if (!report) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Không tìm thấy báo cáo.' });
    }

    let nextStatus = 'RESOLVED';

    if (action === 'START_REVIEW') {
      nextStatus = 'IN_PROGRESS';
    } else if (action === 'DISMISS') {
      nextStatus = 'DISMISSED';
    } else if (action === 'REJECT_COMMENT' || action === 'FLAG_COMMENT_SPAM') {
      if (!report.comment_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Phương án này chỉ áp dụng cho báo cáo bình luận.' });
      }
      const commentStatus = action === 'REJECT_COMMENT' ? 'rejected' : 'flagged';
      await client.query(
        `UPDATE comments
         SET status = $1,
             is_spam = CASE WHEN $1 = 'flagged' THEN true ELSE is_spam END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [commentStatus, report.comment_id]
      );
    } else if (action === 'UNPUBLISH_CHAPTER') {
      if (!report.chapter_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Phương án này chỉ áp dụng cho báo cáo chương.' });
      }
      await client.query(
        'UPDATE chapters SET is_published = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [report.chapter_id]
      );
    } else if (action === 'HIDE_STORY') {
      if (!report.story_id || report.chapter_id || report.comment_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Phương án này chỉ áp dụng cho báo cáo truyện.' });
      }
      await client.query(
        `UPDATE stories
         SET is_published = false,
             hidden_by_admin = CASE WHEN $2 THEN true ELSE hidden_by_admin END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [report.story_id, req.user?.role === 'Admin']
      );
    } else if (action === 'REMOVE_REPORTED_AVATAR') {
      const targetUserId = report.reported_user_id || report.comment_user_id;
      if (report.reason !== 'AVATAR_INAPPROPRIATE' || !targetUserId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Phương án này chỉ áp dụng cho báo cáo avatar.' });
      }
      await client.query(
        'UPDATE users SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [targetUserId]
      );
    }

    const resolved = nextStatus === 'RESOLVED' || nextStatus === 'DISMISSED';
    const updatedResult = await client.query(
      `UPDATE reports
       SET status = $1,
           resolution_action = $2,
           resolution_note = NULLIF($3, ''),
           resolved_by = $4,
           resolved_at = CASE WHEN $5 THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $6
       RETURNING *`,
      [nextStatus, action, note.trim(), req.user.id, resolved, reportId]
    );

    await client.query('COMMIT');
    return res.status(200).json({
      message: nextStatus === 'IN_PROGRESS'
        ? 'Báo cáo đã được chuyển sang trạng thái đang xem xét.'
        : 'Báo cáo đã được xử lý.',
      report: updatedResult.rows[0],
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Phương án xử lý không hợp lệ.', error: error.errors });
    }
    console.error('[reportController.processReport] error', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  } finally {
    if (client) client.release();
  }
};

module.exports = {
  createReport,
  getReports,
  processReport,
  updateReportStatus,
};
