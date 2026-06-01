## Step 4: Authentication System - User Registration & Login API

With your database ready, let's create the authentication system for CMC Truyện using JWT tokens and role-based access control!

### 🎯 What We're Creating This Step

By the end of this step, you'll have:
- ✅ User registration endpoint with input validation
- ✅ User login endpoint with password verification
- ✅ JWT token generation and validation
- ✅ Authentication middleware for protecting routes
- ✅ Role-based authorization middleware
- ✅ Password hashing with bcryptjs

### 🔐 Authentication Flow

```
1. User Registration
   ↓
   POST /api/auth/register
   ↓
   Validate input (email, password strength)
   ↓
   Hash password with bcryptjs
   ↓
   Save user to database
   ↓
   Generate JWT token
   ↓
   Return token + user data

2. User Login
   ↓
   POST /api/auth/login
   ↓
   Find user by email
   ↓
   Compare password with hash
   ↓
   Generate JWT token
   ↓
   Return token + user data

3. Protected Routes
   ↓
   Request includes Authorization: Bearer <token>
   ↓
   Middleware verifies JWT signature
   ↓
   Decode token to get user ID and role
   ↓
   Check role permissions
   ↓
   Route handler executes
```

---

## 🚀 Activity: Create Authentication with Copilot

### Step 1: Create User Controller with Auth Logic

1. **Open Copilot Chat** and paste this prompt:

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create authentication controllers in backend/src/controllers/authController.js with the following functions:
   > 
   > 1. **register(req, res)** function that:
   >    - Accepts username, email, password, full_name from request body
   >    - Validates input using Joi schema (email format, password length >= 8)
   >    - Checks if email already exists in database
   >    - Hashes password using bcryptjs (salt rounds: 10)
   >    - Creates new user with role: 'User' (default)
   >    - Generates JWT token (expires in 7 days)
   >    - Returns 201 status with token and user data (excluding password)
   >    - Returns 400/409 status on validation/duplicate email errors
   > 
   > 2. **login(req, res)** function that:
   >    - Accepts email and password from request body
   >    - Validates required fields
   >    - Finds user by email in database
   >    - Uses bcryptjs to compare provided password with stored hash
   >    - If invalid credentials, returns 401 status
   >    - If valid, generates JWT token (expires in 7 days)
   >    - Returns 200 status with token and user data (excluding password)
   > 
   > 3. **logout(req, res)** function that:
   >    - Simple function that returns 200 with "Logged out successfully"
   >    - (Note: JWT tokens are stateless, real logout would need blacklist/refresh logic)
   > 
   > 4. **getCurrentUser(req, res)** function that:
   >    - Requires authentication middleware to be called first
   >    - Returns current user data from req.user (populated by middleware)
   >    - Excludes password field
   > 
   > Use environment variables for JWT_SECRET and JWT_EXPIRE.
   > Use the User model from models folder to interact with database.
   > ```

2. **Review and click Continue**

### Step 2: Create Authentication Middleware

3. **Paste this prompt to create auth middleware:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create authentication middleware in backend/src/middleware/authMiddleware.js that:
   > 
   > 1. **authenticateToken(req, res, next)** middleware function that:
   >    - Extracts JWT token from Authorization header (Bearer <token>)
   >    - If no token is provided, returns 401 "No token provided"
   >    - Verifies token signature using JWT_SECRET
   >    - If invalid/expired token, returns 401 "Invalid or expired token"
   >    - If valid, decodes token and attaches user data to req.user
   >    - Calls next() to continue to route handler
   > 
   > Also create role-based authorization in backend/src/middleware/roleMiddleware.js:
   > 
   > 2. **authorizeRole(...roles)** middleware that:
   >    - Returns a middleware function that checks req.user.role
   >    - Accepts array of allowed roles (e.g., ['Admin', 'Uploader'])
   >    - If user role not in allowed roles, returns 403 "Access denied"
   >    - If user has correct role, calls next()
   >    - Use this on routes like: router.delete('/stories/:id', authorizeRole('Admin', 'Uploader'), deleteStory)
   > 
   > 3. **errorHandler(err, req, res, next)** error handling middleware in backend/src/middleware/errorMiddleware.js:
   >    - Logs error to console
   >    - Returns 500 status with generic error message
   >    - Hides internal error details in production
   >    - Should catch async errors and pass to this middleware
   > ```

4. **Review and click Continue**

### Step 3: Create Authentication Routes

5. **Paste this prompt to create auth routes:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Create authentication routes in backend/src/routes/authRoutes.js that:
   > 
   > 1. POST /register
   >    - Route handler: authController.register
   >    - No middleware required (public endpoint)
   > 
   > 2. POST /login
   >    - Route handler: authController.login
   >    - No middleware required (public endpoint)
   > 
   > 3. POST /logout
   >    - Route handler: authController.logout
   >    - Middleware: authenticateToken (requires login)
   > 
   > 4. GET /me
   >    - Route handler: authController.getCurrentUser
   >    - Middleware: authenticateToken (requires login)
   > 
   > Export the router as default export.
   > Use Express Router.
   > ```

6. **Review and click Continue**

### Step 4: Update Main App with Auth Routes

7. **Paste this prompt to integrate auth routes into main app:**

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=flat-square&logo=github%20copilot&labelColor=512a97&color=ecd8ff)
   >
   > ```prompt
   > Update backend/src/app.js to:
   > 
   > 1. Import the authRoutes from routes/authRoutes.js
   > 2. Add the routes to the Express app: app.use('/api/auth', authRoutes)
   > 3. Import and use errorHandler middleware at the end (should be last middleware)
   > 4. Make sure app is exported as default
   > ```

8. **Review and click Continue**

---

## ✅ Verification Checklist

After Copilot completes, verify you have:

- [ ] `backend/src/controllers/authController.js` with register, login, logout, getCurrentUser
- [ ] `backend/src/middleware/authMiddleware.js` with authenticateToken function
- [ ] `backend/src/middleware/roleMiddleware.js` with authorizeRole function
- [ ] `backend/src/middleware/errorMiddleware.js` with error handler
- [ ] `backend/src/routes/authRoutes.js` with 4 endpoints
- [ ] `backend/src/app.js` updated with auth routes and error middleware

---

## 🧪 Testing Your Authentication API

### Test Registration:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "full_name": "Test User"
  }'
```

### Test Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Test Protected Route (using token from login):

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 📋 API Response Examples

### Registration Success (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "User"
  }
}
```

### Login Success (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "User"
  }
}
```

### Authentication Error (401):
```json
{
  "error": "Invalid credentials"
}
```

---

## 🔗 Next Steps

You're ready for **Step 5: Create Story Management API** to handle story CRUD operations!

**Ready?** → [Go to Step 5](./5-story-management-api.md)

### 💡 Security Notes

- Passwords are never returned in API responses
- JWT tokens are stored on client side (localStorage/sessionStorage)
- Always use HTTPS in production for token transmission
- Consider adding refresh token rotation for enhanced security
- Rate limiting recommended on auth endpoints to prevent brute force attacks
