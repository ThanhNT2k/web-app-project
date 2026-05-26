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
    // Người dùng đã đăng nhập - hiển thị tên và nút đăng xuất
    authLinksContainer.innerHTML = `
      <div class="user-menu">
        <span class="user-name">${user.userName || 'Người dùng'}</span>
        <a href="/pages/profile.html" class="nav-link">Profile</a>
        ${isAdmin() ? '<a href="/pages/admin.html" class="nav-link">Admin</a>' : ''}
        <button onclick="logout()" class="nav-link logout-btn">Đăng xuất</button>
      </div>
    `;
  } else {
    // Chưa đăng nhập - hiển thị nút đăng nhập/đăng ký
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
  // Handle navigation
  const navLinks = document.querySelectorAll('a[data-page]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateToPage(page);
    });
  });

  // Handle logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

/**
 * Điều hướng tới trang khác
 * @param {string} page - Tên trang
 */
function navigateToPage(page) {
  window.location.href = `/pages/${page}.html`;
}

/**
 * Hiển thị thông báo (Toast/Alert)
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo: 'success', 'error', 'info'
 */
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
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Format ngày tháng năm
 * @param {string} dateString - Chuỗi ngày tháng
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Cắt ngắn văn bản
 * @param {string} text - Văn bản cần cắt
 * @param {number} length - Độ dài tối đa
 */
function truncateText(text, length = 100) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Render danh sách truyện thành HTML
 * @param {array} stories - Danh sách truyện
 * @param {string} containerId - ID container để render
 */
function renderStories(stories, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = stories.map(story => `
    <article class="story-card">
      <div class="story-image">
        <img src="${story.coverImage || '/assets/placeholder.jpg'}" alt="${story.title}">
      </div>
      <div class="story-info">
        <h3 class="story-title">
          <a href="/pages/story.html?id=${story.id}">${story.title}</a>
        </h3>
        <p class="story-author">Tác giả: ${story.author}</p>
        <p class="story-genre">Thể loại: ${story.genre}</p>
        <div class="story-meta">
          <span class="story-status">${story.status}</span>
          <span class="story-rating">⭐ ${story.rating || 'N/A'}</span>
        </div>
        <p class="story-description">${truncateText(story.description, 150)}</p>
        <a href="/pages/story.html?id=${story.id}" class="btn btn-primary">Đọc truyện</a>
      </div>
    </article>
  `).join('');
}

/**
 * Render danh sách thể loại thành HTML
 * @param {array} genres - Danh sách thể loại
 * @param {string} containerId - ID container để render
 */
function renderGenres(genres, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = genres.map(genre => `
    <div class="genre-card">
      <h3>${genre.name}</h3>
      <p>${genre.description}</p>
      <a href="/pages/story.html?genre=${genre.id}" class="btn btn-secondary">
        Xem truyện (${genre.storyCount || 0})
      </a>
    </div>
  `).join('');
}

/**
 * Lấy query parameter từ URL
 * @param {string} param - Tên parameter
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Xây dựng URL với query parameters
 * @param {string} baseUrl - URL cơ bản
 * @param {object} params - Object chứa các parameters
 */
function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
}

/**
 * Gọi API với xử lý loading
 * @param {function} apiFunc - Hàm API cần gọi
 * @param {string} loadingContainerId - ID container hiển thị loading
 */
async function callApiWithLoading(apiFunc, loadingContainerId = null) {
  try {
    if (loadingContainerId) {
      const container = document.getElementById(loadingContainerId);
      if (container) container.innerHTML = '<div class="loading">Đang tải...</div>';
    }
    
    const result = await apiFunc();
    return result;
  } catch (error) {
    showNotification(`Lỗi: ${error.message}`, 'error');
    if (loadingContainerId) {
      const container = document.getElementById(loadingContainerId);
      if (container) container.innerHTML = `<div class="error">Lỗi tải dữ liệu: ${error.message}</div>`;
    }
    throw error;
  }
}
