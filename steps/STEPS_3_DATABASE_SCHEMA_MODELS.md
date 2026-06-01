## Step 3: Database Schema & Models - Set Up PostgreSQL

Now that your backend is scaffolded, let's create the database schema and Sequelize/TypeORM models for CMC Truyện!

### 🎯 What We're Creating This Step

By the end of this step, you'll have:
- ✅ PostgreSQL database schema with 8 tables
- ✅ Database connection and migration scripts
- ✅ User roles and permissions setup
- ✅ Database indexes for performance optimization
- ✅ Sample data population (optional)

### 📊 Database Schema Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts with roles | id, username, email, password, role, avatar_url |
| **stories** | Story metadata | id, title, author_id, description, category, status |
| **chapters** | Story chapters | id, story_id, chapter_number, title, content |
| **reading_history** | User reading progress | id, user_id, story_id, last_chapter, completion_rate |
| **user_follows** | Favorite/Follow system | id, user_id, story_id |
| **comments** | Story/chapter comments | id, user_id, story_id, chapter_id, content, rating |
| **user_preferences** | User settings | id, user_id, dark_mode, font_size, theme_color |
| **ai_summaries** | Cached AI summaries | id, chapter_id, summary |

---

## 🚀 Activity: Create Database Schema with Copilot

### Step 1: Create the Database Schema File

1. **Open Copilot Chat** and paste this prompt:

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > I need to create a PostgreSQL database schema for CMC Truyện (online story reading platform).
   > 
   > Create a file at backend/scripts/schema.sql with the following tables:
   > 
   > 1. **users** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - username (VARCHAR 100, UNIQUE)
   >    - email (VARCHAR 255, UNIQUE)
   >    - password (VARCHAR 255) - will store bcrypt hashes
   >    - full_name (VARCHAR 255)
   >    - avatar_url (VARCHAR 500)
   >    - role (VARCHAR 50) - values: Admin, Uploader, User, Guest
   >    - bio (TEXT)
   >    - created_at, updated_at (TIMESTAMP with DEFAULT CURRENT_TIMESTAMP)
   >    - is_active (BOOLEAN DEFAULT true)
   > 
   > 2. **stories** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - title (VARCHAR 255, NOT NULL)
   >    - slug (VARCHAR 255, UNIQUE)
   >    - author_id (INTEGER, FOREIGN KEY to users)
   >    - description (TEXT)
   >    - cover_image_url (VARCHAR 500)
   >    - category (VARCHAR 100)
   >    - status (VARCHAR 50) - values: Ongoing, Completed, Hiatus
   >    - total_chapters (INTEGER DEFAULT 0)
   >    - created_at, updated_at (TIMESTAMP)
   >    - is_published (BOOLEAN DEFAULT true)
   > 
   > 3. **chapters** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - story_id (INTEGER, FOREIGN KEY to stories ON DELETE CASCADE)
   >    - chapter_number (INTEGER)
   >    - title (VARCHAR 255)
   >    - content (TEXT)
   >    - created_at, updated_at (TIMESTAMP)
   >    - is_published (BOOLEAN DEFAULT true)
   >    - UNIQUE constraint on (story_id, chapter_number)
   > 
   > 4. **reading_history** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - user_id (INTEGER, FOREIGN KEY to users)
   >    - story_id (INTEGER, FOREIGN KEY to stories)
   >    - last_chapter_read (INTEGER)
   >    - last_read_position (INTEGER DEFAULT 0)
   >    - total_read_time (INTEGER DEFAULT 0) - in seconds
   >    - completion_rate (FLOAT DEFAULT 0) - percentage
   >    - last_read_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   >    - created_at (TIMESTAMP)
   >    - UNIQUE constraint on (user_id, story_id)
   > 
   > 5. **user_follows** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - user_id (INTEGER, FOREIGN KEY to users)
   >    - story_id (INTEGER, FOREIGN KEY to stories)
   >    - followed_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   >    - UNIQUE constraint on (user_id, story_id)
   > 
   > 6. **comments** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - user_id (INTEGER, FOREIGN KEY to users)
   >    - story_id (INTEGER, FOREIGN KEY to stories)
   >    - chapter_id (INTEGER, FOREIGN KEY to chapters ON DELETE SET NULL)
   >    - content (TEXT)
   >    - rating (INTEGER, CHECK rating 1-5)
   >    - created_at, updated_at (TIMESTAMP)
   > 
   > 7. **user_preferences** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - user_id (INTEGER, UNIQUE, FOREIGN KEY to users)
   >    - dark_mode (BOOLEAN DEFAULT false)
   >    - font_size (INTEGER DEFAULT 16)
   >    - line_spacing (FLOAT DEFAULT 1.5)
   >    - font_family (VARCHAR 100 DEFAULT 'Arial')
   >    - theme_color (VARCHAR 50 DEFAULT 'default')
   >    - auto_bookmark (BOOLEAN DEFAULT true)
   >    - updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   > 
   > 8. **ai_summaries** table with fields:
   >    - id (SERIAL PRIMARY KEY)
   >    - chapter_id (INTEGER, UNIQUE, FOREIGN KEY to chapters)
   >    - summary (TEXT)
   >    - generated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   > 
   > Please also add indexes on commonly queried fields for performance:
   > - Index on stories(author_id)
   > - Index on chapters(story_id)
   > - Index on reading_history(user_id), reading_history(story_id)
   > - Index on user_follows(user_id)
   > - Index on comments(user_id), comments(story_id)
   > ```

2. **Review and click Continue** to create the SQL schema file

### Step 2: Create Database Connection Script

3. **Paste another prompt to create a database initialization script:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create a file at backend/scripts/init-db.js that:
   > 
   > 1. Connects to the PostgreSQL database using the connection pool from src/config/database.js
   > 2. Reads the schema.sql file
   > 3. Executes the SQL to create all tables
   > 4. Logs success/error messages
   > 5. Can be run with: node backend/scripts/init-db.js
   > 
   > Also add a script in package.json:
   > "db:init": "node scripts/init-db.js"
   > 
   > The script should check if tables already exist before creating them to avoid errors.
   > ```

4. **Review and click Continue**

### Step 3: Create Sample Data Seed Script

5. **Paste this prompt to create sample data:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create a file at backend/scripts/seed-data.js that:
   > 
   > 1. Connects to the PostgreSQL database
   > 2. Clears existing data (optional, with user confirmation)
   > 3. Inserts sample data including:
   >    - 5 test users (admin, uploader, and regular users) with bcrypt hashed passwords
   >    - 10 sample stories with different categories and authors
   >    - 30 sample chapters across the stories
   >    - 20 sample comments
   >    - Sample reading histories
   >    - User preferences for each user
   > 
   > Make user passwords hashing using bcryptjs during insertion.
   > Add this to package.json: "db:seed": "node scripts/seed-data.js"
   > ```

6. **Review and click Continue**

---

## ✅ Verification Checklist

After Copilot completes, verify you have:

- [ ] `backend/scripts/schema.sql` - SQL schema with 8 tables
- [ ] `backend/scripts/init-db.js` - Database initialization script
- [ ] `backend/scripts/seed-data.js` - Sample data seeder
- [ ] `package.json` updated with npm scripts:
  - `npm run db:init` - Create tables
  - `npm run db:seed` - Add sample data
  - `npm run dev` - Start development server

---

## 📋 Manual Setup (if using Supabase)

### Create Database in Supabase:

1. **Go to [Supabase Console](https://app.supabase.com)**
2. **Create a new project** (or use existing one)
3. **Get your connection string** from Project Settings → Database → Connection Pooling
4. **Update `.env`** with `DATABASE_URL`

### Run Database Initialization:

```bash
cd backend
npm install  # Install dependencies first if not done
npm run db:init  # Create tables
npm run db:seed  # Add sample data
```

---

## 🔗 Next Steps

You're ready for **Step 4: Create Authentication System** to implement user login and registration!

**Ready?** → [Go to Step 4](./4-authentication-system.md)

### 💡 Database Notes

- All timestamps use UTC timezone (`TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
- Passwords are hashed with bcryptjs before being stored
- Role-based access controlled through the `role` field in users table
- Foreign keys ensure data integrity (cascade deletes for stories/chapters)
- Unique indexes prevent duplicate email addresses and usernames
