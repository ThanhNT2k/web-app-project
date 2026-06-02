// js/auth.js
export async function loginUser(email, password) {
    const response = await fetch("https://webappbe-fzz7.onrender.com/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password })
    });

    const data = await response.json();

    if (response.ok) {
        // Lưu token
        localStorage.setItem('token', data.token);
        
        // 🌟 CẬP NHẬT: Lưu thêm Email để dùng cho các logic kiểm tra nội bộ
        if (data.user) {
            localStorage.setItem('userRole', data.user.role.toLowerCase());
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('userId', data.user.id);
            // Lưu thêm email nếu backend có trả về
            if (data.user.email) {
                localStorage.setItem('userEmail', data.user.email.toLowerCase());
            }
        }
        
        return data;
    } else {
        throw new Error(data.error || 'Đăng nhập thất bại');
    }
}

// Hàm logout: Cực kỳ quan trọng để dọn sạch thông tin khi người dùng đăng xuất
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    window.location.href = '/index.html';
}

// Giữ lại các hàm helper
export function setToken(token) { localStorage.setItem('token', token); }
export function setRole(role) { localStorage.setItem('userRole', role.toLowerCase()); }