/**
 * history.js - Module API Lịch sử Đọc
 * Xử lý tiến trình đọc của người dùng và theo dõi lịch sử
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/users/history
 * - POST /api/users/history
 * - DELETE /api/users/history/{comicId}
 */

import { apiCall } from './api.js';

/**
 * Nhận lịch sử đọc của người dùng
 * GET /api/users/history
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getHistory() {
  try {
    const response = await apiCall('/users/history', 'GET');
    return {
      success: true,
      data: response.data || response || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Lưu tiến trình đọc
 * POST /api/users/history
 * @param {Object} progressData - {comicId, chapterId, ...}
 * @returns {Promise<Object>} - {success, error}
 */
export async function saveReadingProgress(progressData) {
  try {
    if (!progressData.comicId || !progressData.chapterId) {
      return {
        success: false,
        error: 'Comic ID and Chapter ID are required'
      };
    }

    const response = await apiCall(
      '/users/history',
      'POST',
      progressData
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Xóa mục lịch sử cho một truyện
 * DELETE /api/users/history/{comicId}
 * @param {string} comicId - ID truyện
 * @returns {Promise<Object>} - {success, error}
 */
export async function deleteHistory(comicId) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required'
      };
    }

    await apiCall(`/users/history/${comicId}`, 'DELETE');
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
