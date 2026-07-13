import axios from 'axios';

// Các key dùng để lưu token và thông tin user vào localStorage
// Dùng prefix 'cmc_' để tránh xung đột với các ứng dụng khác cùng domain
const storageKeys = {
  token: 'cmc_token',
  user: 'cmc_user',
};

/**
 * Xác định URL gốc của API backend.
 * Hỗ trợ 2 tên biến môi trường (Vite và Create React App) để tương thích rộng hơn.
 * Fallback về localhost:5000 khi không tìm thấy biến môi trường (môi trường development).
 */
function getBaseURL() {
  return (
    import.meta.env.VITE_API_URL ||       // Vite environment variable
    import.meta.env.REACT_APP_API_URL ||  // Create React App (legacy)
    'http://localhost:5000/api'
  );
}

/**
 * Lấy JWT token từ localStorage.
 * Bao bởi try/catch vì localStorage có thể bị chặn trong incognito mode
 * hoặc khi browser settings ngăn third-party storage.
 */
function getToken() {
  const token = localStorage.getItem('cmc_token');
  return token;
}

/**
 * Xóa thông tin xác thực khỏi localStorage (dùng khi đăng xuất hoặc token hết hạn).
 */
function clearAuthStorage() {
  try {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
  } catch {
    // ignore - nếu không xóa được thì cũng không nghiêm trọng
  }
}

// Tạo axios instance với cấu hình chung
// Mọi request qua apiClient đều tự động có baseURL và Content-Type đúng
const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor: Tự động thêm Authorization header vào mỗi request.
 * Chạy TRƯỚC KHI request được gửi đi.
 * Nếu có token trong localStorage, gắn vào header dạng "Bearer <token>".
 */
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('cmc_token');
    if (token && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // localStorage may be unavailable in some environments (private mode, strict policies).
    // Silently ignore so the app doesn't spam the console or throw runtime errors.
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Response Interceptor: Xử lý tự động khi server trả về lỗi 401 (Unauthorized).
 * Chạy SAU KHI nhận response lỗi từ server.
 *
 * Khi nhận 401:
 * - Xóa thông tin xác thực đã lưu (token đã hết hạn hoặc không hợp lệ)
 * - Chuyển hướng về trang đăng nhập
 * - NGOẠI LỆ: Không redirect khi đang ở trang login/register/home
 *   (tránh vòng lặp redirect vô hạn)
 */
apiClient.interceptors.response.use(
  (response) => response, // Nếu thành công, trả về nguyên response
  (error) => {
    if ((error?.response?.status === 401 || error?.response?.status === 403) && typeof window !== 'undefined') {
      const path = window.location.pathname;

      // Chỉ redirect nếu KHÔNG đang ở các trang public (login, register, home)
      // Tránh redirect loop: login page nhận 401/403 → redirect về login
      if (!path.startsWith('/login') && !path.startsWith('/register') && path !== '/') {
        clearAuthStorage();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Hàm wrapper gọi API và trả về chỉ data (không phải toàn bộ axios response).
 * Giúp controller/component đơn giản hơn khi dùng: không cần .data mỗi lần.
 */
async function request(path, options = {}) {
  const response = await apiClient({
    url: path,
    method: options.method || 'GET',
    params: options.params,
    data: options.data,
  });
  return response.data;
}

/**
 * Object API tập trung toàn bộ các endpoint của ứng dụng.
 * Cấu trúc theo domain: auth, stories, chapters, comments, ai, readingHistory, follows, preferences, upload, tags, admin.
 * Giúp dễ tìm và quản lý các API call trong toàn bộ codebase frontend.
 */
const API = {
  auditLogs: {
    get: (params = {}) => request('/audit-logs', { method: 'GET', params }),
  },
  // ── Xác thực người dùng ──────────────────────────────────────────────────
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', data }),
    login: (data) => request('/auth/login', { method: 'POST', data }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getCurrentUser: () => request('/auth/me', { method: 'GET' }),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', data }),
    // Google OAuth
    googleLogin: (idToken) => request('/auth/google', { method: 'POST', data: { idToken } }),
    googleComplete: (data) => request('/auth/google/complete', { method: 'POST', data }),
    // Quên mật khẩu
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', data: { email } }),
    verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', data: { email, otp } }),
    resetPassword: (data) => request('/auth/reset-password', { method: 'POST', data }),
    // Đổi mật khẩu từ Profile
    changePassword: (data) => request('/auth/change-password', { method: 'PUT', data }),
  },

  // ── Quản lý truyện ───────────────────────────────────────────────────────
  stories: {
    getAll: (page = 1, limit = 10, sortBy = 'newest') => request('/stories', { method: 'GET', params: { page, limit, sortBy } }),
    getMine: (page = 1, limit = 20) => request('/stories/mine', { method: 'GET', params: { page, limit } }),
    getById: (id) => request(`/stories/${id}`, { method: 'GET' }),
    getBySlug: (slug) => request(`/stories/by-slug/${slug}`, { method: 'GET' }),
    create: (data) => request('/stories', { method: 'POST', data }),
    createFromFile: async (payload, file) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post('/stories/import-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    update: (id, data) => request(`/stories/${id}`, { method: 'PUT', data }),
    delete: (id) => request(`/stories/${id}`, { method: 'DELETE' }),
    toggleVisibility: (id) => request(`/stories/${id}/visibility`, { method: 'PATCH' }),
    getRating: (id) => request(`/stories/${id}/rating`, { method: 'GET' }),
    rate: (id, rating) => request(`/stories/${id}/rating`, { method: 'PUT', data: { rating } }),
    deleteRating: (id) => request(`/stories/${id}/rating`, { method: 'DELETE' }),
    getCollaborators: (storyId) => request(`/stories/${storyId}/collaborators`, { method: 'GET' }),
    addCollaborator: (storyId, data) => request(`/stories/${storyId}/collaborators`, { method: 'POST', data }),
    removeCollaborator: (storyId, userId) => request(`/stories/${storyId}/collaborators/${userId}`, { method: 'DELETE' }),
    search: (query, category = null, tag = null, page = 1, limit = 12) => request('/stories/search', {
      method: 'GET',
      params: {
        q: query || undefined,
        category: category || undefined,
        tag: tag || undefined,
        page,
        limit,
      },
    }),
  },
  rankings: {
    get: (type = 'trending', period = 'week', limit = 20) => request('/rankings', {
      method: 'GET',
      params: { type, period, limit },
    }),
  },

  // ── Quản lý chương ───────────────────────────────────────────────────────
  chapters: {
    getByStory: (storyId, page = 1, limit = 10, sort = 'asc') => request(`/stories/${storyId}/chapters`, { method: 'GET', params: { page, limit, sort } }),
    getById: (storyId, chapterId) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'GET' }),
    getBySlugAndNumber: (storySlug, chapterNumber) => request(`/stories/by-slug/${storySlug}/chapters/${chapterNumber}`, { method: 'GET' }),
    create: (storyId, data) => request(`/stories/${storyId}/chapters`, { method: 'POST', data }),
    previewFile: async (storyId, payload, file) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        formData.append(key, String(value));
      });

      const response = await apiClient.post(`/stories/${storyId}/chapters/preview-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    importFromFile: async (storyId, payload, file) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        formData.append(key, String(value));
      });

      const response = await apiClient.post(`/stories/${storyId}/chapters/import-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    update: (storyId, chapterId, data) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'PUT', data }),
    delete: (storyId, chapterId) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'DELETE' }),
  },

  // ── Bình luận ────────────────────────────────────────────────────────────
  comments: {
    getByStory: (storyId) => request(`/comments/story/${storyId}`, { method: 'GET' }),
    getByChapter: (chapterId, storyId) => request(`/comments/chapter/${chapterId}`, {
      method: 'GET',
      params: storyId ? { story_id: storyId } : undefined,
    }),
    create: (data) => request('/comments', { method: 'POST', data }),
    vote: (id, value) => request(`/comments/${id}/vote`, { method: 'POST', data: { value } }),
    delete: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
    
    // ĐÃ SỬA: Dùng hàm request để tự động gắn baseURL (/api) và Token
    getOriginal: (id) => request(`/comments/${id}/original`, { method: 'GET' }),
  },

  // ... (giữ nguyên các phần dưới của file)
  ai: {
    generateSummary: (chapterId, regenerate = false) => request(`/chapters/${chapterId}/summary`, {
      method: 'GET',
      params: regenerate ? { regenerate: 'true' } : undefined,
    }),
    getRecommendations: () => request('/ai/recommendations', { method: 'GET' }),
  },
  readingHistory: {
    save: (data) => request('/reading-history', { method: 'POST', data }),
    getAll: () => request('/reading-history', { method: 'GET' }),
    getStoryProgress: (storyId) => request(`/reading-history/story/${storyId}`, { method: 'GET' }),
    getReadChapters: (storyId) => request(`/reading-history/story/${storyId}/read-chapters`, { method: 'GET' }),
  },
  follows: {
    getAll: () => request('/follows', { method: 'GET' }),
    check: (storyId) => request(`/follows/check/${storyId}`, { method: 'GET' }),
    follow: (storyId) => request(`/follows/${storyId}`, { method: 'POST' }),
    unfollow: (storyId) => request(`/follows/${storyId}`, { method: 'DELETE' }),
  },
  notifications: {
    getAll: (page = 1, limit = 10) => request('/notifications', { method: 'GET', params: { page, limit } }),
    getUnreadCount: () => request('/notifications/unread-count', { method: 'GET' }),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    delete: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
    deleteAll: () => request('/notifications', { method: 'DELETE' }),
    getPreferences: () => request('/notifications/preferences/me', { method: 'GET' }),
    updatePreferences: (data) => request('/notifications/preferences/me', { method: 'PATCH', data }),
  },
  preferences: {
    get: () => request('/preferences', { method: 'GET' }),
    update: (data) => request('/preferences', { method: 'PUT', data }),
  },
  reports: {
    create: (data) => request('/reports', { method: 'POST', data }),
    getAll: (params = {}) => request('/reports', { method: 'GET', params }),
    updateStatus: (id, status) => request(`/reports/${id}`, { method: 'PATCH', data: { status } }),
    process: (id, action, note = '') => request(`/reports/${id}/process`, {
      method: 'PATCH',
      data: { action, note },
    }),
  },
  moderator: {
    getDashboard: () => request('/moderator/dashboard', { method: 'GET' }),
    getPendingStories: (page = 1, limit = 20) => request('/moderator/pending-stories', { method: 'GET', params: { page, limit } }),
    approvePendingStory: (id) => request(`/moderator/pending-stories/${id}/approve`, { method: 'PATCH' }),
    processPendingStory: (id, action, note = '') => request(`/moderator/pending-stories/${id}/process`, {
      method: 'PATCH',
      data: { action, note },
    }),
    getComments: (params = {}) => request('/moderator/comments', { method: 'GET', params }),
    updateCommentStatus: (id, status) => request(`/moderator/comments/${id}/status`, { method: 'PATCH', data: { status } }),
    getProfiles: (status) => request('/moderator/profiles', { method: 'GET', params: status ? { status } : undefined }),
    processProfileAvatar: (id, action, note = '') => request(`/moderator/profiles/${id}/avatar`, {
      method: 'PATCH',
      data: { action, note },
    }),
  },
  upload: {
    cover: async (file) => {
      const formData = new FormData();
      formData.append('cover', file);
      const response = await apiClient.post('/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },
  tags: {
    getAll: () => request('/tags', { method: 'GET' }),
    create: (name) => request('/tags', { method: 'POST', data: { name } }),
  },
  admin: {
    getStats: () => request('/admin/stats', { method: 'GET' }),
    getUsers: (search = '') => request('/admin/users', { method: 'GET', params: { search: search || undefined } }),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', data: { role } }),
    updateUserStatus: (id, isActive) => request(`/admin/users/${id}/status`, { method: 'PATCH', data: { is_active: isActive } }),
    deleteComment: (id) => request(`/admin/comments/${id}`, { method: 'DELETE' }),
    getStories: (page = 1, limit = 50) => request('/admin/stories', { method: 'GET', params: { page, limit } }),
    getReports: (status = 'ALL', page = 1) => 
      request('/reports', { method: 'GET', params: { status, page, limit: 50 } }),
  },
  badWords: {
    getAll: () => request('/admin/bad-words', { method: 'GET' }),
    create: (data) => request('/admin/bad-words', { method: 'POST', data }),
    update: (id, data) => request(`/admin/bad-words/${id}`, { method: 'PATCH', data }),
    delete: (id) => request(`/admin/bad-words/${id}`, { method: 'DELETE' }),
  },
};

export { apiClient };
export default API;
