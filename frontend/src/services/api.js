import axios from 'axios';

const storageKeys = {
  token: 'cmc_token',
  user: 'cmc_user',
};

function getBaseURL() {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.REACT_APP_API_URL ||
    'http://localhost:5000/api'
  );
}

function getToken() {
  try {
    return localStorage.getItem(storageKeys.token);
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  try {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
  } catch {
    // ignore
  }
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register') && path !== '/') {
        clearAuthStorage();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

async function request(path, options = {}) {
  const response = await apiClient.request({ url: path, ...options });
  return response.data;
}

const API = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', data }),
    login: (data) => request('/auth/login', { method: 'POST', data }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getCurrentUser: () => request('/auth/me', { method: 'GET' }),
  },
  stories: {
    getAll: (page = 1, limit = 10, sortBy = 'newest') => request('/stories', { method: 'GET', params: { page, limit, sortBy } }),
    getMine: (page = 1, limit = 20) => request('/stories/mine', { method: 'GET', params: { page, limit } }),
    getById: (id) => request(`/stories/${id}`, { method: 'GET' }),
    create: (data) => request('/stories', { method: 'POST', data }),
    update: (id, data) => request(`/stories/${id}`, { method: 'PUT', data }),
    delete: (id) => request(`/stories/${id}`, { method: 'DELETE' }),
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
  chapters: {
    getByStory: (storyId, page = 1) => request(`/stories/${storyId}/chapters`, { method: 'GET', params: { page } }),
    getById: (storyId, chapterId) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'GET' }),
    create: (storyId, data) => request(`/stories/${storyId}/chapters`, { method: 'POST', data }),
    update: (storyId, chapterId, data) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'PUT', data }),
    delete: (storyId, chapterId) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'DELETE' }),
  },
  comments: {
    getByStory: (storyId) => request(`/comments/story/${storyId}`, { method: 'GET' }),
    getByChapter: (chapterId, storyId) => request(`/comments/chapter/${chapterId}`, {
      method: 'GET',
      params: storyId ? { story_id: storyId } : undefined,
    }),
    create: (data) => request('/comments', { method: 'POST', data }),
    delete: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
  },
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
  },
  follows: {
    getAll: () => request('/follows', { method: 'GET' }),
    check: (storyId) => request(`/follows/check/${storyId}`, { method: 'GET' }),
    follow: (storyId) => request(`/follows/${storyId}`, { method: 'POST' }),
    unfollow: (storyId) => request(`/follows/${storyId}`, { method: 'DELETE' }),
  },
  preferences: {
    get: () => request('/preferences', { method: 'GET' }),
    update: (data) => request('/preferences', { method: 'PUT', data }),
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
    getUsers: () => request('/admin/users', { method: 'GET' }),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', data: { role } }),
    deleteComment: (id) => request(`/admin/comments/${id}`, { method: 'DELETE' }),
    getStories: (page = 1) => request('/admin/stories', { method: 'GET', params: { page, limit: 50 } }),
  },
};

export { apiClient };
export default API;
