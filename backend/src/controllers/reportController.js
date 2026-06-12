const {z} = require('zod');

const db = require('../config/database');

const reportSchema = z.object({
  reason: z.string(),
  description: z.string(),
  chapter_id: z.number().int().nullable() // Phải là chapter_id giống frontend gửi
});

const createReport = async (req, res) => {
  console.log("--- BẮT ĐẦU CREATE REPORT ---");
  console.log("Body nhận được:", req.body);
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
      "INSERT INTO reports (user_id, chapter_id, reason, description) VALUES ($1, $2, $3, $4)",
      [userId, data.chapter_id, data.reason, data.description]
    );

    // Kiểm tra và ẩn chương
    const { rows: countCheck } = await db.query(
      "SELECT COUNT(*) FROM reports WHERE chapter_id = $1 AND status = 'NEW'",
      [data.chapter_id]
    );

    if (parseInt(countCheck[0].count) >= 10) {
      // Lưu ý: Đảm bảo bảng 'chapters' có cột 'status'
      await db.query("UPDATE chapters SET is_published = false WHERE id = $1", [data.chapter_id]);
    }

    res.status(201).json({ message: "Báo cáo đã được ghi nhận!" });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    console.error(error); // Log để dễ debug
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

const getReports = async (req, res) => {
  try {
    const { chapterId, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Tối ưu: Dùng mảng điều kiện linh hoạt
    let query = "SELECT * FROM reports WHERE 1=1";
    const params = [];
    
    if (chapterId) {
      params.push(chapterId);
      query += ` AND chapter_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    res.status(200).json({ reports: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    await db.query(
      "UPDATE reports SET status = $1 WHERE id = $2",
      [status, reportId]
    );

    res.status(200).json({ message: "Trạng thái báo cáo đã được cập nhật!" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus
};