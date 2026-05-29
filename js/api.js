/**
 * api.js - API Client cho Hệ Thống Đọc Truyện Online
 * Tương tự MangaHook API - đơn giản, hiệu quả và dễ mở rộng
 * Tự động cấu hình giữa Local Development và Render Online
 */

// 🟢 AUTO-CONFIG: BASE URL cho Local vs Production
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5208'
    : 'https://webappbe-fzz7.onrender.com';

const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Generic API call wrapper
 * Xử lý request/response, token authentication, và error handling
 */
export async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}


/**
 * =========================================================================
 * 📚 MANGA/COMIC API - Hàm cơ bản để lấy dữ liệu truyện
 * =========================================================================
 */

/**
 * Lấy danh sách tất cả truyện (có phân trang & bộ lọc)
 * GET /api/comics?page=1&limit=12&status=Ongoing&sortBy=created_at
 */
async function getMangaList(page = 1, limit = 12, status = null, sortBy = 'created_at') {
  let url = `/comics?page=${page}&limit=${limit}&sortBy=${sortBy}`;
  if (status) url += `&status=${status}`;
  return apiCall(url);
}

/**
 * Lấy chi tiết 1 truyện theo slug
 * GET /api/comics/:slug
 */
async function getMangaDetail(slug) {
  return apiCall(`/comics/${slug}`);
}

/**
 * Lấy danh sách các thể loại
 * GET /api/genres
 */
async function getGenres() {
  return apiCall('/genres');
}

/**
 * Lấy danh sách chương của 1 truyện
 * GET /api/chapters/comic/:comicId
 */
async function getChapterList(comicId) {
  return apiCall(`/chapters/comic/${comicId}`);
}

/**
 * Lấy ảnh chi tiết của 1 chương
 * GET /api/chapters/:chapterId
 */
async function getChapterImages(chapterId) {
  return apiCall(`/chapters/${chapterId}`);
}

/**
 * Tìm kiếm truyện
 * GET /api/comics/search?q=keyword&page=1&limit=12
 */
async function searchManga(query, page = 1, limit = 12) {
  const q = encodeURIComponent(query || '');
  return apiCall(`/comics/search?q=${q}&page=${page}&limit=${limit}`);
}
/**
 * =========================================================================
 * � AUTH & USER MANAGEMENT
 * =========================================================================
 */

// Token management
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

// Legacy function names for backward compatibility
function setAuthToken(token) {
  setToken(token);
}

function getAuthToken() {
  return getToken();
}

function clearAuthToken() {
  clearToken();
}

/**
 * Đăng nhập
 * POST /api/auth/login
 */
async function login(email, password) {
  const res = await apiCall('/auth/login', 'POST', { email, password });
  if (res && (res.token || res.accessToken)) {
    setAuthToken(res.token || res.accessToken);
  }
  return res;
}

/**
 * Đăng ký tài khoản
 * POST /api/auth/register
 */
async function register(userData) {
  return apiCall('/auth/register', 'POST', userData);
}

/**
 * Đăng xuất
 * POST /api/auth/logout
 */
async function logout() {
  try {
    await apiCall('/auth/logout', 'POST');
  } catch (e) {
    // Ignore errors, always clear token
  } finally {
    clearAuthToken();
  }
}

/**
 * Lấy thông tin profile người dùng hiện tại
 * GET /api/users
 */
async function getProfile() {
  return apiCall('/users');
}

/**
 * Cập nhật profile (username, avatar, etc)
 * PUT /api/users/profile
 */
async function updateProfile(profileData) {
  return apiCall('/users/profile', 'PUT', profileData);
}

/**
 * Lấy lịch sử đọc truyện của user
 * GET /api/users/history
 */
async function getReadingHistory() {
  return apiCall('/users/history');
}

/**
 * Lưu tiến độ đọc
 * POST /api/users/history
 */
async function updateReadProgress(comicId, chapterId) {
  return apiCall('/users/history', 'POST', { comicId, chapterId });
}

/**
 * Lấy danh sách truyện yêu thích/đang follow
 * GET /api/users/favorites
 */
async function getFavoriteComics() {
  return apiCall('/users/favorites');
}

/**
 * Follow/Unfollow một truyện
 * POST /api/users/follow
 */
async function toggleFollowComic(comicId) {
  return apiCall('/users/follow', 'POST', { comicId });
}

// EOF - Hết file api.js


