/**
 * genres.js - Module API Thể loại
 * Xử lý liệt kê thể loại và lọc
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/genres
 * - GET /api/genres/{id}/comics
 */

import { apiCall } from './api.js';

/**
 * Nhận tất cả các thể loại có sẵn
 * GET /api/genres
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getGenres() {
  try {
    const response = await apiCall('/genres', 'GET');
    return {
      success: true,
      data: response.genres || response.data || response
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
 * Nhận truyện theo thể loại
 * GET /api/genres/{id}/comics
 * @param {string} genreId - ID thể loại
 * @param {Object} options - {page, limit}
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getComicsByGenre(genreId, options = {}) {
  try {
    if (!genreId) {
      return {
        success: false,
        error: 'Genre ID is required',
        data: []
      };
    }

    const {
      page = 1,
      limit = 12
    } = options;

    const endpoint = `/genres/${genreId}/comics?page=${page}&limit=${limit}`;

    const response = await apiCall(endpoint, 'GET');
    return {
      success: true,
      data: response.data || response,
      pagination: response.pagination || { page, limit }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}
