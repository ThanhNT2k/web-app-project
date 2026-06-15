/**
 * Middleware kiểm tra phân quyền dựa trên vai trò (RBAC).
 * Đảm bảo file routes import bằng cách sử dụng: const { authorizeRole } = require('...');
 */
function authorizeRole(...roles) {
  return (req, res, next) => {
    // 1. Kiểm tra req.user đã tồn tại chưa (Middleware này phải đặt SAU authenticateToken)
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No role information found',
      });
    }

    // 2. Chuyển đổi về chữ thường để so sánh không phân biệt hoa/thường
    // Điều này tránh lỗi khi DB lưu 'Admin' còn bạn check 'admin'
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    // 3. Kiểm tra quyền
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions',
      });
    }

    // 4. Hợp lệ
    return next();
  };
}

// Export đúng cấu trúc object để các file route nhận diện được function
module.exports = {
  authorizeRole
};