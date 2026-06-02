/**
 * comics.js - Module API Truyện/Câu chuyện
 * Xử lý liệt kê truyện, tìm kiếm, truy xuất chi tiết và quản lý
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/comics
 * - GET /api/comics/{slug}
 * - GET /api/comics/search
 * - GET /api/comics/trending
 * - GET /api/comics/latest
 * - POST /api/comics (Chỉ Uploader/Admin)
 * - PUT /api/comics/{id} (Chỉ Uploader/Admin)
 * - DELETE /api/comics/{id} (Chỉ Uploader/Admin)
 */

import { apiCall } from './api.js';

/**
 * Nhận danh sách truyện được phân trang
 * GET /api/comics?page=1&limit=12
 * @param {Object} options - {page, limit}
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getComics(options = {}) {
  try {
    const {
      page = 1,
      limit = 12
    } = options;

    const endpoint = `/comics?page=${page}&limit=${limit}`;

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

/**
 * Nhận chi tiết truyện theo slug
 * GET /api/comics/{slug}
 * @param {string} slug - Slug thân thiện với URL của truyện
 * @returns {Promise<Object>} - {success, data: comic, error}
 */
export async function getComicBySlug(slug) {
  try {
    if (!slug) {
      return {
        success: false,
        error: 'Slug is required'
      };
    }

    const response = await apiCall(`/comics/${slug}`, 'GET');
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
 * Tìm kiếm truyện theo truy vấn
 * GET /api/comics/search?q=keyword&page=1&limit=12
 * @param {string} query - Từ khóa tìm kiếm
 * @param {Object} options - {page, limit}
 * @returns {Promise<Object>} - {success, data: [], pagination, error}
 */
export async function searchComics(query, options = {}) {
  try {
    if (!query || query.trim() === '') {
      return {
        success: false,
        error: 'Query is required',
        data: []
      };
    }

    const {
      page = 1,
      limit = 12
    } = options;

    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/comics/search?q=${encodedQuery}&page=${page}&limit=${limit}`;

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

/**
 * Nhận truyện đang xu hướng
 * GET /api/comics/trending
 * @param {Object} options - {page, limit}
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getTrendingComics(options = {}) {
  try {
    const {
      page = 1,
      limit = 12
    } = options;

    const endpoint = `/comics/trending?page=${page}&limit=${limit}`;

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

/**
 * Nhận truyện mới nhất
 * GET /api/comics/latest
 * @param {Object} options - {page, limit}
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getLatestComics(options = {}) {
  try {
    const {
      page = 1,
      limit = 12
    } = options;

    const endpoint = `/comics/latest?page=${page}&limit=${limit}`;

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

/**
 * Tạo truyện mới (Chỉ Uploader/Admin)
 * POST /api/comics
 * @param {Object} comicData - {title, slug, description, coverImage, status, ...}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function createComic(comicData) {
  try {
    if (!comicData.title || !comicData.slug) {
      return {
        success: false,
        error: 'Title and slug are required'
      };
    }

    const response = await apiCall('/comics', 'POST', comicData);
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
 * Cập nhật truyện hiện có (Chỉ Uploader/Admin)
 * PUT /api/comics/{id}
 * @param {string} comicId - ID truyện
 * @param {Object} updateData - {title, description, coverImage, status, ...}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function updateComic(comicId, updateData) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required'
      };
    }

    const response = await apiCall(`/comics/${comicId}`, 'PUT', updateData);
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
 * Xóa truyện (Chỉ Uploader/Admin)
 * DELETE /api/comics/{id}
 * @param {string} comicId - ID truyện
 * @returns {Promise<Object>} - {success, error}
 */
export async function deleteComic(comicId) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required'
      };
    }

    await apiCall(`/comics/${comicId}`, 'DELETE');
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
