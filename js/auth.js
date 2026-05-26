/**
 * auth.js - Xử lý Authentication (Đăng nhập, Token JWT, Phân quyền)
 */

const AUTH_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5221/api/Auth'                  // 🟢 Đổi thành Auth viết hoa
    : 'https://webappbackend-jrto.onrender.com/api/Auth'; // 🟢 Đổi thành Auth viết hoa

/**
 * Đăng nhập người dùng
 */
async function login(username, password) { // Đổi từ email thành username theo AuthController
  try {
    const response = await fetch(`${AUTH_URL}/login`, { // Sửa từ AUTH_API_URL thành AUTH_URL cho đúng khai báo biến trên đầu
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // 🟢 Đổi key sang Chữ Hoa Đầu (Username, Password) để khớp C# LoginRequest Class
      body: JSON.stringify({ Username: username, Password: password }) 
    });

    if (!response.ok) {
      // Vì trả về Unauthorized thuần túy từ Controller, ta bẫy lỗi hợp lý
      throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
    }

    const data = await response.json();
    
    // 🟢 Lưu dữ liệu dựa theo LoginResponse trả về từ C# (Token, Username)
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.username); // .NET trả về chữ thường trong thuộc tính JSON mặc định
      
      // Tách và giải mã vai trò (Role) từ JWT token để gán quyền (Tùy chọn nâng cao)
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
        localStorage.setItem('role', payload[roleKey] || payload['role'] || 'User');
      } catch (e) {
        localStorage.setItem('role', 'User');
      }
      
      return data;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Đăng ký người dùng mới (Giữ nguyên cấu trúc đợi bạn làm Controller)
 */
async function register(email, password, fullName) {
  try {
    const response = await fetch(`${AUTH_URL}/register`, {
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

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('role');
  window.location.href = '/index.html';
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  return {
    userName: localStorage.getItem('userName'),
    role: localStorage.getItem('role'),
    token: localStorage.getItem('token')
  };
}

function isAdmin() {
  return localStorage.getItem('role') === 'Admin';
}

function isUploader() {
  const role = localStorage.getItem('role');
  return role === 'Uploader' || role === 'Admin';
}