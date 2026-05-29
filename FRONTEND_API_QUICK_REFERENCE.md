# Frontend API - Quick Reference Guide

## 🔑 Quick Import Reference

```javascript
// Authentication
import { register, login, logout } from './js/auth.js';

// Comics
import { 
  getComics, 
  getComicBySlug, 
  searchComics,
  getTrendingComics,
  getLatestComics,
  createComic,        // Uploader/Admin
  updateComic,        // Uploader/Admin
  deleteComic         // Uploader/Admin
} from './js/novels.js';

// Chapters
import { 
  getComicChapters, 
  getChapterContent,
  createChapter,      // Uploader/Admin
  updateChapter,      // Uploader/Admin
  deleteChapter       // Uploader/Admin
} from './js/chapters.js';

// Genres
import { 
  getGenres,
  getComicsByGenre 
} from './js/genres.js';

// Comments
import { 
  getComments,
  createComment,
  replyComment,
  updateComment,
  deleteComment 
} from './js/comments.js';

// Follows/Favorites
import { 
  getFavorites,
  followComic,
  unfollowComic 
} from './js/favorites.js';

// Reading History
import { 
  getHistory,
  saveReadingProgress,
  deleteHistory 
} from './js/history.js';

// User Profile & Account
import { 
  getProfile,
  updateProfile,        // NEW
  uploadAvatar,         // NEW
  changePassword,       // NEW
  getReadingHistory,
  saveReadingProgress,
  getPersonalizedRecommendations  // NEW
} from './js/users.js';
```

---

## 📋 Common Use Cases

### Authentication Flow
```javascript
// 1. Register
const regResult = await register({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'secure123'
});

// 2. Login
const loginResult = await login({
  email: 'john@example.com',
  password: 'secure123'
});
// Token stored automatically in localStorage

// 3. Logout (anywhere in app)
await logout();
// Token cleared automatically
```

### Browse Comics
```javascript
// Get all comics (paginated)
const result = await getComics({ page: 1, limit: 12 });
// Returns: { success: true, data: [...], pagination: {...} }

// Search comics
const search = await searchComics('action', { page: 1, limit: 12 });

// Get trending
const trending = await getTrendingComics({ limit: 6 });

// Get latest
const latest = await getLatestComics({ limit: 6 });

// Get novels with filter
const ongoing = await getNovels({ 
  page: 1, 
  limit: 12, 
  status: 'Ongoing' 
});

// Get novel detail by slug
const novel = await getNovelBySlug('the-great-journey');
console.log(novel.data.description);

// Search novels
const search = await searchNovels('fantasy', { page: 1, limit: 20 });


// ============================================================================
// 3. CHAPTERS & READING
// ============================================================================

import { 
  getNovelChapters, 
  getChapterContent 
} from './chapters.js';

// Get all chapters of a novel
const chapters = await getNovelChapters('novel-id');
chapters.data.forEach(ch => console.log(`Ch ${ch.chapterNumber}: ${ch.title}`));

// Get chapter content
const chapter = await getChapterContent('chapter-id');
console.log(chapter.data.content);


// ============================================================================
// 4. READING PROGRESS
// ============================================================================

import { 
  getHistory, 
  saveReadingProgress, 
  deleteHistory 
} from './history.js';

// Save reading progress
await saveReadingProgress({
  novelId: 'novel-id',
  chapterId: 'chapter-id',
  progress: 75
});

// Get reading history
const history = await getHistory();
console.log('Last read:', history.data[0].lastReadAt);

// Delete history record
await deleteHistory('history-id');


// ============================================================================
// 5. FAVORITES & FOLLOWING
// ============================================================================

import { 
  getFavorites, 
  followNovel, 
  unfollowNovel 
} from './favorites.js';

// Get user's favorites
const favorites = await getFavorites();
console.log('Following:', favorites.data.length, 'novels');

// Follow a novel
await followNovel('novel-id');

// Unfollow a novel
await unfollowNovel('novel-id');


// ============================================================================
// 6. COMMENTS
// ============================================================================

import { 
  getComments, 
  createComment, 
  replyComment, 
  updateComment, 
  deleteComment 
} from './comments.js';

// Get comments
const comments = await getComments('novel-id');
console.log(comments.data.length, 'comments');

// Create comment
await createComment('novel-id', {
  content: 'Great novel! Love it!'
});

// Reply to comment
await replyComment('novel-id', 'parent-comment-id', {
  content: 'I agree!'
});

// Update comment
await updateComment('comment-id', {
  content: 'Updated comment text'
});

// Delete comment
await deleteComment('comment-id');


// ============================================================================
// 7. USER PROFILE
// ============================================================================

import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  changePassword 
} from './users.js';

// Get profile
const profile = await getProfile();
console.log('Username:', profile.data.username);

// Update profile
await updateProfile({
  username: 'new_username',
  bio: 'I love reading'
});

// Upload avatar
const file = document.getElementById('avatar-input').files[0];
await uploadAvatar(file);

// Change password
await changePassword({
  currentPassword: 'oldPassword123',
  newPassword: 'newPassword456',
  confirmPassword: 'newPassword456'
});


// ============================================================================
// 8. GENRES
// ============================================================================

import { 
  getGenres, 
  getNovelsByGenre 
} from './genres.js';

// Get all genres
const genres = await getGenres();
genres.data.forEach(g => console.log(g.name));

// Get novels by genre
const fantasyNovels = await getNovelsByGenre('genre-id', { page: 1, limit: 12 });


// ============================================================================
// 9. ERROR HANDLING PATTERN
// ============================================================================

async function apiWithErrorHandling() {
  try {
    const result = await someApiFunction();
    
    if (!result.success) {
      console.error('API Error:', result.error);
      showErrorNotification(result.error);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('Network Error:', error.message);
    showErrorNotification('Network error. Please try again.');
    return null;
  }
}


// ============================================================================
// 10. COMPLETE PAGE EXAMPLE: NOVEL DETAIL
// ============================================================================

import { getNovelBySlug } from './novels.js';
import { getNovelChapters } from './chapters.js';
import { followNovel } from './favorites.js';
import { getComments, createComment } from './comments.js';

async function loadNovelPage() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  
  // Load novel
  const novelRes = await getNovelBySlug(slug);
  if (!novelRes.success) {
    alert('Novel not found');
    return;
  }
  
  const novel = novelRes.data;
  
  // Render novel
  document.getElementById('title').textContent = novel.title;
  document.getElementById('cover').src = novel.coverImage;
  document.getElementById('description').textContent = novel.description;
  
  // Load chapters
  const chaptersRes = await getNovelChapters(novel.id);
  if (chaptersRes.success) {
    const html = chaptersRes.data.map(ch => 
      `<li><a href="/read/${ch.id}">Ch ${ch.chapterNumber}: ${ch.title}</a></li>`
    ).join('');
    document.getElementById('chapters').innerHTML = `<ul>${html}</ul>`;
  }
  
  // Load comments
  const commentsRes = await getComments(novel.id);
  if (commentsRes.success) {
    renderComments(commentsRes.data);
  }
  
  // Setup follow button
  document.getElementById('follow-btn').onclick = async () => {
    const res = await followNovel(novel.id);
    if (res.success) {
      alert('Following this novel!');
      document.getElementById('follow-btn').disabled = true;
    }
  };
  
  // Setup comment form
  document.getElementById('comment-form').onsubmit = async (e) => {
    e.preventDefault();
    const content = document.getElementById('comment-input').value;
    
    const res = await createComment(novel.id, { content });
    if (res.success) {
      document.getElementById('comment-input').value = '';
      // Reload comments
      const updated = await getComments(novel.id);
      renderComments(updated.data);
    }
  };
}

function renderComments(comments) {
  const html = comments.map(c => `
    <div class="comment">
      <strong>${c.author.username}</strong>
      <p>${c.content}</p>
      <small>${new Date(c.createdAt).toLocaleDateString()}</small>
    </div>
  `).join('');
  document.getElementById('comments').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadNovelPage);


// ============================================================================
// 11. COMPLETE PAGE EXAMPLE: USER PROFILE
// ============================================================================

import { getProfile, updateProfile, uploadAvatar, changePassword } from './users.js';
import { isAuthenticated } from './auth.js';

async function loadProfilePage() {
  // Check auth
  if (!isAuthenticated()) {
    window.location.href = '/pages/account.html';
    return;
  }
  
  // Load profile
  const profileRes = await getProfile();
  if (!profileRes.success) {
    alert('Failed to load profile');
    return;
  }
  
  const profile = profileRes.data;
  
  // Render profile
  document.getElementById('username').value = profile.username;
  document.getElementById('email').textContent = profile.email;
  document.getElementById('avatar').src = profile.avatar;
  
  // Update profile form
  document.getElementById('profile-form').onsubmit = async (e) => {
    e.preventDefault();
    const res = await updateProfile({
      username: document.getElementById('username').value
    });
    if (res.success) alert('Profile updated!');
  };
  
  // Avatar upload
  document.getElementById('avatar-input').onchange = async (e) => {
    const res = await uploadAvatar(e.target.files[0]);
    if (res.success) {
      document.getElementById('avatar').src = res.data.avatarUrl;
      alert('Avatar updated!');
    }
  };
  
  // Password change
  document.getElementById('password-form').onsubmit = async (e) => {
    e.preventDefault();
    const res = await changePassword({
      currentPassword: document.getElementById('current-pwd').value,
      newPassword: document.getElementById('new-pwd').value,
      confirmPassword: document.getElementById('confirm-pwd').value
    });
    if (res.success) {
      alert('Password changed!');
      document.getElementById('password-form').reset();
    } else {
      alert('Error: ' + res.error);
    }
  };
}

document.addEventListener('DOMContentLoaded', loadProfilePage);


// ============================================================================
// 12. API CALL HELPER
// ============================================================================

/**
 * Safe API call wrapper with error handling
 */
async function callApi(apiFunction, ...args) {
  try {
    const result = await apiFunction(...args);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  } catch (error) {
    if (error.message.includes('401')) {
      // Token expired
      window.location.href = '/pages/account.html';
    }
    
    console.error('API Error:', error.message);
    return null;
  }
}

// Usage:
// const user = await callApi(getCurrentUser);
// const novels = await callApi(getNovels, { page: 1, limit: 12 });


// ============================================================================
// 13. PAGINATION HELPER
// ============================================================================

async function loadMoreNovels(page = 1) {
  const result = await getNovels({ 
    page, 
    limit: 12 
  });
  
  if (result.success) {
    console.log(`Page ${page} of ${Math.ceil(result.pagination.total / 12)}`);
    return result.data;
  }
  
  return [];
}


// ============================================================================
// 14. SEARCH WITH DEBOUNCE
// ============================================================================

let searchTimeout;

document.getElementById('search-input').oninput = (e) => {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    const query = e.target.value;
    if (!query) return;
    
    const result = await searchNovels(query, { page: 1, limit: 20 });
    if (result.success) {
      renderSearchResults(result.data);
    }
  }, 300); // Wait 300ms after user stops typing
};


// ============================================================================
// STATUS CODES & COMMON ERRORS
// ============================================================================

/*
200 OK - Request successful
201 Created - Resource created
400 Bad Request - Invalid input
401 Unauthorized - Not authenticated / Token expired
403 Forbidden - Insufficient permissions
404 Not Found - Resource doesn't exist
500 Server Error - Backend error
Network Error - Connection issues
*/


// ============================================================================
// HELPFUL CONSOLE DEBUGGING
// ============================================================================

// Check if authenticated
console.log(isAuthenticated());

// Get stored token
import { getToken } from './auth.js';
console.log('Token:', getToken());

// Check API response structure
const res = await getNovels();
console.log('Response structure:', res);
console.log('Pagination:', res.pagination);
console.log('Data:', res.data);
