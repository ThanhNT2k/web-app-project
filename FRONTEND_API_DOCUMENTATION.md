/**
 * ============================================================================
 * FRONTEND API LAYER - API MODULES DOCUMENTATION
 * ============================================================================
 * 
 * Production-ready frontend API modules using vanilla JavaScript ES Modules
 * Built on top of api.js HTTP wrapper with Fetch API
 * 
 * All modules export functions that return Promise objects with:
 * {
 *   success: boolean,
 *   data?: any,          // Response data (if successful)
 *   error?: string,      // Error message (if failed)
 *   pagination?: object  // For list endpoints
 * }
 */

// ============================================================================
// 1. AUTH MODULE (auth.js)
// ============================================================================

import { login, register, logout, getCurrentUser, isAuthenticated, getAuthToken } from './auth.js';

/**
 * register(credentials)
 * POST /api/auth/register
 * Creates a new user account
 * 
 * @param {Object} credentials
 *   - username: string (required)
 *   - email: string (required)
 *   - password: string (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { user: {...}, token: "jwt_token" }
 *   error: string
 * 
 * @example
 * const result = await register({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   password: 'securePassword123'
 * });
 * if (result.success) {
 *   console.log('User created:', result.data.user);
 * }
 */

/**
 * login(credentials)
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 * 
 * @param {Object} credentials
 *   - username: string OR email: string (required)
 *   - password: string (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { user: {...}, token: "jwt_token" }
 *   error: string
 * 
 * @example
 * const result = await login({
 *   email: 'john@example.com',
 *   password: 'securePassword123'
 * });
 * if (result.success) {
 *   console.log('Login successful');
 * }
 */

/**
 * logout()
 * POST /api/auth/logout
 * Clears authentication token
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   warning?: string
 * 
 * @example
 * await logout();
 * window.location.href = '/index.html';
 */

/**
 * getCurrentUser()
 * GET /api/users/profile
 * Fetches current authenticated user info
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { id, username, email, role, avatar, ... }
 *   error: string
 * 
 * @example
 * const result = await getCurrentUser();
 * if (result.success) {
 *   console.log('User:', result.data);
 * }
 */

/**
 * isAuthenticated()
 * Checks if token exists in localStorage
 * 
 * @returns {boolean}
 */

/**
 * getAuthToken()
 * Gets stored JWT token
 * 
 * @returns {string|null}
 */


// ============================================================================
// 2. NOVELS MODULE (novels.js)
// ============================================================================

import {
  getNovels,
  getNovelBySlug,
  searchNovels,
  getTrendingNovels,
  getLatestNovels,
  createNovel,
  updateNovel,
  deleteNovel
} from './novels.js';

/**
 * getNovels(options)
 * GET /api/novels?page=1&limit=12&status=Ongoing&sortBy=created_at
 * Fetches paginated list of novels with filters
 * 
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 *   - status: "Ongoing" | "Completed" | "Hiatus" (optional)
 *   - sortBy: "created_at" | "total_views" | "updated_at" (default: "created_at")
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, title, slug, description, coverImage, ... }]
 *   pagination: { page, limit, total }
 *   error: string
 * 
 * @example
 * const result = await getNovels({ page: 1, limit: 12, status: 'Ongoing' });
 * if (result.success) {
 *   console.log('Novels:', result.data);
 *   console.log('Total:', result.pagination.total);
 * }
 */

/**
 * getNovelBySlug(slug)
 * GET /api/novels/:slug
 * Fetches detailed novel information by URL slug
 * 
 * @param {string} slug - URL-friendly novel identifier
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { id, title, slug, description, coverImage, author, status, genres, views, ... }
 *   error: string
 * 
 * @example
 * const result = await getNovelBySlug('the-great-journey');
 * if (result.success) {
 *   console.log('Novel:', result.data);
 * }
 */

/**
 * searchNovels(query, options)
 * GET /api/novels/search?q=keyword&page=1&limit=12
 * Searches novels by title and author
 * 
 * @param {string} query - Search keyword (required)
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, title, slug, ... }]
 *   pagination: { page, limit, total }
 *   error: string
 * 
 * @example
 * const result = await searchNovels('fantasy', { page: 1, limit: 20 });
 * if (result.success) {
 *   console.log('Search results:', result.data);
 * }
 */

/**
 * getTrendingNovels(options)
 * GET /api/novels?sortBy=total_views
 * Fetches most viewed/popular novels
 * 
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ ... }]
 *   pagination: { page, limit, total }
 *   error: string
 */

/**
 * getLatestNovels(options)
 * GET /api/novels?sortBy=created_at
 * Fetches most recently added novels
 * 
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ ... }]
 *   pagination: { page, limit, total }
 *   error: string
 */


// ============================================================================
// 3. CHAPTERS MODULE (chapters.js)
// ============================================================================

import {
  getNovelChapters,
  getChapterContent,
  createChapter,
  updateChapter,
  deleteChapter
} from './chapters.js';

/**
 * getNovelChapters(novelId)
 * GET /api/chapters/novel/:novelId
 * Fetches all chapters of a novel
 * 
 * @param {string} novelId - Novel ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, chapterNumber, title, views, createdAt, ... }]
 *   error: string
 * 
 * @example
 * const result = await getNovelChapters('novel-uuid');
 * if (result.success) {
 *   console.log('Chapters:', result.data);
 * }
 */

/**
 * getChapterContent(chapterId)
 * GET /api/chapters/:id
 * Fetches chapter content and metadata
 * 
 * @param {string} chapterId - Chapter ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { id, novelId, chapterNumber, title, content, views, ... }
 *   error: string
 * 
 * @example
 * const result = await getChapterContent('chapter-uuid');
 * if (result.success) {
 *   console.log('Content:', result.data.content);
 * }
 */


// ============================================================================
// 4. GENRES MODULE (genres.js)
// ============================================================================

import {
  getGenres,
  getNovelsByGenre
} from './genres.js';

/**
 * getGenres()
 * GET /api/genres
 * Fetches all available genres
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, name, description, ... }]
 *   error: string
 * 
 * @example
 * const result = await getGenres();
 * if (result.success) {
 *   console.log('Genres:', result.data);
 * }
 */

/**
 * getNovelsByGenre(genreId, options)
 * GET /api/genres/:id/novels?page=1&limit=12
 * Fetches novels filtered by genre
 * 
 * @param {string} genreId - Genre ID (required)
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ ... }]
 *   pagination: { page, limit, total }
 *   error: string
 */


// ============================================================================
// 5. COMMENTS MODULE (comments.js)
// ============================================================================

import {
  getComments,
  createComment,
  replyComment,
  updateComment,
  deleteComment
} from './comments.js';

/**
 * getComments(novelId)
 * GET /api/comments/novel/:novelId
 * Fetches comments for a novel (top-level only)
 * 
 * @param {string} novelId - Novel ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, content, author, createdAt, replies: [...], ... }]
 *   error: string
 * 
 * @example
 * const result = await getComments('novel-uuid');
 * if (result.success) {
 *   console.log('Comments:', result.data);
 * }
 */

/**
 * createComment(novelId, commentData)
 * POST /api/comments?novelId=:novelId
 * Creates a new comment
 * 
 * @param {string} novelId - Novel ID (required)
 * @param {Object} commentData
 *   - content: string (required, min 1 char)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { id, content, author, createdAt, ... }
 *   error: string
 * 
 * @example
 * const result = await createComment('novel-uuid', {
 *   content: 'Great story!'
 * });
 */

/**
 * replyComment(novelId, parentCommentId, replyData)
 * POST /api/comments?novelId=:novelId
 * Creates a reply to a comment (threaded)
 * 
 * @param {string} novelId - Novel ID (required)
 * @param {string} parentCommentId - Parent comment ID (required)
 * @param {Object} replyData
 *   - content: string (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { id, content, parentCommentId, ... }
 *   error: string
 */

/**
 * updateComment(commentId, updateData)
 * PUT /api/comments/:id
 * Updates comment (owner only)
 * 
 * @param {string} commentId - Comment ID (required)
 * @param {Object} updateData
 *   - content: string (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { ... }
 *   error: string
 */

/**
 * deleteComment(commentId)
 * DELETE /api/comments/:id
 * Deletes comment (owner only)
 * 
 * @param {string} commentId - Comment ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   error: string
 */


// ============================================================================
// 6. FAVORITES MODULE (favorites.js)
// ============================================================================

import {
  getFavorites,
  followNovel,
  unfollowNovel,
  toggleFavorite
} from './favorites.js';

/**
 * getFavorites()
 * GET /api/users/favorites
 * Fetches user's favorite/followed novels
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, title, ... }]
 *   error: string
 * 
 * @example
 * const result = await getFavorites();
 * if (result.success) {
 *   console.log('Favorites:', result.data);
 * }
 */

/**
 * followNovel(novelId)
 * POST /api/users/favorites
 * Adds novel to favorites
 * 
 * @param {string} novelId - Novel ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { ... }
 *   error: string
 */

/**
 * unfollowNovel(novelId)
 * DELETE /api/users/favorites/:novelId
 * Removes novel from favorites
 * 
 * @param {string} novelId - Novel ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   error: string
 */

/**
 * toggleFavorite(novelId)
 * POST /api/users/favorites
 * Toggles favorite status (add if not present, remove if present)
 * 
 * @param {string} novelId - Novel ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { isFavorited: boolean, ... }
 *   error: string
 */


// ============================================================================
// 7. HISTORY MODULE (history.js)
// ============================================================================

import {
  getHistory,
  saveReadingProgress,
  deleteHistory,
  clearAllHistory
} from './history.js';

/**
 * getHistory()
 * GET /api/users/history
 * Fetches user's reading history
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ id, novelId, chapterId, progress, lastReadAt, ... }]
 *   error: string
 * 
 * @example
 * const result = await getHistory();
 * if (result.success) {
 *   console.log('History:', result.data);
 * }
 */

/**
 * saveReadingProgress(progressData)
 * POST /api/users/history
 * Saves or updates reading progress (upsert)
 * 
 * @param {Object} progressData
 *   - novelId: string (required)
 *   - chapterId: string (required)
 *   - progress: number (optional, 0-100)
 *   - lastReadAt: string (optional, ISO datetime)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { ... }
 *   error: string
 * 
 * @example
 * const result = await saveReadingProgress({
 *   novelId: 'novel-uuid',
 *   chapterId: 'chapter-uuid',
 *   progress: 75
 * });
 */

/**
 * deleteHistory(historyId)
 * DELETE /api/users/history/:historyId
 * Deletes a history record
 * 
 * @param {string} historyId - History record ID (required)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   error: string
 */

/**
 * clearAllHistory()
 * Deletes all reading history records
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   error: string
 */


// ============================================================================
// 8. USERS MODULE (users.js)
// ============================================================================

import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getReadingHistory,
  getUserFavorites
} from './users.js';

/**
 * getProfile()
 * GET /api/users/profile
 * Fetches current user profile
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { id, username, email, avatar, role, createdAt, ... }
 *   error: string
 * 
 * @example
 * const result = await getProfile();
 * if (result.success) {
 *   console.log('Profile:', result.data);
 * }
 */

/**
 * updateProfile(profileData)
 * PUT /api/users/profile
 * Updates user profile information
 * 
 * @param {Object} profileData
 *   - username: string (optional)
 *   - email: string (optional)
 *   - avatar: string (optional, URL)
 *   - bio: string (optional)
 *   - ... other profile fields
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { ... updated user data ... }
 *   error: string
 * 
 * @example
 * const result = await updateProfile({
 *   username: 'new_username',
 *   bio: 'I love reading novels'
 * });
 */

/**
 * uploadAvatar(file)
 * POST /api/users/avatar (multipart/form-data)
 * Uploads user avatar image
 * 
 * @param {File} file - Image file (required)
 *   Accepted: JPEG, PNG, GIF, WebP
 *   Max size: 5MB
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: { avatarUrl: string, ... }
 *   error: string
 * 
 * @example
 * const file = document.getElementById('file-input').files[0];
 * const result = await uploadAvatar(file);
 */

/**
 * changePassword(passwordData)
 * POST /api/users/change-password
 * Changes user password
 * 
 * @param {Object} passwordData
 *   - currentPassword: string (required)
 *   - newPassword: string (required)
 *   - confirmPassword: string (required, must match newPassword)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   error: string
 * 
 * @example
 * const result = await changePassword({
 *   currentPassword: 'oldPassword123',
 *   newPassword: 'newPassword456',
 *   confirmPassword: 'newPassword456'
 * });
 */

/**
 * getReadingHistory(options)
 * GET /api/users/history?page=1&limit=20
 * Fetches paginated reading history
 * 
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ ... }]
 *   pagination: { page, limit, total }
 *   error: string
 */

/**
 * getUserFavorites(options)
 * GET /api/users/favorites?page=1&limit=12
 * Fetches paginated favorites
 * 
 * @param {Object} options (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 * 
 * @returns {Promise<Object>}
 *   success: true | false
 *   data: [{ ... }]
 *   pagination: { page, limit, total }
 *   error: string
 */


// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example: Complete user flow
 */

// 1. Register new user
// const registerResult = await register({
//   username: 'john_doe',
//   email: 'john@example.com',
//   password: 'securePassword123'
// });

// 2. Login
// const loginResult = await login({
//   email: 'john@example.com',
//   password: 'securePassword123'
// });

// 3. Browse novels
// const novelsResult = await getLatestNovels({ page: 1, limit: 12 });

// 4. Get novel detail
// const novelResult = await getNovelBySlug('the-great-journey');

// 5. Get chapters
// const chaptersResult = await getNovelChapters(novelResult.data.id);

// 6. Read chapter
// const chapterResult = await getChapterContent(chaptersResult.data[0].id);

// 7. Save reading progress
// await saveReadingProgress({
//   novelId: novelResult.data.id,
//   chapterId: chapterResult.data.id,
//   progress: 100
// });

// 8. Leave comment
// await createComment(novelResult.data.id, {
//   content: 'Great novel!'
// });

// 9. Follow novel
// await followNovel(novelResult.data.id);

// 10. Get user profile
// const profileResult = await getProfile();

// 11. Logout
// await logout();


// ============================================================================
// ERROR HANDLING PATTERNS
// ============================================================================

/**
 * All API functions return objects with this structure:
 * {
 *   success: boolean,
 *   data?: any,
 *   error?: string,
 *   pagination?: { page, limit, total }
 * }
 * 
 * Standard error handling pattern:
 * 
 * const result = await someFunction(...);
 * if (result.success) {
 *   // Process result.data
 *   console.log(result.data);
 * } else {
 *   // Handle error
 *   console.error(result.error);
 *   showErrorNotification(result.error);
 * }
 * 
 * Common error cases:
 * - 401 Unauthorized: User not authenticated (check token)
 * - 403 Forbidden: Insufficient permissions
 * - 404 Not Found: Resource doesn't exist
 * - 500 Server Error: Backend issue
 * - Network Error: Connection issues
 */


// ============================================================================
// AUTHENTICATION FLOW
// ============================================================================

/**
 * The auth.js module provides token management via localStorage:
 * 
 * 1. Register/Login: Token automatically stored via setToken()
 * 2. Subsequent requests: Token auto-included in Authorization header
 * 3. Logout: Token cleared via clearToken()
 * 4. Check auth: Use isAuthenticated() or getAuthToken()
 * 
 * Token persists across page refreshes (stored in localStorage)
 * Token included automatically in all API calls via api.js
 */
