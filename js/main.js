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

// Đóng/Mở Modal
window.toggleAuthModal = function(show) {
    document.getElementById('auth-modal').style.display = show ? 'flex' : 'none';
}

// Chuyển đổi giữa Login và Register
window.switchForm = function(type) {
    const container = document.getElementById('auth-form-container');
    const title = document.getElementById('modal-title');
    if (type === 'register') {
        if(title) title.innerText = "Đăng Ký";
        container.innerHTML = `
            <form>
                <div class="form-group"><input type="text" placeholder="Tên đăng nhập" required></div>
                <div class="form-group"><input type="email" placeholder="Email" required></div>
                <div class="form-group"><input type="password" placeholder="Mật khẩu" required></div>
                <button class="btn btn-primary">Đăng Ký</button>
            </form>
            <p style="margin-top: 1rem; text-align: center;">Đã có tài khoản? <a href="#" onclick="switchForm('login')">Đăng nhập</a></p>
        `;
    } else {
        location.reload(); 
    }
}