/**
 * chapters.js - Module API Chương
 * Xử lý liệt kê chương, truy xuất nội dung và quản lý
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/comics/{id}/chapters
 * - GET /api/chapters/{id}
 * - POST /api/chapters (Chỉ Uploader/Admin)
 * - PUT /api/chapters/{id} (Chỉ Uploader/Admin)
 * - DELETE /api/chapters/{id} (Chỉ Uploader/Admin)
 */

import { apiCall } from './api.js';

/**
 * Nhận tất cả các chương của một truyện
 * GET /api/comics/{id}/chapters
 * @param {string} comicId - ID truyện
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
 * Nhận nội dung chương theo ID
 * GET /api/chapters/{id}
 * @param {string} chapterId - ID chương
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
 * Tạo chương mới (Chỉ Uploader/Admin)
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
 * Cập nhật chương hiện có (Chỉ Uploader/Admin)
 * PUT /api/chapters/{id}
 * @param {string} chapterId - ID chương
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
 * Xóa chương (Chỉ Uploader/Admin)
 * DELETE /api/chapters/{id}
 * @param {string} chapterId - ID chương
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
