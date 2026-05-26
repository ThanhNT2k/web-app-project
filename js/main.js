/**
 * main.js - Xử lý logic DOM chung cho tất cả các trang
 */

document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
  attachGlobalEventListeners();
});

/**
 * Cập nhật thanh điều hướng (Navbar) thông minh dựa trên Roles
 */
function updateHeader() {
  const user = getCurrentUser();
  const authLinksContainer = document.getElementById('auth-links');
  
  if (!authLinksContainer) return;

  if (isLoggedIn()) {
    authLinksContainer.innerHTML = `
      <div class="user-menu" style="display: flex; align-items: center; gap: 15px;">
        <span class="user-name" style="font-weight: bold; color: var(--primary-color);">👤 ${user.userName || 'Người dùng'}</span>
        <span class="user-role" style="font-size: 0.75rem; padding: 2px 6px; background: #3b82f6; color: white; border-radius: 4px;">${user.role}</span>
        <a href="/pages/profile.html" class="nav-link">Hồ sơ</a>
        ${isAdmin() ? '<a href="/pages/admin.html" class="nav-link" style="color: #ef4444; font-weight: bold;">Admin</a>' : ''}
        <button onclick="logout()" class="nav-link logout-btn" style="background: none; border: none; cursor: pointer; color: #6b7280;">Đăng xuất</button>
      </div>
    `;
  } else {
    authLinksContainer.innerHTML = `
      <a href="/pages/account.html" class="nav-link">Đăng nhập / Đăng ký</a>
    `;
  }
}

function attachGlobalEventListeners() {
  const navLinks = document.querySelectorAll('a[data-page]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateToPage(page);
    });
  });
}

function navigateToPage(page) {
  window.location.href = `/pages/${page}.html`;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 5px;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

/**
 * 🟢 RENDER DANH SÁCH TRUYỆN TRANH (Đồng bộ chuẩn hóa trường dữ liệu Database)
 */
function renderComics(comics, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!comics || comics.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center; color:#6b7280;">Không tìm thấy truyện nào.</p>';
    return;
  }

  container.innerHTML = comics.map(comic => `
    <article class="story-card">
      <div class="story-image">
        <img src="${comic.coverUrl || '/assets/placeholder.jpg'}" alt="${comic.title}">
      </div>
      <div class="story-info">
        <h3 class="story-title">
          <a href="/pages/comic.html?slug=${comic.slug}">${comic.title}</a>
        </h3>
        <div class="story-meta">
          <span class="story-status">${comic.status || 'Ongoing'}</span>
          <span class="story-views" style="font-size: 0.85rem; color: #6b7280;">👁️ ${comic.totalViews || 0}</span>
        </div>
        <a href="/pages/comic.html?slug=${comic.slug}" class="btn btn-primary" style="display:inline-block; margin-top:10px;">Đọc truyện</a>
      </div>
    </article>
  `).join('');
}

/**
 * 🟢 RENDER DANH SÁCH CHƯƠNG TRUYỆN
 */
function renderChapters(chapters, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!chapters || chapters.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center; color:#6b7280;">Truyện hiện chưa có chương nào.</p>';
    return;
  }

  container.innerHTML = chapters.map(chapter => `
    <div class="chapter-item" style="padding: 12px; border-bottom: 1px solid var(--border-color);">
      <a href="/pages/chapter.html?id=${chapter.id}" style="text-decoration: none; color: var(--text-color); font-weight: 500;">
        Chương ${chapter.chapterNumber}: ${chapter.chapterName || 'Nội dung chương'}
      </a>
    </div>
  `).join('');
}

function truncateText(text, length = 100) {
  if (!text || text.length <= length) return text || '';
  return text.substring(0, length) + '...';
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Hàm format ngày tháng cơ bản
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}