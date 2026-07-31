import { describe, expect, it } from 'vitest';
import {
  getApiErrorMessage,
  localizeApiError,
  translateApiMessage,
} from './apiError';

describe('Vietnamese API error messages', () => {
  it.each([
    ['Invalid credentials', 'Email hoặc mật khẩu không chính xác.'],
    ['Unauthorized', 'Bạn cần đăng nhập để thực hiện thao tác này.'],
    ['Story not found', 'Không tìm thấy truyện.'],
    ['Network Error', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'],
  ])('translates "%s"', (source, expected) => {
    expect(translateApiMessage(source)).toBe(expected);
  });

  it('normalizes the response before UI components read it', () => {
    const error = {
      response: {
        status: 400,
        data: {
          message: 'Validation failed',
          errors: ['"email" must be a valid email'],
        },
      },
    };
    localizeApiError(error);
    expect(error.response.data).toEqual({
      message: 'Dữ liệu đầu vào không hợp lệ.',
      errors: ['Email không đúng định dạng.'],
    });
  });

  it('returns a Vietnamese network fallback', () => {
    expect(getApiErrorMessage(
      new Error('Network Error'),
      'Không thể thực hiện yêu cầu.',
    )).toBe('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
  });
});
