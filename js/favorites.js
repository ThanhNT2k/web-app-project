/**
 * favorites.js - Module API Theo dõi/Yêu thích
 * Xử lý theo dõi người dùng, quản lý yêu thích
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/users/follows
 * - POST /api/follows
 * - DELETE /api/follows/{comicId}
 */

import { apiCall } from './api.js';

/**
 * Nhận các truyện yêu thích / truyện được theo dõi của người dùng
 * GET /api/users/follows
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getFavorites() {
  try {
    const response = await apiCall('/users/follows', 'GET');
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
 * Theo dõi một truyện
 * POST /api/follows
 * @param {string} comicId - ID truyện để theo dõi
 * @returns {Promise<Object>} - {success, error}
 */
export async function followComic(comicId) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required'
      };
    }

    const response = await apiCall(
      '/follows',
      'POST',
      { comicId }
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
 * Bỏ theo dõi một truyện
 * DELETE /api/follows/{comicId}
 * @param {string} comicId - ID truyện để bỏ theo dõi
 * @returns {Promise<Object>} - {success, error}
 */
export async function unfollowComic(comicId) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required'
      };
    }

    await apiCall(`/follows/${comicId}`, 'DELETE');
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
