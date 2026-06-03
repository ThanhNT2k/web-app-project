/**
 * Middleware bắt lỗi route không tồn tại (404 Not Found).
 * Được đặt TRƯỚC errorHandler trong app.js và SAU tất cả route đã đăng ký.
 * Khi không có route nào khớp với request, Express chạy middleware này.
 */
const notFoundHandler = (req, res, next) => {
  // Trả về 404 kèm đường dẫn gốc để client dễ debug
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

/**
 * Middleware xử lý lỗi tập trung (Global Error Handler).
 * Express nhận biết đây là error handler vì có 4 tham số (err, req, res, next).
 * Phải được đặt CUỐI CÙNG trong chuỗi middleware của app.js.
 *
 * Nhận lỗi được throw từ controller/route và chuẩn hóa response trả về client.
 * Trong môi trường development, trả thêm stack trace để debug dễ hơn.
 */
const errorHandler = (error, req, res, next) => {
  // Ưu tiên dùng statusCode từ lỗi (ví dụ: 400, 403, 404), mặc định là 500
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    // Chỉ trả về stack trace trong môi trường development để tránh lộ thông tin nội bộ ra production
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};