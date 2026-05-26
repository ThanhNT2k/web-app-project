/**
 * api.js - Gọi API từ Backend ASP.NET Core (.NET 9/10)
 * Tự động cấu hình linh hoạt giữa Local và Render Online
 */

// 🟢 TỰ ĐỘNG CẤU HÌNH ĐỊA CHỈ BASE URL THÔNG MINH
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5221'                               // Khi bạn chạy test ở máy cục bộ
    : 'https://webappbackend-jrto.onrender.com';             // Địa chỉ Render của bạn

const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Hàm generic để gọi API
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Đồng bộ Key lấy token dạng 'token' giống như auth.js đang lưu trữ
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
 * =========================================================================
 * 📚 PHẦN QUẢN LÝ TRUYỆN (ĐỒNG BỘ CHỮ HOA/THƯỜNG VÀ ROUTE THEO .NET CONTROLLER)
 * =========================================================================
 */

/**
 * Lấy danh sách tất cả các truyện
 */
async function getStories() {
  return apiCall('/Story'); // 🟢 Đã uncomment để chạy thật và đổi chữ S hoa
}

/**
 * Lấy chi tiết một bộ truyện
 */
async function getStory(storyId) {
  return apiCall(`/Story/${storyId}`); // 🟢 Đổi sang chữ S hoa
}

/**
 * API ĐẶC BIỆT DÀNH CHO ADMIN: Tạo truyện mới (Yêu cầu quyền Admin)
 */
async function createStory(storyData) {
  return apiCall('/Story/create', 'POST', storyData); // 🟢 Đổi sang chữ S hoa
}

/**
 * Lấy danh sách các thể loại truyện
 */
async function getGenres() {
  return apiCall('/Genre'); // 🟢 Đổi sang chữ G hoa để khớp GenreController (nếu có)
}

/**
 * Lấy danh sách chương của một truyện
 * (Đồng bộ theo ChapterController: api/Chapter)
 */
async function getChapters(storyId) {
  // Vì ChapterController đang để [HttpGet] lấy toàn bộ, nếu sau này bạn sửa 
  // [HttpGet("story/{storyId}")] thì giữ nguyên, còn hiện tại gọi tạm qua /Chapter
  return apiCall(`/Chapter?storyId=${storyId}`); 
}

/**
 * Lấy nội dung chi tiết một chương truyện
 */
async function getChapterContent(storyId, chapterId) {
  return apiCall(`/Chapter/${chapterId}`);
}

/**
 * Gọi gợi ý truyện từ AI (Đồng bộ AIController.cs)
 */
async function getAIRecommendations(preference) {
  return apiCall(`/AI/recommend?preference=${encodeURIComponent(preference)}`);
}

/**
 * =========================================================================
 * 👤 PHẦN QUẢN LÝ TÀI KHOẢN & LỊCH SỬ (Đồng bộ chữ cái viết hoa)
 * =========================================================================
 */

async function getProfile() {
  return apiCall('/Profile');
}

async function updateProfile(profileData) {
  return apiCall('/Profile', 'PUT', profileData);
}

async function getReadingHistory() {  
  return apiCall('/Profile/history');
}

async function getFavoriteStories() {
  return apiCall('/Profile/favorites');
}

async function addFavoriteStory(storyId) {
  return apiCall('/Profile/favorites', 'POST', { storyId });
}

async function removeFavoriteStory(storyId) {
  return apiCall(`/Profile/favorites/${storyId}`, 'DELETE');
}

async function updateReadProgress(storyId, chapterId) {
  return apiCall('/Profile/history', 'POST', { storyId, chapterId });
}