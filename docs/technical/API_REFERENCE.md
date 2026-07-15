# Tham chiếu REST API CMC Truyện

Base URL local: `http://localhost:5000/api`.

Endpoint yêu cầu đăng nhập nhận header:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Quy ước quyền: **Public** không cần token; **Optional** công khai nhưng dùng thêm user context nếu token hợp lệ; **Auth** yêu cầu đăng nhập.

## Health

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/health` | Public | Kiểm tra trạng thái Express server |

## Authentication — `/api/auth`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| POST | `/register` | Public | Đăng ký |
| POST | `/login` | Public | Đăng nhập, nhận JWT |
| POST | `/logout` | Auth | Đăng xuất |
| GET | `/me` | Auth | User hiện tại |
| PUT | `/profile` | Auth | Cập nhật hồ sơ |
| POST | `/google` | Public | Đăng nhập/đăng ký Google |
| POST | `/google/complete` | Public | Hoàn tất tài khoản Google mới |
| POST | `/forgot-password` | Public | Gửi OTP reset password |
| POST | `/verify-otp` | Public | Xác minh OTP |
| POST | `/reset-password` | Public | Đặt lại mật khẩu |
| PUT | `/change-password` | Auth | Đổi mật khẩu |

## Stories và chapters — `/api/stories`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/` | Public | Danh sách published; `page`, `limit`, `sortBy` |
| GET | `/mine` | Uploader/Admin | Truyện sở hữu hoặc cộng tác |
| GET | `/search` | Public | Tìm theo `q`, `category`, `tag`, pagination |
| GET | `/by-slug/:slug` | Optional | Chi tiết theo slug hoặc `id-slug` |
| GET | `/:id` | Optional | Chi tiết theo ID |
| POST | `/` | Uploader | Tạo truyện ở trạng thái chờ duyệt |
| PUT | `/:id` | Uploader/Admin | Cập nhật truyện có quyền chỉnh sửa |
| DELETE | `/:id` | Uploader/Admin | Xóa mềm truyện |
| PATCH | `/:id/visibility` | Admin theo workflow | Thay đổi visibility và ghi audit |
| GET | `/:id/rating` | Optional | Tổng quan rating và rating của user |
| PUT | `/:id/rating` | Auth | Tạo/cập nhật rating 1–5 |
| DELETE | `/:id/rating` | Auth | Xóa rating |
| GET | `/:id/collaborators` | Auth | Danh sách cộng tác viên |
| POST | `/:id/collaborators` | Uploader/Admin | Thêm cộng tác viên |
| DELETE | `/:id/collaborators/:userId` | Uploader/Admin | Xóa cộng tác viên |
| GET | `/:storyId/chapters` | Optional | Danh sách metadata chương; không có `content` |
| GET | `/:storyId/chapters/:chapterId` | Optional | Chi tiết chương gồm nội dung |
| GET | `/by-slug/:storySlug/chapters/:chapterNumber` | Optional | Chi tiết chương theo URL đọc |
| POST | `/:storyId/chapters` | Uploader | Tạo chương cho truyện đủ điều kiện |
| POST | `/:storyId/chapters/preview-file` | Uploader | Preview TXT/EPUB, multipart field `file` |
| POST | `/:storyId/chapters/import-file` | Uploader | Import TXT/EPUB, multipart field `file` |
| PUT | `/:storyId/chapters/:chapterId` | Uploader/Admin | Cập nhật chương |
| DELETE | `/:storyId/chapters/:chapterId` | Uploader/Admin | Xóa chương |

`POST /api/stories/import-file` hiện trả conflict và không phải luồng import được khuyến nghị. Luồng đúng là tạo metadata truyện, chờ duyệt, sau đó import chapter.

## AI và reading history

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/chapters/:id/summary` | Theo controller | Lấy/tạo tóm tắt chương |
| GET | `/api/ai/recommendations` | Auth | Gợi ý cá nhân hóa |
| POST | `/api/reading-history` | Auth | Upsert tiến độ đọc |
| GET | `/api/reading-history` | Auth | Lịch sử đọc |
| GET | `/api/reading-history/story/:storyId` | Auth | Tiến độ một truyện |
| GET | `/api/reading-history/story/:storyId/read-chapters` | Auth | Số chương đã đọc |

## Comments — `/api/comments`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/story/:storyId` | Optional | Bình luận truyện |
| GET | `/chapter/:chapterId` | Optional | Bình luận chương; có thể truyền `story_id` |
| POST | `/` | Auth | Tạo bình luận/reply |
| POST | `/:id/vote` | Auth | Like, dislike hoặc bỏ vote |
| DELETE | `/:id` | Auth/owner/admin | Xóa bình luận |

## Follows — `/api/follows`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/` | Auth | Tủ truyện theo dõi |
| GET | `/check/:storyId` | Optional | Kiểm tra follow |
| POST | `/:storyId` | Auth | Follow |
| DELETE | `/:storyId` | Auth | Unfollow |

## Notifications — `/api/notifications`

Tất cả endpoint yêu cầu Auth.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/` | Danh sách phân trang |
| GET | `/unread-count` | Số chưa đọc |
| PATCH | `/:id/read` | Đánh dấu đã đọc |
| PATCH | `/read-all` | Đọc tất cả |
| DELETE | `/:id` | Xóa một thông báo |
| DELETE | `/` | Xóa tất cả |
| GET | `/preferences/me` | Notification preferences |
| PATCH | `/preferences/me` | Cập nhật notification preferences |

## Reader preferences — `/api/preferences`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/` | Auth | Cài đặt đọc |
| PUT | `/` | Auth | Cập nhật font, spacing, theme, auto bookmark |

## Uploads, tags và rankings

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/upload/cover` | Auth | Upload cover/avatar, multipart field `cover` |
| GET | `/api/tags` | Public | Danh sách tag |
| POST | `/api/tags` | Uploader/Admin | Tạo tag |
| GET | `/api/rankings` | Public | Ranking theo type/period/limit |

## Reports — `/api/reports`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| POST | `/` | Auth + rate limit | Tạo report cho story/comment/profile |
| GET | `/` | Admin/Moderator | Danh sách report |
| PATCH | `/:id/process` | Admin/Moderator | Xử lý report và action |
| PATCH | `/:id` | Admin/Moderator | Cập nhật trạng thái report |

## Moderator — `/api/moderator`

Tất cả endpoint yêu cầu Moderator hoặc Admin.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/dashboard` | Thống kê moderation |
| GET | `/pending-stories` | Hàng chờ truyện |
| PATCH | `/pending-stories/:id/approve` | Duyệt nhanh |
| PATCH | `/pending-stories/:id/process` | Approve/request changes/reject |
| GET | `/comments` | Danh sách và bộ lọc bình luận |
| PATCH | `/comments/:id/status` | Cập nhật moderation status |
| GET | `/profiles` | Hồ sơ/avatar bị report |
| PATCH | `/profiles/:id/avatar` | Xử lý avatar |

## Admin — `/api/admin`

Tất cả endpoint yêu cầu Admin.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/stats` | Thống kê hệ thống |
| GET | `/users` | Tìm và liệt kê user |
| PATCH | `/users/:id/role` | Đổi role |
| PATCH | `/users/:id/status` | Khóa/mở tài khoản |
| DELETE | `/comments/:id` | Xóa bình luận |
| GET | `/stories` | Danh sách truyện quản trị |
| GET | `/bad-words` | Danh sách từ khóa |
| POST | `/bad-words` | Tạo từ khóa |
| PATCH | `/bad-words/:id` | Đổi tier |
| DELETE | `/bad-words/:id` | Xóa từ khóa |

## Audit logs — `/api/audit-logs`

| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/` | Admin/Moderator | Log phân trang và lọc; Moderator bị giới hạn phạm vi |

## HTTP status thường gặp

| Status | Ý nghĩa |
|---|---|
| 200/201 | Thành công/tạo mới |
| 400 | Payload hoặc query không hợp lệ |
| 401 | Thiếu/hỏng token |
| 403 | Không đủ quyền |
| 404 | Không tồn tại hoặc resource không được phép xem |
| 409 | Xung đột workflow/dữ liệu |
| 429 | Vượt rate limit |
| 500 | Lỗi không mong đợi |

Route code là nguồn sự thật cuối cùng tại `backend/src/routes/`. Khi thêm hoặc đổi endpoint, phải cập nhật file này cùng pull request.
