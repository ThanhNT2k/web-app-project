/**
 * auth.js - Xử lý Authentication & Phân quyền ứng dụng
 */

// 1. Import cấu hình bảo mật
// Nếu dùng type="module", hãy giữ import này. 
// Nếu không, hãy đảm bảo config.js được load trước file này trong HTML
import { supabaseConfig } from './config.js';

// Khởi tạo Supabase client dùng cấu hình từ config.js
const supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);

/**
 * Xử lý sau khi đăng nhập thành công (Đã gộp logic)
 */
async function handleLoginSuccess(token) {
    try {
        localStorage.setItem('token', token);

        // Gọi API profile để lấy thông tin (đảm bảo hàm getProfile có trong api.js)
        const profile = await getProfile(); 

        localStorage.setItem('userName', profile.username || 'Thành viên');
        localStorage.setItem('role', profile.role || 'User');
        localStorage.setItem('avatarUrl', profile.avatarUrl || '');
        localStorage.setItem('userId', profile.id || '');

        return profile;
    } catch (error) {
        console.error('Lỗi đồng bộ thông tin phân quyền:', error);
        clearAuthStorage();
        throw new Error('Không thể thiết lập phiên đăng nhập!');
    }
}

// ĐĂNG NHẬP
async function login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await handleLoginSuccess(data.session.access_token);
    return data;
}

// ĐĂNG KÝ
async function register(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { username: username } }
    });
    if (error) throw error;
    return data;
}

// --- CÁC HÀM QUẢN LÝ TRẠNG THÁI ---

function logout() {
    clearAuthStorage();
    window.location.href = '/index.html';
}

function clearAuthStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('userId');
}

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getCurrentUser() {
    return {
        userName: localStorage.getItem('userName'),
        role: localStorage.getItem('role'),
        token: localStorage.getItem('token'),
        avatarUrl: localStorage.getItem('avatarUrl'),
        userId: localStorage.getItem('userId')
    };
}

// --- PHÂN QUYỀN ---

function isAdmin() {
    return localStorage.getItem('role') === 'Admin';
}

function isUploader() {
    const role = localStorage.getItem('role');
    return role === 'Uploader' || role === 'Admin';
}

function requireLogin() {
    if (!isLoggedIn()) {
        alert('Vui lòng đăng nhập để tiếp tục!');
        window.location.href = '/pages/account.html';
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        alert('Truy cập bị từ chối!');
        window.location.href = '/index.html';
    }
}

// --- GIAO DIỆN NAVBAR ---

function syncNavbarUI() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    const user = getCurrentUser();
    if (user && user.token) {
        authLinks.innerHTML = `
            <a href="/pages/profile.html" class="nav-link">👤 ${user.userName}</a>
            <a href="javascript:void(0)" onclick="logout()" class="nav-link">Đăng xuất</a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="javascript:void(0)" class="nav-link" onclick="toggleAuthModal(true)">Đăng nhập</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', syncNavbarUI);