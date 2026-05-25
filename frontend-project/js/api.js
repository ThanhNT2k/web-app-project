/**
 * api.js - Gọi API từ Backend (Node/Express)
 * Cấu hình base URL: http://localhost:3000
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Hàm generic để gọi API
 * @param {string} endpoint - API endpoint (ví dụ: /stories, /genres)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Data gửi đi (nếu POST/PUT)
 * @returns {Promise} - Response từ server
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Lấy danh sách truyện
 */
async function getStories() {
  return apiCall('/stories');
}

/**
 * Lấy chi tiết một truyện
 * @param {number} storyId - ID của truyện
 */
async function getStory(storyId) {
  return apiCall(`/stories/${storyId}`);
}

/**
 * Lấy danh sách thể loại
 */
async function getGenres() {
  return apiCall('/genres');
}

/**
 * Lấy danh sách chương của một truyện
 * @param {number} storyId - ID của truyện
 */
async function getChapters(storyId) {
  return apiCall(`/stories/${storyId}/chapters`);
}

/**
 * Lấy nội dung một chương
 * @param {number} storyId - ID của truyện
 * @param {number} chapterId - ID của chương
 */
async function getChapterContent(storyId, chapterId) {
  return apiCall(`/stories/${storyId}/chapters/${chapterId}`);
}

/**
 * Lấy profile người dùng
 */
async function getProfile() {
  return apiCall('/profile');
}

/**
 * Cập nhật profile
 * @param {object} profileData - Dữ liệu profile cần cập nhật
 */
async function updateProfile(profileData) {
  return apiCall('/profile', 'PUT', profileData);
}

/**
 * Lấy lịch sử đọc truyện
 */
async function getReadingHistory() {
  return apiCall('/profile/history');
}

/**
 * Lấy danh sách truyện yêu thích
 */
async function getFavoriteStories() {
  return apiCall('/profile/favorites');
}

/**
 * Thêm truyện vào yêu thích
 * @param {number} storyId - ID của truyện
 */
async function addFavoriteStory(storyId) {
  return apiCall('/profile/favorites', 'POST', { storyId });
}

/**
 * Xóa truyện khỏi yêu thích
 * @param {number} storyId - ID của truyện
 */
async function removeFavoriteStory(storyId) {
  return apiCall(`/profile/favorites/${storyId}`, 'DELETE');
}

/**
 * Cập nhật tiến độ đọc chương
 * @param {number} storyId - ID của truyện
 * @param {number} chapterId - ID của chương
 */
async function updateReadProgress(storyId, chapterId) {
  return apiCall('/profile/history', 'POST', { storyId, chapterId });
}
