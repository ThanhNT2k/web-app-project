const MESSAGE_TRANSLATIONS = new Map([
  ['Invalid credentials', 'Email hoặc mật khẩu không chính xác.'],
  ['Validation failed', 'Dữ liệu đầu vào không hợp lệ.'],
  ['Unauthorized', 'Bạn cần đăng nhập để thực hiện thao tác này.'],
  ['Access denied', 'Bạn không có quyền thực hiện thao tác này.'],
  ['Access denied. Admins only.', 'Chỉ quản trị viên mới có quyền thực hiện thao tác này.'],
  ['Access denied: No role information found', 'Không tìm thấy thông tin vai trò của tài khoản.'],
  ['Access denied: Insufficient permissions', 'Tài khoản không có đủ quyền thực hiện thao tác này.'],
  ['No token provided', 'Không tìm thấy token xác thực. Vui lòng đăng nhập.'],
  ['Invalid or expired token', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'],
  ['Story not found', 'Không tìm thấy truyện.'],
  ['Chapter not found', 'Không tìm thấy chương truyện.'],
  ['Comment not found', 'Không tìm thấy bình luận.'],
  ['Parent comment not found', 'Không tìm thấy bình luận cha.'],
  ['Invalid story ID', 'Mã truyện không hợp lệ.'],
  ['Invalid story id', 'Mã truyện không hợp lệ.'],
  ['Invalid chapter id', 'Mã chương truyện không hợp lệ.'],
  ['Invalid comment id', 'Mã bình luận không hợp lệ.'],
  ['Email already exists', 'Email đã được sử dụng.'],
  ['Internal server error', 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'],
  ['Upload failed', 'Tải tệp lên thất bại.'],
]);

function translateMessage(message, statusCode) {
  if (!message || typeof message !== 'string') return message;

  if (statusCode >= 500) {
    return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
  }

  if (MESSAGE_TRANSLATIONS.has(message)) {
    return MESSAGE_TRANSLATIONS.get(message);
  }

  if (message.startsWith('Route not found:')) {
    return `Không tìm thấy đường dẫn: ${message.slice('Route not found:'.length).trim()}`;
  }

  if (/must be a valid email/i.test(message)) return 'Email không đúng định dạng.';
  if (/is not allowed/i.test(message)) return 'Dữ liệu chứa trường không được hỗ trợ.';
  if (/is required/i.test(message)) return 'Vui lòng nhập đầy đủ thông tin bắt buộc.';
  if (/must be (less than|larger than|greater than)/i.test(message)) {
    return 'Giá trị nằm ngoài phạm vi cho phép.';
  }

  return message;
}

function localizeErrorResponse(_req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body && body.success === false) {
      const statusCode = res.statusCode || 500;
      const localized = {
        ...body,
        message: translateMessage(body.message, statusCode),
      };
      if (Array.isArray(body.errors)) {
        localized.errors = body.errors.map((error) => translateMessage(error, statusCode));
      }
      return originalJson(localized);
    }
    return originalJson(body);
  };

  next();
}

module.exports = {
  localizeErrorResponse,
  translateMessage,
};
