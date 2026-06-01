/**
 * auth.js - Authentication API Module
 * Handles user registration, login, logout, and session management
 * Includes role-based access control helpers
 * Uses API wrapper from api.js for HTTP communication
 */

// Re-export from api.js for convenience
import { apiCall, setToken, getToken, clearToken } from './api.js';

/**
 * Store user role in localStorage
 */
function setRole(role) {
  if (role) {
    localStorage.setItem('userRole', role);
  }
}

/**
 * Get user role from localStorage
 */
function getRole() {
  return localStorage.getItem('userRole');
}

/**
 * Clear user role from localStorage
 */
function clearRole() {
  localStorage.removeItem('userRole');
}

/**
 * Register a new user
 * POST /api/auth/register
 * @param {Object} credentials - {username, email, password}
 * @returns {Promise<Object>} - {success, data: {user, token}, error}
 */
export async function register(credentials) {
  try {
    const response = await apiCall('/auth/register', 'POST', {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password
    });

    if (response && response.token) {
      setToken(response.token);
      // Store user role from response (typically 'user' for new registrations)
      if (response.user && response.user.role) {
        setRole(response.user.role.toLowerCase());
      } else {
        // Default to user role if not provided
        setRole('user');
      }
      return {
        success: true,
        data: {
          user: response.user,
          token: response.token
        }
      };
    }

    return {
      success: false,
      error: response?.error || 'Registration failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Login user
 * POST /api/auth/login
 * @param {Object} credentials - {username, password} or {email, password}
 * @returns {Promise<Object>} - {success, data: {user, token}, error}
 */
export async function login(credentials) {
  try {
    const response = await apiCall('/auth/login', 'POST', {
      username: credentials.username || credentials.email,
      password: credentials.password
    });

    if (response && response.token) {
      setToken(response.token);
      // Store user role from response (normalized to lowercase)
      if (response.user && response.user.role) {
        setRole(response.user.role.toLowerCase());
      }
      return {
        success: true,
        data: {
          user: response.user,
          token: response.token
        }
      };
    }

    return {
      success: false,
      error: response?.error || 'Login failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 * @returns {Promise<Object>} - {success, warning}
 */
export async function logout() {
  try {
    await apiCall('/auth/logout', 'POST');
    clearToken();
    clearRole();  // Clear role on logout
    return { success: true };
  } catch (error) {
    // Even if API call fails, clear local token and role
    clearToken();
    clearRole();
    return {
      success: true,
      warning: error.message
    };
  }
}

/**
 * Get current authenticated user
 * GET /api/users/me
 * @returns {Promise<Object>} - {success, data: user, error}
 */
export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: 'No token found'
      };
    }

    const response = await apiCall('/users/me', 'GET');

    return {
      success: true,
      data: response
    };
  } catch (error) {
    // Clear token if it's invalid
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      clearToken();
      clearRole();
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get stored auth token
 * @returns {string|null}
 */
export function getAuthToken() {
  return getToken();
}

/**
 * Check if user is an Admin
 * @returns {boolean}
 */
export function isAdmin() {
  return getRole() === 'admin';
}

/**
 * Check if user is an Uploader
 * @returns {boolean}
 */
export function isUploader() {
  return getRole() === 'uploader';
}

/**
 * Check if user is a regular User
 * @returns {boolean}
 */
export function isUser() {
  return getRole() === 'user';
}

/**
 * Check if user can manage content (Admin or Uploader)
 * @returns {boolean}
 */
export function canManageContent() {
  const role = getRole();
  return role === 'admin' || role === 'uploader';
}

/**
 * Get current user's role
 * @returns {string|null}
 */
export function getUserRole() {
  return getRole();
}
// End of file - kept HEAD implementation (exports and lowercase roles)
