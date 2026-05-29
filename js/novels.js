/**
 * comics.js - Comic/Story API Module
 * Handles comic listing, searching, detail retrieval, and management
 * 
 * Backend Endpoints:
 * - GET /api/comics
 * - GET /api/comics/{slug}
 * - GET /api/comics/search
 * - GET /api/comics/trending
 * - GET /api/comics/latest
 * - POST /api/comics (Uploader/Admin only)
 * - PUT /api/comics/{id} (Uploader/Admin only)
 * - DELETE /api/comics/{id} (Uploader/Admin only)
 */

import { apiCall } from './api.js';

/**
 * Get paginated list of comics
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
 * Get comic details by slug
 * GET /api/comics/{slug}
 * @param {string} slug - URL-friendly slug of the comic
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
 * Search comics by query
 * GET /api/comics/search?q=keyword&page=1&limit=12
 * @param {string} query - Search keyword
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
 * Get trending comics
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
 * Get latest comics
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
 * Create new comic (Uploader/Admin only)
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
 * Update existing comic (Uploader/Admin only)
 * PUT /api/comics/{id}
 * @param {string} comicId - Comic ID
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
 * Delete comic (Uploader/Admin only)
 * DELETE /api/comics/{id}
 * @param {string} comicId - Comic ID
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
