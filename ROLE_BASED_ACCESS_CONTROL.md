# 🔐 Role-Based Access Control Implementation Guide

**For**: Frontend Development Team  
**Status**: ✅ Production Ready  
**Last Updated**: 28 May 2026

---

## 📚 Table of Contents

1. [Role System Overview](#role-system-overview)
2. [Available Role Helpers](#available-role-helpers)
3. [Implementation Patterns](#implementation-patterns)
4. [Usage Examples](#usage-examples)
5. [Common Scenarios](#common-scenarios)
6. [Testing Role-Based Features](#testing-role-based-features)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Role System Overview

### Three-Tier Role Model

The system implements a simple but effective three-tier role hierarchy:

```
Admin (Full Access)
  ↓
Uploader (Content Creator)
  ↓
User (Consumer)
```

| Role | Description | Permissions |
|------|-------------|------------|
| **Admin** | System administrator | Full access to all features and user management |
| **Uploader** | Content creator | Create, read, update, delete own comics and chapters |
| **User** | Regular user | Read comics, comment, follow, manage profile |

### No Guest Role

⚠️ **Important**: There is **NO Guest role** in this system. All API endpoints require authentication.

---

## 🔧 Available Role Helpers

All role helper functions are exported from `auth.js`:

```javascript
import {
  isAdmin,
  isUploader,
  isUser,
  canManageContent,
  getUserRole
} from './js/auth.js';
```

### Function Reference

#### `isAdmin()`
**Returns**: `boolean`  
**Checks**: If current user's role is 'Admin'

```javascript
if (isAdmin()) {
  // Show admin-only features
}
```

---

#### `isUploader()`
**Returns**: `boolean`  
**Checks**: If current user's role is 'Uploader'

```javascript
if (isUploader()) {
  // Show uploader features (create comic, manage chapters)
}
```

---

#### `isUser()`
**Returns**: `boolean`  
**Checks**: If current user's role is 'User'

```javascript
if (isUser()) {
  // Show regular user features
}
```

---

#### `canManageContent()`
**Returns**: `boolean`  
**Checks**: If user is Admin OR Uploader

```javascript
if (canManageContent()) {
  // User can create/edit/delete content
}
```

**Equivalent to**:
```javascript
isAdmin() || isUploader()
```

---

#### `getUserRole()`
**Returns**: `string | null`  
**Returns**: Current user's role or null if not authenticated

```javascript
const role = getUserRole();
console.log(role); // 'Admin', 'Uploader', 'User', or null
```

---

## 💡 Implementation Patterns

### Pattern 1: Simple Role Check

```javascript
import { isAdmin } from './js/auth.js';

// Show/hide element based on role
const adminPanel = document.getElementById('admin-panel');
if (isAdmin()) {
  adminPanel.style.display = 'block';
} else {
  adminPanel.style.display = 'none';
}
```

### Pattern 2: Permission-Based Button State

```javascript
import { canManageContent } from './js/auth.js';

const uploadBtn = document.getElementById('upload-btn');
if (canManageContent()) {
  uploadBtn.disabled = false;
  uploadBtn.title = 'Upload new comic';
} else {
  uploadBtn.disabled = true;
  uploadBtn.title = 'Only creators can upload comics';
}
```

### Pattern 3: Multiple Role Checks

```javascript
import { isAdmin, isUploader, isUser } from './js/auth.js';

if (isAdmin()) {
  showAdminDashboard();
} else if (isUploader()) {
  showUploaderDashboard();
} else if (isUser()) {
  showUserDashboard();
}
```

### Pattern 4: Conditional API Calls

```javascript
import { canManageContent, getUserRole } from './js/auth.js';
import { createComic } from './js/novels.js';

async function handleCreateComic(formData) {
  if (!canManageContent()) {
    alert('Only creators can upload comics');
    return;
  }

  try {
    const result = await createComic(formData);
    if (result.success) {
      console.log('Comic created:', result.data);
    }
  } catch (error) {
    console.error('Failed to create comic:', error);
  }
}
```

### Pattern 5: Dynamic UI Rendering

```javascript
import { isAdmin, isUploader } from './js/auth.js';

function renderComicActions(comic, userId) {
  let actions = '';

  // Edit button (only for uploader or admin)
  if (isAdmin() || (isUploader() && comic.uploaderId === userId)) {
    actions += `<button onclick="editComic('${comic.id}')">Edit</button>`;
  }

  // Delete button (only for admin)
  if (isAdmin()) {
    actions += `<button onclick="deleteComic('${comic.id}')">Delete</button>`;
  }

  return actions;
}
```

---

## 📖 Usage Examples

### Example 1: Initialize After Login

```javascript
import { login, getUserRole, isAdmin } from './js/auth.js';

async function handleLogin(email, password) {
  const result = await login({ email, password });
  
  if (result.success) {
    const role = getUserRole();
    console.log(`Logged in as ${role}`);
    
    if (isAdmin()) {
      window.location.href = '/pages/admin.html';
    } else {
      window.location.href = '/index.html';
    }
  } else {
    console.error('Login failed:', result.error);
  }
}
```

### Example 2: Navigation Menu

```javascript
import { isAdmin, isUploader, canManageContent } from './js/auth.js';

function renderNavMenu() {
  const menu = document.getElementById('nav-menu');
  
  let html = `
    <a href="/index.html">Home</a>
    <a href="/pages/profile.html">Profile</a>
  `;

  if (canManageContent()) {
    html += `<a href="/pages/create-comic.html">Create Comic</a>`;
  }

  if (isAdmin()) {
    html += `<a href="/pages/admin.html">Admin Panel</a>`;
  }

  menu.innerHTML = html;
}
```

### Example 3: Dashboard Selection

```javascript
import { getUserRole } from './js/auth.js';

async function loadDashboard() {
  const role = getUserRole();

  switch (role) {
    case 'Admin':
      await import('./dashboards/admin-dashboard.js');
      break;
    case 'Uploader':
      await import('./dashboards/uploader-dashboard.js');
      break;
    case 'User':
      await import('./dashboards/user-dashboard.js');
      break;
    default:
      window.location.href = '/pages/login.html';
  }
}
```

### Example 4: Content Management

```javascript
import { isAdmin, isUploader } from './js/auth.js';
import { deleteComic, updateComic } from './js/novels.js';

async function manageComic(comicId, action) {
  const role = getUserRole();
  const comic = await getComic(comicId);

  // Authorization checks
  if (action === 'delete') {
    if (!isAdmin()) {
      throw new Error('Only admins can delete comics');
    }
  }

  if (action === 'edit') {
    if (!isAdmin() && !isUploader()) {
      throw new Error('Only creators can edit comics');
    }
  }

  // Execute action
  const result = await (action === 'delete' 
    ? deleteComic(comicId)
    : updateComic(comicId, {...})
  );

  return result;
}
```

---

## 🎯 Common Scenarios

### Scenario 1: Show "Upload Comic" Button Only to Uploaders

```html
<!-- HTML -->
<button id="upload-comic-btn" style="display: none;">Upload Comic</button>

<script type="module">
import { canManageContent } from './js/auth.js';

const uploadBtn = document.getElementById('upload-comic-btn');
if (canManageContent()) {
  uploadBtn.style.display = 'block';
}
</script>
```

### Scenario 2: Restrict Edit/Delete Actions

```javascript
import { isAdmin, isUploader } from './js/auth.js';

function canEditComic(comic, currentUserId) {
  // Admin can edit any comic
  if (isAdmin()) return true;

  // Uploader can edit their own comics
  if (isUploader() && comic.uploaderId === currentUserId) return true;

  return false;
}

function canDeleteComic(comic) {
  // Only admin can delete
  return isAdmin();
}
```

### Scenario 3: Admin-Only Settings

```javascript
import { isAdmin } from './js/auth.js';

async function accessAdminSettings() {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Load admin settings
  window.location.href = '/pages/admin.html';
}
```

### Scenario 4: Show Different UI Per Role

```javascript
import { isAdmin, isUploader, isUser } from './js/auth.js';

function renderUserDashboard() {
  const dashboard = document.getElementById('dashboard');

  if (isAdmin()) {
    dashboard.innerHTML = renderAdminDashboard();
  } else if (isUploader()) {
    dashboard.innerHTML = renderUploaderDashboard();
  } else if (isUser()) {
    dashboard.innerHTML = renderUserDashboard();
  }
}

function renderAdminDashboard() {
  return `
    <h1>Admin Dashboard</h1>
    <section>User Management</section>
    <section>System Analytics</section>
    <section>Content Moderation</section>
  `;
}

function renderUploaderDashboard() {
  return `
    <h1>Creator Dashboard</h1>
    <section>My Comics</section>
    <section>Create New Comic</section>
    <section>Statistics</section>
  `;
}

function renderUserDashboard() {
  return `
    <h1>Your Dashboard</h1>
    <section>Reading History</section>
    <section>Followed Comics</section>
    <section>Profile</section>
  `;
}
```

---

## 🧪 Testing Role-Based Features

### Test 1: Admin Can Access Admin Features

```javascript
import { isAdmin, login } from './js/auth.js';

async function testAdminAccess() {
  // Login as admin
  await login({ email: 'admin@example.com', password: 'admin123' });

  // Should have admin privileges
  console.assert(isAdmin() === true, 'Admin check failed');
  console.log('✓ Admin access test passed');
}
```

### Test 2: Regular User Cannot Access Admin Features

```javascript
import { isAdmin, isUser, login } from './js/auth.js';

async function testUserRestriction() {
  // Login as regular user
  await login({ email: 'user@example.com', password: 'user123' });

  // Should NOT have admin privileges
  console.assert(isAdmin() === false, 'Admin should be false');
  console.assert(isUser() === true, 'User should be true');
  console.log('✓ User restriction test passed');
}
```

### Test 3: Role Cleanup on Logout

```javascript
import { login, logout, getUserRole } from './js/auth.js';

async function testRoleCleanup() {
  // Login
  await login({ email: 'user@example.com', password: 'user123' });
  console.log('Role after login:', getUserRole());

  // Logout
  await logout();
  console.assert(getUserRole() === null, 'Role should be null after logout');
  console.log('✓ Role cleanup test passed');
}
```

### Test 4: Role Persistence in Storage

```javascript
import { isAdmin, login, getUserRole } from './js/auth.js';

async function testRolePersistence() {
  // Login as admin
  await login({ email: 'admin@example.com', password: 'admin123' });

  // Check localStorage directly
  const storedRole = localStorage.getItem('userRole');
  console.assert(storedRole === 'Admin', 'Role should be stored in localStorage');
  console.log('✓ Role persistence test passed');
}
```

---

## 🐛 Troubleshooting

### Issue: Role is always null

**Causes**:
- User not logged in
- Token expired
- localStorage cleared

**Solution**:
```javascript
import { isAuthenticated, getUserRole } from './js/auth.js';

if (!isAuthenticated()) {
  window.location.href = '/pages/login.html';
} else {
  const role = getUserRole();
  console.log('Current role:', role);
}
```

---

### Issue: Role not updating after login

**Causes**:
- Browser cache
- localStorage disabled
- Multiple tabs interfering

**Solution**:
```javascript
import { login, getUserRole } from './js/auth.js';

async function debugLogin() {
  const result = await login(credentials);
  
  // Debug logging
  console.log('Login result:', result);
  console.log('User role:', getUserRole());
  console.log('localStorage role:', localStorage.getItem('userRole'));
  console.log('All localStorage:', localStorage);
}
```

---

### Issue: Permission checks failing

**Causes**:
- Role not set after login
- Checking wrong role type
- Case sensitivity issue

**Solution**:
```javascript
import { getUserRole } from './js/auth.js';

async function debugPermissions() {
  const role = getUserRole();
  console.log('User role:', role);
  console.log('Type:', typeof role);
  console.log('Is string?', typeof role === 'string');
  
  // Compare carefully
  if (role === 'Admin') {
    console.log('User is admin');
  }
}
```

---

### Issue: Role persists after logout

**Causes**:
- Logout API call failed
- Error handler didn't clear role
- Multiple logout calls in parallel

**Solution**:
```javascript
import { logout, getUserRole } from './js/auth.js';

async function debugLogout() {
  console.log('Role before logout:', getUserRole());
  
  const result = await logout();
  console.log('Logout result:', result);
  console.log('Role after logout:', getUserRole());
  
  // Force clear if needed
  if (getUserRole() !== null) {
    localStorage.removeItem('userRole');
    console.log('Manually cleared role');
  }
}
```

---

## 📊 Reference Chart

### Role vs Feature Access

| Feature | Admin | Uploader | User |
|---------|-------|----------|------|
| View Comics | ✅ | ✅ | ✅ |
| Create Comic | ✅ | ✅ | ❌ |
| Edit Own Comic | ✅ | ✅ | ❌ |
| Edit Others' Comic | ✅ | ❌ | ❌ |
| Delete Comic | ✅ | ❌ | ❌ |
| Comment | ✅ | ✅ | ✅ |
| Follow Comic | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Admin Panel | ✅ | ❌ | ❌ |

---

## ✅ Best Practices

1. **Always check role before sensitive operations**
   ```javascript
   if (canManageContent()) {
     // Only execute if authorized
   }
   ```

2. **Use role helpers instead of direct localStorage access**
   ```javascript
   // ✅ Good
   if (isAdmin()) { }

   // ❌ Avoid
   if (localStorage.getItem('userRole') === 'Admin') { }
   ```

3. **Provide clear error messages for permission denials**
   ```javascript
   if (!canManageContent()) {
     alert('Only creators can upload comics');
     return;
   }
   ```

4. **Test role-based features thoroughly**
   ```javascript
   // Test as Admin, Uploader, and User
   ```

5. **Handle role cleanup properly**
   ```javascript
   import { logout } from './js/auth.js';
   
   // Always use logout function
   await logout(); // Clears both token and role
   ```

---

## 📞 Summary

The role-based access control system provides:
- ✅ Simple 3-tier role model (Admin, Uploader, User)
- ✅ Easy-to-use helper functions
- ✅ Automatic role management on login/logout
- ✅ localStorage persistence
- ✅ Zero compilation overhead

Use these helpers to build secure, role-aware frontend features! 🚀
