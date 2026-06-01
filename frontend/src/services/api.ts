import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import type { ApiListResponse, Chapter, Story, User } from '../types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function getStoredToken() {
  return localStorage.getItem('cmc_token');
}

function clearStoredSession() {
  localStorage.removeItem('cmc_token');
  localStorage.removeItem('cmc_user');
}

function emitAuthChange() {
  window.dispatchEvent(new Event('auth-changed'));
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      clearStoredSession();
      emitAuthChange();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

async function unwrap<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  const response = await request;
  return response.data;
}

export const auth = {
  register: (data: { username: string; email: string; password: string; full_name?: string }) =>
    unwrap<ApiListResponse<User & { token?: string }>>(apiClient.post('/auth/register', data)),
  login: (data: { email: string; password: string }) =>
    unwrap<ApiListResponse<User & { token?: string }>>(apiClient.post('/auth/login', data)),
  logout: () => unwrap<ApiListResponse<Record<string, never>>>(apiClient.post('/auth/logout')),
  getCurrentUser: () => unwrap<ApiListResponse<User>>(apiClient.get('/auth/me')),
};

export const stories = {
  getAll: (page = 1, limit = 10) =>
    unwrap<ApiListResponse<Story>>(apiClient.get('/stories', { params: { page, limit } })),
  getById: (id: string | number) => unwrap<ApiListResponse<Story>>(apiClient.get(`/stories/${id}`)),
  create: (data: Partial<Story>) => unwrap<ApiListResponse<Story>>(apiClient.post('/stories', data)),
  update: (id: string | number, data: Partial<Story>) =>
    unwrap<ApiListResponse<Story>>(apiClient.put(`/stories/${id}`, data)),
  delete: (id: string | number) => unwrap<ApiListResponse<Story>>(apiClient.delete(`/stories/${id}`)),
  search: (query: string, category = '', page = 1) =>
    unwrap<ApiListResponse<Story>>(apiClient.get('/stories/search', { params: { q: query, category, page } })),
};

export const chapters = {
  getByStory: (storyId: string | number, page = 1) =>
    unwrap<ApiListResponse<Chapter>>(apiClient.get(`/stories/${storyId}/chapters`, { params: { page } })),
  getById: (storyId: string | number, chapterId: string | number) =>
    unwrap<ApiListResponse<Chapter>>(apiClient.get(`/stories/${storyId}/chapters/${chapterId}`)),
  create: (storyId: string | number, data: { title: string; content: string; chapter_number: number }) =>
    unwrap<ApiListResponse<Chapter>>(apiClient.post(`/stories/${storyId}/chapters`, data)),
  update: (storyId: string | number, chapterId: string | number, data: { title: string; content: string }) =>
    unwrap<ApiListResponse<Chapter>>(apiClient.put(`/stories/${storyId}/chapters/${chapterId}`, data)),
  delete: (storyId: string | number, chapterId: string | number) =>
    unwrap<ApiListResponse<Chapter>>(apiClient.delete(`/stories/${storyId}/chapters/${chapterId}`)),
};

export const comments = {
  getByStory: (storyId: string | number) =>
    unwrap<ApiListResponse<Record<string, unknown>>>(apiClient.get(`/stories/${storyId}/comments`)),
  create: (storyId: string | number, data: Record<string, unknown>) =>
    unwrap<ApiListResponse<Record<string, unknown>>>(apiClient.post(`/stories/${storyId}/comments`, data)),
};

export default apiClient;