# Getting started - CMC Truyện Platform Frontend and Backend Setup

## Explain to GitHub Copilot the goals and steps

```text
I want to build a CMC Truyện (Online Story Reading Platform) that will include the following:

* User authentication and profiles (Admin, Uploader, User, Guest roles)
* Story management and chapter reading
* Reading history tracking and auto-bookmark
* Story search and filtering
* User preferences (dark mode, font size, reading settings)
* AI-powered chapter/story summaries
* Comment system for stories and chapters
* Follow/favorite stories system
* User dashboard and profile management

It should be a complete, full-stack application

generate instructions in this order

1. Create the frontend and backend directory structure for cmc-truyen project
2. Setup backend Node.js/Express with environment configuration
3. Create a backend/package.json with all required dependencies
4. The backend directory will store the Express.js server with routes, middleware, and controllers
5. Setup the frontend directory with React or vanilla JavaScript
6. Install frontend dependencies (React, Tailwind CSS, Bootstrap)
7. Create database configuration files (PostgreSQL/Supabase connection)
8. Setup environment variables (.env file) for API keys, database credentials
9. Create initial database schema for users, stories, chapters, comments, reading_history
10. Setup authentication middleware and role-based access control

The directory tree for CMC Truyện Platform
cmc-truyen/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── environment.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── storyController.js
│   │   │   ├── chapterController.js
│   │   │   ├── userController.js
│   │   │   └── commentController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Story.js
│   │   │   ├── Chapter.js
│   │   │   ├── ReadingHistory.js
│   │   │   └── Comment.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── storyRoutes.js
│   │   │   ├── chapterRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── commentRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── aiService.js (for Gemini API integration)
│   │   │   ├── authService.js
│   │   │   └── storyService.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env (environment variables)
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── StoryCard.jsx
    │   │   ├── StoryReader.jsx
    │   │   ├── UserProfile.jsx
    │   │   ├── CommentSection.jsx
    │   │   └── AIChapterSummary.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── StoryDetailPage.jsx
    │   │   ├── ChapterReaderPage.jsx
    │   │   ├── UserProfilePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   └── DashboardPage.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── authService.js
    │   ├── styles/
    │   │   ├── main.css
    │   │   └── darkMode.css
    │   ├── App.jsx
    │   └── index.js
    ├── package.json
    └── README.md

Create a backend/package.json with the following Node.js required packages

{
  "name": "cmc-truyen-backend",
  "version": "1.0.0",
  "description": "Backend API for CMC Truyện platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-cors": "^1.0.1",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "@supabase/supabase-js": "^2.38.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "joi": "^17.11.0",
    "axios": "^1.6.2",
    "@google-cloud/vertexai": "^1.0.0",
    "multer": "^1.4.5-lts.1",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}

All of the backend structure will be in src/ directory with separate controllers, models, routes, middleware, and services

Use environment variables for all sensitive information (database credentials, API keys, JWT secrets)

For database, use PostgreSQL with Supabase as the cloud provider

Use Bootstrap and Tailwind CSS for responsive frontend design

Let's think about this step by step
```

### Commands to setup CMC Truyện project structure

```bash
mkdir -p cmc-truyen/{backend/src/{config,controllers,models,routes,middleware,services,scripts},frontend}

cd cmc-truyen/backend

npm init -y

npm install express dotenv cors pg bcryptjs jsonwebtoken joi axios multer morgan helmet

npm install -D nodemon jest supertest

# Setup frontend
cd ../frontend

npx create-react-app . --template typescript

npm install bootstrap tailwindcss postcss autoprefixer

npm install react-router-dom axios

npx tailwindcss init -p

# Create .env files
cd ../backend
touch .env .env.example

cd ../frontend
touch .env .env.example
```

## Initialize Database Schema and Setup Configuration

### Backend Configuration Files

#### backend/.env

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/cmc_truyen
DB_HOST=db.supabase.co
DB_PORT=5432
DB_NAME=cmc_truyen
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### backend/.env.example

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

DATABASE_URL=postgresql://user:password@db.supabase.co:5432/cmc_truyen
DB_HOST=db.supabase.co
DB_PORT=5432
DB_NAME=cmc_truyen
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

GEMINI_API_KEY=your_key
FRONTEND_URL=http://localhost:3000
```

#### backend/src/config/database.js

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
```

#### backend/src/config/environment.js

```javascript
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL,
};
```

### Database Schema (SQL)

Create file: `backend/scripts/schema.sql`

```sql
-- Users table with roles (Admin, Uploader, User, Guest)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'User' CHECK (role IN ('Admin', 'Uploader', 'User', 'Guest')),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Stories table
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  description TEXT,
  cover_image_url VARCHAR(500),
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed', 'Hiatus')),
  total_chapters INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_published BOOLEAN DEFAULT true
);

-- Chapters table
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_published BOOLEAN DEFAULT true,
  UNIQUE(story_id, chapter_number)
);

-- Reading history for users
CREATE TABLE reading_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  story_id INTEGER NOT NULL REFERENCES stories(id),
  last_chapter_read INTEGER,
  last_read_position INTEGER DEFAULT 0,
  total_read_time INTEGER DEFAULT 0, -- in seconds
  completion_rate FLOAT DEFAULT 0, -- percentage
  last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, story_id)
);

-- User story follows/favorites
CREATE TABLE user_follows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  story_id INTEGER NOT NULL REFERENCES stories(id),
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, story_id)
);

-- Comments on stories and chapters
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  story_id INTEGER NOT NULL REFERENCES stories(id),
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  dark_mode BOOLEAN DEFAULT false,
  font_size INTEGER DEFAULT 16, -- in pixels
  line_spacing FLOAT DEFAULT 1.5,
  font_family VARCHAR(100) DEFAULT 'Arial',
  theme_color VARCHAR(50) DEFAULT 'default',
  auto_bookmark BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Summary cache
CREATE TABLE ai_summaries (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER UNIQUE NOT NULL REFERENCES chapters(id),
  summary TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_chapters_story ON chapters(story_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_reading_history_story ON reading_history(story_id);
CREATE INDEX idx_user_follows_user ON user_follows(user_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_story ON comments(story_id);
```

## Sample Backend Code

### backend/src/models/User.js

```javascript
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, full_name, role = 'User' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, email, hashedPassword, full_name, role]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { username, full_name, bio, avatar_url } = userData;
    const result = await pool.query(
      'UPDATE users SET username = $1, full_name = $2, bio = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [username, full_name, bio, avatar_url, id]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
```

### backend/src/controllers/authController.js

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/environment');

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password, full_name } = req.body;
      
      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Create user
      const newUser = await User.create({
        username,
        email,
        password,
        full_name,
        role: 'User'
      });

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;
```

### backend/src/middleware/authMiddleware.js

```javascript
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

### backend/src/middleware/roleMiddleware.js

```javascript
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    next();
  };
};

module.exports = roleMiddleware;
```

### backend/src/app.js

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
```

### backend/src/server.js

```javascript
const app = require('./app');
const pool = require('./config/database');
const { PORT } = require('./config/environment');

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Frontend Setup

### frontend/.env

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### frontend/src/App.jsx

```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import StoryDetailPage from './pages/StoryDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import DashboardPage from './pages/DashboardPage';
import './styles/main.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      setUserRole(userData?.role);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/story/:id" element={<StoryDetailPage />} />
          <Route path="/story/:storyId/chapter/:chapterId" element={<ChapterReaderPage />} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated && (userRole === 'Admin' || userRole === 'Uploader') ? <DashboardPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## Running the Application

### Start Backend

```bash
cd backend
npm install
npm run dev
```

### Start Frontend

```bash
cd frontend
npm install
npm start
```

### Database Setup with Supabase

1. Create a Supabase project
2. Run the schema.sql file in Supabase SQL Editor
3. Update DATABASE_URL in backend/.env with your Supabase connection string

## Commands for Initial Setup

```bash
# Clone/initialize the project
mkdir cmc-truyen && cd cmc-truyen

# Backend setup
mkdir -p backend/src/{config,controllers,models,routes,middleware,services,scripts}
cd backend
npm init -y
npm install express dotenv cors pg bcryptjs jsonwebtoken joi axios multer morgan helmet
npm install -D nodemon jest supertest
touch .env .env.example
cd src
touch app.js server.js
cd ../scripts
touch schema.sql
cd ../../../

# Frontend setup
cd frontend
npx create-react-app . --template typescript
npm install bootstrap tailwindcss postcss autoprefixer react-router-dom axios
npx tailwindcss init -p
touch .env .env.example
```

## Next Steps for Development

- [ ] Setup Supabase PostgreSQL database
- [ ] Implement all API endpoints (CRUD for stories, chapters, comments)
- [ ] Add AI summarization service (Gemini API integration)
- [ ] Create React components for story reader
- [ ] Implement authentication and role-based access control
- [ ] Add user preferences (dark mode, font size)
- [ ] Create admin dashboard for content management
- [ ] Add pagination and search functionality
- [ ] Implement reading history tracking
- [ ] Deploy to production (Vercel for frontend, Railway/Render for backend)

This tracker prompt provides a complete foundation for building the CMC Truyện platform from scratch.
