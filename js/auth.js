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
  localStorage.removeItem('userEmail');
}

/**
 * Đăng ký người dùng mới
 * POST /api/auth/register
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
      if (response.user && response.user.role) {
        setRole(response.user.role.toLowerCase().trim());
      } else {
        setRole('user');
      }
      return {
        success: true,
        data: { user: response.user, token: response.token }
      };
    }

    return {
      success: false,
      error: response?.error || 'Registration failed'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Đăng nhập người dùng - Bản tương thích sâu Backend C#
 */
export async function login(credentials) {
  try {
    const response = await apiCall('/auth/login', 'POST', {
      username: credentials.username || credentials.email,
      password: credentials.password
    });

    alert("BACKEND TRẢ VỀ: " + JSON.stringify(response));
    console.log("BACKEND TRẢ VỀ GỐC:", response);

    console.log("Dữ liệu gốc nhận từ API Backend:", response);

    if (response && (response.token || response.Token)) {
      const token = response.token || response.Token;
      setToken(token);
      
      let rawRole = '';
      if (response.user && response.user.role) rawRole = response.user.role;
      else if (response.User && response.User.Role) rawRole = response.User.Role;
      else if (response.role) rawRole = response.role;
      else if (response.Role) rawRole = response.Role;
      
      let rawEmail = '';
      if (response.user && response.user.email) rawEmail = response.user.email;
      else if (response.User && response.User.Email) rawEmail = response.User.Email;
      else if (response.email) rawEmail = response.email;
      else if (response.Email) rawEmail = response.Email;
      else if (credentials.email && credentials.email.includes('@')) rawEmail = credentials.email;

      localStorage.setItem('userRole', rawRole.toLowerCase().trim());
      localStorage.setItem('userEmail', rawEmail.toLowerCase().trim());

      console.log("Dữ liệu sau khi đăng nhập thành công:", {
          role: localStorage.getItem('userRole'),
          email: localStorage.getItem('userEmail')
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      return { success: true, data: response };
    }

    return {
      success: false,
      error: response?.error || response?.Error || 'Login failed'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Đăng xuất người dùng
 */
export async function logout() {
  try {
    await apiCall('/auth/logout', 'POST');
    clearToken();
    clearRole();  
    return { success: true };
  } catch (error) {
    clearToken();
    clearRole();
    return { success: true, warning: error.message };
  }
}
window.logout = logout; // Phục vụ thuộc tính onclick ngoài HTML công cộng

/**
 * Nhận người dùng được xác thực hiện tại từ DB
 */
export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) return { success: false, error: 'No token found' };

    const response = await apiCall('/users/me', 'GET');
    return { success: true, data: response };
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      clearToken();
      clearRole();
    }
    return { success: false, error: error.message };
  }
}

/**
 * Hàm cập nhật giao diện dựa trên trạng thái đăng nhập và quyền hạn
 */
export function updateAuthUI() {
    const authLinksContainer = document.getElementById('auth-links');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');

    if (!authLinksContainer) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole'); 

    if (token) {
        authLinksContainer.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'block';

        if (profileMenu) {
            let menuHtml = `
                <a href="/pages/profile.html" class="profile-menu-item">👤 Hồ sơ của tôi</a>
                <a href="/pages/favorites.html" class="profile-menu-item">❤️ Danh sách yêu thích</a>
                <a href="/pages/history.html" class="profile-menu-item">📖 Lịch sử đọc</a>
            `;

            // ✨ ĐẶC CÁCH DI ĐỘNG: Tạo lối tắt Admin Panel nếu role khớp
            if (role === 'admin') {
                menuHtml += `
                    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
                    <a href="/pages/admin.html" class="profile-menu-item" style="color: #f59e0b; font-weight: 600;">🛠️ Quản trị hệ thống (Admin)</a>
                `;
            }

            menuHtml += `
                <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
                <a href="#" class="profile-menu-item" style="color: #ef4444;" id="dropdown-logout-btn">🚪 Đăng xuất</a>
            `;

            profileMenu.innerHTML = menuHtml;

            const logoutBtn = document.getElementById('dropdown-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await logout();
                    window.location.href = '/index.html';
                });
            }
        }
    } else {
        authLinksContainer.style.display = 'flex';
        authLinksContainer.innerHTML = `
            <a href="#" class="nav-link" onclick="event.preventDefault(); window.toggleAuthModal(true)">Đăng nhập</a>
        `;
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

// Bọc hàm kiểm soát đóng mở Menu Dropdown
window.toggleProfileMenu = function() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
    }
}

// Đóng menu khi người dùng click ra ngoài khoảng trống
document.addEventListener('click', (e) => {
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');
    if (profileDropdown && profileMenu && !profileDropdown.contains(e.target)) {
        profileMenu.style.display = 'none';
    }
});

/**
 * 🔄 LUỒNG TỰ ĐỘNG ĐỒNG BỘ VÀ KIỂM TRA ROLE TỪ DATABASE KHI KHỞI CHẠY WEB
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Vẽ giao diện ngay lập tức dựa trên bộ nhớ tạm (localStorage) hiện tại trước
    updateAuthUI();

    // 2. Chạy ngầm Request hỏi Database xem có thay đổi gì về quyền hạn hay không
    if (localStorage.getItem('token')) {
        try {
            const res = await getCurrentUser();
            
            if (res.success && res.data) {
                const currentRoleFromDB = res.data.role || res.data.Role;
                const currentEmailFromDB = res.data.email || res.data.Email;

                if (currentRoleFromDB) {
                    const localRole = localStorage.getItem('userRole');
                    const newRole = currentRoleFromDB.toLowerCase().trim();

                    // Nếu phát hiện Role dưới DB lệch với Role đang lưu tạm ở máy tính
                    if (localRole !== newRole) {
                        console.log(`[ĐỒNG BỘ] Phát hiện thay đổi quyền trên DB: ${localRole} -> ${newRole}`);
                        
                        localStorage.setItem('userRole', newRole);
                        if (currentEmailFromDB) {
                            localStorage.setItem('userEmail', currentEmailFromDB.toLowerCase().trim());
                        }

                        // Vẽ lại giao diện ngay tại chỗ để nạp mục Admin Panel (hoặc ẩn đi nếu bị hạ quyền)
                        updateAuthUI();
                        
                        alert('Thông tin phân quyền tài khoản của bạn đã được hệ thống cập nhật tự động!');
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi đồng bộ thông tin tài khoản từ DB:', error);
        }
    }
});

/**
 * Các hàm hỗ trợ kiểm tra quyền hạn (Helper functions)
 */
export function isAuthenticated() { return !!getToken(); }
export function getAuthToken() { return getToken(); }
export function isAdmin() { return getRole() === 'admin'; }
export function isUploader() { return getRole() === 'uploader'; }
export function isUser() { return getRole() === 'user'; }
export function canManageContent() {
  const role = getRole();
  return role === 'admin' || role === 'uploader';
}
export function getUserRole() { return getRole(); }