## Step 2: Backend Initial Setup - Create Project Structure

Now that you have your development branch ready, let's use GitHub Copilot agent mode to set up the complete backend structure for CMC Truyện!

### 🎯 What We're Creating This Step

By the end of this step, you'll have:
- ✅ Complete Node.js/Express project structure
- ✅ Backend directory with `src/` organization (config, controllers, models, routes, middleware, services)
- ✅ `package.json` with all required dependencies
- ✅ Environment configuration files (`.env`, `.env.example`)
- ✅ Basic Express.js server setup
- ✅ Database connection configuration

### 📋 Backend Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js 18+ | Server runtime |
| **Framework** | Express.js | Web server framework |
| **Database** | PostgreSQL (Supabase) | Primary database |
| **Authentication** | JWT + bcryptjs | Secure auth & password hashing |
| **API Documentation** | JSDoc/Swagger | API specs |
| **Validation** | Joi | Input validation |
| **AI Integration** | Gemini API | Chapter summaries & recommendations |
| **File Upload** | Multer | Handle image uploads |
| **Logging** | Morgan | HTTP request logging |
| **Security** | Helmet | HTTP security headers |

---

## 🚀 Activity: Use Copilot Agent Mode to Set Up Backend

Follow these steps to use Copilot agent mode to create your backend structure:

### Step 1: Open Copilot Agent and Prepare Backend

1. **Open GitHub Copilot Chat** (Ctrl+Shift+I in VS Code)

2. **Paste this prompt into the chat and select "Agent" mode:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > I want to create a complete backend for CMC Truyện using Node.js and Express.js.
   > 
   > Please help me:
   > 1. Create the backend directory structure with the following folders:
   >    - src/config (for database and environment configuration)
   >    - src/controllers (for route handlers)
   >    - src/models (for database queries and logic)
   >    - src/routes (for API routes)
   >    - src/middleware (for authentication and error handling)
   >    - src/services (for business logic like AI integration)
   >    - src/scripts (for database migrations)
   > 
   > 2. Create a package.json with these dependencies:
   >    - express, dotenv, cors, pg (PostgreSQL client)
   >    - bcryptjs (password hashing), jsonwebtoken (JWT auth)
   >    - joi (input validation), axios (HTTP requests)
   >    - multer (file uploads), morgan (logging), helmet (security)
   > 
   > 3. Create .env and .env.example files with these variables:
   >    - NODE_ENV, PORT, API_URL
   >    - Database credentials (DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
   >    - JWT_SECRET, JWT_EXPIRE
   >    - GEMINI_API_KEY, FRONTEND_URL
   > 
   > 4. Create initial configuration files:
   >    - src/config/database.js (PostgreSQL connection pool)
   >    - src/config/environment.js (load environment variables)
   >    - src/app.js (Express app setup with middleware)
   >    - src/server.js (start the server)
   > 
   > Please create all these files and folders.
   > ```

3. **Review the plan** that Copilot suggests and click **Continue**

4. **Wait for Copilot to finish creating all files** (this may take a moment)

---

## ✅ Verification Checklist

After Copilot completes, verify you have:

- [ ] `backend/` folder exists with `src/` subdirectory
- [ ] `backend/package.json` contains all required dependencies
- [ ] `backend/.env` and `backend/.env.example` files exist
- [ ] Directory structure:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   │   ├── database.js
  │   │   └── environment.js
  │   ├── controllers/
  │   ├── models/
  │   ├── routes/
  │   ├── middleware/
  │   ├── services/
  │   ├── scripts/
  │   ├── app.js
  │   └── server.js
  ├── .env
  ├── .env.example
  └── package.json
  ```

---

## 📝 Manual Configuration (if needed)

### Update `backend/.env` with Supabase credentials:

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Get these from your Supabase project settings
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/cmc_truyen
DB_HOST=db.supabase.co
DB_PORT=5432
DB_NAME=cmc_truyen
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

---

## 🔗 Next Steps

You're ready to move to **Step 3: Database Schema and Models** to set up your PostgreSQL database!

**Ready?** → [Go to Step 3](./3-database-schema-models.md)

### 💡 Quick Reference

- **PostgreSQL Connection:** Handled by `src/config/database.js`
- **Environment Loading:** Handled by `src/config/environment.js`
- **Express Setup:** In `src/app.js` with CORS, helmet, and morgan middleware
- **Server Start:** `node src/server.js` or `npm run dev` (with nodemon)
