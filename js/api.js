/**
 * api.js - Gọi API từ Backend ASP.NET Core (.NET 10)
 * Tự động cấu hình linh hoạt giữa Local và Render Online
 * ĐÃ ĐỒNG BỘ CHUẨN ĐÉT VỚI DATABASE TRUYỆN TRANH (COMIC/CHAPTER/GENRE)
 */

// 🟢 TỰ ĐỘNG CẤU HÌNH ĐỊA CHỈ BASE URL THÔNG MINH
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5208'                               // Khi bạn chạy test ở máy cục bộ (Cập nhật lại port nếu cần, ví dụ: 5000 hoặc 5221)
    : 'https://webappbe-fzz7.onrender.com';                 // Địa chỉ Render của bạn

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
      // Gửi Token bảo mật phục vụ Middleware Auth phân quyền
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Thêm xử lý bóc tách lỗi chi tiết từ AuthorizeRolesAttribute (401, 403)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * =========================================================================
 * 📚 PHẦN QUẢN LÝ TRUYỆN TRANH (ĐỒNG BỘ 100% VỚI COMICSCONTROLLER)
 * =========================================================================
 */

/**
 * Lấy danh sách tất cả các truyện (Có hỗ trợ phân trang và bộ lọc trạng thái)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng truyện mỗi trang
 * @param {string} status - Bộ lọc trạng thái ('Ongoing', 'Completed')
 * @param {string} sortBy - Sắp xếp theo ('created_at', 'total_views')
 */
async function getComics(page = 1, limit = 12, status = null, sortBy = 'created_at') {
  let url = `/comics?page=${page}&limit=${limit}&sortBy=${sortBy}`;
  if (status) url += `&status=${status}`;
  return apiCall(url);
}

/**
 * Lấy chi tiết một bộ truyện dựa vào Slug (Xử lý lỗi 404 cũ)
 * @param {string} slug - Đường dẫn định danh truyện (Ví dụ: 'solo-leveling')
 */
async function getComicBySlug(slug) {
  return apiCall(`/comics/${slug}`);
}

/**
 * API PHÂN QUYỀN: Tạo truyện mới (Yêu cầu quyền Uploader hoặc Admin)
 */
async function createComic(comicData) {
  return apiCall('/comics/create', 'POST', comicData);
}

/**
 * Lấy danh sách các thể loại truyện công khai
 */
async function getGenres() {
  return apiCall('/genres'); 
}

/**
 * Lấy danh sách chương của một bộ truyện dựa trên Comic ID
 * @param {number} comicId - ID của bộ truyện
 */
async function getChaptersByComic(comicId) {
  return apiCall(`/chapters/comic/${comicId}`); 
}

/**
 * Lấy nội dung chi tiết ảnh của một chương truyện
 * @param {number} chapterId - ID của chương cần đọc
 */
async function getChapterImages(chapterId) {
  return apiCall(`/chapters/${chapterId}`);
}

/**
 * Gọi gợi ý truyện từ AI thông minh (Đồng bộ AIController)
 */
async function getAIRecommendations(preference) {
  return apiCall(`/AI/recommend?preference=${encodeURIComponent(preference)}`);
}

/**
 * =========================================================================
 * 👤 PHẦN QUẢN LÝ USER, TƯƠNG TÁC & PHÂN QUYỀN (Đồng bộ UsersController)
 * =========================================================================
 */

/**
 * Lấy thông tin Profile cá nhân của người dùng đang đăng nhập
 */
async function getProfile() {
  return apiCall('/users/profile');
}

/**
 * Cập nhật thông tin cá nhân (Username, Avatar)
 */
async function updateProfile(profileData) {
  return apiCall('/users/profile', 'PUT', profileData);
}

/**
 * Lấy lịch sử đọc truyện của User
 */
async function getReadingHistory() {  
  return apiCall('/users/history');
}

/**
 * Lưu lịch sử tiến độ khi User đọc đến một chương truyện cụ thể
 */
async function updateReadProgress(comicId, chapterId) {
  return apiCall('/users/history', 'POST', { comicId, chapterId });
}

/**
 * Lấy danh sách truyện đang theo dõi/yêu thích của User
 */
async function getFavoriteComics() {
  return apiCall('/users/favorites');
}

/**
 * Đổi trạng thái Theo dõi / Bỏ theo dõi một bộ truyện (Toggle Follow)
 */
async function toggleFollowComic(comicId) {
  return apiCall('/users/follow', 'POST', { comicId });
}

/**
 * Đăng bình luận mới vào một bộ truyện
 */
async function createComment(comicId, content, parentId = null) {
  return apiCall('/users/comment', 'POST', { comicId, content, parentId });
}

/**
 * =========================================================================
 * 🛡️ BIẾN ĐỘC QUYỀN CHO ADMIN (ADMIN MANAGEMENT)
 * =========================================================================
 */

/**
 * API HỦY DIỆT: Xóa toàn bộ thông tin một User ra khỏi hệ thống (Chỉ đích danh Admin)
 * @param {string} userId - UUID của User cần xóa
 */
async function adminDeleteUser(userId) {
  return apiCall(`/users/admin/manage-user/${userId}`, 'DELETE');
}