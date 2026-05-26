/**
 * 🟢 RENDER DANH SÁCH TRUYỆN TRANH
 * Đảm bảo tên thuộc tính khớp với C# (thường là PascalCase nếu không cấu hình JSON CamelCase)
 */
function renderComics(comics, containerId) {
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
function renderChapters(chapters, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!chapters || chapters.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center; color:#6b7280; padding: 20px;">Truyện hiện chưa có chương nào.</p>';
    return;
  }

  // Sắp xếp chương từ cao xuống thấp (Chương mới nhất trước)
  const sortedChapters = [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber);

  container.innerHTML = sortedChapters.map(chapter => `
    <div class="chapter-item" style="padding: 12px; border-bottom: 1px solid var(--border-color);">
      <a href="/pages/chapter.html?id=${chapter.id}" style="text-decoration: none; color: var(--text-dark); font-weight: 500;">
        Chương ${chapter.chapterNumber}: ${chapter.title || 'Chương mới cập nhật'}
      </a>
    </div>
  `).join('');
}