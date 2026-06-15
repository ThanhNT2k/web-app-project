# Đặc Tả API Endpoints — CMC Truyện (API_REFERENCE.md)

Tài liệu này đặc tả chi tiết toàn bộ các API Endpoints hiện có trong hệ thống CMC Truyện. Tiền tố mặc định của API là `/api`.

---

## 🔐 1. Xác Thực Người Dùng (Authentication)
*Tiền tố: `/api/auth`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Không | Đăng ký tài khoản (bắt buộc username duy nhất, role mặc định: `User`). |
| **POST** | `/login` | Không | Đăng nhập tài khoản. Trả về token JWT và thông tin người dùng. |
| **POST** | `/logout` | Có (`User+`) | Đăng xuất tài khoản (thu hồi phiên). |
| **GET** | `/me` | Có (`User+`) | Lấy thông tin tài khoản đang đăng nhập. |

---

## 📖 2. Quản Lý Truyện (Stories)
*Tiền tố: `/api/stories`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Không | Lấy danh sách truyện công khai (phân trang, sắp xếp, lọc thể loại). |
| **GET** | `/mine` | Có (`Uploader`, `Admin`) | Lấy danh sách truyện do chính mình đăng tải. |
| **GET** | `/search` | Không | Tìm kiếm truyện (truy vấn qua tham số `?q=`, lọc thể loại, thẻ). |
| **GET** | `/by-slug/:slug` | Không | Lấy thông tin chi tiết truyện theo Slug (SEO). |
| **GET** | `/:id` | Không | Lấy thông tin chi tiết truyện theo ID. |
| **POST** | `/` | Có (`Uploader`) | Tạo bộ truyện mới. |
| **PUT** | `/:id` | Có (`Owner`, `Admin`) | Cập nhật thông tin bộ truyện. |
| **DELETE** | `/:id` | Có (`Owner`, `Admin`) | Xóa mềm bộ truyện (ẩn khỏi danh sách hiển thị). |
| **PATCH** | `/:id/visibility` | Có (`Owner`, `Admin`) | Ẩn/hiện truyện (Admin ẩn tuyệt đối qua `hidden_by_admin`). |

---

## 📄 3. Quản Lý Chương (Chapters)
*Tiền tố: `/api/stories` (tài nguyên lồng nhau) hoặc `/api/chapters`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/:storyId/chapters` | Không | Lấy danh sách chương của truyện. |
| **GET** | `/:storyId/chapters/:chapterId` | Không | Lấy chi tiết nội dung một chương để đọc. |
| **GET** | `/by-slug/:storySlug/chapters/:chapterNumber` | Không | Lấy chi tiết chương theo Slug truyện và số thứ tự chương (SEO). |
| **POST** | `/:storyId/chapters` | Có (`Uploader`) | Đăng tải chương mới. |
| **PUT** | `/:storyId/chapters/:chapterId` | Có (`Owner`, `Admin`) | Chỉnh sửa nội dung chương. |
| **DELETE** | `/:storyId/chapters/:chapterId` | Có (`Owner`, `Admin`) | Xóa chương khỏi truyện. |
| **GET** | `/api/chapters/:id/summary` | Có (`User+`) | Lấy nội dung tóm tắt chương do AI tạo (ưu tiên cache). |

---

## 💬 4. Bình Luận (Comments)
*Tiền tố: `/api/comments`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/story/:storyId` | Không | Lấy danh sách bình luận dưới một truyện. |
| **GET** | `/chapter/:chapterId` | Không | Lấy danh sách bình luận dưới một chương. |
| **GET** | `/:id/original` | Có (`User+`) | Lấy nội dung gốc của bình luận (trước khi bị che mờ/moderated). |
| **POST** | `/` | Có (`User+`) | Gửi bình luận mới (đưa vào hàng đợi BullMQ để duyệt tự động). |
| **DELETE** | `/:id` | Có (`Owner`, `Admin`) | Xóa bình luận. |

---

## 📥 5. Theo Dõi & Lịch Sử (Follow & Reading History)
*Tiền tố: `/api/follows` hoặc `/api/reading-history`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/follows` | Có (`User+`) | Lấy danh sách truyện đang theo dõi. |
| **GET** | `/api/follows/check/:storyId` | Không | Kiểm tra xem user hiện tại đã theo dõi truyện chưa. |
| **POST** | `/api/follows/:storyId` | Có (`User+`) | Theo dõi bộ truyện. |
| **DELETE** | `/api/follows/:storyId` | Có (`User+`) | Bỏ theo dõi bộ truyện. |
| **GET** | `/api/reading-history` | Có (`User+`) | Lấy danh sách lịch sử đọc truyện của bản thân. |
| **GET** | `/api/reading-history/story/:storyId` | Có (`User+`) | Lấy tiến độ đọc của một truyện cụ thể. |
| **POST** | `/api/reading-history` | Có (`User+`) | Lưu tiến độ đọc (chương cuối, scroll, dwell time đọc). |

---

## ⚙️ 6. Thiết Lập Cá Nhân (User Preferences)
*Tiền tố: `/api/preferences`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Có (`User+`) | Lấy thiết lập đọc cá nhân (font, dark mode, auto-bookmark). |
| **PUT** | `/` | Có (`User+`) | Cập nhật thiết lập đọc cá nhân. |

---

## 🤖 7. Gợi Ý Bằng AI (AI Recommendations)
*Tiền tố: `/api/ai`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/recommendations` | Có (`User+`) | Lấy danh sách truyện được gợi ý cá nhân hóa dựa trên Telemetry. |

---

## 📁 8. Các Endpoint Phụ Trợ (Uploads, Tags & Reports)

### Uploads (Tiền tố: `/api/upload`)
*   **POST** `/cover` — Có (`User+`) — Tải ảnh bìa truyện hoặc avatar lên Supabase Storage.

### Tags (Tiền tố: `/api/tags`)
*   **GET** `/` — Không — Lấy toàn bộ danh sách thẻ từ khóa.
*   **POST** `/` — Có (`Uploader`, `Admin`) — Tạo thẻ từ khóa phân loại mới.

### Reports (Tiền tố: `/api/reports`)
*   **POST** `/` — Có (`User+`) — Gửi báo cáo vi phạm của một chương truyện (lý do, mô tả).
*   **GET** `/` — Có (`Admin`, `Moderator`) — Lấy danh sách các báo cáo vi phạm.
*   **PATCH** `/:id` — Có (`Admin`, `Moderator`) — Cập nhật trạng thái xử lý báo cáo vi phạm.

---

## 🛠️ 9. Quản Trị Hệ Thống (Admin & Moderator APIs)
*Tiền tố: `/api/admin`*

| Phương thức | Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/stats` | Có (`Admin`) | Lấy số liệu thống kê tổng hợp hệ thống. |
| **GET** | `/users` | Có (`Admin`) | Lấy danh sách người dùng (hỗ trợ tìm kiếm theo tên/email). |
| **PATCH** | `/users/:id/role` | Có (`Admin`) | Thay đổi vai trò phân quyền của người dùng. |
| **PATCH** | `/users/:id/status` | Có (`Admin`) | Khóa/Mở khóa tài khoản người dùng (`is_active`). |
| **DELETE** | `/comments/:id` | Có (`Admin`, `Moderator`) | Xóa bình luận vi phạm. |
| **GET** | `/stories` | Có (`Admin`, `Moderator`) | Xem tất cả truyện (gồm cả truyện chưa xuất bản hoặc đã ẩn). |
| **GET** | `/bad-words` | Có (`Admin`, `Moderator`) | Xem danh sách từ khóa nhạy cảm bị lọc tự động. |
| **POST** | `/bad-words` | Có (`Admin`) | Tạo từ khóa nhạy cảm mới. |
| **DELETE** | `/bad-words/:id` | Có (`Admin`) | Xóa từ khóa nhạy cảm. |
