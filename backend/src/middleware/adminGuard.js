// backend/src/middleware/adminGuard.js
const auth = require('./authMiddleware.js');

// Định nghĩa hàm thiếu
const authorizeAdmin = (req, res, next) => {
  // Giả sử req.user được gán bởi authenticateToken
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
};

module.exports = {
  ...auth,          // Giữ lại authenticateToken và optionalAuth
  authorizeAdmin    // Thêm hàm admin mới
};