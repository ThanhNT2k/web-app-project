/**
 * comments.js - Comment API Module
 * Handles comment listing, creation, updating, and deletion
 * 
 * Backend Endpoints:
 * - GET /api/comments/{comicId}
 * - POST /api/comments
 * - PUT /api/comments/{id}
 * - DELETE /api/comments/{id}
 */

import { apiCall } from './api.js';

/**
 * Get comments for a comic
 * GET /api/comments/{comicId}
 * @param {string} comicId - Comic ID
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
 * Create new comment (User only)
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
 * Reply to a comment (User only)
 * POST /api/comments (with parentCommentId)
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
 * Update comment (User/Admin only)
 * PUT /api/comments/{id}
 * @param {string} commentId - Comment ID
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
 * Delete comment (User/Admin only)
 * DELETE /api/comments/{id}
 * @param {string} commentId - Comment ID
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
