const BACKEND_URL = "https://webappbe-fzz7.onrender.com";

export async function loginUser(email, password) {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password })
    });
    
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        // Lưu role và userId nếu có trong response
        if (data.user) {
            localStorage.setItem('userRole', (data.user.role || 'user').toLowerCase());
            localStorage.setItem('userId', data.user.id || '');
        }
        return { success: true };
    }
    throw new Error(data.error || 'Đăng nhập thất bại');
}