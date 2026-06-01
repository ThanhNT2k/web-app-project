import { auth } from './api';
import type { User } from '../types';

const TOKEN_KEY = 'cmc_token';
const USER_KEY = 'cmc_user';

function emitAuthChange() {
  window.dispatchEvent(new Event('auth-changed'));
}

function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitAuthChange();
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitAuthChange();
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser(): User | null {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return Boolean(getToken());
}

function hasRole(requiredRole: string) {
  const user = getCurrentUser();
  return Boolean(user && user.role === requiredRole);
}

async function register(username: string, email: string, password: string, fullName: string) {
  const response = await auth.register({ username, email, password, full_name: fullName });
  const token = response.token;
  const user = response.user as User;

  if (token && user) {
    saveSession(token, user);
  }

  return user;
}

async function login(email: string, password: string) {
  const response = await auth.login({ email, password });
  const token = response.token;
  const user = response.user as User;

  if (token && user) {
    saveSession(token, user);
  }

  return user;
}

async function logout() {
  try {
    await auth.logout();
  } catch {
    // Ignore logout failures and clear local session regardless.
  } finally {
    clearSession();
  }
}

export default {
  register,
  login,
  logout,
  getToken,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  clearSession,
};

export { register, login, logout, getToken, getCurrentUser, isAuthenticated, hasRole, clearSession };