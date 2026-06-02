/**
 * auth.js - Module API Xác thực
 * Xử lý đăng ký người dùng, đăng nhập, đăng xuất và quản lý phiên
 * Bao gồm các hàm hỗ trợ kiểm soát truy cập dựa trên vai trò
 * Sử dụng API wrapper từ api.js để giao tiếp HTTP
 */

// Tái xuất từ api.js để thuận tiện
import { apiCall, setToken, getToken, clearToken } from './api.js';

/**
 * Lưu trữ vai trò người dùng trong localStorage
 */
function setRole(role) {
  if (role) {
    localStorage.setItem('userRole', role);
  }
}

/**
 * Lấy vai trò người dùng từ localStorage
 */
function getRole() {
  return localStorage.getItem('userRole');
}

/**
 * Xóa vai trò người dùng từ localStorage
 */
function clearRole() {
  localStorage.removeItem('userRole');
}

/**
 * Đăng ký người dùng mới
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
      // Lưu trữ vai trò người dùng từ phản hồi (thường là 'user' cho đăng ký mới)
      if (response.user && response.user.role) {
        setRole(response.user.role.toLowerCase());
      } else {
        // Mặc định là vai trò người dùng nếu không được cung cấp
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
 * Đăng nhập người dùng
 * POST /api/auth/login
 * @param {Object} credentials - {username, password} hoặc {email, password}
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
      // Lưu trữ vai trò người dùng từ phản hồi (bình thường hóa thành chữ thường)
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
 * Đăng xuất người dùng
 * POST /api/auth/logout
 * @returns {Promise<Object>} - {success, warning}
 */
export async function logout() {
  try {
    await apiCall('/auth/logout', 'POST');
    clearToken();
    clearRole();  // Xóa vai trò khi đăng xuất
    return { success: true };
  } catch (error) {
    // Ngay cả khi cuộc gọi API thất bại, vẫn xóa token cục bộ và vai trò
    clearToken();
    clearRole();
    return {
      success: true,
      warning: error.message
    };
  }
}

/**
 * Nhận người dùng được xác thực hiện tại
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
    // Xóa token nếu nó không hợp lệ
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

// Hàm cập nhật giao diện dựa trên trạng thái đăng nhập
// Tìm đến hàm updateAuthUI() trong file js/auth.js của bạn và thay thế bằng đoạn này:
export function updateAuthUI() {
    const authLinksContainer = document.getElementById('auth-links');
    if (!authLinksContainer) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole'); // Lấy vai trò hệ thống vừa ghi nhận

    if (token) {
        // Tạo chuỗi HTML mặc định hiển thị lời chào và nút Đăng xuất
        let authHtml = `<span class="nav-link" style="color: var(--primary-color); font-weight: bold;">👋 Xin chào!</span>`;
        
        // 🚀 ĐẶC CÁCH: Nếu vai trò là admin, chèn thêm nút nhảy nhanh vào Dashboard Quản trị
        if (role === 'admin') {
            authHtml += `<a href="/pages/admin.html" class="nav-link" style="color: var(--warning-color); font-weight: 600;">🛠️ Admin Panel</a>`;
        }

        authHtml += `<a href="#" id="logout-btn" class="nav-link" style="color: #ef4444;">Đăng xuất</a>`;
        authLinksContainer.innerHTML = authHtml;

        // Bắt sự kiện click nút Đăng xuất
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token'); 
            localStorage.removeItem('userRole'); // Dọn dẹp sạch sẽ vai trò khi logout
            alert('Đã đăng xuất thành công!');
            window.location.href = '/index.html'; // Đưa về trang chủ
        });
    } else {
        // Nếu chưa đăng nhập: Hiển thị lại nút Đăng nhập gốc
        authLinksContainer.innerHTML = `
            <a href="#" class="nav-link" onclick="event.preventDefault(); window.toggleAuthModal(true)">Đăng nhập</a>
        `;
    }
}

// Tự động chạy khi file js/auth.js được nạp
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});


/**
 * Kiểm tra xem người dùng có được xác thực hay không
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Lấy token xác thực được lưu trữ
 * @returns {string|null}
 */
export function getAuthToken() {
  return getToken();
}

/**
 * Kiểm tra xem người dùng có phải là Admin hay không
 * @returns {boolean}
 */
export function isAdmin() {
  return getRole() === 'admin';
}

/**
 * Kiểm tra xem người dùng có phải là Uploader hay không
 * @returns {boolean}
 */
export function isUploader() {
  return getRole() === 'uploader';
}

/**
 * Kiểm tra xem người dùng có phải là Người dùng thường xuyên hay không
 * @returns {boolean}
 */
export function isUser() {
  return getRole() === 'user';
}

/**
 * Kiểm tra xem người dùng có thể quản lý nội dung hay không (Admin hoặc Uploader)
 * @returns {boolean}
 */
export function canManageContent() {
  const role = getRole();
  return role === 'admin' || role === 'uploader';
}

/**
 * Lấy vai trò của người dùng hiện tại
 * @returns {string|null}
 */
export function getUserRole() {
  return getRole();
}
// Kết thúc tệp - triển khai HEAD được giữ (xuất khẩu và vai trò chữ thường)
