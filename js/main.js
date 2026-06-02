/**
 * 🟢 RENDER DANH SÁCH TRUYỆN TRANH
 */
window.renderComics = function(comics, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!comics || comics.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center; color:#6b7280; padding: 20px;">Không tìm thấy truyện nào.</p>';
    return;
  }

  container.innerHTML = comics.map(comic => `
    <article class="story-card">
      <div class="story-image">
        <img src="${comic.coverUrl || comic.cover_url || '/assets/placeholder.jpg'}" alt="${comic.title}">
      </div>
      <div class="story-info">
        <h3 class="story-title">
          <a href="/pages/comic.html?slug=${comic.slug}">${comic.title}</a>
        </h3>
        <div class="story-meta">
          <span class="story-status">${comic.status || 'Ongoing'}</span>
          <span class="story-views">👁️ ${comic.views || comic.totalViews || 0}</span>
        </div>
      </div>
    </article>
  `).join('');
}

/**
 * 🟢 RENDER DANH SÁCH CHƯƠNG TRUYỆN
 */
window.renderChapters = function(chapters, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!chapters || chapters.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center; color:#6b7280; padding: 20px;">Truyện hiện chưa có chương nào.</p>';
    return;
  }

  const sortedChapters = [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber);

  container.innerHTML = sortedChapters.map(chapter => `
    <div class="chapter-item" style="padding: 12px; border-bottom: 1px solid var(--border-color);">
      <a href="/pages/chapter.html?id=${chapter.id}" style="text-decoration: none; color: var(--text-dark); font-weight: 500;">
        Chương ${chapter.chapterNumber}: ${chapter.title || 'Chương mới cập nhật'}
      </a>
    </div>
  `).join('');
}

// =============================================
// 🟢 PROFILE MANAGEMENT & AUTHENTICATION UI
// =============================================

/**
 * Cập nhật giao diện dựa trên trạng thái xác thực
 */
window.updateAuthUI = function() {
    const token = localStorage.getItem('token');
    const authLinks = document.getElementById('auth-links');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (token) {
        // Người dùng đã đăng nhập
        if (authLinks) authLinks.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'flex';
        
        // Tải ảnh đại diện
        window.loadUserAvatar();
    } else {
        // Người dùng chưa đăng nhập
        if (authLinks) authLinks.style.display = 'block';
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

/**
 * Tải ảnh đại diện người dùng
 */
window.loadUserAvatar = function() {
    const avatarImg = document.getElementById('profile-avatar');
    if (!avatarImg) return;

    // Lấy ảnh từ localStorage hoặc dùng ảnh mặc định
    const userAvatar = localStorage.getItem('userAvatar') || '/assets/default-avatar.svg';
    avatarImg.src = userAvatar;
}

/**
 * Chuyển đổi hiển thị Profile Menu
 */
window.toggleProfileMenu = function() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.classList.toggle('show');
    }
}

/**
 * Đóng Profile Menu khi click bên ngoài
 */
document.addEventListener('click', function(event) {
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');
    
    if (profileDropdown && !profileDropdown.contains(event.target)) {
        if (profileMenu && profileMenu.classList.contains('show')) {
            profileMenu.classList.remove('show');
        }
    }
});

/**
 * Hàm Đăng xuất
 */
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.reload();
}

/**
 * Khởi tạo khi trang load
 */
document.addEventListener('DOMContentLoaded', function() {
    window.updateAuthUI();
});
