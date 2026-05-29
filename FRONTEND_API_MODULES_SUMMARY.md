# Frontend API Modules - Summary

## Overview

This project includes 8 production-ready frontend API modules using vanilla JavaScript ES Modules and the Fetch API. All modules are built on top of the `api.js` HTTP wrapper.

## Module Files

### 1. **api.js** (HTTP Wrapper)
- **Location**: `js/api.js`
- **Purpose**: Core HTTP client with automatic token management
- **Exports**:
  - `apiCall(endpoint, method, data)` - Generic API request handler
  - `setToken(token)` - Store JWT token
  - `getToken()` - Retrieve stored token
  - `clearToken()` - Remove token from storage

### 2. **auth.js** (Authentication)
- **Location**: `js/auth.js`
- **Purpose**: User authentication and session management
- **Functions**:
  - `register(credentials)` - Create new user account
  - `login(credentials)` - Authenticate user
  - `logout()` - Clear session
  - `getCurrentUser()` - Fetch current user info
  - `isAuthenticated()` - Check if logged in
  - `getAuthToken()` - Get stored JWT token

### 3. **novels.js** (Novel Management)
- **Location**: `js/novels.js`
- **Purpose**: Novel listing, searching, and detail retrieval
- **Functions**:
  - `getNovels(options)` - Get paginated novels with filters
  - `getNovelBySlug(slug)` - Get novel details by URL slug
  - `searchNovels(query, options)` - Search novels
  - `getTrendingNovels(options)` - Get popular novels
  - `getLatestNovels(options)` - Get recently added novels
  - `createNovel(novelData)` - Create new novel (Uploader/Admin)
  - `updateNovel(novelId, updateData)` - Update novel (Uploader/Admin)
  - `deleteNovel(novelId)` - Delete novel (Admin)

### 4. **chapters.js** (Chapter Management)
- **Location**: `js/chapters.js`
- **Purpose**: Chapter listing and content retrieval
- **Functions**:
  - `getNovelChapters(novelId)` - Get chapters of a novel
  - `getChapterContent(chapterId)` - Get chapter content
  - `createChapter(novelId, chapterData)` - Create chapter (Uploader/Admin)
  - `updateChapter(chapterId, updateData)` - Update chapter (Uploader/Admin)
  - `deleteChapter(chapterId)` - Delete chapter (Uploader/Admin)

### 5. **genres.js** (Genre Management)
- **Location**: `js/genres.js`
- **Purpose**: Genre listing and category filtering
- **Functions**:
  - `getGenres()` - Get all genres
  - `getNovelsByGenre(genreId, options)` - Get novels by genre

### 6. **comments.js** (Comment System)
- **Location**: `js/comments.js`
- **Purpose**: Novel comments with threading support
- **Functions**:
  - `getComments(novelId)` - Get novel comments
  - `createComment(novelId, commentData)` - Post new comment
  - `replyComment(novelId, parentCommentId, replyData)` - Reply to comment
  - `updateComment(commentId, updateData)` - Edit comment (Owner)
  - `deleteComment(commentId)` - Delete comment (Owner)

### 7. **favorites.js** (Favorites/Following)
- **Location**: `js/favorites.js`
- **Purpose**: User favorites and novel following
- **Functions**:
  - `getFavorites()` - Get user's favorites
  - `followNovel(novelId)` - Add to favorites
  - `unfollowNovel(novelId)` - Remove from favorites
  - `toggleFavorite(novelId)` - Toggle favorite status

### 8. **history.js** (Reading History)
- **Location**: `js/history.js`
- **Purpose**: Reading progress and history tracking
- **Functions**:
  - `getHistory()` - Get reading history
  - `saveReadingProgress(progressData)` - Save/update progress
  - `deleteHistory(historyId)` - Remove history record
  - `clearAllHistory()` - Clear all history

### 9. **users.js** (User Profile)
- **Location**: `js/users.js`
- **Purpose**: User profile and account management
- **Functions**:
  - `getProfile()` - Get user profile
  - `updateProfile(profileData)` - Update profile info
  - `uploadAvatar(file)` - Upload avatar image
  - `changePassword(passwordData)` - Change password
  - `getReadingHistory(options)` - Get paginated history
  - `getUserFavorites(options)` - Get paginated favorites

## API Response Format

All functions return a consistent response object:

```javascript
{
  success: boolean,
  data?: any,              // Response data (on success)
  error?: string,          // Error message (on failure)
  pagination?: {           // For list endpoints
    page: number,
    limit: number,
    total: number
  }
}
```

## Standard Usage Pattern

```javascript
import { login } from './auth.js';

// Make API call
const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Check result
if (result.success) {
  console.log('Login successful:', result.data.user);
} else {
  console.error('Login failed:', result.error);
}
```

## Features

✅ **Clean Architecture**: Each module has single responsibility
✅ **Error Handling**: Consistent error response format
✅ **Token Management**: Automatic JWT token handling
✅ **Async/Await**: Modern promise-based API
✅ **Input Validation**: Client-side validation before API calls
✅ **Pagination Support**: Built-in pagination for list endpoints
✅ **ES Modules**: Modern JavaScript module system
✅ **Production Ready**: No external dependencies (Fetch API only)

## Authentication Flow

1. User registers or logs in via `auth.js`
2. JWT token automatically stored in localStorage
3. Token auto-included in all API requests via `api.js`
4. Token persists across page refreshes
5. Logout clears token from storage

## Integration Steps

1. **Include in HTML**: Use `<script type="module">` tags
2. **Import modules**: `import { function } from './module.js'`
3. **Call functions**: `const result = await function(...)`
4. **Handle responses**: Check `result.success` before using data
5. **Handle errors**: Display user-friendly error messages

## Documentation Files

- **FRONTEND_API_DOCUMENTATION.md** - Detailed API reference
- **FRONTEND_API_INTEGRATION_GUIDE.md** - Integration examples and patterns
- **README.md** - Project overview

## API Endpoints Map

| Module | Method | Endpoint | Purpose |
|--------|--------|----------|---------|
| auth | POST | /auth/register | Register user |
| auth | POST | /auth/login | Login user |
| auth | POST | /auth/logout | Logout user |
| novels | GET | /novels | List novels |
| novels | GET | /novels/:slug | Get novel detail |
| novels | GET | /novels/search | Search novels |
| chapters | GET | /chapters/novel/:novelId | List chapters |
| chapters | GET | /chapters/:id | Get chapter content |
| genres | GET | /genres | List genres |
| comments | GET | /comments/novel/:novelId | Get comments |
| comments | POST | /comments | Create/reply comment |
| favorites | GET | /users/favorites | Get favorites |
| favorites | POST | /users/favorites | Add favorite |
| favorites | DELETE | /users/favorites/:novelId | Remove favorite |
| history | GET | /users/history | Get reading history |
| history | POST | /users/history | Save progress |
| users | GET | /users/profile | Get profile |
| users | PUT | /users/profile | Update profile |
| users | POST | /users/avatar | Upload avatar |
| users | POST | /users/change-password | Change password |

## Browser Compatibility

- Modern browsers with ES Module support
- Chrome 61+, Firefox 67+, Safari 11+, Edge 79+
- Requires localStorage support
- Requires Fetch API support

## Performance Considerations

- Token stored in localStorage (persistent across sessions)
- API responses are not cached (implement caching as needed)
- File uploads capped at 5MB
- Pagination supports custom page/limit parameters

## Security Notes

- JWT tokens stored in localStorage (consider using HttpOnly cookies for production)
- All requests over HTTPS (in production)
- CORS configured on backend
- Password validation on client and server
- Image upload validation (file type, size)

## Next Steps

1. Implement caching layer for better performance
2. Add request debouncing for search
3. Implement infinite scroll for lists
4. Add offline support with service workers
5. Implement retry logic for failed requests
6. Add request timeout handling

---

**Created**: 28 May 2026
**Status**: Production Ready
**Version**: 1.0.0
