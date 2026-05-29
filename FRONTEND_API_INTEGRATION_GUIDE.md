/**
 * ============================================================================
 * FRONTEND API INTEGRATION GUIDE
 * ============================================================================
 * 
 * Quick reference for integrating API modules into your frontend
 */

// ============================================================================
// 1. HTML SETUP (add to index.html or main template)
// ============================================================================

/**
 * Enable ES Modules in HTML:
 * 
 * <script type="module" src="/js/main.js"></script>
 * 
 * Or import directly in your JavaScript files:
 * 
 * import { login, register } from './auth.js';
 * import { getNovels, getNovelBySlug } from './novels.js';
 * ... etc
 */


// ============================================================================
// 2. BASIC SETUP IN YOUR MAIN APPLICATION
// ============================================================================

/**
 * File: js/app.js
 */

import { isAuthenticated, getCurrentUser } from './auth.js';
import { getNovels } from './novels.js';

/**
 * Initialize app on page load
 */
async function initializeApp() {
  // 1. Check if user is logged in
  if (isAuthenticated()) {
    try {
      const userResult = await getCurrentUser();
      if (userResult.success) {
        console.log('Logged in user:', userResult.data.username);
        updateNavbar(userResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  // 2. Load initial data
  await loadHomepage();
}

/**
 * Update navbar with user info
 */
function updateNavbar(user) {
  const userMenu = document.getElementById('user-menu');
  if (userMenu) {
    userMenu.innerHTML = `
      <span class="user-name">${user.username}</span>
      <img src="${user.avatar}" alt="Avatar" class="user-avatar">
      <a href="/pages/profile.html">Profile</a>
      <a href="#" onclick="handleLogout()">Logout</a>
    `;
  }
}

/**
 * Load homepage data
 */
async function loadHomepage() {
  try {
    // Get latest novels
    const latestResult = await getNovels({ page: 1, limit: 12 });
    if (latestResult.success) {
      renderNovels(latestResult.data, 'latest-section');
    }

    // Get trending novels
    const trendingResult = await getNovels({
      page: 1,
      limit: 12,
      sortBy: 'total_views'
    });
    if (trendingResult.success) {
      renderNovels(trendingResult.data, 'trending-section');
    }
  } catch (error) {
    console.error('Failed to load homepage:', error);
  }
}

/**
 * Render novels to DOM
 */
function renderNovels(novels, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = novels.map(novel => `
    <div class="novel-card">
      <img src="${novel.coverImage}" alt="${novel.title}">
      <h3>${novel.title}</h3>
      <p class="author">${novel.author}</p>
      <p class="status">${novel.status}</p>
      <a href="/pages/story.html?slug=${novel.slug}" class="btn">Read</a>
    </div>
  `).join('');
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeApp);


// ============================================================================
// 3. LOGIN/REGISTER PAGE EXAMPLE
// ============================================================================

/**
 * File: pages/account.html + js/account-handler.js
 */

import { login, register } from './auth.js';

// Handle login form submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const result = await login({ email, password });

    if (result.success) {
      // Login successful
      alert('Welcome back, ' + result.data.user.username);
      window.location.href = '/index.html';
    } else {
      // Show error
      alert('Login failed: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Handle register form submission
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const result = await register({
      username,
      email,
      password
    });

    if (result.success) {
      alert('Account created! Welcome ' + result.data.user.username);
      window.location.href = '/index.html';
    } else {
      alert('Registration failed: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});


// ============================================================================
// 4. NOVEL DETAIL PAGE EXAMPLE
// ============================================================================

/**
 * File: pages/story.html + js/story-handler.js
 */

import { getNovelBySlug } from './novels.js';
import { getNovelChapters } from './chapters.js';
import { followNovel, unfollowNovel } from './favorites.js';

async function loadNovelDetail() {
  // Get slug from URL
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    document.body.innerHTML = '<h2>Novel not found</h2>';
    return;
  }

  try {
    // Fetch novel details
    const novelResult = await getNovelBySlug(slug);
    if (!novelResult.success) {
      throw new Error(novelResult.error);
    }

    const novel = novelResult.data;

    // Render novel header
    document.getElementById('novel-cover').src = novel.coverImage;
    document.getElementById('novel-title').textContent = novel.title;
    document.getElementById('novel-author').textContent = 'By: ' + novel.author;
    document.getElementById('novel-description').textContent = novel.description;
    document.getElementById('novel-status').textContent = novel.status;
    document.getElementById('novel-views').textContent = novel.views + ' views';

    // Fetch and render chapters
    const chaptersResult = await getNovelChapters(novel.id);
    if (chaptersResult.success) {
      const chaptersHtml = chaptersResult.data.map(chapter => `
        <li>
          <a href="/pages/story.html?chapterId=${chapter.id}">
            Chapter ${chapter.chapterNumber}: ${chapter.title}
          </a>
          <span class="views">${chapter.views} views</span>
        </li>
      `).join('');

      document.getElementById('chapters-list').innerHTML = `<ul>${chaptersHtml}</ul>`;
    }

    // Setup follow button
    const followBtn = document.getElementById('follow-btn');
    followBtn.addEventListener('click', async () => {
      const result = await followNovel(novel.id);
      if (result.success) {
        followBtn.textContent = 'Following';
        followBtn.disabled = true;
      }
    });
  } catch (error) {
    document.body.innerHTML = `<h2>Error: ${error.message}</h2>`;
  }
}

document.addEventListener('DOMContentLoaded', loadNovelDetail);


// ============================================================================
// 5. CHAPTER READING PAGE EXAMPLE
// ============================================================================

/**
 * File: pages/reader.html + js/reader-handler.js
 */

import { getChapterContent } from './chapters.js';
import { saveReadingProgress } from './history.js';
import { getComments, createComment } from './comments.js';

async function loadChapter() {
  const params = new URLSearchParams(window.location.search);
  const chapterId = params.get('id');
  const novelId = params.get('novelId');

  if (!chapterId || !novelId) {
    document.body.innerHTML = '<h2>Chapter not found</h2>';
    return;
  }

  try {
    // Fetch chapter content
    const result = await getChapterContent(chapterId);
    if (!result.success) throw new Error(result.error);

    const chapter = result.data;

    // Render chapter
    document.getElementById('chapter-title').textContent =
      `Chapter ${chapter.chapterNumber}: ${chapter.title}`;
    document.getElementById('chapter-content').innerHTML = chapter.content;

    // Save reading progress
    await saveReadingProgress({
      novelId,
      chapterId,
      progress: 100
    });

    // Load comments
    const commentsResult = await getComments(novelId);
    if (commentsResult.success) {
      renderComments(commentsResult.data);
    }

    // Setup comment form
    document.getElementById('comment-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = document.getElementById('comment-input').value;

      const commentResult = await createComment(novelId, { content });
      if (commentResult.success) {
        document.getElementById('comment-input').value = '';
        // Reload comments
        const updated = await getComments(novelId);
        if (updated.success) renderComments(updated.data);
      }
    });
  } catch (error) {
    document.body.innerHTML = `<h2>Error: ${error.message}</h2>`;
  }
}

function renderComments(comments) {
  const commentsContainer = document.getElementById('comments-container');
  commentsContainer.innerHTML = comments.map(comment => `
    <div class="comment">
      <strong>${comment.author.username}</strong>
      <p>${comment.content}</p>
      <small>${new Date(comment.createdAt).toLocaleDateString()}</small>
      ${comment.replies?.map(reply => `
        <div class="reply">
          <strong>${reply.author.username}</strong>
          <p>${reply.content}</p>
        </div>
      `).join('') || ''}
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadChapter);


// ============================================================================
// 6. USER PROFILE PAGE EXAMPLE
// ============================================================================

/**
 * File: pages/profile.html + js/profile-handler.js
 */

import { getProfile, updateProfile, uploadAvatar, changePassword } from './users.js';
import { getReadingHistory, getUserFavorites } from './users.js';
import { isAuthenticated } from './auth.js';

async function loadUserProfile() {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = '/pages/account.html';
    return;
  }

  try {
    // Get profile
    const profileResult = await getProfile();
    if (!profileResult.success) throw new Error(profileResult.error);

    const user = profileResult.data;

    // Render profile
    document.getElementById('username').value = user.username;
    document.getElementById('email').textContent = user.email;
    document.getElementById('avatar').src = user.avatar;
    document.getElementById('role').textContent = user.role;

    // Load reading history
    const historyResult = await getReadingHistory({ page: 1, limit: 10 });
    if (historyResult.success) {
      renderHistory(historyResult.data);
    }

    // Load favorites
    const favoritesResult = await getUserFavorites({ page: 1, limit: 10 });
    if (favoritesResult.success) {
      renderFavorites(favoritesResult.data);
    }

    // Setup profile update form
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = await updateProfile({
        username: document.getElementById('username').value
      });
      if (result.success) {
        alert('Profile updated');
      }
    });

    // Setup avatar upload
    document.getElementById('avatar-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const result = await uploadAvatar(file);
        if (result.success) {
          document.getElementById('avatar').src = result.data.avatarUrl;
          alert('Avatar uploaded');
        }
      }
    });

    // Setup password change
    document.getElementById('password-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = await changePassword({
        currentPassword: document.getElementById('current-password').value,
        newPassword: document.getElementById('new-password').value,
        confirmPassword: document.getElementById('confirm-password').value
      });
      if (result.success) {
        alert('Password changed');
        document.getElementById('password-form').reset();
      } else {
        alert('Error: ' + result.error);
      }
    });
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function renderHistory(history) {
  const container = document.getElementById('reading-history');
  container.innerHTML = history.map(record => `
    <div class="history-item">
      <h4>${record.novel.title}</h4>
      <p>Chapter ${record.chapter.chapterNumber}</p>
      <small>${new Date(record.lastReadAt).toLocaleDateString()}</small>
    </div>
  `).join('');
}

function renderFavorites(favorites) {
  const container = document.getElementById('favorites');
  container.innerHTML = favorites.map(novel => `
    <div class="favorite-item">
      <img src="${novel.coverImage}" alt="${novel.title}">
      <h4>${novel.title}</h4>
      <a href="/pages/story.html?slug=${novel.slug}">Read</a>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadUserProfile);


// ============================================================================
// 7. ERROR HANDLING PATTERNS
// ============================================================================

/**
 * Global error handler for all API calls
 */
async function safeApiCall(apiFunction, ...args) {
  try {
    const result = await apiFunction(...args);

    if (!result.success) {
      handleApiError(result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    handleApiError(error.message);
    return null;
  }
}

function handleApiError(error) {
  // Check for common errors
  if (error.includes('401') || error.includes('Unauthorized')) {
    alert('Session expired. Please login again.');
    window.location.href = '/pages/account.html';
    return;
  }

  if (error.includes('403') || error.includes('Forbidden')) {
    alert('You do not have permission to perform this action.');
    return;
  }

  if (error.includes('404') || error.includes('Not Found')) {
    alert('Resource not found.');
    return;
  }

  // Show generic error
  alert('Error: ' + error);

  // Log to console for debugging
  console.error('API Error:', error);
}


// ============================================================================
// 8. BEST PRACTICES
// ============================================================================

/**
 * ✓ DO:
 * - Always check result.success before using result.data
 * - Handle errors gracefully with try/catch
 * - Show user-friendly error messages
 * - Use loading indicators during API calls
 * - Cache data when appropriate
 * - Validate user input before sending to API
 * 
 * ✗ DON'T:
 * - Assume API call succeeded without checking result.success
 * - Expose error details to end users
 * - Make multiple API calls in tight loops
 * - Send sensitive data in URL parameters
 * - Forget to handle network errors
 * - Make blocking API calls on main thread
 */
