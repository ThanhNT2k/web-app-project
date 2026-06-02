/**
 * comments.js - Module API Bình luận
 * Xử lý liệt kê, tạo, cập nhật và xóa bình luận
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/comments/{comicId}
 * - POST /api/comments
 * - PUT /api/comments/{id}
 * - DELETE /api/comments/{id}
 */

import { apiCall } from './api.js';

/**
 * Nhận bình luận cho truyện
 * GET /api/comments/{comicId}
 * @param {string} comicId - ID truyện
 * @param {Object} options - {page, limit}
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getComments(comicId, options = {}) {
  try {
    if (!comicId) {
      return {
        success: false,
        error: 'Comic ID is required',
        data: []
      };
    }

    const {
      page = 1,
      limit = 20
    } = options;

    const endpoint = `/comments/${comicId}?page=${page}&limit=${limit}`;

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
 * Tạo bình luận mới (Chỉ người dùng)
 * POST /api/comments
 * @param {Object} commentData - {comicId, content, rating}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function createComment(commentData) {
  try {
    if (!commentData.comicId || !commentData.content) {
      return {
        success: false,
        error: 'Comic ID and content are required'
      };
    }

    const response = await apiCall('/comments', 'POST', commentData);
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
 * Trả lời bình luận (Chỉ người dùng)
 * POST /api/comments (với parentCommentId)
 * @param {Object} replyData - {comicId, content, parentCommentId}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function replyComment(replyData) {
  try {
    if (!replyData.comicId || !replyData.content || !replyData.parentCommentId) {
      return {
        success: false,
        error: 'Comic ID, content, and parent comment ID are required'
      };
    }

    const response = await apiCall('/comments', 'POST', replyData);
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
 * Cập nhật bình luận (Chỉ người dùng/Admin)
 * PUT /api/comments/{id}
 * @param {string} commentId - ID bình luận
 * @param {Object} updateData - {content, rating}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function updateComment(commentId, updateData) {
  try {
    if (!commentId) {
      return {
        success: false,
        error: 'Comment ID is required'
      };
    }

    const response = await apiCall(`/comments/${commentId}`, 'PUT', updateData);
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
 * Xóa bình luận (Chỉ người dùng/Admin)
 * DELETE /api/comments/{id}
 * @param {string} commentId - ID bình luận
 * @returns {Promise<Object>} - {success, error}
 */
export async function deleteComment(commentId) {
  try {
    if (!commentId) {
      return {
        success: false,
        error: 'Comment ID is required'
      };
    }

    await apiCall(`/comments/${commentId}`, 'DELETE');
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
