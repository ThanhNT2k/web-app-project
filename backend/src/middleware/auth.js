const jwt = require('jsonwebtoken');

const env = require('../config/environment');

/**
 * Middleware xác thực token bắt buộc (bản cũ hơn của authMiddleware.js).
 * Cả hai file auth.js và authMiddleware.js thực hiện cùng logic authenticateToken,
 * nhưng file này (auth.js) không có hàm optionalAuth.
 * Được dùng ở một số route cũ; authMiddleware.js là phiên bản đầy đủ hơn.
 *
 * Luồng hoạt động:
 * 1. Đọc Authorization header
 * 2. Tách token khỏi chuỗi "Bearer <token>"
 * 3. Xác thực JWT và gán payload vào req.user
 */
const authenticateToken = (req, res, next) => {
  // Lấy header Authorization từ request (dạng "Bearer <jwt_token>")
  const authHeader = req.headers.authorization;

  // Nếu header không tồn tại hoặc không bắt đầu bằng "Bearer ", từ chối truy cập
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
    });
  }

  // Tách phần token ra khỏi chuỗi "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    // Giải mã token với secret key, nếu thất bại sẽ throw exception
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Gán thông tin người dùng đã giải mã (id, username, email, role) vào req.user
    // để các middleware và controller phía sau dùng được
    req.user = decoded;
    return next();
  } catch (error) {
    // Token không hợp lệ (chữ ký sai) hoặc đã hết hạn
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = {
  authenticateToken,
};