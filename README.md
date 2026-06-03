# CMC Truyện Frontend

Giao diện ReactJS + Vite cho ứng dụng đọc truyện CMC Truyện.

## 🚀 Giới thiệu

Dự án này là frontend SPA sử dụng ReactJS, Vite, Bootstrap và Tailwind CSS.
Frontend kết nối với backend qua API REST, quản lý đăng nhập, tìm kiếm truyện, đọc chương và quản lý người dùng.

## 📁 Cấu trúc dự án chính

```
web-app-project/
├── public/                # Tài nguyên tĩnh, favicon, file HTML
│   └── pages/             # Các trang tĩnh/legacy không dùng trực tiếp trong SPA
├── src/
│   ├── components/        # Các component giao diện tái sử dụng
│   ├── contexts/          # Context cho authentication và theme
│   ├── pages/             # Trang chính của ứng dụng
│   ├── services/          # API client và auth service
│   ├── styles/            # CSS chính, dark mode, reader
│   └── utils/             # Tiện ích chung
├── index.html             # Entry HTML cho Vite
├── package.json          # Cấu hình npm scripts và dependencies
├── vite.config.js        # Cấu hình Vite, proxy API
└── README.md             # Tài liệu này
```

## 🧩 Công nghệ chính

- React 18
- Vite
- React Router DOM
- Axios
- Bootstrap 5
- Tailwind CSS

## 🌐 Cấu hình backend

`src/services/api.js` dùng URL mặc định:

```js
http://localhost:5000/api
```

Bạn có thể thay đổi bằng biến môi trường:

```bash
VITE_API_URL=http://localhost:5000/api
```

`vite.config.js` cũng proxy các yêu cầu:

- `/api` -> `http://localhost:5000`
- `/uploads` -> `http://localhost:5000`

## 🚦 Routes chính

- `/` → `HomePage`
- `/browse` hoặc `/tim-truyen` → `FindStoriesPage`
- `/login` → `LoginPage`
- `/register` → `RegisterPage`
- `/account` → `AccountPage`
- `/story/:id` → `StoryDetailPage`
- `/story/:storyId/chapter/:chapterId` → `ChapterReaderPage`
- `/profile` → `UserProfilePage` (yêu cầu đăng nhập)
- `/dashboard` → `DashboardPage` (yêu cầu role `Uploader` hoặc `Admin`)
- `/admin` → `AdminPage` (yêu cầu role `Admin`)
- `*` → `NotFoundPage`

## 🔧 API chính

Frontend sử dụng `src/services/api.js` với các nhóm endpoint sau:

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/profile`

### Stories
- `GET /stories`
- `GET /stories/mine`
- `GET /stories/:id`
- `POST /stories`
- `PUT /stories/:id`
- `DELETE /stories/:id`
- `GET /stories/search`

### Chapters
- `GET /stories/:storyId/chapters`
- `GET /stories/:storyId/chapters/:chapterId`
- `POST /stories/:storyId/chapters`
- `PUT /stories/:storyId/chapters/:chapterId`
- `DELETE /stories/:storyId/chapters/:chapterId`

### Comments
- `GET /comments/story/:storyId`
- `GET /comments/chapter/:chapterId`
- `POST /comments`
- `DELETE /comments/:id`

### AI và đề xuất
- `GET /chapters/:chapterId/summary`
- `GET /ai/recommendations`

### Lịch sử đọc
- `GET /reading-history`
- `POST /reading-history`
- `GET /reading-history/story/:storyId`

### Follow
- `GET /follows`
- `GET /follows/check/:storyId`
- `POST /follows/:storyId`
- `DELETE /follows/:storyId`

### Preferences
- `GET /preferences`
- `PUT /preferences`

### Upload
- `POST /upload/cover`

### Admin
- `GET /admin/stats`
- `GET /admin/users`
- `PATCH /admin/users/:id/role`
- `DELETE /admin/comments/:id`
- `GET /admin/stories`

## 🔐 Authentication

Token và user được lưu trong `localStorage` với các khóa:

- `cmc_token`
- `cmc_user`

`src/services/authService.js` cung cấp các hàm:

- `register`
- `login`
- `logout`
- `getToken`
- `getCurrentUser`
- `isAuthenticated`
- `hasRole`

## 🧠 Kiến trúc ứng dụng

- `src/App.jsx`: Thiết lập router và layout chung
- `src/components/ProtectedRoute.jsx`: Bảo vệ route khi chưa đăng nhập
- `src/components/RoleProtectedRoute.jsx`: Bảo vệ permission theo role
- `src/contexts/AuthContext.jsx`: Quản lý trạng thái user
- `src/contexts/ThemeContext.jsx`: Quản lý chế độ sáng/tối

## 📌 Lưu ý

- Backend cần chạy trên `http://localhost:5000` hoặc thay `VITE_API_URL`
- Nếu backend dùng CORS, đảm bảo cho phép origin của frontend
- Tắt cache, refresh lại khi thay đổi cấu hình môi trường

## 💡 Chạy nhanh

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` và kiểm tra các route `/`, `/login`, `/profile`.

---

**Phiên bản**: 1.0.0

**License**: MIT
