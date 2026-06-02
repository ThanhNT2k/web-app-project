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
 * Đăng nhập người dùng - Phiên bản bắt lỗi tuyệt đối (Chặn nuốt lỗi)
 */
export async function login(credentials) {
  try {
    console.log("=== BẮT ĐẦU GỌI API ĐĂNG NHẬP ===");
    
    const response = await apiCall('/auth/login', 'POST', {
      username: credentials.username || credentials.email,
      password: credentials.password
    });

    // 🌟 KHỐI HIỂN THỊ KHI THÀNH CÔNG (BẤT CHẤP CẤU TRÚC)
    console.log("DỮ LIỆU ĐĂNG NHẬP THÀNH CÔNG:", response);
    alert("KẾT QUẢ ĐĂNG NHẬP THÀNH CÔNG:\n" + JSON.stringify(response));

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

      await new Promise(resolve => setTimeout(resolve, 60));

      return { success: true, data: response };
    }

    return {
      success: false,
      error: response?.error || response?.Error || 'Login failed'
    };
  } catch (error) {
    // 🌟 KHỐI HIỂN THỊ KHI BỊ CHẠY VÀO LỖI (CATCH)
    console.error("LỖI PHÁT SINH TRONG HÀM LOGIN:", error);
    alert("HÀM LOGIN BỊ CHẠY VÀO KHỐI LỖI (CATCH):\nNội dung lỗi: " + error.message);
    
    return {
      success: false,
      error: error.message
    };
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
 * Nhận người dùng được xác thực hiện tại từ DB Supabase
 * GET /api/users/profile
 */
export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) return { success: false, error: 'No token found' };

    // 🎯 SỬA ĐƯỜNG DẪN TẠI ĐÂY: Đổi từ '/users/me' thành '/users/profile'
    const response = await apiCall('/users/profile', 'GET');

    console.log("Dữ liệu gốc nhận từ API /users/profile:", response);

    // Vì Supabase Service của C# thường trả về trực tiếp Object hoặc mảng Model
    if (response) {
        return {
            success: true,
            data: response // Trả dữ liệu Profile ra cho luồng xử lý
        };
    }

    return { success: false, error: 'Không thể lấy thông tin profile' };
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

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Vẽ nhanh giao diện ban đầu từ localStorage trước
    updateAuthUI();

    const token = localStorage.getItem('token');

    // 2. Chạy ngầm kiểm tra và đồng bộ quyền từ Database
    if (token) {
        try {
            await new Promise(resolve => setTimeout(resolve, 50));
            const res = await getCurrentUser();
            
            if (res && res.success && res.data) {
                // 🔍 DÒNG DEBUG QUAN TRỌNG: Xem cấu trúc thực tế của đối tượng Profile
                console.log("=== DỮ LIỆU ĐỒNG BỘ TRẢ VỀ TỪ SUPABASE ===", res.data);
                
                // Lấy ra giá trị Role (quét cả viết hoa lẫn viết thường)
                const rawRoleFromDB = res.data.role || res.data.Role || res.data.roleName || res.data.RoleName;
                const currentEmailFromDB = res.data.email || res.data.Email;

                console.log("-> Giá trị Quyền đọc được từ DB là:", rawRoleFromDB);
                console.log("-> Kiểu dữ liệu (Type):", typeof rawRoleFromDB);

                if (rawRoleFromDB !== undefined && rawRoleFromDB !== null) {
                    // Chuyển thành chuỗi chữ thường để so sánh chuẩn hóa
                    const newRole = String(rawRoleFromDB).toLowerCase().trim();
                    const localRole = localStorage.getItem('userRole');

                    // 🚨 ĐOẠN ÉP ĐÈ: Nếu bạn kiểm tra thấy DB trả về số hoặc chữ khác, hãy bổ sung logic tại đây
                    // Ví dụ: nếu DB trả về số 1 hoặc chữ "admin" thì đều coi là 'admin'
                    let finalRoleValue = newRole;
                    if (newRole === '1' || newRole === 'admin') {
                        finalRoleValue = 'admin';
                    }

                    if (localRole !== finalRoleValue) {
                        console.log(`[ĐỒNG BỘ] Cập nhật quyền bộ nhớ: ${localRole} -> ${finalRoleValue}`);
                        
                        localStorage.setItem('userRole', finalRoleValue);
                        if (currentEmailFromDB) {
                            localStorage.setItem('userEmail', String(currentEmailFromDB).toLowerCase().trim());
                        }

                        // Vẽ lại giao diện ngay lập tức
                        updateAuthUI();
                        console.log("=== ĐÃ GỌI LẠI UPDATE_AUTH_UI THÀNH CÔNG ===");
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi chạy ngầm đồng bộ quyền:', error);
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