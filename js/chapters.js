/**
 * chapters.js - Chapter API Module
 * Handles chapter listing, content retrieval, and management
 * 
 * Backend Endpoints:
 * - GET /api/comics/{id}/chapters
 * - GET /api/chapters/{id}
 * - POST /api/chapters (Uploader/Admin only)
 * - PUT /api/chapters/{id} (Uploader/Admin only)
 * - DELETE /api/chapters/{id} (Uploader/Admin only)
 */

import { apiCall } from './api.js';

/**
 * Get all chapters of a comic
 * GET /api/comics/{id}/chapters
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getComicChapters(comicId) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required',
        data: []
      };
    }

    const response = await apiCall(`/comics/${comicId}/chapters`, 'GET');
    return {
      success: true,
      data: response.data || response
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
 * Get chapter content by ID
 * GET /api/chapters/{id}
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<Object>} - {success, data: chapter, error}
 */
export async function getChapterContent(chapterId) {
  try {
    if (!chapterId) {
      return {
        success: false,
        error: 'Chapter ID is required'
      };
    }

    const response = await apiCall(`/chapters/${chapterId}`, 'GET');
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
 * Create new chapter (Uploader/Admin only)
 * POST /api/chapters
 * @param {Object} chapterData - {comicId, title, chapterNumber, content, images, ...}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function createChapter(chapterData) {
  try {
    if (!chapterData.comicId || !chapterData.title) {
      return {
        success: false,
        error: 'Comic ID and title are required'
      };
    }

    const response = await apiCall('/chapters', 'POST', chapterData);
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
 * Update existing chapter (Uploader/Admin only)
 * PUT /api/chapters/{id}
 * @param {string} chapterId - Chapter ID
 * @param {Object} updateData - {title, content, images, ...}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function updateChapter(chapterId, updateData) {
  try {
    if (!chapterId) {
      return {
        success: false,
        error: 'Chapter ID is required'
      };
    }

    const response = await apiCall(`/chapters/${chapterId}`, 'PUT', updateData);
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
 * Delete chapter (Uploader/Admin only)
 * DELETE /api/chapters/{id}
 * @param {string} chapterId - Chapter ID
 * @returns {Promise<Object>} - {success, error}
 */
export async function deleteChapter(chapterId) {
  try {
    if (!chapterId) {
      return {
        success: false,
        error: 'Chapter ID is required'
      };
    }

    await apiCall(`/chapters/${chapterId}`, 'DELETE');
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
