

// Hàm đăng nhập đã được tối ưu để lưu cả role
export async function login(credentials) {
    const url = "https://webappbe-fzz7.onrender.com/api/auth/login";
    console.log("Đang gửi login tới:", url);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: credentials.username || credentials.email,
            password: credentials.password
        })
    });

    console.log("Status trả về:", response.status);
    
    // ĐỌC TEXT TRƯỚC KHI ĐỌC JSON
    const text = await response.text();
    console.log("Nội dung thô trả về từ server:", text);

    if (response.ok) {
        try {
            const data = JSON.parse(text);
            console.log("Dữ liệu parsed:", data);
            // Tiếp tục logic lưu token/role ở đây...
            return { success: true, data: data };
        } catch (e) {
            return { success: false, error: "Server trả về thành công nhưng không phải JSON" };
        }
    }
    return { success: false, error: "Lỗi HTTP: " + response.status };
}

// Giữ lại các hàm cũ để tránh lỗi gọi hàm
export function setToken(token) { localStorage.setItem('token', token); }
export function setRole(role) { localStorage.setItem('userRole', role); }