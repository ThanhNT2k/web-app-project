

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
        
        // 🌟 ĐOẠN QUAN TRỌNG: Lưu role từ object 'user'
        if (data.user) {
            localStorage.setItem('userRole', data.user.role.toLowerCase());
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('userId', data.user.id);
        }
        
        return data;
    } else {
        throw new Error(data.error || 'Đăng nhập thất bại');
    }
}

// Giữ lại các hàm cũ để tránh lỗi gọi hàm
export function setToken(token) { localStorage.setItem('token', token); }
export function setRole(role) { localStorage.setItem('userRole', role); }