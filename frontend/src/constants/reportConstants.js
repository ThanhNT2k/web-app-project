/**
 * Các lý do báo cáo người dùng có thể chọn
 * Key là ID lưu vào database, Value là text hiển thị cho người dùng
 */
export const REPORT_REASONS = {
  BROKEN_IMAGE: "Ảnh bị lỗi (mất ảnh, không load được)",
  INCORRECT_CONTENT: "Nội dung sai lệch hoặc trùng lặp",
  INAPPROPRIATE_CONTENT: "Nội dung phản cảm, vi phạm chính sách",
  COPYRIGHT_VIOLATION: "Vi phạm bản quyền",
  OTHER: "Lý do khác"
};

/**
 * Trạng thái của một báo cáo (Dùng cho cả Backend và Frontend)
 */
export const REPORT_STATUS = {
  NEW: "NEW",           // Mới gửi, chưa xử lý
  PENDING: "PENDING",   // Đang xem xét
  RESOLVED: "RESOLVED", // Đã xử lý xong
  DISMISSED: "DISMISSED" // Bác bỏ (báo cáo sai sự thật)
};

/**
 * Cấu hình ngưỡng tự động ẩn chương (Threshold)
 * Nếu đạt số lượng báo cáo 'NEW' nhất định, hệ thống tự ẩn chương
 */
export const REPORT_THRESHOLD = 10;