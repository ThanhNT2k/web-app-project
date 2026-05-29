# Frontend API Modules - Project Structure

## Updated Project Layout

```
web-app-project-emDuong/
│
├── index.html                                 # Main homepage
├── test_api.html                             # API testing page
│
├── css/
│   └── style.css                             # Global styles
│
├── js/                                       # 🎯 Frontend API Layer
│   ├── api.js                                # ✅ HTTP wrapper (core)
│   ├── auth.js                               # ✅ Authentication module
│   ├── novels.js                             # ✅ Novel management module
│   ├── chapters.js                           # ✅ Chapter management module
│   ├── genres.js                             # ✅ Genre management module
│   ├── comments.js                           # ✅ Comments system module
│   ├── favorites.js                          # ✅ Favorites/following module
│   ├── history.js                            # ✅ Reading history module
│   └── users.js                              # ✅ User profile module
│
├── pages/
│   ├── account.html                          # Login/Register page
│   ├── admin.html                            # Admin dashboard
│   ├── profile.html                          # User profile page
│   └── story.html                            # Novel detail/reader page
│
├── Documentation/
│   ├── FRONTEND_API_DOCUMENTATION.md         # ✅ Detailed API reference
│   ├── FRONTEND_API_INTEGRATION_GUIDE.md     # ✅ Integration examples
│   ├── FRONTEND_API_MODULES_SUMMARY.md       # ✅ Quick overview
│   ├── AGENTS.md                             # Agent roles/responsibilities
│   ├── AI_FEATURE_PROPOSAL.md                # Feature proposals
│   ├── PRODUCT_ANALYSIS.md                   # Product analysis
│   └── README.md                             # Project overview
│
└── backend-api/                              # ⚠️ Handled by another team
    ├── WebNovelApi.csproj
    ├── src/
    │   ├── Models/
    │   ├── DTOs/
    │   ├── Services/
    │   ├── Controllers/
    │   └── Data/
    └── ... (ASP.NET Core project structure)
```

## Module Dependencies

```
┌─────────────────────────────────────────────┐
│          Application Layer (Pages)          │
│  (account.html, story.html, profile.html)   │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│         Feature API Modules (8 modules)     │
│                                             │
│  auth.js ─────────┐                        │
│  novels.js        │                        │
│  chapters.js      ├─→ auth.js (for tokens) │
│  comments.js  ────┤                        │
│  favorites.js ────┤                        │
│  history.js  ─────┤                        │
│  genres.js   ─────┤                        │
│  users.js    ─────┘                        │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│    HTTP Wrapper (api.js)                    │
│  - apiCall(endpoint, method, data)          │
│  - Token management (setToken, getToken)    │
│  - Fetch API integration                    │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│    Backend API (ASP.NET Core 8)             │
│  - JWT Authentication                       │
│  - PostgreSQL Database                      │
│  - RESTful Endpoints                        │
└─────────────────────────────────────────────┘
```

## File Statistics

| Category | Count | Files |
|----------|-------|-------|
| **API Modules** | 9 | api.js, auth.js, novels.js, chapters.js, genres.js, comments.js, favorites.js, history.js, users.js |
| **HTML Pages** | 5 | index.html, account.html, admin.html, profile.html, story.html |
| **Documentation** | 3 | FRONTEND_API_DOCUMENTATION.md, FRONTEND_API_INTEGRATION_GUIDE.md, FRONTEND_API_MODULES_SUMMARY.md |
| **CSS** | 1 | style.css |
| **Total** | 18+ | - |

## Key Features by Module

### 1. Auth Module (auth.js)
- ✅ Register new users
- ✅ Login with email/username
- ✅ Logout functionality
- ✅ Get current user info
- ✅ Check authentication status
- ✅ Token management

### 2. Novels Module (novels.js)
- ✅ List all novels with pagination
- ✅ Get novel by slug
- ✅ Search functionality
- ✅ Trending novels
- ✅ Latest novels
- ✅ Create/Update/Delete (for uploaders)

### 3. Chapters Module (chapters.js)
- ✅ List chapters by novel
- ✅ Get chapter content
- ✅ Create/Update/Delete chapters (for uploaders)
- ✅ View tracking

### 4. Genres Module (genres.js)
- ✅ Get all genres
- ✅ Filter novels by genre

### 5. Comments Module (comments.js)
- ✅ Get comments
- ✅ Create comments
- ✅ Reply to comments (threaded)
- ✅ Edit/Delete own comments

### 6. Favorites Module (favorites.js)
- ✅ Get user favorites
- ✅ Follow novels
- ✅ Unfollow novels
- ✅ Toggle favorite status

### 7. History Module (history.js)
- ✅ Get reading history
- ✅ Save reading progress
- ✅ Delete history records
- ✅ Clear all history

### 8. Users Module (users.js)
- ✅ Get user profile
- ✅ Update profile
- ✅ Upload avatar
- ✅ Change password
- ✅ Get reading history
- ✅ Get user favorites

### 9. API Wrapper (api.js)
- ✅ HTTP request wrapper (Fetch API)
- ✅ Automatic token injection
- ✅ Error handling
- ✅ Token management utilities
- ✅ Auto base URL detection (local/production)

## Implementation Checklist

- [x] Create auth.js module with login/register/logout
- [x] Create novels.js module with list/search/detail
- [x] Create chapters.js module with chapter operations
- [x] Create genres.js module with genre filtering
- [x] Create comments.js module with comment threading
- [x] Create favorites.js module with follow/unfollow
- [x] Create history.js module with progress tracking
- [x] Create users.js module with profile management
- [x] Update api.js with export statements
- [x] Create FRONTEND_API_DOCUMENTATION.md
- [x] Create FRONTEND_API_INTEGRATION_GUIDE.md
- [x] Create FRONTEND_API_MODULES_SUMMARY.md

## Usage Examples

### Import and Use Modules

```javascript
// In your HTML: <script type="module" src="js/main.js"></script>

import { login } from './auth.js';
import { getNovels, getNovelBySlug } from './novels.js';
import { getChapterContent } from './chapters.js';
import { saveReadingProgress } from './history.js';

// Login
const loginResult = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Get novels
const novelsResult = await getNovels({ page: 1, limit: 12 });

// Get novel detail
const novelResult = await getNovelBySlug('the-great-journey');

// Get chapter
const chapterResult = await getChapterContent('chapter-id');

// Save progress
await saveReadingProgress({
  novelId: novelResult.data.id,
  chapterId: chapterResult.data.id,
  progress: 100
});
```

## Response Format

All functions follow consistent response format:

```javascript
// Success Response
{
  success: true,
  data: { /* actual data */ },
  pagination: { page: 1, limit: 12, total: 100 }  // if applicable
}

// Error Response
{
  success: false,
  error: "Error message",
  data: null
}
```

## Error Handling

All errors are caught and returned in consistent format:

```javascript
try {
  const result = await someFunction();
  if (result.success) {
    // Use result.data
  } else {
    console.error('API Error:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error.message);
}
```

## Configuration

### API Base URL
Automatically detected in `api.js`:
- **Development**: `http://localhost:5208/api`
- **Production**: `https://webappbe-fzz7.onrender.com/api`

### Token Storage
- **Storage**: localStorage
- **Key**: 'token'
- **Format**: JWT (Bearer token)

## Security Considerations

✅ **Implemented**:
- JWT token-based authentication
- Automatic token injection in headers
- Password validation on client
- Input sanitization before API calls
- File upload validation (type, size)

⚠️ **For Production**:
- Use HTTPS for all requests
- Consider HttpOnly cookies instead of localStorage
- Implement CSRF protection
- Add rate limiting
- Implement request signing

## Testing

Use `test_api.html` to test all API endpoints:

```html
<script type="module" src="js/auth.js"></script>
<script type="module">
  import { login } from './auth.js';
  
  // Test login
  const result = await login({
    email: 'test@example.com',
    password: 'password123'
  });
  console.log(result);
</script>
```

## Performance Notes

- No external dependencies (Fetch API only)
- Async/await for non-blocking I/O
- Automatic token caching
- Support for pagination to reduce payload
- Consider implementing:
  - Response caching
  - Request debouncing
  - Infinite scroll
  - Service workers for offline support

## Future Enhancements

- [ ] Add response caching layer
- [ ] Implement request retry logic
- [ ] Add request timeout handling
- [ ] Implement search debouncing
- [ ] Add offline support
- [ ] Implement infinite scroll
- [ ] Add optimistic updates
- [ ] Add request cancellation
- [ ] Implement rate limiting client-side
- [ ] Add analytics tracking

---

**Frontend Development Status**: ✅ Complete
**Backend Development Status**: ⚠️ Handled by another team
**Integration Status**: Ready for testing
