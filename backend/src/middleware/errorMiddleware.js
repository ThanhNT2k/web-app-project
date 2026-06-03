/**
 * Wrapper bao bọc async handler function để tự động bắt lỗi.
 * Thay vì phải viết try/catch trong mỗi async controller,
 * bọc handler bằng asyncHandler để mọi lỗi được tự động chuyển đến
 * Express error handler tập trung (next(err)) khi có exception.
 *
 * Cách dùng:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(handler) {
  // Trả về một middleware function mới bao gồm try-catch ẩn
  // Nếu handler throw hoặc Promise bị rejected, lỗi sẽ được chuyển sang next(err)
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/**
 * Middleware xử lý lỗi tổng quát (bản thứ hai, trong errorMiddleware.js).
 * Tương tự errorHandler trong errorHandler.js nhưng có thêm logic:
 * - Trong production: trả về thông điệp lỗi chung chung (ẩn chi tiết nội bộ)
 * - Trong development: trả về thông điệp lỗi thật để dễ debug
 */
function errorHandler(err, req, res, next) {
  // Log lỗi đầy đủ ra console để dễ debug ở server-side
  console.error('[Error]', err);

  // Xác định môi trường chạy để quyết định mức độ chi tiết của thông báo lỗi trả về
  const isProduction = process.env.NODE_ENV === 'production';

  // Đọc status code từ lỗi (err.statusCode hoặc err.status), mặc định 500
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    // Trong production, ẩn thông báo lỗi chi tiết để tránh lộ thông tin nội bộ cho client
    // Trong development, hiển thị message thật để debug dễ dàng hơn
    message: isProduction ? 'Internal server error' : err.message || 'Internal server error',
  });
}

module.exports = {
  asyncHandler,
  errorHandler,
};