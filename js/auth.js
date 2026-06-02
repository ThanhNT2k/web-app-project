

// Hàm đăng nhập đã được tối ưu để lưu cả role
export async function login(credentials) {
  try {
    const response = await fetch("https://webappbe-fzz7.onrender.com/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username || credentials.email,
        password: credentials.password
      })
    });

    const data = await response.json();
    console.log("Response từ API Login:", data); // Để bạn kiểm tra trong F12

    if (response.ok) {
      // 1. Lưu Token
      const token = data.token || data.Token;
      if (token) localStorage.setItem('token', token);

      // 2. LƯU ROLE (Quan trọng: lấy từ user object trả về từ server)
      // Giả sử server trả về cấu trúc: { token: "...", user: { id: 1, role: "admin", ... } }
      const userData = data.user || data.User || {};
      const role = userData.role || userData.Role || 'user'; 
      
      localStorage.setItem('userRole', role.toLowerCase().trim());
      localStorage.setItem('userId', (userData.id || userData.Id || '').toString());

      return { success: true, data: data };
    }

    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Giữ lại các hàm cũ để tránh lỗi gọi hàm
export function setToken(token) { localStorage.setItem('token', token); }
export function setRole(role) { localStorage.setItem('userRole', role); }