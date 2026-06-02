/**
 * users.js - Module API Hồ sơ & Quản lý Tài khoản Người dùng
 * Xử lý hồ sơ người dùng và các hoạt động tài khoản
 * 
 * Các Điểm Cuối Backend:
 * - GET /api/users/me
 * - PUT /api/users/profile
 * - POST /api/users/avatar
 * - PUT /api/users/change-password
 * - GET /api/recommendations/personalized
 */

import { apiCall } from './api.js';

/**
 * Nhận hồ sơ người dùng hiện tại
 * GET /api/users/me
 * @returns {Promise<Object>} - {success, data: user, error}
 */
export async function getProfile() {
  try {
    const response = await apiCall('/users/me', 'GET');
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
 * Cập nhật hồ sơ người dùng
 * PUT /api/users/profile
 * @param {Object} profileData - {username, email, bio, ...}
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function updateProfile(profileData) {
  try {
    if (!profileData || Object.keys(profileData).length === 0) {
      return {
        success: false,
        error: 'Profile data is required'
      };
    }

    const response = await apiCall('/users/profile', 'PUT', profileData);
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
 * Tải lên ảnh đại diện của người dùng
 * POST /api/users/avatar
 * @param {FormData} formData - Form data với tệp 'avatar'
 * @returns {Promise<Object>} - {success, data, error}
 */
export async function uploadAvatar(formData) {
  try {
    if (!formData || !formData.get('avatar')) {
      return {
        success: false,
        error: 'Avatar file is required'
      };
    }

    // Đối với FormData, chúng ta cần xử lý cách khác
    const token = localStorage.getItem('token');
    const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5208'
      : 'https://webappbe-fzz7.onrender.com';
    
    const response = await fetch(`${BACKEND_URL}/api/users/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || ''}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Thay đổi mật khẩu người dùng
 * PUT /api/users/change-password
 * @param {Object} passwordData - {currentPassword, newPassword}
 * @returns {Promise<Object>} - {success, error}
 */
export async function changePassword(passwordData) {
  try {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return {
        success: false,
        error: 'Current and new password are required'
      };
    }

    await apiCall('/users/change-password', 'PUT', passwordData);
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

/**
 * Nhận các gợi ý được cá nhân hóa
 * GET /api/recommendations/personalized
 * @param {Object} options - {limit}
 * @returns {Promise<Object>} - {success, data: [], error}
 */
export async function getPersonalizedRecommendations(options = {}) {
  try {
    const {
      limit = 12
    } = options;

    const endpoint = `/recommendations/personalized?limit=${limit}`;

    const response = await apiCall(endpoint, 'GET');
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
