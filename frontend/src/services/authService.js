import API from './api';

const TOKEN_KEY = 'cmc_token';
const USER_KEY = 'cmc_user';

function saveAuthData(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function register(username, email, password, fullName) {
  const response = await API.auth.register({
    username,
    email,
    password,
    full_name: fullName,
  });

  saveAuthData(response.token, response.user);
  return response.user;
}

async function login(email, password) {
  const response = await API.auth.login({ email, password });
  saveAuthData(response.token, response.user);
  return response.user;
}

async function logout() {
  try {
    await API.auth.logout();
  } catch {
    // Logout should still clear local state if the server is unavailable.
  }

  clearAuthData();
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  const rawUser = localStorage.getItem(USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
}

function isAuthenticated() {
  return Boolean(getToken());
}

function hasRole(requiredRole) {
  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

const authService = {
  register,
  login,
  logout,
  getToken,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  saveAuthData,
  clearAuthData,
};

export default authService;
