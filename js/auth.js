/**
 * auth.js - Module API Xác thực
 * Xử lý đăng ký, đăng nhập, đăng xuất và đồng bộ quyền Admin từ Database
 */

import { apiCall, setToken, getToken, clearToken } from './api.js';

function setRole(role) {
  if (role) {
    localStorage.setItem('userRole', role);
  }
}

function getRole() {
  return localStorage.getItem('userRole');
}

function clearRole() {
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
}

/**
 * Kiểm tra quyền hạn trực tiếp bằng ID người dùng từ Database
 */
export async function checkRoleById(id) {
  try {
    if (!id) return { success: false, error: 'ID trống' };
    
    const response = await apiCall(`/users/check-admin?id=${encodeURIComponent(id.trim())}`, 'GET');
    
    if (response && response.success) {
        return {
            success: true,
            role: response.role
        };
    }
    return { success: false, error: 'Không lấy được thông tin quyền' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Đăng ký người dùng mới
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
      setRole(response.user?.role?.toLowerCase().trim() || 'user');
      return { success: true, data: response };
    }
    return { success: false, error: response?.error || 'Registration failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Đăng nhập người dùng - Tự động đồng bộ quyền Admin bằng ID lập tức
 */
export async function login(credentials) {
  try {
    const response = await apiCall('/auth/login', 'POST', {
      username: credentials.username || credentials.email,
      password: credentials.password
    });

    console.log("Response từ API Login:", response); // 🌟 DEBUG: Xem server trả về cái gì

    if (response && (response.token || response.Token)) {
      const token = response.token || response.Token;
      setToken(token);
      
      // Xử lý userId linh hoạt hơn
      const userData = response.user || response.User || {};
      const userId = userData.id || userData.Id;
      
      let detectedRole = (userData.role || 'user').toLowerCase().trim();

      // Nếu API trả về role trực tiếp thì dùng luôn, không cần checkRoleById nữa cho nhanh
      if (userId) {
        localStorage.setItem('userId', userId.toString().trim());
      }

      // Nếu chưa có role từ login response, mới dùng tới checkRoleById
      if (detectedRole === 'user' && userId) {
        try {
          console.log("Đang kiểm tra quyền qua ID...");
          const roleCheck = await checkRoleById(userId);
          if (roleCheck.success && roleCheck.role) {
            detectedRole = roleCheck.role.toLowerCase().trim();
          }
        } catch (e) {
          console.error("Lỗi khi checkRoleById:", e);
        }
      }

      localStorage.setItem('userRole', detectedRole);
      
      // Update UI và trả về
      updateAuthUI();
      return { success: true, data: response };
    }

    return { success: false, error: response?.error || 'Login failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Đăng xuất
 */
export async function logout() {
  try {
    await apiCall('/auth/logout', 'POST');
  } finally {
    clearToken();
    clearRole();
    window.location.href = '/index.html';
  }
}
window.logout = logout;

/**
 * Hàm cập nhật giao diện
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

            if (role === 'admin') {
                menuHtml += `
                    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
                    <a href="/pages/admin.html" class="profile-menu-item" style="color: #f59e0b; font-weight: 600;">🛠️ Quản trị hệ thống (Admin)</a>
                `;
            }

            menuHtml += `
                <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
                <a href="#" class="profile-menu-item" style="color: #ef4444;" onclick="logout()">🚪 Đăng xuất</a>
            `;
            profileMenu.innerHTML = menuHtml;
        }
    } else {
        authLinksContainer.style.display = 'flex';
        authLinksContainer.innerHTML = `<a href="#" class="nav-link" onclick="event.preventDefault(); window.toggleAuthModal(true)">Đăng nhập</a>`;
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

/**
 * Luồng đồng bộ ngầm khi tải trang
 */
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    setTimeout(async () => {
        const token = localStorage.getItem('token');
        const savedId = localStorage.getItem('userId');
        
        if (token && savedId) {
            try {
                const res = await checkRoleById(savedId);
                if (res.success && res.role) {
                    const localRole = localStorage.getItem('userRole');
                    const newRole = res.role.toLowerCase().trim();

                    if (localRole !== newRole) {
                        localStorage.setItem('userRole', newRole);
                        updateAuthUI();
                    }
                }
            } catch (error) {
                // Xử lý im lặng
            }
        }
    }, 100);
});

export function isAuthenticated() { return !!getToken(); }
export function isAdmin() { return getRole() === 'admin'; }