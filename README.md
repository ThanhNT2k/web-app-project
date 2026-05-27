# Frontend - CMC Truyện

Giao diện người dùng (Frontend) cho ứng dụng CMC Truyện.

## 📁 Cấu Trúc Dự Án

```
frontend-project/
├── assets/              # Hình ảnh, logo, fonts
├── css/                 # Stylesheets
│   └── style.css       # Giao diện chính
├── js/                  # JavaScript
│   ├── api.js          # Gọi API từ backend
│   ├── auth.js         # Xử lý authentication (JWT Token)
│   └── main.js         # Logic DOM chung
├── pages/              # Trang HTML
│   ├── index.html      # Trang chủ
│   ├── story.html      # Tìm truyện / Chi tiết truyện
│   ├── account.html    # Đăng nhập / Đăng ký
│   ├── profile.html    # Profile người dùng
│   └── admin.html      # Admin panel
├── .gitignore
└── README.md           # File này
```

## 🚀 Khởi Động

### Yêu Cầu
- Backend chạy trên `http://localhost:3000`
- Browser hỗ trợ ES6+

### Chạy Frontend

#### Cách 1: Mở trực tiếp trong trình duyệt
```bash
# Mở file index.html bằng trình duyệt
open pages/index.html  # macOS
start pages\index.html # Windows
```

#### Cách 2: Sử dụng local server (khuyên dùng)
```bash
# Dùng Python
python -m http.server 8000

# Hoặc dùng Node.js (cài http-server)
npm install -g http-server
http-server -p 8000
```

Sau đó mở `http://localhost:8000/pages/index.html` trong trình duyệt.

## 📝 Các Trang Chính

### 1. **index.html** - Trang Chủ
- Hiển thị truyện nổi bật
- Danh sách thể loại
- Truyện cập nhật gần đây
- Gọi API: `/api/stories`, `/api/genres`

### 2. **story.html** - Tìm Truyện
- Search, filter theo thể loại, trạng thái
- Sắp xếp (mới nhất, phổ biến, đánh giá cao)
- Gọi API: `/api/stories`

### 3. **account.html** - Đăng Nhập / Đăng Ký
- Form đăng nhập (email + password)
- Form đăng ký (name + email + password)
- Lưu JWT token vào localStorage
- Gọi API: `/auth/login`, `/auth/register`

### 4. **profile.html** - Profile
- Lịch sử đọc truyện
- Truyện yêu thích
- Cài đặt tài khoản
- Gọi API: `/api/profile`, `/api/profile/history`, `/api/profile/favorites`

### 5. **admin.html** - Admin Panel (Yêu cầu role: Admin)
- Dashboard với thống kê
- Thêm truyện mới
- Quản lý truyện (edit/delete)
- Quản lý người dùng
- Báo cáo

## 🔗 API Endpoints (Backend)

### Stories
- `GET /api/stories` - Lấy danh sách truyện
- `GET /api/stories/:id` - Lấy chi tiết truyện
- `GET /api/genres` - Lấy danh sách thể loại

### Profile
- `GET /api/profile` - Lấy thông tin profile
- `PUT /api/profile` - Cập nhật profile
- `GET /api/profile/history` - Lấy lịch sử đọc
- `POST /api/profile/history` - Cập nhật tiến độ đọc
- `GET /api/profile/favorites` - Lấy truyện yêu thích
- `POST /api/profile/favorites` - Thêm truyện yêu thích
- `DELETE /api/profile/favorites/:id` - Xóa truyện yêu thích

### Auth
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

## 🔐 Authentication

Token JWT được lưu trong `localStorage`:
```javascript
localStorage.setItem('token', 'jwt_token_here');
localStorage.setItem('userId', 'user_id');
localStorage.setItem('userName', 'user_name');
localStorage.setItem('role', 'User/Admin/Uploader');
```

### Kiểm tra Quyền
```javascript
isLoggedIn()      // Kiểm tra đã đăng nhập
isAdmin()         // Kiểm tra Admin
isUploader()      // Kiểm tra Uploader
requireLogin()    // Redirect nếu chưa đăng nhập
requireAdmin()    // Redirect nếu không phải Admin
```

## 🎨 Giao Diện

### Màu Sắc Chính
- **Primary**: #3c6ad3 (Xanh dương)
- **Secondary**: #10b981 (Xanh lá)
- **Danger**: #ef4444 (Đỏ)
- **Warning**: #f59e0b (Cam)

### Responsive Design
- Desktop: 1200px max-width
- Tablet: Grid tự động adjust
- Mobile: Full width

## 📚 Hàm Utility Chính

### API Calls (api.js)
```javascript
getStories()                    // Lấy danh sách truyện
getStory(storyId)              // Lấy chi tiết truyện
getGenres()                    // Lấy thể loại
getProfile()                   // Lấy profile
updateProfile(data)            // Cập nhật profile
getReadingHistory()            // Lấy lịch sử đọc
getFavoriteStories()           // Lấy yêu thích
addFavoriteStory(storyId)      // Thêm yêu thích
removeFavoriteStory(storyId)   // Xóa yêu thích
```

### Auth (auth.js)
```javascript
login(email, password)         // Đăng nhập
register(email, password, name) // Đăng ký
logout()                       // Đăng xuất
isLoggedIn()                   // Kiểm tra đã đăng nhập
getCurrentUser()               // Lấy thông tin user
isAdmin()                      // Kiểm tra Admin
```

### DOM Utils (main.js)
```javascript
renderStories(stories, containerId)  // Render danh sách truyện
renderGenres(genres, containerId)    // Render danh sách thể loại
showNotification(message, type)      // Hiển thị thông báo
formatDate(dateString)               // Format ngày tháng
truncateText(text, length)           // Cắt ngắn văn bản
getQueryParam(param)                 // Lấy query parameter
```

## 🔧 Cấu Hình

### API Base URL
Mở `js/api.js` và thay đổi:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_API_URL = 'http://localhost:3000/auth';
```

### CORS
Nếu gặp lỗi CORS, đảm bảo backend đã config:
```javascript
// Backend (Express)
app.use(cors({ origin: 'http://localhost:8000' }));
```

## 📱 Testing Locally

1. Mở 2 terminal:
```bash
# Terminal 1: Backend
cd ../server
node server.js

# Terminal 2: Frontend
python -m http.server 8000
```

2. Mở trình duyệt: `http://localhost:8000/pages/index.html`

3. Tại Trang chủ sẽ load dữ liệu từ backend `/api/stories`

## 🚢 Deployment

### Netlify
```bash
# Drag & drop folder frontend-project vào Netlify
# Hoặc kết nối GitHub
```

### GitHub Pages
```bash
# Push vào branch gh-pages
git subtree push --prefix frontend-project origin gh-pages
```

## ⚠️ Lưu Ý

- Không lưu sensitive data (password, API keys) trong localStorage
- Luôn validate input từ người dùng
- Sử dụng HTTPS trong production
- Test trên nhiều browser (Chrome, Firefox, Safari)

## 📞 Hỗ Trợ

Liên hệ: support@cmctruyện.com

---

**Phiên bản**: 1.0.0  
**Cập nhật**: 2026-05-25  
**License**: MIT
