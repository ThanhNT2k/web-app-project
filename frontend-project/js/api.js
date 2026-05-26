/**
 * api.js - Gọi API từ Backend ASP.NET Core (.NET 9/10)
 * Tự động cấu hình linh hoạt giữa Local và Render Online
 */

// 🟢 TỰ ĐỘNG CẤU HÌNH ĐỊA CHỈ BASE URL THÔNG MINH
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5221'                               // Khi bạn chạy test ở máy cục bộ
    : 'https://webappbackend-jrto.onrender.com';             // ⚠️ HÃY THAY ĐƯỜNG DẪN RENDER THẬT CỦA BẠN VÀO ĐÂY

const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Hàm generic để gọi API
 * @param {string} endpoint - API endpoint (ví dụ: /story, /auth/login)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Data gửi đi (nếu POST/PUT)
 * @returns {Promise} - Response từ server
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Trong .NET, Token thường lưu với Key là 'bearer_jwt_token', nếu auth.js của bạn dùng tên khác, hãy sửa lại ở đây
      'Authorization': `Bearer ${localStorage.getItem('bearer_jwt_token') || localStorage.getItem('token') || ''}`
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
 * =========================================================================
 * 📚 PHẦN QUẢN LÝ TRUYỆN (ĐÃ ĐỔI TỪ SỐ NHIỀU /stories THÀNH SỐ ÍT /story THEO .NET)
 * =========================================================================
 */

/**
 * Lấy danh sách tất cả các truyện
 */
async function getStories() {
  return apiCall('/story'); 
}

/**
 * Lấy chi tiết một bộ truyện
 * @param {number} storyId - ID của truyện
 */
async function getStory(storyId) {
  return apiCall(`/story/${storyId}`);
}

/**
 * API ĐẶC BIỆT DÀNH CHO ADMIN: Tạo truyện mới (Yêu cầu quyền Admin)
 * Hàm này dùng để liên kết với nút "Gọi API Tạo Truyện" phân quyền JWT
 */
async function createStory(storyData) {
  return apiCall('/story/create', 'POST', storyData);
}

/**
 * Lấy danh sách các thể loại truyện
 */
async function getGenres() {
  return apiCall('/genre'); // Đồng bộ số ít theo Controller .NET
}

/**
 * Lấy danh sách chương của một truyện
 */
async function getChapters(storyId) {
  return apiCall(`/story/${storyId}/chapters`);
}

/**
 * Lấy nội dung chi tiết một chương truyện
 */
async function getChapterContent(storyId, chapterId) {
  return apiCall(`/story/${storyId}/chapters/${chapterId}`);
}

/**
 * =========================================================================
 * 👤 PHẦN QUẢN LÝ TÀI KHOẢN & LỊCH SỬ (Giữ nguyên cấu trúc định tuyến)
 * =========================================================================
 */

/**
 * Lấy profile người dùng hiện tại
 */
async function getProfile() {
  return apiCall('/profile');
}

/**
 * Cập nhật thông tin cá nhân
 */
async function updateProfile(profileData) {
  return apiCall('/profile', 'PUT', profileData);
}

/**
 * Lấy lịch sử đọc truyện của User
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
 * Thêm truyện vào danh sách yêu thích
 */
async function addFavoriteStory(storyId) {
  return apiCall('/profile/favorites', 'POST', { storyId });
}

/**
 * Xóa truyện khỏi danh sách yêu thích
 */
async function removeFavoriteStory(storyId) {
  return apiCall(`/profile/favorites/${storyId}`, 'DELETE');
}

/**
 * Cập nhật tiến độ đọc chương (Bookmark)
 */
async function updateReadProgress(storyId, chapterId) {
  return apiCall('/profile/history', 'POST', { storyId, chapterId });
}