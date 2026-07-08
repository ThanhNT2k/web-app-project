const { z } = require('zod');

const db = require('../config/database');

const reportSchema = z.object({
  reason: z.string(),
  description: z.string(),
  story_id: z.number().int().nullable(),
  chapter_id: z.number().int().nullable(),
  comment_id: z.number().int().nullable(),
}).refine(
  (data) => data.story_id || data.chapter_id || data.comment_id,
  { message: 'Báo cáo phải gắn với truyện, chương hoặc bình luận.' }
);

const createReport = async (req, res) => {
  try {
    const data = reportSchema.parse(req.body);
    const userId = req.user.id;

    // Chống spam: Dùng 'reports' (thường) thay vì 'Reports' (hoa)
    const { rows: spamCheck } = await db.query(
      "SELECT COUNT(*) FROM reports WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'",
      [userId]
    );
    
    if (parseInt(spamCheck[0].count) >= 10) {
      return res.status(429).json({ error: "Bạn đã báo cáo quá nhiều lần." });
    }

    await db.query(
      "INSERT INTO reports (user_id, story_id, chapter_id, comment_id, reason, description) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, data.story_id, data.chapter_id, data.comment_id, data.reason, data.description]
    );

    // Kiểm tra và ẩn chương nếu báo cáo gắn với chapter
    if (data.chapter_id) {
      const { rows: countCheck } = await db.query(
        "SELECT COUNT(*) FROM reports WHERE chapter_id = $1 AND status = 'NEW'",
        [data.chapter_id]
      );

      if (parseInt(countCheck[0].count) >= 10) {
        // Lưu ý: Đảm bảo bảng 'chapters' có cột 'status'
        await db.query("UPDATE chapters SET is_published = false WHERE id = $1", [data.chapter_id]);
      }
    }

    res.status(201).json({ message: "Báo cáo đã được ghi nhận!" });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error('[reportController.createReport] error', error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

// Trong Controller lấy danh sách báo cáo
const getReports = async (req, res) => {
  try {
    const { status } = req.query; // Nhận status từ URL params
    let query = `
      SELECT r.*, u.username AS reporter_username,
             ch.chapter_number, ch.title AS chapter_title,
             c.content AS comment_content,
             c.status AS comment_status,
             COALESCE(report_story.title, chapter_story.title) AS story_title,
             COALESCE(report_story.slug, chapter_story.slug) AS story_slug,
             COALESCE(report_story.id, chapter_story.id) AS story_id
      FROM reports r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN chapters ch ON ch.id = r.chapter_id
      LEFT JOIN comments c ON c.id = r.comment_id
      LEFT JOIN stories report_story ON report_story.id = r.story_id
      LEFT JOIN stories chapter_story ON chapter_story.id = COALESCE(ch.story_id, c.story_id)
    `;
    let values = [];

    if (status && status !== 'ALL') {
      query += " WHERE r.status = $1";
      values.push(status);
    }
    
    // Thêm ORDER BY để báo cáo mới nhất hiện lên đầu
    query += " ORDER BY r.created_at DESC";

    const result = await db.query(query, values);
    res.status(200).json({ reports: result.rows });
  } catch (error) {
    console.error('[reportController.getReports] error', error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      "UPDATE reports SET status = $1 WHERE id = $2",
      [status, id]
    );

    // Kiểm tra xem có dòng nào được cập nhật không
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    }

    res.status(200).json({ message: "Trạng thái báo cáo đã được cập nhật!" });
  } catch (error) {
    console.error('[reportController.updateReportStatus] error', error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus
};
