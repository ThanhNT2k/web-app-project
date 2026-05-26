/**
 * auth.js - Xử lý Authentication & Phân quyền ứng dụng
 * ĐÃ ĐỒNG BỘ CHUẨN XÁC VỚI CƠ CHẾ AUTH SUPABASE + BACKEND ROLES
 */

/**
 * Hàm hỗ trợ xử lý sau khi đăng nhập thành công từ giao diện Supabase Auth
 * @param {string} token - Access Token do Supabase cấp sau khi login thành công
 */
async function handleLoginSuccess(token) {
  try {
    // 1. Lưu token trước để hàm apiCall trong api.js có quyền truy cập headers
    localStorage.setItem('token', token);

    // 2. Gọi API profile từ backend để lấy thông tin thực tế trong bảng public.profiles
    const profile = await getProfile(); 

    // 3. Lưu trữ thông tin sạch vào LocalStorage để render giao diện nhanh
    localStorage.setItem('userName', profile.username || 'Thành viên');
    localStorage.setItem('role', profile.role || 'User'); // 'User', 'Uploader', 'Admin'
    localStorage.setItem('avatarUrl', profile.avatarUrl || '');
    localStorage.setItem('userId', profile.id || '');

    return profile;
  } catch (error) {
    console.error('Lỗi thiết lập thông tin phân quyền:', error);
    clearAuthStorage();
    throw new Error('Không thể đồng bộ quyền hạn từ hệ thống!');
  }
}

function logout() {
  clearAuthStorage();
  window.location.href = '/index.html';
}

function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('role');
  localStorage.removeItem('avatarUrl');
  localStorage.removeItem('userId');
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  return {
    userName: localStorage.getItem('userName'),
    role: localStorage.getItem('role'),
    token: localStorage.getItem('token'),
    avatarUrl: localStorage.getItem('avatarUrl'),
    userId: localStorage.getItem('userId')
  };
}

function isAdmin() {
  return localStorage.getItem('role') === 'Admin';
}

function isUploader() {
  const role = localStorage.getItem('role');
  return role === 'Uploader' || role === 'Admin';
}

// Chặn truy cập nếu chưa đăng nhập
function requireLogin() {
  if (!isLoggedIn()) {
    alert('Vui lòng đăng nhập để tiếp tục!');
    window.location.href = '/pages/account.html';
  }
}

// Chặn truy cập nếu không phải Admin
function requireAdmin() {
  if (!isAdmin()) {
    alert('Thẩm quyền tối cao bị từ chối! Bạn không có quyền truy cập khu vực này.');
    window.location.href = '/index.html';
  }
}