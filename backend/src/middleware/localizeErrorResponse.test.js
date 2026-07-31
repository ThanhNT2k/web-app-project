const { localizeErrorResponse, translateMessage } = require('./localizeErrorResponse');

describe('Vietnamese error response localization', () => {
  it.each([
    ['Invalid credentials', 401, 'Email hoặc mật khẩu không chính xác.'],
    ['Unauthorized', 401, 'Bạn cần đăng nhập để thực hiện thao tác này.'],
    ['Story not found', 404, 'Không tìm thấy truyện.'],
    ['Invalid story ID', 400, 'Mã truyện không hợp lệ.'],
    ['Route not found: /api/missing', 404, 'Không tìm thấy đường dẫn: /api/missing'],
  ])('translates "%s"', (message, status, expected) => {
    expect(translateMessage(message, status)).toBe(expected);
  });

  it('hides internal details for every server error', () => {
    expect(translateMessage('Database unavailable: password=secret', 500))
      .toBe('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
  });

  it('localizes error message and validation details returned by a controller', () => {
    const json = jest.fn();
    const res = { statusCode: 400, json };
    const next = jest.fn();
    localizeErrorResponse({}, res, next);

    res.json({
      success: false,
      message: 'Validation failed',
      errors: ['"email" must be a valid email'],
    });

    expect(next).toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ.',
      errors: ['Email không đúng định dạng.'],
    });
  });

  it('does not change successful responses', () => {
    const json = jest.fn();
    const res = { statusCode: 200, json };
    localizeErrorResponse({}, res, jest.fn());
    res.json({ success: true, message: 'Login successful' });
    expect(json).toHaveBeenCalledWith({ success: true, message: 'Login successful' });
  });
});
