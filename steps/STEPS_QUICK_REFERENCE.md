# CMC Truyện Development - Quick Reference Card

A cheat sheet for the 7-step GitHub Copilot guided development journey.

---

## 📖 Steps at a Glance

```
Step 1: PREPARE (15 min)
    └─> Setup dev environment, create branch

Step 2: BACKEND SETUP (45 min)
    └─> Create project structure, install deps, setup config

Step 3: DATABASE (60 min)
    └─> Design schema, create 8 tables, seed data

Step 4: AUTHENTICATION (60 min)
    └─> JWT tokens, bcrypt hashing, role-based auth

Step 5: STORY API (90 min)
    └─> CRUD endpoints for stories/chapters, search, pagination

Step 6: FRONTEND (90 min)
    └─> React components, routing, API integration, dark mode

Step 7: AI & TESTING (120 min)
    └─> Gemini API, summaries, caching, full testing
```

---

## 🚀 Quick Start Commands

```bash
# Clone project
git clone <your-repo>
cd web-app-project

# Create development branch
git checkout -b setup-cmc-truyen-backend

# Backend setup
cd backend
npm install
npm run db:init
npm run db:seed
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

---

## 📁 File Structure Created

```
cmc-truyen/
├── backend/
│   ├── src/
│   │   ├── config/        ← database.js, environment.js
│   │   ├── controllers/   ← authController.js, storyController.js, etc
│   │   ├── models/        ← User.js, Story.js, Chapter.js, etc
│   │   ├── routes/        ← authRoutes.js, storyRoutes.js, etc
│   │   ├── middleware/    ← authMiddleware.js, roleMiddleware.js
│   │   ├── services/      ← aiService.js
│   │   ├── scripts/       ← schema.sql, init-db.js, seed-data.js
│   │   ├── app.js         ← Express app setup
│   │   └── server.js      ← Server entry point
│   ├── package.json
│   ├── .env
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/    ← Navbar, StoryCard, Footer, etc
    │   ├── pages/        ← HomePage, LoginPage, ChapterReaderPage, etc
    │   ├── services/     ← api.js, authService.js
    │   ├── styles/       ← main.css, darkMode.css
    │   ├── App.jsx       ← Main app with routing
    │   └── index.js      ← React entry point
    ├── package.json
    ├── .env
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🔑 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `backend/src/app.js` | Express app configuration, middleware setup |
| `backend/src/server.js` | Server startup, database connection |
| `backend/src/config/database.js` | PostgreSQL connection pool |
| `backend/src/controllers/authController.js` | Login/register logic |
| `backend/src/middleware/authMiddleware.js` | JWT verification |
| `backend/src/models/Story.js` | Story database queries |
| `backend/scripts/schema.sql` | Database table definitions |
| `frontend/src/App.jsx` | Router setup, main layout |
| `frontend/src/services/api.js` | Axios instance, API calls |
| `frontend/src/pages/HomePage.jsx` | Story listing page |

---

## 🔗 API Endpoints Reference

### Authentication
```
POST   /api/auth/register      → Create new user
POST   /api/auth/login         → Login user, get JWT token
POST   /api/auth/logout        → Logout (clear token)
GET    /api/auth/me            → Get current user (protected)
```

### Stories
```
GET    /api/stories            → List all stories (paginated)
GET    /api/stories/:id        → Get story details
POST   /api/stories            → Create story (Auth + Uploader role)
PUT    /api/stories/:id        → Update story (Owner/Admin only)
DELETE /api/stories/:id        → Delete story (Owner/Admin only)
GET    /api/stories/search     → Search stories
```

### Chapters
```
GET    /api/stories/:storyId/chapters              → List chapters
GET    /api/stories/:storyId/chapters/:chapterId   → Get chapter content
POST   /api/stories/:storyId/chapters              → Create chapter (Auth)
PUT    /api/stories/:storyId/chapters/:chapterId   → Update chapter (Owner)
DELETE /api/stories/:storyId/chapters/:chapterId   → Delete chapter (Owner)
GET    /api/chapters/:id/summary                   → Get AI summary
```

### User Features
```
POST   /api/reading-history    → Save reading progress (Auth)
GET    /api/reading-history    → Get user's reading history (Auth)
POST   /api/user-follows       → Follow a story (Auth)
GET    /api/user-follows       → Get followed stories (Auth)
POST   /api/comments           → Add comment (Auth)
GET    /api/comments           → Get comments
```

---

## 💾 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, username, email, password, role |
| `stories` | Story info | id, title, author_id, category, status |
| `chapters` | Story chapters | id, story_id, chapter_number, content |
| `reading_history` | User progress | user_id, story_id, last_chapter, completion_rate |
| `user_follows` | Favorites | user_id, story_id |
| `comments` | Comments | user_id, story_id, chapter_id, content |
| `user_preferences` | User settings | user_id, dark_mode, font_size, theme |
| `ai_summaries` | Summary cache | chapter_id, summary |

---

## 🔐 User Roles & Permissions

| Role | Can Do | Access |
|------|--------|--------|
| **Admin** | Everything | Full system access |
| **Uploader** | Create/edit stories + all User permissions | Story management |
| **User** | Read stories, comment, bookmark | Reading features |
| **Guest** | View public stories only | Read-only access |

---

## 🔑 Environment Variables Needed

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/db_name
DB_HOST=db.supabase.co
DB_PORT=5432
DB_NAME=cmc_truyen
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## 🧪 Testing Workflows

### Test API Endpoint (using curl)
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Get protected data (using token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend
```bash
# Open in browser
http://localhost:3000/

# Test pages
/login              → Login page
/register          → Registration page
/                  → Home page
/story/:id         → Story detail
/story/:id/chapter/:chapterId → Reader page
/profile           → User profile (protected)
```

---

## 💡 Common Copilot Prompts

### Debugging Issues
> "The API endpoint /api/stories is returning a 500 error. Can you help me debug this?"

### Adding Features
> "I want to add a rating system to stories. Each story should have a 5-star rating. What changes do I need?"

### Code Review
> "Review my storyController.js for security issues and best practices"

### Optimization
> "How can I optimize the story listing endpoint for better performance with large datasets?"

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| `Cannot find module 'express'` | Run `npm install` |
| `ECONNREFUSED` on port 5000 | Port already in use, change PORT in .env |
| `Database connection failed` | Check DATABASE_URL in .env |
| `JWT token expired` | Backend returns 401, frontend redirects to login |
| `CORS error in console` | Check FRONTEND_URL in backend .env |
| `API not responding` | Check if backend server is running (npm run dev) |
| `Styling not applying` | Rebuild Tailwind CSS, clear browser cache |

---

## 📱 Component Usage Examples

### Using StoryCard Component
```jsx
<StoryCard 
  story={{
    id: 1,
    title: "Story Title",
    author: "Author Name",
    cover_image_url: "url",
    category: "Fantasy",
    chapter_count: 50
  }}
/>
```

### Using API Service
```jsx
import API from '../services/api';

// Get all stories
const stories = await API.stories.getAll(1, 10);

// Create story
const newStory = await API.stories.create({
  title: "New Story",
  description: "...",
  category: "Romance"
});

// Login
const user = await API.auth.login('email@example.com', 'password');
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b setup-cmc-truyen-backend

# After each step, commit progress
git add .
git commit -m "Step 2: Backend initial setup"

# Push to GitHub
git push origin setup-cmc-truyen-backend

# When ready, create Pull Request
# (on GitHub web interface)
```

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
npm run dev              # Shows Express logs in terminal
# Look for: "Server running on port 5000"
# Look for: "Database connected successfully"
```

### Frontend Logs
```bash
# Check browser console (F12)
# Look for: API request logs
# Look for: Component render logs
```

### Database Logs (Supabase)
```
Settings → Database → Logs
```

---

## 📚 Step Progression

```
START
  ↓
Step 1: Prepare ✓
  ↓
Step 2: Backend ← YOU ARE HERE
  ↓
Step 3: Database
  ↓
Step 4: Auth
  ↓
Step 5: Stories
  ↓
Step 6: Frontend
  ↓
Step 7: AI & Testing
  ↓
DEPLOY TO PRODUCTION
  ↓
DONE 🎉
```

---

## 🎯 Success Criteria Checklist

### For Each Step
- [ ] Read the step guide completely
- [ ] Follow Copilot prompts in order
- [ ] Review all generated code before clicking Continue
- [ ] Run verification commands
- [ ] Check verification checklist passes
- [ ] Commit progress with git
- [ ] Move to next step

### Final Project
- [ ] All 7 steps completed
- [ ] Backend server runs without errors
- [ ] Frontend loads and connects to API
- [ ] User can register and login
- [ ] Stories display and can be read
- [ ] AI summaries generate
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Remove debug logging
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS
- [ ] Set FRONTEND_URL to production domain
- [ ] Database URL points to production DB
- [ ] Error messages don't leak sensitive info
- [ ] .env not committed to git
- [ ] Rate limiting enabled on auth endpoints
- [ ] CORS configured for production domain
- [ ] Database backups configured
- [ ] Monitoring/alerts setup

---

**Need Help?** Check `STEPS_INDEX.md` for full documentation!

**Ready to start?** Begin with `STEPS_1_PREPARING.md`

Good luck! 🚀✨
