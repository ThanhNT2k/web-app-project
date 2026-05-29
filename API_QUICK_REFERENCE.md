# 🔖 Frontend API Quick Reference Card

**For**: Frontend Developers  
**Last Updated**: 28 May 2026

---

## 📌 Core Modules

### api.js - HTTP Wrapper
```javascript
import { apiCall, setToken, getToken, clearToken } from './js/api.js';

// Make authenticated API calls
const data = await apiCall('/comics', 'GET');
const result = await apiCall('/comics', 'POST', { title: 'New Comic' });

// Manage token
setToken(token);      // Store token
const token = getToken();  // Retrieve token
clearToken();          // Remove token
```

### auth.js - Authentication & Role Control
```javascript
import {
  register, login, logout, getCurrentUser,
  isAuthenticated, isAdmin, isUploader, isUser,
  canManageContent, getUserRole
} from './js/auth.js';

// Authentication
await register({ email, password });
const result = await login({ email, password });
await logout();
const user = await getCurrentUser();

// Permission checks
isAdmin();              // boolean
isUploader();           // boolean
isUser();               // boolean
canManageContent();     // Admin OR Uploader
getUserRole();          // 'Admin' | 'Uploader' | 'User' | null
```

---

## 📚 API Endpoints by Category

### AUTH (4 endpoints)
```
POST   /auth/register          → register(credentials)
POST   /auth/login             → login(credentials)
POST   /auth/logout            → logout()
GET    /users/me               → getCurrentUser()
```

### COMICS (8 endpoints)
```
GET    /comics                 → getComics(params)
GET    /comics/{slug}          → getComicBySlug(slug)
GET    /comics/search          → searchComics(query)
GET    /comics/trending        → getTrendingComics()
GET    /comics/latest          → getLatestComics()
POST   /comics                 → createComic(data)
PUT    /comics/{id}            → updateComic(id, data)
DELETE /comics/{id}            → deleteComic(id)
```

### CHAPTERS (5 endpoints)
```
GET    /comics/{id}/chapters   → getComicChapters(id)
GET    /chapters/{id}          → getChapterContent(id)
POST   /chapters               → createChapter(data)
PUT    /chapters/{id}          → updateChapter(id, data)
DELETE /chapters/{id}          → deleteChapter(id)
```

### GENRES (2 endpoints)
```
GET    /genres                 → getGenres()
GET    /genres/{id}/comics     → getComicsByGenre(id)
```

### COMMENTS (4 endpoints)
```
GET    /comments/{comicId}     → getComments(comicId)
POST   /comments               → createComment(data)
PUT    /comments/{id}          → updateComment(id, data)
DELETE /comments/{id}          → deleteComment(id)
```

### FOLLOWS (3 endpoints)
```
GET    /users/follows          → getFavorites()
POST   /follows                → followComic(comicId)
DELETE /follows/{comicId}      → unfollowComic(comicId)
```

### HISTORY (3 endpoints)
```
GET    /users/history          → getHistory()
POST   /users/history          → saveReadingProgress(data)
DELETE /users/history/{id}     → deleteHistory(comicId)
```

### PROFILE (4 endpoints)
```
GET    /users/me               → getProfile()
PUT    /users/profile          → updateProfile(data)
POST   /users/avatar           → uploadAvatar(file)
PUT    /users/change-password  → changePassword(oldPass, newPass)
```

### AI (1 endpoint)
```
GET    /recommendations/personalized → getPersonalizedRecommendations()
```

---

## 🔐 Role System

### Three Roles
| Role | Can Do | Module |
|------|--------|--------|
| **Admin** | Everything | Full access |
| **Uploader** | Create/edit own content | Create comics, upload chapters |
| **User** | Read, comment, follow | Browse, interact |

### Check Permissions
```javascript
if (isAdmin()) { /* Admin panel */ }
if (isUploader()) { /* Upload comic */ }
if (isUser()) { /* Browse comics */ }
if (canManageContent()) { /* Create or edit */ }
```

### No Guest Role
⚠️ All endpoints require authentication. No guest/anonymous access.

---

## 💡 Common Patterns

### 1. Login & Get Role
```javascript
const result = await login({ email, password });
if (result.success) {
  const role = getUserRole();
  console.log(`Logged in as ${role}`);
}
```

### 2. Check Before Action
```javascript
if (!canManageContent()) {
  alert('Only creators can upload');
  return;
}
const result = await createComic(data);
```

### 3. Conditional UI
```javascript
const uploadBtn = document.getElementById('upload-btn');
uploadBtn.style.display = canManageContent() ? 'block' : 'none';
```

### 4. Role-Based Navigation
```javascript
if (isAdmin()) {
  window.location.href = '/pages/admin.html';
} else if (isUploader()) {
  window.location.href = '/pages/uploader.html';
} else {
  window.location.href = '/index.html';
}
```

### 5. API Call with Error Handling
```javascript
try {
  const comics = await getComics();
  renderComics(comics);
} catch (error) {
  console.error('Failed to load comics:', error);
  showErrorMessage(error.message);
}
```

---

## 🎯 Import Cheatsheet

```javascript
// Auth & Role Control
import { login, logout, getUserRole, isAdmin, canManageContent } from './js/auth.js';

// Comics
import { getComics, getComicBySlug, createComic, searchComics } from './js/novels.js';

// Chapters
import { getComicChapters, getChapterContent, createChapter } from './js/chapters.js';

// Genres
import { getGenres, getComicsByGenre } from './js/genres.js';

// Comments
import { getComments, createComment, updateComment, deleteComment } from './js/comments.js';

// Follows
import { getFavorites, followComic, unfollowComic } from './js/favorites.js';

// History
import { getHistory, saveReadingProgress, deleteHistory } from './js/history.js';

// User Profile
import { getProfile, updateProfile, uploadAvatar, changePassword } from './js/users.js';
```

---

## 📊 Response Format

All API responses follow this structure:
```javascript
{
  success: boolean,
  data: any,           // Response data or array
  error: string,       // Error message if !success
  pagination: {        // Optional for list endpoints
    page: number,
    limit: number,
    total: number
  }
}
```

---

## 🔑 Storage Keys

| Key | Type | Purpose | Cleared On |
|-----|------|---------|-----------|
| `authToken` | JWT | Authentication | Logout, Exp |
| `userRole` | String | Role reference | Logout, 401 |

---

## ⚠️ Common Mistakes

❌ **Don't**: Access role directly from localStorage
```javascript
// WRONG
if (localStorage.getItem('userRole') === 'Admin') { }
```

✅ **Do**: Use helper functions
```javascript
// RIGHT
if (isAdmin()) { }
```

---

❌ **Don't**: Forget to check authorization before API calls
```javascript
// WRONG
const result = await createComic(data); // No permission check!
```

✅ **Do**: Check permissions first
```javascript
// RIGHT
if (!canManageContent()) return;
const result = await createComic(data);
```

---

❌ **Don't**: Assume logout clears everything
```javascript
// WRONG - Manual cleanup needed
await logout();
localStorage.removeItem('userRole'); // Already done by logout()!
```

✅ **Do**: Trust logout to handle cleanup
```javascript
// RIGHT
await logout(); // Clears token and role automatically
```

---

## 🧪 Quick Tests

### Test 1: Login Flow
```javascript
const result = await login({ email: 'user@test.com', password: 'pass' });
console.log(result.success);      // true
console.log(getUserRole());        // 'User' or 'Admin' or 'Uploader'
```

### Test 2: Logout Flow
```javascript
await logout();
console.log(getUserRole());        // null
console.log(localStorage.getItem('authToken')); // null
```

### Test 3: Permission Check
```javascript
console.log(canManageContent());   // true or false
console.log(isAdmin());            // true or false
```

### Test 4: Get Comics
```javascript
const comics = await getComics();
console.log(Array.isArray(comics.data)); // true
```

---

## 📞 Need Help?

1. **Role Questions?** → ROLE_BASED_ACCESS_CONTROL.md
2. **Audit Details?** → AUDIT_REPORT.md
3. **Code Examples?** → ROLE_BASED_ACCESS_CONTROL.md (Usage Examples section)
4. **Function Details?** → Check JSDoc comments in each module

---

## ✅ Verification Checklist

Before deploying your feature:

- [ ] Using correct role helpers (not localStorage access)
- [ ] Checking permissions before sensitive operations
- [ ] Handling auth errors gracefully
- [ ] Using correct endpoint paths (/users/me not /users/profile)
- [ ] Testing with all 3 roles (Admin, Uploader, User)
- [ ] Verifying role persists after page refresh
- [ ] Verifying role clears after logout

---

**Version**: 1.0  
**Status**: Production Ready ✅  
**Last Updated**: 28 May 2026
