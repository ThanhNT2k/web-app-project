/**
 * auth.js - Xử lý Authentication (Đăng nhập, Token JWT, Phân quyền)
 */

const AUTH_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5221/api/auth'
    : 'https://webappbackend-jrto.onrender.com/api/auth'; // ⚠️ HÃY THAY ĐƯỜNG DẪN RENDER THẬT CỦA BẠN VÀO ĐÂY

/**
 * Đăng nhập người dùng
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 */
async function login(email, password) {
  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    
    // Lưu token vào localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.userName);
      localStorage.setItem('role', data.role);
      return data;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Đăng ký người dùng mới
 * @param {string} email - Email
 * @param {string} password - Mật khẩu
 * @param {string} fullName - Tên đầy đủ
 */
async function register(email, password, fullName) {
  try {
    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, fullName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng ký thất bại');
    }

    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

/**
 * Đăng xuất (xóa token từ localStorage)
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('role');
  window.location.href = '/index.html';
}

/**
 * Kiểm tra xem người dùng đã đăng nhập chưa
 */
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

/**
 * Lấy thông tin người dùng hiện tại
 */
function getCurrentUser() {
  return {
    userId: localStorage.getItem('userId'),
    userName: localStorage.getItem('userName'),
    role: localStorage.getItem('role'),
    token: localStorage.getItem('token')
  };
}

/**
 * Kiểm tra xem người dùng có phải Admin không
 */
function isAdmin() {
  return localStorage.getItem('role') === 'Admin';
}

/**
 * Kiểm tra xem người dùng có phải Uploader không
 */
function isUploader() {
  const role = localStorage.getItem('role');
  return role === 'Uploader' || role === 'Admin';
}

/**
 * Refresh token (nếu backend hỗ trợ)
 */
async function refreshToken() {
  try {
    const response = await fetch(`${AUTH_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.token;
    } else {
      logout();
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    logout();
  }
}

/**
 * Redirect tới trang đăng nhập nếu chưa đăng nhập
 */
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/account.html';
  }
}

/**
 * Redirect tới trang đăng nhập nếu không phải Admin
 */
function requireAdmin() {
  if (!isAdmin()) {
    alert('Bạn không có quyền truy cập trang này');
    window.location.href = '/index.html';
  }
}

/**
 * Redirect tới trang đăng nhập nếu không phải Uploader/Admin
 */
function requireUploader() {
  if (!isUploader()) {
    alert('Bạn không có quyền truy cập trang này');
    window.location.href = '/index.html';
  }
}
