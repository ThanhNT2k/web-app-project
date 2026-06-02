/**
 * auth.js - Module API Xác thực
 * Xử lý đăng ký người dùng, đăng nhập, đăng xuất và quản lý phiên
 * Bao gồm các hàm hỗ trợ kiểm soát truy cập dựa trên vai trò
 * Sử dụng API wrapper từ api.js để giao tiếp HTTP
 */

// Tái xuất từ api.js để thuận tiện
import { apiCall, setToken, getToken, clearToken } from './api.js';

import { getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Chỉ kiểm tra nếu người dùng đang có trạng thái đăng nhập
    if (localStorage.getItem('token')) {
        try {
            const res = await getCurrentUser();
            
            if (res.success && res.data) {
                // Giả định API /users/me trả về Object chứa Role (C# hay trả về kiểu viết hoa hoặc viết thường)
                const currentRoleFromDB = res.data.role || res.data.Role;
                const currentEmailFromDB = res.data.email || res.data.Email;

                if (currentRoleFromDB) {
                    const localRole = localStorage.getItem('userRole');
                    const newRole = currentRoleFromDB.toLowerCase().trim();

                    // 🔄 Nếu phát hiện Vai trò dưới DB khác với Vai trò đang lưu ở máy tính
                    if (localRole !== newRole) {
                        console.log(`Phát hiện thay đổi quyền: ${localRole} -> ${newRole}`);
                        
                        // Cập nhật lại bộ nhớ máy tính
                        localStorage.setItem('userRole', newRole);
                        if (currentEmailFromDB) {
                            localStorage.setItem('userEmail', currentEmailFromDB.toLowerCase().trim());
                        }

                        // Thông báo và ép tải lại giao diện mới
                        alert('Thông tin tài khoản của bạn đã được cập nhật từ hệ thống!');
                        window.location.reload();
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi đồng bộ thông tin tài khoản:', error);
        }
    }
});
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

    console.log("Dữ liệu gốc nhận từ API Backend:", response); // In ra để xem trực tiếp cấu trúc

    if (response && (response.token || response.Token)) {
      // 1. Lưu Token (hỗ trợ cả viết hoa lẫn viết thường)
      const token = response.token || response.Token;
      setToken(token);
      
      // 2. Trích xuất Role thông minh (Quét mọi ngóc ngách cấu trúc C#)
      let rawRole = '';
      if (response.user && response.user.role) rawRole = response.user.role;
      else if (response.User && response.User.Role) rawRole = response.User.Role;
      else if (response.role) rawRole = response.role;
      else if (response.Role) rawRole = response.Role;
      
      // 3. Trích xuất Email thông minh
      let rawEmail = '';
      if (response.user && response.user.email) rawEmail = response.user.email;
      else if (response.User && response.User.Email) rawEmail = response.User.Email;
      else if (response.email) rawEmail = response.email;
      else if (response.Email) rawEmail = response.Email;
      else if (credentials.email && credentials.email.includes('@')) rawEmail = credentials.email;

      // 4. Lưu chính thức vào máy sau khi chuẩn hóa
      localStorage.setItem('userRole', rawRole.toLowerCase().trim());
      localStorage.setItem('userEmail', rawEmail.toLowerCase().trim());

      console.log("Dữ liệu sau khi trích xuất thành công:", {
          role: localStorage.getItem('userRole'),
          email: localStorage.getItem('userEmail')
      });

      // 5. Đợi một nhịp ngắn cho trình duyệt nạp dữ liệu ổn định
      await new Promise(resolve => setTimeout(resolve, 60));

      return {
        success: true,
        data: response
      };
    }

    return {
      success: false,
      error: response?.error || response?.Error || 'Login failed'
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
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');

    if (!authLinksContainer) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole'); // Đã quét từ hàm login lưu xuống

    if (token) {
        // 1. Ẩn nút "Đăng nhập" gốc
        authLinksContainer.style.display = 'none';

        // 2. Hiện khối "Profile Dropdown" của người dùng lên
        if (profileDropdown) {
            profileDropdown.style.display = 'block';
        }

        // 3. Tái cấu trúc Menu bên trong Dropdown dựa trên quyền hạn
        if (profileMenu) {
            // Các mục mặc định của tất cả người dùng
            let menuHtml = `
                <a href="/pages/profile.html" class="profile-menu-item">👤 Hồ sơ của tôi</a>
                <a href="/pages/favorites.html" class="profile-menu-item">❤️ Danh sách yêu thích</a>
                <a href="/pages/history.html" class="profile-menu-item">📖 Lịch sử đọc</a>
            `;

            // ✨ ĐẶC CÁCH: Nếu là admin, chèn thêm lối tắt vào Admin Panel
            if (role === 'admin') {
                menuHtml += `
                    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
                    <a href="/pages/admin.html" class="profile-menu-item" style="color: #f59e0b; font-weight: 600;">🛠️ Quản trị hệ thống (Admin)</a>
                `;
            }

            // Nút đăng xuất cuối cùng
            menuHtml += `
                <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
                <a href="#" class="profile-menu-item" style="color: #ef4444;" id="dropdown-logout-btn">🚪 Đăng xuất</a>
            `;

            profileMenu.innerHTML = menuHtml;

            // Bắt sự kiện click nút Đăng xuất trong dropdown một cách an toàn
            const logoutBtn = document.getElementById('dropdown-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    
                    // Thực thi hàm đăng xuất hệ thống (hàm từ auth.js gốc của bạn)
                    if (typeof window.logout === 'function') {
                        await window.logout();
                    } else {
                        // Phương án dự phòng nếu chưa bọc logout vào cửa sổ window
                        localStorage.clear();
                        window.location.href = '/index.html';
                    }
                });
            }
        }
    } else {
        // 4. Khi chưa đăng nhập: Hiện nút Đăng nhập và ẩn cụm Dropdown Hồ sơ
        authLinksContainer.style.display = 'flex';
        authLinksContainer.innerHTML = `
            <a href="#" class="nav-link" onclick="event.preventDefault(); window.toggleAuthModal(true)">Đăng nhập</a>
        `;
        if (profileDropdown) {
            profileDropdown.style.display = 'none';
        }
    }
}

// Bọc thêm hàm để các thẻ HTML gọi onclick="window.toggleProfileMenu()" không bị lỗi
window.toggleProfileMenu = function() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        // Toggle ẩn/hiện menu
        if (profileMenu.style.display === 'block') {
            profileMenu.style.display = 'none';
        } else {
            profileMenu.style.display = 'block';
        }
    }
}

// Lắng nghe click ra ngoài để tự đóng dropdown menu (Tăng trải nghiệm UX)
document.addEventListener('click', (e) => {
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');
    if (profileDropdown && profileMenu && !profileDropdown.contains(e.target)) {
        profileMenu.style.display = 'none';
    }
});

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
