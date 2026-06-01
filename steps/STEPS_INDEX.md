# CMC Truyện - Build Steps Guide

Welcome to the **CMC Truyện Full-Stack Development Journey** using GitHub Copilot! 🚀

This guide breaks down the complete development of a Vietnamese online story reading platform into 7 manageable steps. Each step provides detailed instructions for using GitHub Copilot in **Agent Mode** to build your application.

---

## 📚 Overview: What You're Building

**CMC Truyện** is a modern web platform for reading Vietnamese stories online with:

| Feature | Description |
|---------|-------------|
| 📖 **Story Management** | Upload, manage, and organize stories with chapters |
| 🔐 **User Authentication** | Secure JWT-based authentication with role-based access |
| 📚 **Reading Experience** | Customizable reader with font sizes, dark mode, auto-bookmark |
| 🤖 **AI Summaries** | Google Gemini API integration for chapter summaries |
| 💬 **Community** | Comments, ratings, and recommendations |
| ⭐ **Personalization** | Reading history tracking and story recommendations |
| 🎨 **Responsive Design** | Works perfectly on mobile, tablet, and desktop |

---

## 🗺️ Step-by-Step Learning Path

### **Step 1: Prepare Development Environment**
📁 File: `STEPS_1_PREPARING.md`

**Duration:** 10-15 minutes | **Difficulty:** Easy

Get your development environment ready and learn about GitHub Copilot Agent Mode.

**What You'll Learn:**
- How to use GitHub Copilot agent mode effectively
- Creating git branches for development
- Project structure overview
- Understanding the tech stack

**Outcomes:**
- ✅ Opened Copilot in VS Code
- ✅ Created `setup-cmc-truyen-backend` branch
- ✅ Understood the project structure

---

### **Step 2: Backend Initial Setup**
📁 File: `STEPS_2_BACKEND_INITIAL_SETUP.md`

**Duration:** 30-45 minutes | **Difficulty:** Medium

Set up the Node.js/Express backend infrastructure with all required configurations.

**What You'll Learn:**
- Creating Express.js project structure
- Organizing backend code (MVC pattern)
- Environment variable management
- Database connection setup

**Technologies:**
- Node.js 18+
- Express.js
- PostgreSQL (Supabase)
- JWT Authentication
- Helmet & CORS

**Outcomes:**
- ✅ Backend directory structure created
- ✅ `package.json` with all dependencies
- ✅ Configuration files (`.env`, `database.js`)
- ✅ Express app initialized

**Deliverables:**
```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── app.js
│   └── server.js
├── package.json
├── .env
└── .env.example
```

---

### **Step 3: Database Schema & Models**
📁 File: `STEPS_3_DATABASE_SCHEMA_MODELS.md`

**Duration:** 45-60 minutes | **Difficulty:** Medium

Design and implement the PostgreSQL database schema with 8 tables.

**What You'll Learn:**
- Database design best practices
- Creating SQL schema with proper relationships
- Indexing for performance
- Database initialization scripts
- Sample data seeding

**Tables:**
1. **users** - User accounts with roles (Admin, Uploader, User, Guest)
2. **stories** - Story metadata and information
3. **chapters** - Individual chapters within stories
4. **reading_history** - Track user reading progress
5. **user_follows** - Favorite/follow system
6. **comments** - Comments on stories and chapters
7. **user_preferences** - User customization settings
8. **ai_summaries** - Cached AI-generated summaries

**Outcomes:**
- ✅ `schema.sql` with complete database design
- ✅ `init-db.js` initialization script
- ✅ `seed-data.js` with sample data
- ✅ npm scripts: `db:init`, `db:seed`

---

### **Step 4: Authentication System**
📁 File: `STEPS_4_AUTHENTICATION_SYSTEM.md`

**Duration:** 45-60 minutes | **Difficulty:** Medium

Build secure user authentication with JWT tokens and role-based authorization.

**What You'll Learn:**
- JWT token generation and validation
- Password hashing with bcryptjs
- Authentication middleware
- Role-based authorization
- Error handling

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)

**Outcomes:**
- ✅ `authController.js` with login/register logic
- ✅ `authMiddleware.js` for JWT verification
- ✅ `roleMiddleware.js` for role-based access
- ✅ `authRoutes.js` with auth endpoints
- ✅ Secure password hashing and token generation

**Security Features:**
- bcryptjs password hashing (10 salt rounds)
- JWT tokens with 7-day expiration
- Authorization header validation
- Role-based route protection

---

### **Step 5: Story Management API**
📁 File: `STEPS_5_STORY_MANAGEMENT_API.md`

**Duration:** 60-90 minutes | **Difficulty:** Hard

Create complete CRUD API for stories and chapters - the core of your platform.

**What You'll Learn:**
- RESTful API design
- CRUD operations
- Pagination and filtering
- Search functionality
- Authorization checks (owner/admin only)
- Database query optimization

**API Endpoints:**

**Stories:**
- `GET /api/stories` - List stories (paginated)
- `GET /api/stories/:id` - Get story details
- `POST /api/stories` - Create story (Uploader/Admin only)
- `PUT /api/stories/:id` - Update story (Owner/Admin only)
- `DELETE /api/stories/:id` - Delete story (Owner/Admin only)
- `GET /api/stories/search?q=query` - Search stories

**Chapters:**
- `GET /api/stories/:storyId/chapters` - List chapters
- `GET /api/stories/:storyId/chapters/:chapterId` - Get chapter
- `POST /api/stories/:storyId/chapters` - Create chapter
- `PUT /api/stories/:storyId/chapters/:chapterId` - Update chapter
- `DELETE /api/stories/:storyId/chapters/:chapterId` - Delete chapter

**Models & Controllers:**
- `Story.js` - Database queries for stories
- `Chapter.js` - Database queries for chapters
- `storyController.js` - Story request handlers
- `chapterController.js` - Chapter request handlers

**Outcomes:**
- ✅ Complete story management API
- ✅ Chapter reading endpoints
- ✅ Search and pagination
- ✅ Role-based permissions
- ✅ Comprehensive error handling

---

### **Step 6: Frontend Setup with React**
📁 File: `STEPS_6_FRONTEND_SETUP_REACT.md`

**Duration:** 75-90 minutes | **Difficulty:** Hard

Build a beautiful, responsive React frontend with routing, components, and API integration.

**What You'll Learn:**
- React 18 with TypeScript setup
- Component composition and reusability
- React Router for page navigation
- State management with hooks
- API integration with axios
- Tailwind CSS and Bootstrap styling
- Dark mode implementation

**Component Library:**

**Layout Components:**
- `Navbar.jsx` - Navigation header with search
- `Footer.jsx` - Footer with links
- `Sidebar.jsx` - Side navigation (optional)

**Content Components:**
- `StoryCard.jsx` - Story preview cards
- `StoryReader.jsx` - Chapter reading interface
- `CommentSection.jsx` - Comments display

**Page Components:**
- `HomePage.jsx` - Story listing
- `StoryDetailPage.jsx` - Story information
- `ChapterReaderPage.jsx` - Chapter content
- `LoginPage.jsx` - User login
- `RegisterPage.jsx` - User registration
- `UserProfilePage.jsx` - User profile
- `DashboardPage.jsx` - Admin/Uploader dashboard

**Services:**
- `api.js` - Axios instance with interceptors
- `authService.js` - Authentication helpers
- `storageService.js` - localStorage management

**Technologies:**
- React 18 with Hooks
- React Router v6
- Axios for HTTP
- Tailwind CSS
- Bootstrap 5
- Dark mode CSS

**Outcomes:**
- ✅ Complete React project structure
- ✅ Routing with protected pages
- ✅ API integration layer
- ✅ Responsive components
- ✅ Authentication flows
- ✅ Dark mode toggle
- ✅ Mobile-responsive design

---

### **Step 7: AI Integration & Testing**
📁 File: `STEPS_7_AI_INTEGRATION_TESTING.md`

**Duration:** 90-120 minutes | **Difficulty:** Hard

Integrate Google Gemini API for AI summaries and complete end-to-end testing.

**What You'll Learn:**
- AI API integration (Google Gemini)
- Prompt engineering for summaries
- Caching strategies for API efficiency
- End-to-end testing methodology
- Deployment preparation
- Performance optimization

**AI Features:**

**Backend:**
- `aiService.js` - Gemini API integration
- Chapter summary generation
- Story overview generation
- Recommendation engine
- Summary caching to avoid API costs

**Frontend:**
- `AIChapterSummary.jsx` - Display AI summaries
- `ReadingProgress.jsx` - Reading progress tracker
- `RecommendedStories.jsx` - AI recommendations
- Bookmark system

**Key Integration Points:**
- `ChapterReaderPage.jsx` - Summary display
- Reading history tracking
- Auto-save reading progress
- Recommendation feed

**API Endpoints (New):**
- `GET /api/chapters/:id/summary` - Get/generate summary
- `POST /api/reading-history` - Save reading progress
- `GET /api/reading-history` - Get reading history
- `GET /api/recommendations` - Get AI recommendations

**Outcomes:**
- ✅ Google Gemini API integrated
- ✅ Chapter summaries working
- ✅ Reading history tracking
- ✅ Summary caching implemented
- ✅ Full end-to-end testing completed
- ✅ Deployment guide created

**Testing Checklist:**
- ✅ User registration & login flows
- ✅ Story browsing and search
- ✅ Chapter reading with all controls
- ✅ AI summary generation
- ✅ Reading progress saving
- ✅ Dark mode functionality
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Error handling
- ✅ Mobile responsiveness

---

## 🛠️ Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js + Express.js | Web server |
| **Database** | PostgreSQL (Supabase) | Data persistence |
| **Frontend** | React 18 + React Router | User interface |
| **Styling** | Tailwind CSS + Bootstrap | UI design |
| **Authentication** | JWT + bcryptjs | Secure auth |
| **API Client** | Axios | HTTP requests |
| **AI Integration** | Google Gemini API | AI summaries |
| **Hosting** | Vercel (Frontend), Railway/Render (Backend) | Deployment |

---

## 📋 Quick Reference

### Environment Variables (.env)
```env
# Backend
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
FRONTEND_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Common Commands

**Backend:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run db:init      # Initialize database
npm run db:seed      # Add sample data
```

**Frontend:**
```bash
npm install          # Install dependencies
npm start            # Start dev server (port 3000)
npm run build        # Build for production
```

### API Base URLs
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

---

## 📚 Useful Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)

### Learning
- [GitHub Copilot Docs](https://github.com/features/copilot)
- [VS Code Guide](https://code.visualstudio.com/docs)
- [JWT.io](https://jwt.io/) - JWT tutorial
- [RESTful API Design](https://restfulapi.net/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - Database management
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) or [Render](https://render.com/) - Backend hosting

---

## 🎯 Estimated Timeline

| Step | Duration | Total |
|------|----------|-------|
| 1. Prepare | 15 min | 15 min |
| 2. Backend Setup | 45 min | 60 min |
| 3. Database | 60 min | 120 min |
| 4. Authentication | 60 min | 180 min |
| 5. Story API | 90 min | 270 min |
| 6. Frontend | 90 min | 360 min |
| 7. AI & Testing | 120 min | 480 min |

**Total:** ~8 hours of guided development with Copilot

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git installed
- VS Code with GitHub Copilot extension
- PostgreSQL/Supabase account
- Google API key for Gemini (free tier available)

### Start Here
1. Read `STEPS_1_PREPARING.md`
2. Open GitHub Copilot in VS Code
3. Create your development branch
4. Follow each step sequentially

---

## 💡 Pro Tips

1. **Always review Copilot's suggestions** before clicking Continue
2. **Test each step** before moving to the next
3. **Save your work** frequently with git commits
4. **Use the sample prompts** as templates, customize as needed
5. **Check the verification checklist** at each step
6. **Keep your `.env` file secure** - never commit it
7. **Ask Copilot questions** - it's conversational!

---

## 📞 Getting Help

If you encounter issues:
1. Check the **Verification Checklist** in each step
2. Review **error messages carefully** - they're descriptive
3. Ask **Copilot directly** in the chat - it's great at debugging
4. Check the **Terminal/Console** for detailed error logs
5. Visit the **Resources section** for documentation links

---

## 🎉 What's Next After Completion?

After finishing all 7 steps, you have a complete, production-ready web application! Here are next steps to consider:

- Deploy to production (Vercel + Railway)
- Add automated testing (Jest, Playwright)
- Implement advanced features (notifications, social sharing)
- Optimize performance (caching, CDN, database indexing)
- Add monitoring and analytics
- Implement CI/CD pipeline with GitHub Actions
- Scale your infrastructure

---

**Happy coding! You're building something amazing with AI! 🚀✨**

Start with [Step 1: Prepare Development Environment](./STEPS_1_PREPARING.md)
