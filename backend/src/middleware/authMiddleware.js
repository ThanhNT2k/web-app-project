const jwt = require('jsonwebtoken');

const env = require('../config/environment');

/**
 * Middleware xác thực token bắt buộc (required authentication).
 * Mọi route được bảo vệ bởi middleware này đều YÊU CẦU người dùng phải đăng nhập.
 *
 * Luồng hoạt động:
 * 1. Đọc header Authorization từ request
 * 2. Kiểm tra định dạng "Bearer <token>"
 * 3. Giải mã và xác thực JWT với secret key
 * 4. Nếu hợp lệ: gán payload vào req.user và gọi next()
 * 5. Nếu không hợp lệ: trả về 401 Unauthorized
 */
function authenticateToken(req, res, next) {
  // Đọc giá trị header Authorization từ request
  const authHeader = req.headers.authorization;

  // Kiểm tra header phải tồn tại và có đúng định dạng "Bearer <token>"
  // Nếu không có hoặc sai định dạng, từ chối ngay với 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  // Tách lấy phần token sau chữ "Bearer " (index 1 sau split)
  const token = authHeader.split(' ')[1];

  try {
    // Giải mã và xác thực JWT với secret key từ môi trường
    // Nếu token hết hạn hoặc bị giả mạo, jwt.verify sẽ throw lỗi
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Gán payload đã giải mã (chứa id, username, email, role) vào req.user
    // để các controller phía sau có thể sử dụng thông tin người dùng
    req.user = decoded;
    return next();
  } catch (error) {
    // Bắt lỗi khi token không hợp lệ (chữ ký sai) hoặc đã hết hạn (TokenExpiredError)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Middleware xác thực token tùy chọn (optional authentication).
 * Cho phép cả người dùng đã đăng nhập lẫn khách (guest) truy cập route.
 * - Nếu có token hợp lệ: gán thông tin user vào req.user
 * - Nếu không có hoặc token lỗi: gán req.user = null (xử lý như guest)
 * - KHÔNG từ chối request, luôn gọi next()
 *
 * Dùng cho các endpoint như: xem chi tiết truyện, xem danh sách chương,
 * nơi khách có thể đọc nhưng user đăng nhập có thêm tính năng (bookmark, lịch sử...)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // Chỉ xử lý nếu có header Authorization với định dạng Bearer
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Thử giải mã token; nếu hợp lệ thì gán vào req.user
      req.user = jwt.verify(token, env.JWT_SECRET);
    } catch {
      // Token present but invalid — treat as guest, don't reject
      req.user = null;
    }
  } else {
    // Không có token => xử lý như khách vãng lai
    req.user = null;
  }

  return next();
}

function authorizeAdmin(req, res, next) {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
}

module.exports = {
  authenticateToken,
  authorizeAdmin,
  optionalAuth
};