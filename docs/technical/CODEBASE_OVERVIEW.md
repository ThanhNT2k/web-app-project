# Tổng Quan Mã Nguồn Dự Án — CMC Truyện (CODEBASE_OVERVIEW.md)

---

## 👥 THÔNG TIN NHÓM THỰC HIỆN

*   **Nhóm:** Nhóm 3
*   **Danh sách thành viên:**
    1.  **Nguyễn Thị Thùy** - BAI252513
    2.  **Trần Thị Kim Uyên** - BAI250072
    3.  **Nguyễn Hải Dương** - BAI250020
    4.  **Nguyễn Tuấn Thành** - BAI252417
    5.  **Vũ Viết Trí** - BAI250063

---

## 🗺️ 1. Bản Đồ Liên Kết Nghiệp Vụ & Mã Nguồn (Business-to-Code Mapping)

Dưới đây là cách các User Stories (US) được hiện thực hóa trong mã nguồn ở thời điểm Tuần 3 (các tính năng Core & Expansion đang ở trạng thái **In Progress** thông qua giao diện mẫu UX Prototype và cấu trúc Node.js backend ban đầu):

### 🔐 Epic 1 & 5: Authentication & User Profile (US03) - *Status: In Progress*
*   **Frontend UI:**
    *   Thành phần Modal đăng ký/đăng nhập: [`AuthModal.jsx`](../../frontend/src/components/AuthModal.jsx)
    *   Trang đăng ký: [`RegisterPage.jsx`](../../frontend/src/pages/RegisterPage.jsx)
    *   Trang đăng nhập: [`LoginPage.jsx`](../../frontend/src/pages/LoginPage.jsx)
    *   Quản lý trạng thái đăng nhập toàn cục: [`AuthContext.jsx`](../../frontend/src/contexts/AuthContext.jsx)
*   **Frontend Services:**
    *   Dịch vụ xử lý token & gọi API đăng nhập/đăng ký: [`authService.js`](../../frontend/src/services/authService.js)
*   **Backend Logic:**
    *   Tuyến đường Auth API: `backend/src/routes/authRoutes.js`
    *   Xử lý băm mật khẩu & ký token JWT: `backend/src/controllers/authController.js`
    *   Xác thực quyền qua token: [`authMiddleware.js`](../../backend/src/middleware/authMiddleware.js)

### 🔍 Epic 2: Story Discovery & Search (US01) - *Status: In Progress*
*   **Frontend UI:**
    *   Thanh tìm kiếm trên thanh điều hướng: [`Navbar.jsx`](../../frontend/src/components/Navbar.jsx)
    *   Trang tìm kiếm truyện: [`FindStoriesPage.jsx`](../../frontend/src/pages/FindStoriesPage.jsx)
*   **Backend Logic:**
    *   API tìm kiếm truyện (`GET /api/stories/search`): Được định nghĩa trong `backend/src/routes/storyRoutes.js` và xử lý trong `backend/src/controllers/storyController.js`.
    *   Query tìm kiếm SQL full-text: Được cài đặt trong hàm `search` của model [`Story.js`](../../backend/src/models/Story.js).

### 📖 Epic 3: Reading Experience (US02, US05) - *Status: In Progress*
*   **Frontend UI:**
    *   Trang thông tin truyện: [`StoryDetailPage.jsx`](../../frontend/src/pages/StoryDetailPage.jsx)
    *   Giao diện đọc chương: [`ChapterReaderPage.jsx`](../../frontend/src/pages/ChapterReaderPage.jsx)
    *   Bảng điều chỉnh giao diện đọc (cỡ chữ, giãn dòng, Dark Mode): [`ReadingPreferencesPanel.jsx`](../../frontend/src/components/ReadingPreferencesPanel.jsx)
*   **Backend Logic:**
    *   Query lấy dữ liệu câu chuyện và danh sách chương: Cài đặt trong `backend/src/models/Story.js` và `backend/src/models/Chapter.js`.
    *   Các endpoint API liên quan: `GET /api/stories/:id` và `GET /api/stories/:storyId/chapters/:chapterId` tại `backend/src/routes/storyRoutes.js`.

### 💬 Epic 4 & 6: Content & Engagement - *Status: Pending (Được mô phỏng tĩnh)*
Các tính năng lưu trữ lịch sử đọc, theo dõi và tóm tắt AI đang ở trạng thái Pending trên database thực tế nhưng được mô phỏng tĩnh tại phía client bằng Mock Data và LocalStorage để kiểm thử luồng UX:
*   Theo dõi truyện (Favorite/Follow): [`FollowButton.jsx`](../../frontend/src/components/FollowButton.jsx)
*   Bình luận (Comments): [`CommentSection.jsx`](../../frontend/src/components/CommentSection.jsx)
*   Hiển thị tiến độ đọc: [`ReadingProgress.jsx`](../../frontend/src/components/ReadingProgress.jsx)

### 🛠️ Epic 6 & 7: Content & User Management (US07, US08, US09) - *Status: In Progress*
*   **Frontend UI:**
    *   Trang dành cho Admin và Uploader: [`DashboardPage.jsx`](../../frontend/src/pages/DashboardPage.jsx) và [`AdminPage.jsx`](../../frontend/src/pages/AdminPage.jsx)
*   **Backend Logic:**
    *   Kiểm tra phân quyền Admin/Uploader: Sử dụng [`roleMiddleware.js`](../../backend/src/middleware/roleMiddleware.js)
    *   Endpoint thêm/sửa/xóa truyện: `POST`, `PUT`, `DELETE` trên `/api/stories` tại `backend/src/routes/storyRoutes.js`.

---

## 🧬 2. Chi Tiết Các File Code Quan Trọng (Core Code Highlights)

### A. Middleware Phân Quyền Vai Trò (`backend/src/middleware/roleMiddleware.js`)
Middleware này kiểm tra xem user sau khi đã decode token JWT có vai trò phù hợp với yêu cầu của endpoint hay không:
```javascript
module.exports = function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Bạn không có quyền thực hiện hành động này.'
      });
    }
    next();
  };
};
```

### B. Hàm Lưu Dwell Time & Cập Nhật Telemetry (`frontend/src/pages/ChapterReaderPage.jsx`)
Giao diện gửi tín hiệu Heartbeat định kỳ mỗi 30 giây để cập nhật thời gian đọc thực tế của người dùng:
```javascript
useEffect(() => {
  if (!isAuthenticated || !chapterId) return;

  const interval = setInterval(() => {
    // Tránh lưu dwell time nếu người dùng đang không hoạt động (treo máy)
    if (document.visibilityState === 'visible' && !isUserIdle) {
      API.readingHistory.saveProgress({
        storyId,
        chapterId,
        chapterNumber,
        dwellTimeSeconds: 30
      });
    }
  }, 30000);

  return () => clearInterval(interval);
}, [chapterId, isUserIdle]);
```

### C. Định Nghĩa Thực Thể Cơ Sở Dữ Liệu (`backend/scripts/schema.sql`)
Mã SQL khởi tạo bảng `stories` với các ràng buộc khóa ngoại chặt chẽ liên kết với `users` (uploader):
```sql
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Ongoing',
    uploader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
