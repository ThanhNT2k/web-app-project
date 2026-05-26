/**
 * main.js - Xử lý logic DOM chung cho tất cả các trang
 */

// Cập nhật header (navbar) khi trang load
document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
  attachGlobalEventListeners();
});

/**
 * Cập nhật header dựa trên trạng thái đăng nhập
 */
function updateHeader() {
  const user = getCurrentUser();
  const authLinksContainer = document.getElementById('auth-links');
  
  if (!authLinksContainer) return;

  if (isLoggedIn()) {
    authLinksContainer.innerHTML = `
      <div class="user-menu">
        <span class="user-name">${user.userName || 'Người dùng'}</span>
        <a href="/pages/profile.html" class="nav-link">Profile</a>
        ${isAdmin() ? '<a href="/pages/admin.html" class="nav-link">Admin</a>' : ''}
        <button onclick="logout()" class="nav-link logout-btn">Đăng xuất</button>
      </div>
    `;
  } else {
    authLinksContainer.innerHTML = `
      <a href="/pages/account.html" class="nav-link">Đăng nhập</a>
      <a href="/pages/account.html" class="nav-link">Đăng ký</a>
    `;
  }
}

/**
 * Gắn event listeners chung cho toàn bộ trang
 */
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
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

/**
 * 🟢 CẬP NHẬT RENDER TRUYỆN THEO ĐÚNG THUỘC TÍNH CỦA StoryDTO C#
 * Các trường dữ liệu nhận về từ .NET sẽ tự chuyển thành chữ thường: id, name, slug, coverUrl, status
 */
function renderStories(stories, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = stories.map(story => `
    <article class="story-card">
      <div class="story-image">
        <img src="${story.coverUrl || '/assets/placeholder.jpg'}" alt="${story.name}">
      </div>
      <div class="story-info">
        <h3 class="story-title">
          <a href="/pages/story.html?slug=${story.slug}">${story.name}</a>
        </h3>
        <div class="story-meta">
          <span class="story-status">${story.status || 'Đang tiến hành'}</span>
        </div>
        <a href="/pages/story.html?slug=${story.slug}" class="btn btn-primary">Đọc truyện</a>
      </div>
    </article>
  `).join('');
}

/**
 * 🟢 CẬP NHẬT RENDER CHƯƠNG THEO ĐÚNG THUỘC TÍNH CỦA ChapterDTO C#
 * Các trường dữ liệu: id, name, chapterNo
 */
function renderChapters(chapters, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = chapters.map(chapter => `
    <div class="chapter-item">
      <a href="/pages/chapter.html?id=${chapter.id}">
        Chương ${chapter.chapterNo}: ${chapter.name}
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