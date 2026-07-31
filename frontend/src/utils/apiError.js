const MESSAGE_TRANSLATIONS = {
  'Invalid credentials': 'Email hoặc mật khẩu không chính xác.',
  'Validation failed': 'Dữ liệu đầu vào không hợp lệ.',
  Unauthorized: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  'Access denied': 'Bạn không có quyền thực hiện thao tác này.',
  'Access denied. Admins only.': 'Chỉ quản trị viên mới có quyền thực hiện thao tác này.',
  'Access denied: No role information found': 'Không tìm thấy thông tin vai trò của tài khoản.',
  'Access denied: Insufficient permissions': 'Tài khoản không có đủ quyền thực hiện thao tác này.',
  'No token provided': 'Không tìm thấy token xác thực. Vui lòng đăng nhập.',
  'Invalid or expired token': 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  'Story not found': 'Không tìm thấy truyện.',
  'Chapter not found': 'Không tìm thấy chương truyện.',
  'Comment not found': 'Không tìm thấy bình luận.',
  'Parent comment not found': 'Không tìm thấy bình luận cha.',
  'Invalid story ID': 'Mã truyện không hợp lệ.',
  'Invalid chapter id': 'Mã chương truyện không hợp lệ.',
  'Invalid comment id': 'Mã bình luận không hợp lệ.',
  'Email already exists': 'Email đã được sử dụng.',
  'Internal server error': 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  'Upload failed': 'Tải tệp lên thất bại.',
  'Network Error': 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
};

export function translateApiMessage(message, fallbackMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  if (!message || typeof message !== 'string') return fallbackMessage;
  if (MESSAGE_TRANSLATIONS[message]) return MESSAGE_TRANSLATIONS[message];
  if (message.startsWith('Route not found:')) return 'Không tìm thấy đường dẫn yêu cầu.';
  if (/must be a valid email/i.test(message)) return 'Email không đúng định dạng.';
  if (/is required/i.test(message)) return 'Vui lòng nhập đầy đủ thông tin bắt buộc.';
  return message;
}

export function localizeApiError(error) {
  const responseData = error?.response?.data;
  if (responseData && typeof responseData === 'object') {
    responseData.message = translateApiMessage(
      responseData.message,
      error?.response?.status >= 500
        ? 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
        : 'Yêu cầu không thể thực hiện. Vui lòng kiểm tra lại.',
    );
    if (Array.isArray(responseData.errors)) {
      responseData.errors = responseData.errors.map((item) => translateApiMessage(item));
    }
  }
  return error;
}

export function getApiErrorMessage(error, fallbackMessage) {
  localizeApiError(error);
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }

  return responseData?.message
    || translateApiMessage(error?.message, fallbackMessage)
    || fallbackMessage;
}
