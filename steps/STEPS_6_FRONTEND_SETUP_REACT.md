## Step 6: Frontend Setup with React - Build the User Interface

Now it's time to create the beautiful frontend for CMC Truyện using React, Tailwind CSS, and Bootstrap!

### 🎯 What We're Creating This Step

By the end of this step, you'll have:
- ✅ React project with TypeScript support
- ✅ Complete component library (Navbar, StoryCard, StoryReader, etc.)
- ✅ Page routing with React Router
- ✅ Tailwind CSS + Bootstrap styling
- ✅ Dark mode support
- ✅ API integration service

### 🎨 Frontend Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation header
│   │   ├── StoryCard.jsx       # Story preview card
│   │   ├── StoryReader.jsx     # Chapter reading interface
│   │   ├── UserProfile.jsx     # User profile display
│   │   ├── CommentSection.jsx  # Comments for stories
│   │   ├── AIChapterSummary.jsx # AI-powered summary
│   │   └── Footer.jsx          # Footer component
│   ├── pages/
│   │   ├── HomePage.jsx        # Homepage with story list
│   │   ├── StoryDetailPage.jsx # Story details
│   │   ├── ChapterReaderPage.jsx # Read chapters
│   │   ├── UserProfilePage.jsx # User profile
│   │   ├── LoginPage.jsx       # Login form
│   │   ├── RegisterPage.jsx    # Registration form
│   │   └── DashboardPage.jsx   # Dashboard for uploaders
│   ├── services/
│   │   ├── api.js              # Axios instance
│   │   └── authService.js      # Auth API calls
│   ├── styles/
│   │   ├── main.css            # Global styles
│   │   └── darkMode.css        # Dark mode styles
│   ├── App.jsx                 # Main app component
│   └── index.js                # Entry point
├── public/
├── package.json
└── tailwind.config.js
```

---

## 🚀 Activity: Set Up React Frontend with Copilot

### Step 1: Create React Project

1. **Open Copilot Chat** and paste this prompt:

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > I need to create a React frontend for CMC Truyện application.
   > 
   > Please help me setup:
   > 1. Create frontend directory with npx create-react-app . (using React 18 + TypeScript)
   > 2. Install dependencies:
   >    - react-router-dom (for routing)
   >    - axios (for API calls)
   >    - bootstrap (for styling)
   >    - tailwindcss postcss autoprefixer (for Tailwind)
   > 
   > 3. Setup Tailwind CSS configuration (npx tailwindcss init -p)
   > 
   > 4. Create .env file with:
   >    REACT_APP_API_URL=http://localhost:5000/api
   >    REACT_APP_ENV=development
   > 
   > 5. Update src/index.js to:
   >    - Import Bootstrap CSS
   >    - Import Tailwind CSS
   >    - Use React 18 createRoot API
   > 
   > 6. Create directory structure:
   >    - src/components/
   >    - src/pages/
   >    - src/services/
   >    - src/styles/
   > 
   > Please create the React project with these configurations.
   > ```

2. **Review and click Continue**

### Step 2: Create API Service Layer

3. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create API service layer in frontend/src/services/api.js that:
   > 
   > 1. Creates axios instance with:
   >    - baseURL from REACT_APP_API_URL environment variable
   >    - Default headers
   > 
   > 2. Adds request interceptor to:
   >    - Attach JWT token from localStorage to Authorization header
   >    - For requests that need authentication
   > 
   > 3. Adds response interceptor to:
   >    - Handle 401 errors (token expired)
   >    - Redirect to login page
   >    - Handle other errors gracefully
   > 
   > 4. Export API methods for:
   >    - auth.register(data)
   >    - auth.login(data)
   >    - auth.logout()
   >    - auth.getCurrentUser()
   >    - stories.getAll(page, limit)
   >    - stories.getById(id)
   >    - stories.create(data)
   >    - stories.update(id, data)
   >    - stories.delete(id)
   >    - stories.search(query, category)
   >    - chapters.getByStory(storyId, page)
   >    - chapters.getById(storyId, chapterId)
   >    - chapters.create(storyId, data)
   >    - chapters.update(storyId, chapterId, data)
   >    - comments.getByStory(storyId)
   >    - comments.create(data)
   > 
   > Keep API methods organized by resource.
   > ```

4. **Review and click Continue**

### Step 3: Create Auth Service

5. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create authentication service in frontend/src/services/authService.js that:
   > 
   > 1. **register(username, email, password, fullName)** function
   >    - Calls API.auth.register with form data
   >    - Saves token to localStorage
   >    - Saves user data to localStorage
   >    - Returns user data
   > 
   > 2. **login(email, password)** function
   >    - Calls API.auth.login with credentials
   >    - Saves token to localStorage
   >    - Saves user data to localStorage
   >    - Returns user data
   > 
   > 3. **logout()** function
   >    - Removes token from localStorage
   >    - Removes user data from localStorage
   > 
   > 4. **getToken()** function
   >    - Returns token from localStorage or null
   > 
   > 5. **getCurrentUser()** function
   >    - Returns user data from localStorage or null
   > 
   > 6. **isAuthenticated()** function
   >    - Returns true if token exists, false otherwise
   > 
   > 7. **hasRole(requiredRole)** function
   >    - Checks if current user has required role
   > 
   > Export all functions as object.
   > ```

6. **Review and click Continue**

### Step 4: Create Essential Components

7. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create React components in frontend/src/components/:
   > 
   > 1. **Navbar.jsx** component with:
   >    - Logo/brand linking to home
   >    - Search bar for stories
   >    - Navigation links (Home, Browse, Dashboard, Profile)
   >    - Login/Logout buttons based on auth state
   >    - Hamburger menu for mobile responsive design
   >    - Dark mode toggle button
   >    - Use Bootstrap navbar classes
   > 
   > 2. **StoryCard.jsx** component with:
   >    - Story cover image
   >    - Title and author name
   >    - Category badge
   >    - Short description truncated
   >    - Chapter count
   >    - Star rating (if available)
   >    - Link to story detail page
   >    - Hover effects with shadow
   >    - Responsive grid layout
   > 
   > 3. **Footer.jsx** component with:
   >    - Copyright info
   >    - Quick links (About, Contact, Terms)
   >    - Social media links
   >    - Newsletter signup
   >    - Bootstrap grid layout
   > 
   > Make components reusable and styled with Tailwind CSS and Bootstrap classes.
   > Use proper prop types/TypeScript interfaces for props.
   > ```

8. **Review and click Continue**

### Step 5: Create Page Components

9. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create page components in frontend/src/pages/:
   > 
   > 1. **HomePage.jsx** that:
   >    - Displays list of stories using StoryCard component
   >    - Implements pagination
   >    - Shows loading state while fetching
   >    - Shows error message on API failure
   >    - Includes search/filter functionality
   >    - Responsive grid layout (1 col on mobile, 2 on tablet, 3+ on desktop)
   > 
   > 2. **LoginPage.jsx** that:
   >    - Form with email and password fields
   >    - Submit button that calls authService.login()
   >    - Error message display
   >    - Link to register page
   >    - Redirect to home after successful login
   > 
   > 3. **RegisterPage.jsx** that:
   >    - Form with username, email, password, full_name fields
   >    - Submit button that calls authService.register()
   >    - Password validation (min 8 chars)
   >    - Error message display
   >    - Link to login page
   >    - Redirect to home after successful registration
   > 
   > Use React hooks (useState, useEffect, useNavigate) for state management.
   > Add loading states and error handling.
   > Use Bootstrap form classes for styling.
   > ```

10. **Review and click Continue**

### Step 6: Create Main App Component

11. **Paste this prompt:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create frontend/src/App.jsx that:
   > 
   > 1. Uses React Router with BrowserRouter
   > 
   > 2. Defines routes:
   >    - / → HomePage
   >    - /login → LoginPage
   >    - /register → RegisterPage
   >    - /story/:id → StoryDetailPage (create this as placeholder)
   >    - /story/:storyId/chapter/:chapterId → ChapterReaderPage (create this as placeholder)
   >    - /profile → UserProfilePage (protected, requires auth)
   >    - /dashboard → DashboardPage (protected, requires Uploader/Admin role)
   > 
   > 3. Includes:
   >    - Navbar component at top
   >    - Footer component at bottom
   >    - Main content area with Outlet
   >    - Dark mode context/state management
   > 
   > 4. Creates context provider for:
   >    - Authentication state
   >    - Dark mode toggle
   > 
   > Use React Router v6 syntax (Routes, Route, Outlet, useNavigate, etc).
   > Export App as default.
   > ```

12. **Review and click Continue**

---

## ✅ Verification Checklist

- [ ] `frontend/` directory created with React
- [ ] All dependencies installed (react-router-dom, axios, bootstrap, tailwindcss)
- [ ] `frontend/src/services/api.js` with axios instance
- [ ] `frontend/src/services/authService.js` with auth functions
- [ ] `frontend/src/components/` with Navbar, StoryCard, Footer
- [ ] `frontend/src/pages/` with HomePage, LoginPage, RegisterPage
- [ ] `frontend/src/App.jsx` with routing setup
- [ ] `frontend/.env` with API_URL configured
- [ ] Tailwind CSS configuration file

---

## 🧪 Testing the Frontend

### Start Development Server:

```bash
cd frontend
npm start
```

The app should open at `http://localhost:3000`

### Test Features:
- [ ] Navigation works
- [ ] Home page loads stories from API
- [ ] Registration form submits to backend
- [ ] Login works with valid credentials
- [ ] Protected pages require authentication
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile/tablet

---

## 🔗 Next Steps

You're almost done! **Step 7: Connect Frontend to Backend & AI Integration** will complete the application!

**Ready?** → [Go to Step 7](./7-ai-integration-testing.md)

### 💡 Frontend Notes

- All API requests include JWT token automatically via axios interceptor
- localStorage stores token and user data (use sessionStorage for sensitive deployments)
- Dark mode preference can be saved to localStorage for persistence
- Error boundaries recommended for production robustness
- Consider adding loading skeletons for better UX while data is fetching
