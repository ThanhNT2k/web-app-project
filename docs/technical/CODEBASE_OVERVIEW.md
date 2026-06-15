# Tổng Quan Mã Nguồn Dự Án — CMC Truyện (CODEBASE_OVERVIEW.md)

---

## 👥 THÔNG TIN NHÓM THỰC HIỆN
*   **Nhóm:** Nhóm 3 (Nguyễn Thị Thùy, Trần Thị Kim Uyên, Nguyễn Hải Dương, Nguyễn Tuấn Thành, Vũ Viết Trí)

---

## 🗺️ 1. Bản Đồ Liên Kết Nghiệp Vụ & Mã Nguồn (Business-to-Code Mapping)

Dưới đây là sơ đồ liên kết giữa các tính năng nghiệp vụ và các file mã nguồn tương ứng trong hệ thống hiện tại:

### 🔐 Epic 1: Authentication & User Profile
*   **Frontend UI & Context:** [`RegisterPage.jsx`](../../frontend/src/pages/RegisterPage.jsx), [`LoginPage.jsx`](../../frontend/src/pages/LoginPage.jsx), [`AccountPage.jsx`](../../frontend/src/pages/AccountPage.jsx), [`AuthContext.jsx`](../../frontend/src/contexts/AuthContext.jsx).
*   **Backend Services & Controllers:** `authRoutes.js`, `authController.js`, [`authMiddleware.js`](../../backend/src/middleware/authMiddleware.js), `user.js` model.
*   **Tính năng bổ sung:** Ràng buộc username duy nhất khi đăng ký, tự động khóa tài khoản (`is_active = false`), tự động đăng xuất tài khoản bị khóa qua response interceptor.

### 🔍 Epic 2: Story Discovery & Search
*   **Frontend UI:** [`Navbar.jsx`](../../frontend/src/components/Navbar.jsx), [`FindStoriesPage.jsx`](../../frontend/src/pages/FindStoriesPage.jsx).
*   **Backend Logic:** `storyRoutes.js`, `storyController.js`, `Story.js` (hàm `searchStories`).
*   **Tính năng bổ sung:** Slug SEO-friendly cho truyện và chương, tìm kiếm full-text kết hợp lọc theo thể loại (`category`) và thẻ (`tags` / `story_tags`).

### 📖 Epic 3: Reading Experience
*   **Frontend UI:** [`StoryDetailPage.jsx`](../../frontend/src/pages/StoryDetailPage.jsx), [`ChapterReaderPage.jsx`](../../frontend/src/pages/ChapterReaderPage.jsx).
*   **Backend Logic:** `chapterRoutes.js` (dành cho summary), `storyRoutes.js` (đọc thông tin chương theo slug/số thứ tự).

### 💬 Epic 4: Content & Engagement
*   **Frontend UI:** `FollowButton.jsx`, `CommentSection.jsx`, `ReadingProgress.jsx`.
*   **Backend Logic:** `followRoutes.js`, `followController.js`, `commentRoutes.js`, `commentController.js`, `readingHistoryRoutes.js`, `readingHistoryController.js`.
*   **Dữ liệu:** `UserFollow.js`, `Comment.js`, `ReadingHistory.js`.

### 🛠️ Epic 5: Content & User Management (Admin & Moderator Layouts)
*   **Giao diện quản lý:** [`AdminPage.jsx`](../../frontend/src/pages/AdminPage.jsx), [`AdminUsersPage.jsx`](../../frontend/src/pages/AdminUsersPage.jsx), [`AdminStoriesPage.jsx`](../../frontend/src/pages/AdminStoriesPage.jsx), [`DashboardPage.jsx`](../../frontend/src/pages/DashboardPage.jsx).
*   **Moderator Layout:** [`ModeratorLayout.jsx`](../../frontend/src/layouts/ModeratorLayout.jsx) phân quyền dành riêng cho Moderator và Admin.
*   **Backend Logic:** `adminRoutes.js`, `adminController.js`.
*   **Tính năng bổ sung:** Khóa/mở khóa tài khoản user, thay đổi vai trò (role), ẩn/hiện truyện nâng cao (`hidden_by_admin` chặn Uploader tự ý hiển thị lại).

### 🤖 Epic 6: Cá Nhân Hóa & Tóm Tắt AI
*   **Tóm tắt & Gợi ý:** `aiRoutes.js`, `aiService.js` (gọi trực tiếp Groq API hoặc Gemini API qua Axios, cache 2 tầng RAM + Database trong `AISummary.js`).

### 🛡️ Epic 7: Kiểm Duyệt Bình Luận & Quản Lý Báo Cáo (Mới)
*   **Hàng đợi kiểm duyệt:** `moderationService.js`, `moderationWorker.js` sử dụng **BullMQ + Redis** để phân loại bình luận theo các cấp độ tier (rejected, masked, flagged) từ danh sách từ khóa nhạy cảm.
*   **Quản lý từ khóa:** `badWordRoutes.js`, `badWordController.js`, `BadWord.js` model, [`ManageBadWords.jsx`](../../frontend/src/pages/admin/ManageBadWords.jsx).
*   **Báo cáo vi phạm:** `reportRoutes.js`, `reportController.js`, `Report.js` model, [`AdminReportsPage.jsx`](../../frontend/src/pages/AdminReportsPage.jsx).

---

## 🧬 2. Chi Tiết Các File Code Quan Trọng (Core Code Highlights)

### A. Kết Nối Database (Không Dùng ORM)
Hệ thống sử dụng trực tiếp Connection Pool của `pg` thư viện để thực hiện truy vấn SQL trực tiếp, giúp tối ưu hóa hiệu năng và kiểm soát query tốt nhất:
```javascript
// backend/src/config/database.js
const { Pool } = require('pg');
const pool = new Pool(poolConfig);
module.exports = pool;
```

### B. Middleware Phân Quyền Vai Trò
Hệ thống thực hiện phân quyền tập trung dựa trên vai trò qua middleware:
```javascript
// backend/src/middleware/roleMiddleware.js
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
}
```

### C. Dispatch Job Kiểm Duyệt Chạy Ngầm
Bình luận sau khi được tạo sẽ ngay lập tức được gửi vào hàng đợi xử lý nền thay vì kiểm duyệt đồng bộ gây trễ request:
```javascript
// backend/src/controllers/commentController.js (tóm tắt logic)
const moderationQueue = new Queue('moderationQueue', { connection: redisConfig });
// Khi tạo comment mới:
await moderationQueue.add('moderate-comment', { content: comment.content, commentId: comment.id });
```
