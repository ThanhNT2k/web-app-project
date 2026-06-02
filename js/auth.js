// js/auth.js
export async function loginUser(email, password) {
    const response = await fetch("https://webappbe-fzz7.onrender.com/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // PHẢI GỬI ĐÚNG KEY "email" VÀ "password"
        body: JSON.stringify({ 
            email: email, 
            password: password 
        })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token);
        
        if (data.user) {
            localStorage.setItem('userRole', data.user.role.toLowerCase());
            // Cẩn thận: Backend đang trả về display_name (username) hay là gì? 
            // Nếu data.user.username là null, hãy kiểm tra lại cấu trúc backend trả về.
            localStorage.setItem('username', data.user.username || data.user.email.split('@')[0]);
            localStorage.setItem('userId', data.user.id);
            if (data.user.email) {
                localStorage.setItem('userEmail', data.user.email.toLowerCase());
            }
        }
        
        return data;
    } else {
        throw new Error(data.error || 'Đăng nhập thất bại');
    }
}