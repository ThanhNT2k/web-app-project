# Danh Sách API Endpoints - CMC Truyện (API_REFERENCE.md)

Tài liệu này đặc tả chi tiết toàn bộ các điểm cuối API của hệ thống CMC Truyện, bao gồm phương thức HTTP, đường dẫn, phân quyền và mô tả chức năng.

---

## 🔐 1. Xác Thực Người Dùng (Authentication)

Tất cả các endpoint xác thực đều bắt đầu bằng tiền tố `/api/auth`.

| Phương thức | Endpoint | Yêu cầu xác thực | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Không | Đăng ký tài khoản người dùng mới (Mặc định quyền `User`). |
| **POST** | `/api/auth/login` | Không | Đăng nhập tài khoản. Trả về token JWT và thông tin User. |
| **POST** | `/api/auth/logout` | Có | Đăng xuất tài khoản (Xóa phiên và thu hồi token). |
| **GET** | `/api/auth/me` | Có (`User+`) | Lấy thông tin cá nhân của tài khoản đang đăng nhập. |

---

## 📖 2. Quản Lý Truyện (Stories)

Tất cả các endpoint quản lý truyện đều bắt đầu bằng tiền tố `/api/stories`.

| Phương thức | Endpoint | Quyền truy cập | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/stories` | Không | Lấy danh sách truyện có phân trang và lọc theo thể loại. |
| **GET** | `/api/stories/:id` | Không | Lấy thông tin chi tiết bộ truyện theo ID. |
| **POST** | `/api/stories` | Có (`Uploader`, `Admin`) | Tạo mới một bộ truyện (Chỉ người đăng truyện hoặc Admin). |
| **PUT** | `/api/stories/:id` | Có (`Owner`, `Admin`) | Cập nhật thông tin bộ truyện (Chỉ chủ sở hữu hoặc Admin). |
| **DELETE** | `/api/stories/:id` | Có (`Owner`, `Admin`) | Xóa bộ truyện khỏi hệ thống (Chỉ chủ sở hữu hoặc Admin). |
| **GET** | `/api/stories/search` | Không | Tìm kiếm truyện theo tên hoặc từ khóa (truy vấn qua tham số `?q=`). |
| **GET** | `/api/stories/trending`| Không | Lấy danh sách truyện đang có lượt đọc/tương tác cao nhất. |
| **GET** | `/api/stories/latest` | Không | Lấy danh sách truyện mới được cập nhật gần đây nhất. |

---

## 📄 3. Quản Lý Chương (Chapters)

Quản lý chương truyện nằm dưới tài nguyên của câu chuyện tương ứng.

| Phương thức | Endpoint | Quyền truy cập | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/stories/:storyId/chapters` | Không | Lấy danh sách toàn bộ chương của một bộ truyện. |
| **GET** | `/api/stories/:storyId/chapters/:chapterId` | Không | Lấy chi tiết nội dung một chương truyện để đọc. |
| **POST** | `/api/stories/:storyId/chapters` | Có (`Uploader`, `Admin`) | Đăng tải chương mới lên bộ truyện (Chỉ uploader truyện hoặc Admin). |
| **PUT** | `/api/stories/:storyId/chapters/:chapterId` | Có (`Owner`, `Admin`) | Chỉnh sửa nội dung chương truyện (Chỉ chủ sở hữu hoặc Admin). |
| **DELETE** | `/api/stories/:storyId/chapters/:chapterId` | Có (`Owner`, `Admin`) | Xóa chương truyện (Chỉ chủ sở hữu hoặc Admin). |
| **GET** | `/api/chapters/:id/summary` | Có (`User+`) | Gọi AI Gemini tóm tắt nội dung chương (Kết quả được cache). |

---

## 💬 4. Tương Tác & Lịch Sử Đọc (User Features)

Các chức năng lưu trữ lịch sử, theo dõi truyện và bình luận.

| Phương thức | Endpoint | Quyền truy cập | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/reading-history` | Có (`User+`) | Lưu lại chương truyện vừa đọc và cập nhật tiến độ đọc truyện. |
| **GET** | `/api/reading-history` | Có (`User+`) | Lấy danh sách lịch sử đọc truyện của người dùng. |
| **DELETE**| `/api/reading-history/:storyId`| Có (`User+`) | Xóa một truyện khỏi danh sách lịch sử đọc. |
| **POST** | `/api/user-follows` | Có (`User+`) | Theo dõi (Follow) một bộ truyện để nhận thông báo chương mới. |
| **GET** | `/api/user-follows` | Có (`User+`) | Lấy danh sách truyện đang được người dùng theo dõi. |
| **DELETE**| `/api/user-follows/:storyId` | Có (`User+`) | Bỏ theo dõi (Unfollow) bộ truyện. |
| **POST** | `/api/comments` | Có (`User+`) | Viết bình luận mới dưới một chương truyện hoặc bộ truyện. |
| **GET** | `/api/comments` | Không | Lấy danh sách bình luận của truyện/chương (hỗ trợ phân trang). |
| **DELETE**| `/api/comments/:id` | Có (`Owner`, `Admin`) | Xóa bình luận của bản thân hoặc do Admin thực hiện. |

---

## 🤖 5. Cá Nhân Hóa Bằng AI (AI Recommendations)

Nhóm API phục vụ cho đề xuất cá nhân hóa.

| Phương thức | Endpoint | Quyền truy cập | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/recommendations/personalized` | Có (`User+`) | Lấy danh sách 5 truyện gợi ý tương thích từ AI Gemini dựa trên Telemetry. |

---

## 📋 6. Định Dạng Phản Hồi Chuẩn (Standardized Response Format)

Tất cả các API endpoint đều trả về một cấu trúc phản hồi JSON thống nhất để Client dễ dàng kiểm soát lỗi:

### Phản hồi Thành công (Success Response):
```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công."
}
```

### Phản hồi Lỗi (Error Response):
```json
{
  "success": false,
  "error": "Tài khoản hoặc mật khẩu không chính xác.",
  "code": "AUTH_FAILED"
}
```
Các mã lỗi phổ biến:
*   `400 Bad Request` -> Đầu vào dữ liệu không đúng định dạng.
*   `401 Unauthorized` -> Không có token xác thực hoặc token hết hạn.
*   `403 Forbidden` -> Tài khoản không đủ quyền truy cập (Sai role).
*   `404 Not Found` -> Tài nguyên không tồn tại.
*   `500 Internal Server Error` -> Lỗi hệ thống hoặc lỗi kết nối database.
