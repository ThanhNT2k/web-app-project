# CHANGELOG

Tất cả thay đổi đáng kể của dự án **CMC Truyện** được ghi lại tại đây.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.1.0] — 2026-06-03

### 📝 Documentation — Thêm comment kỹ thuật toàn bộ codebase

**Người thực hiện:** AI Technical Mentor (Antigravity)
**Phạm vi:** Backend + Frontend

Toàn bộ codebase được đọc và bổ sung comment tiếng Việt chi tiết theo chuẩn Senior Engineer.
Logic, tên biến, tên hàm **không bị thay đổi**. Chỉ thêm comment giải thích.

---

#### Backend — `backend/src/`

##### Entry Point & Configuration

| File | Nội dung comment được thêm |
|------|---------------------------|
| `server.js` | Giải thích khởi động HTTP server, xử lý `unhandledRejection` ở cấp process |
| `app.js` | Giải thích từng middleware (helmet, CORS, morgan), tại sao dùng `crossOriginResourcePolicy: 'cross-origin'`, logic whitelist CORS động, thứ tự đăng ký route và error handler |
| `config/environment.js` | Giải thích từng biến môi trường, lý do dùng object tập trung thay vì `process.env` rải rác |
| `config/database.js` | Giải thích Connection Pool, cấu hình SSL theo môi trường, health check khi khởi động |

##### Middleware

| File | Nội dung comment được thêm |
|------|---------------------------|
| `middleware/authMiddleware.js` | Phân biệt `authenticateToken` (bắt buộc) vs `optionalAuth` (tùy chọn), luồng xác thực JWT, lý do tồn tại 2 function |
| `middleware/auth.js` | Ghi chú đây là phiên bản cũ hơn, khác với `authMiddleware.js` ở chỗ nào |
| `middleware/errorHandler.js` | Giải thích 404 handler phải đặt trước error handler, tại sao error handler có 4 tham số |
| `middleware/errorMiddleware.js` | Giải thích `asyncHandler` wrapper pattern — tự động `catch` mọi async error và chuyển sang `next(err)` |
| `middleware/roleMiddleware.js` | Giải thích RBAC (Role-Based Access Control), cách dùng rest params `...roles` |
| `middleware/upload.js` | Giải thích tại sao dùng `memoryStorage` thay vì `diskStorage` (Render ephemeral filesystem) |

##### Controllers

| File | Nội dung comment được thêm |
|------|---------------------------|
| `controllers/authController.js` | Luồng register/login (5 bước), lý do bcrypt salt rounds=10, tại sao `sanitizeUser` loại bỏ password, tại sao `getCurrentUser` query lại DB thay vì dùng JWT payload |
| `controllers/storyController.js` | Logic `isStoryOwnerOrAdmin`, tại sao dùng `Number()` khi so sánh ID, logic fallback tags từ category |
| `controllers/chapterController.js` | Tại sao kiểm tra quyền ở cấp truyện (không phải cấp chương), tại sao không cho đổi `chapter_number` khi update |
| `controllers/commentController.js` | Tại sao re-fetch sau INSERT để lấy user info, logic phân quyền xóa (chủ sở hữu OR Admin) |
| `controllers/followController.js` | Tại sao `checkFollow` không yêu cầu auth (trả về `false` thay vì 401), giải thích idempotent |
| `controllers/readingHistoryController.js` | Luồng `saveProgress` 4 bước, cơ chế best-effort completion rate, AI summary cache 2 tầng (RAM + DB), luồng recommendation với fallback |
| `controllers/adminController.js` | Tại sao dùng `Promise.all` cho 4 query thống kê, sự khác nhau với `commentController.remove` |
| `controllers/uploadController.js` | Luồng upload Supabase, tại sao tạo filename unique, fallback placeholder URL khi chưa cấu hình |
| `controllers/preferencesController.js` | Tại sao auto-create defaults khi lần đầu get, cơ chế partial update |
| `controllers/tagController.js` | Giải thích findOrCreate pattern |

##### Models

| File | Nội dung comment được thêm |
|------|---------------------------|
| `models/user.js` | Giải thích `baseSelect` dùng chung, tại sao `COALESCE` cho partial update |
| `models/Story.js` | Giải thích N+1 problem và cách giải quyết bằng batch fetch trong `attachTagsToStories`, Window function `COUNT(*) OVER()`, 3 chế độ sort, soft delete và lý do |
| `models/Chapter.js` | Giải thích Transaction (BEGIN/COMMIT/ROLLBACK) khi tạo/xóa chương, tại sao cần giữ `total_chapters` nhất quán, `GREATEST(total_chapters - 1, 0)` |
| `models/Comment.js` | Giải thích `$2::int IS NULL` pattern để bỏ qua điều kiện lọc tùy chọn |
| `models/ReadingHistory.js` | Giải thích `ON CONFLICT DO UPDATE` cộng dồn `total_read_time`, công thức tính `completion_rate` |
| `models/Tag.js` | Giải thích từng bước `slugify` tiếng Việt (NFD, combining marks, 'đ'), trick `ON CONFLICT DO UPDATE` để luôn có `RETURNING` |
| `models/UserFollow.js` | Giải thích `ON CONFLICT DO NOTHING` cho idempotent follow, `Boolean(result.rows[0])` |
| `models/UserPreference.js` | Giải thích chuỗi ưu tiên merge `??` (nullish coalescing): prefs mới → existing → defaults |
| `models/AISummary.js` | Giải thích 2 tầng cache (RAM trong `aiService`, DB trong model này), `ON CONFLICT (chapter_id)` |

##### Services

| File | Nội dung comment được thêm |
|------|---------------------------|
| `services/aiService.js` | File đã có comment tiếng Việt sẵn — giữ nguyên |

---

#### Frontend — `frontend/src/`

| File | Nội dung comment được thêm |
|------|---------------------------|
| `App.jsx` | Giải thích thứ tự Provider nesting (ThemeProvider → AuthProvider → BrowserRouter), cấu trúc Route, `ProtectedRoute` vs `RoleProtectedRoute`, `LegacyRedirect` |
| `contexts/AuthContext.jsx` | Giải thích lazy initializer `useState(() => ...)`, tại sao fetch lại từ server khi mount, `useMemo` tối ưu tránh re-render, `refreshCurrentUser` |
| `services/api.js` | Giải thích Request Interceptor (auto attach JWT), Response Interceptor (auto redirect 401, tránh redirect loop), tại sao dùng `|| undefined` khi truyền params, tại sao upload dùng `FormData` và override `Content-Type` |

---

### Thống kê

- **Tổng file đã comment:** 31 files
- **Backend:** 28 files (2 config, 6 middleware, 10 controllers, 9 models, 1 service)
- **Frontend:** 3 files (1 App, 1 Context, 1 Service)
- **Logic code bị thay đổi:** ❌ Không có
- **Tên biến/hàm bị đổi:** ❌ Không có
- **Ngôn ngữ comment:** Tiếng Việt
- **Loại comment tập trung vào:** WHY (tại sao), WHAT (đang làm gì), HOW (hoạt động ra sao)

---

## [1.0.0] — 2026-06-02

### 🚀 Initial Release — Ra mắt phiên bản đầu tiên

**CMC Truyện** — Nền tảng đọc và chia sẻ truyện với tính năng AI.

#### ✨ Features

**Authentication**
- Đăng ký / đăng nhập với email + password
- JWT token xác thực (7 ngày)
- Phân quyền 4 cấp: Admin, Uploader, User, Guest
- Cập nhật profile (tên, avatar, bio)

**Stories**
- CRUD truyện (tạo, xem, sửa, xóa mềm)
- Tìm kiếm full-text (title + description)
- Lọc theo thể loại và tag
- Sắp xếp: mới nhất / phổ biến nhất / cập nhật gần đây
- Phân trang

**Chapters**
- CRUD chương trong transaction (đảm bảo `total_chapters` nhất quán)
- Sắp xếp asc/desc theo số thứ tự chương

**AI Features**
- Tóm tắt chương tự động bằng AI (Groq ưu tiên, Gemini dự phòng)
- Cache tóm tắt 2 tầng: RAM (1 giờ) + Database (lâu dài)
- Gợi ý truyện cá nhân hóa dựa trên lịch sử đọc
- Fallback khi AI không khả dụng

**Reading**
- Lưu tiến trình đọc (chapter, vị trí scroll, thời gian đọc)
- Lịch sử đọc với tỷ lệ hoàn thành (completion rate)
- Cài đặt đọc cá nhân: font, cỡ chữ, giãn dòng, dark mode

**Social**
- Theo dõi / bỏ theo dõi truyện
- Bình luận và đánh giá (1-5 sao)

**Upload**
- Upload ảnh bìa truyện lên Supabase Storage
- Fallback placeholder URL khi chưa cấu hình Supabase

**Admin**
- Dashboard thống kê (users, stories, chapters, comments)
- Quản lý user và phân quyền role
- Xóa bình luận vi phạm
- Xem tất cả truyện (kể cả unpublished)

#### 🛠 Tech Stack

**Backend**
- Node.js + Express.js
- PostgreSQL + `pg` connection pool
- JWT authentication (jsonwebtoken)
- bcryptjs password hashing
- Joi validation
- Multer file upload
- Supabase Storage
- Groq API + Gemini API (AI)

**Frontend**
- React 18 + Vite
- React Router v6
- Axios với interceptors
- Context API (Auth + Theme)
- TailwindCSS

**Infrastructure**
- Render.com (backend hosting)
- Vercel (frontend hosting)
- Supabase (PostgreSQL + Storage)

---

*Changelog này được tạo theo chuẩn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).*
