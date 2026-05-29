/**
 * favorites.js - Follows/Favorites API Module
 * Handles user following, favorites management
 * 
 * Backend Endpoints:
 * - GET /api/users/follows
 * - POST /api/follows
 * - DELETE /api/follows/{comicId}
 */

import { apiCall } from './api.js';

/**
 * Get user's favorite comics / followed comics
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
 * Follow a comic
 * POST /api/follows
 * @param {string} comicId - Comic ID to follow
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
 * Unfollow a comic
 * DELETE /api/follows/{comicId}
 * @param {string} comicId - Comic ID to unfollow
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
