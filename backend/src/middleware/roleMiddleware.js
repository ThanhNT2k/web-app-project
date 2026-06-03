/**
 * Middleware kiểm tra phân quyền dựa trên vai trò (Role-Based Access Control - RBAC).
 * Được dùng SAU authenticateToken để hạn chế quyền truy cập theo role.
 *
 * Cách dùng:
 *   router.get('/admin', authenticateToken, authorizeRole('Admin'), handler)
 *   router.post('/upload', authenticateToken, authorizeRole('Admin', 'Uploader'), handler)
 *
 * @param {...string} roles - Danh sách các role được phép truy cập route đó
 * @returns {Function} Middleware Express
 */
function authorizeRole(...roles) {
  return (req, res, next) => {
    // Kiểm tra req.user phải tồn tại (middleware này phải đặt SAU authenticateToken)
    // và phải có trường role trong payload JWT
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Kiểm tra xem role của người dùng hiện tại có nằm trong danh sách role được phép không
    // Ví dụ: nếu route chỉ cho phép 'Admin' mà user có role 'User' thì từ chối
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Role hợp lệ, tiếp tục xử lý request
    return next();
  };
}

module.exports = {
  authorizeRole,
};