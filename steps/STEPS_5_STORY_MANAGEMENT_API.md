## Step 5: Story Management API - CRUD Operations

Now let's build the core API endpoints for managing stories and chapters - the heart of CMC Truyện!

### 🎯 What We're Creating This Step

By the end of this step, you'll have:
- ✅ Story CRUD endpoints (Create, Read, Update, Delete)
- ✅ Chapter management endpoints
- ✅ Reading history tracking
- ✅ Story search and filtering
- ✅ Pagination for large datasets
- ✅ Role-based permissions on story operations

### 📚 API Endpoints to Create

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| **GET** | `/api/stories` | List all stories (paginated) | No | - |
| **GET** | `/api/stories/:id` | Get single story details | No | - |
| **POST** | `/api/stories` | Create new story | Yes | Uploader, Admin |
| **PUT** | `/api/stories/:id` | Update story | Yes | Owner, Admin |
| **DELETE** | `/api/stories/:id` | Delete story | Yes | Owner, Admin |
| **GET** | `/api/stories/:storyId/chapters` | List chapters | No | - |
| **GET** | `/api/stories/:storyId/chapters/:chapterId` | Get chapter content | No | - |
| **POST** | `/api/stories/:storyId/chapters` | Create chapter | Yes | Owner, Admin |
| **PUT** | `/api/stories/:storyId/chapters/:chapterId` | Update chapter | Yes | Owner, Admin |
| **GET** | `/api/stories/:id/summary` | Get AI summary | No | - |
| **POST** | `/api/reading-history` | Save reading progress | Yes | - |
| **GET** | `/api/reading-history` | Get user's reading history | Yes | - |

---

## 🚀 Activity: Build Story Management API with Copilot

### Step 1: Create Story Model

1. **Open Copilot Chat** and paste this prompt:

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create database query functions in backend/src/models/Story.js that:
   > 
   > 1. **getAllStories(page = 1, limit = 10)** - Get paginated stories
   >    - Returns stories with pagination info
   >    - Order by created_at DESC
   > 
   > 2. **getStoryById(id)** - Get single story with author details
   >    - Join with users table to get author info
   >    - Include chapter count
   > 
   > 3. **createStory(storyData)** - Create new story
   >    - Input: title, slug, author_id, description, cover_image_url, category
   >    - Returns created story data
   > 
   > 4. **updateStory(id, storyData)** - Update story
   >    - Input: title, description, cover_image_url, category, status
   >    - Returns updated story data
   > 
   > 5. **deleteStory(id)** - Soft delete story
   >    - Set is_published to false
   > 
   > 6. **searchStories(query, category = null, page = 1)** - Search stories
   >    - Search by title and description
   >    - Filter by category if provided
   >    - Return paginated results
   > 
   > Use the database pool from config/database.js
   > All functions should return error on database issues
   > ```

2. **Review and click Continue**

### Step 2: Create Chapter Model

3. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create database query functions in backend/src/models/Chapter.js that:
   > 
   > 1. **getChaptersByStory(storyId, page = 1)** - Get chapters for a story
   >    - Paginate chapters
   >    - Order by chapter_number ASC
   > 
   > 2. **getChapterById(chapterId)** - Get chapter content
   >    - Include story details
   > 
   > 3. **createChapter(storyData)** - Create new chapter
   >    - Input: story_id, chapter_number, title, content
   >    - Auto-increment story's total_chapters
   > 
   > 4. **updateChapter(id, chapterData)** - Update chapter
   >    - Input: title, content
   > 
   > 5. **deleteChapter(id)** - Delete chapter
   >    - Decrement story's total_chapters
   > 
   > 6. **getChapterCount(storyId)** - Get total chapter count
   >    - Return count for a story
   > 
   > Use the database pool from config/database.js
   > ```

4. **Review and click Continue**

### Step 3: Create Story Controller

5. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create story controller functions in backend/src/controllers/storyController.js:
   > 
   > 1. **getAllStories(req, res)** - Handles GET /api/stories
   >    - Extract page and limit from query params (defaults: page=1, limit=10)
   >    - Call Story.getAllStories(page, limit)
   >    - Return 200 with stories array and pagination info
   > 
   > 2. **getStoryById(req, res)** - Handles GET /api/stories/:id
   >    - Extract id from params
   >    - Call Story.getStoryById(id)
   >    - Return 200 with story data or 404 if not found
   > 
   > 3. **createStory(req, res)** - Handles POST /api/stories
   >    - Validate input (title, slug, description required)
   >    - Set author_id from req.user.id
   >    - Call Story.createStory(storyData)
   >    - Return 201 with created story
   > 
   > 4. **updateStory(req, res)** - Handles PUT /api/stories/:id
   >    - Check if user is story owner or admin
   >    - Validate input
   >    - Call Story.updateStory(id, updateData)
   >    - Return 200 with updated story
   > 
   > 5. **deleteStory(req, res)** - Handles DELETE /api/stories/:id
   >    - Check if user is story owner or admin
   >    - Call Story.deleteStory(id)
   >    - Return 200 with success message
   > 
   > 6. **searchStories(req, res)** - Handles GET /api/stories/search?q=query&category=cat
   >    - Extract query and category from query params
   >    - Call Story.searchStories(query, category)
   >    - Return 200 with search results
   > 
   > Use proper error handling and status codes.
   > ```

6. **Review and click Continue**

### Step 4: Create Chapter Controller

7. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create chapter controller functions in backend/src/controllers/chapterController.js:
   > 
   > 1. **getChapters(req, res)** - Handles GET /api/stories/:storyId/chapters
   >    - Extract storyId and page from params
   >    - Call Chapter.getChaptersByStory(storyId, page)
   >    - Return 200 with chapters list
   > 
   > 2. **getChapterById(req, res)** - Handles GET /api/stories/:storyId/chapters/:chapterId
   >    - Extract IDs from params
   >    - Call Chapter.getChapterById(chapterId)
   >    - Return 200 with chapter content
   > 
   > 3. **createChapter(req, res)** - Handles POST /api/stories/:storyId/chapters
   >    - Check user is story owner/admin
   >    - Validate input (title, content required)
   >    - Call Chapter.createChapter(storyData)
   >    - Return 201 with created chapter
   > 
   > 4. **updateChapter(req, res)** - Handles PUT /api/stories/:storyId/chapters/:chapterId
   >    - Check user is story owner/admin
   >    - Validate input
   >    - Call Chapter.updateChapter(id, updateData)
   >    - Return 200 with updated chapter
   > 
   > 5. **deleteChapter(req, res)** - Handles DELETE /api/stories/:storyId/chapters/:chapterId
   >    - Check user is story owner/admin
   >    - Call Chapter.deleteChapter(id)
   >    - Return 200 with success message
   > 
   > Use proper error handling for authorization failures.
   > ```

8. **Review and click Continue**

### Step 5: Create Story Routes

9. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create story routes in backend/src/routes/storyRoutes.js using Express Router:
   > 
   > 1. GET /
   >    - Handler: storyController.getAllStories
   > 
   > 2. GET /search
   >    - Handler: storyController.searchStories
   > 
   > 3. GET /:id
   >    - Handler: storyController.getStoryById
   > 
   > 4. POST /
   >    - Middleware: authenticateToken, authorizeRole('Uploader', 'Admin')
   >    - Handler: storyController.createStory
   > 
   > 5. PUT /:id
   >    - Middleware: authenticateToken, authorizeRole('Uploader', 'Admin')
   >    - Handler: storyController.updateStory
   > 
   > 6. DELETE /:id
   >    - Middleware: authenticateToken, authorizeRole('Uploader', 'Admin')
   >    - Handler: storyController.deleteStory
   > 
   > 7. GET /:storyId/chapters
   >    - Handler: chapterController.getChapters
   > 
   > 8. GET /:storyId/chapters/:chapterId
   >    - Handler: chapterController.getChapterById
   > 
   > 9. POST /:storyId/chapters
   >    - Middleware: authenticateToken, authorizeRole('Uploader', 'Admin')
   >    - Handler: chapterController.createChapter
   > 
   > 10. PUT /:storyId/chapters/:chapterId
   >     - Middleware: authenticateToken, authorizeRole('Uploader', 'Admin')
   >     - Handler: chapterController.updateChapter
   > 
   > 11. DELETE /:storyId/chapters/:chapterId
   >     - Middleware: authenticateToken, authorizeRole('Uploader', 'Admin')
   >     - Handler: chapterController.deleteChapter
   > 
   > Import all controllers and middleware.
   > Export the router as default.
   > ```

10. **Review and click Continue**

### Step 6: Update App Routes

11. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Update backend/src/app.js to add the story routes:
   > 
   > 1. Import storyRoutes from routes/storyRoutes.js
   > 2. Add route: app.use('/api/stories', storyRoutes)
   > 3. Make sure this is added before the error handler middleware
   > ```

12. **Review and click Continue**

---

## ✅ Verification Checklist

- [ ] `backend/src/models/Story.js` with 6 functions
- [ ] `backend/src/models/Chapter.js` with 6 functions
- [ ] `backend/src/controllers/storyController.js` with 6 handlers
- [ ] `backend/src/controllers/chapterController.js` with 5 handlers
- [ ] `backend/src/routes/storyRoutes.js` with 11 routes
- [ ] `backend/src/app.js` updated with story routes

---

## 🔗 Next Steps

You're ready for **Step 6: Frontend Setup with React** to build the user interface!

**Ready?** → [Go to Step 6](./6-frontend-setup-react.md)
