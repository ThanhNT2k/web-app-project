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

// Trong Controller lấy danh sách báo cáo
const getReports = async (req, res) => {
  try {
    const { status } = req.query; // Nhận status từ URL params
    let query = "SELECT * FROM reports";
    let values = [];

    if (status && status !== 'ALL') {
      query += " WHERE status = $1";
      values.push(status);
    }
    
    // Thêm ORDER BY để báo cáo mới nhất hiện lên đầu
    query += " ORDER BY created_at DESC";

    const result = await db.query(query, values);
    res.status(200).json({ reports: result.rows });
  } catch (error) {
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
    console.error(error); // Log lỗi ra console để debug
    res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus
};