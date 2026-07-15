# Tổng quan codebase CMC Truyện

## Entry points

- Frontend: `frontend/src/main.jsx` → `App.jsx`.
- Backend API: `backend/src/server.js` → `app.js`.
- Background worker: `backend/src/startWorker.js`.
- Database schema: `backend/scripts/schema.sql`.
- Migration runner: `backend/src/scripts/migrate.js`.

## Frontend

`App.jsx` chia route thành ba layout:

- User/public: trang chủ, tìm truyện, bảng xếp hạng, chi tiết, đọc chương và tài khoản.
- Admin: dashboard, users, stories, reports, bad words, comments, profiles và logs.
- Moderator: dashboard, hàng chờ truyện, reports, comments, profiles và logs.
Các thư mục frontend chi tiết:

- `src/data/` – Mock data (danh sách tags, categories) và hằng số UI (số item trên trang, delay auto-scroll).
- `src/lib/` – Tiện ích: `formatDate()`, `formatReadingTime()`, `truncate()` và các helpers khác.
- `src/utils/` – Validation, parsing query params và các hàm phụ trợ khác.
Các module đáng chú ý:

| Module | Vai trò |
|---|---|
| `services/api.js` | Axios client, base URL, JWT và toàn bộ API facade |
| `contexts/AuthContext.jsx` | Phiên đăng nhập và user state |
| `contexts/ThemeContext.jsx` | Theme state |
| `pages/StoryDetailPage.jsx` | Chi tiết, chapter metadata, progress và cộng đồng |
| `pages/ChapterReaderPage.jsx` | Đọc chương và lưu tiến độ |
| `pages/DashboardPage.jsx` | Quản lý truyện/chương/cộng tác viên |
| `components/FollowButton.jsx` | Follow optimistic update có rollback |
| `components/StoryRating.jsx` | Rating optimistic update có rollback |
| `components/CommentSection.jsx` | Comment tree, reply và vote optimistic |

Skeleton dùng class `.skeleton-box` và các loading class dùng chung trong `main.css`. Hai danh sách “Được quan tâm” và “Cập nhật gần đây” chỉ cuộn thủ công; hero carousel đổi slide mỗi 8 giây.

## Backend

### Cấu trúc và quy ước

**Backend phân lớp theo tầng:**
- `src/constants/` – Enum, constants (vai trò, trạng thái workflow, loại notification).
- `src/config/` – Database pool, Redis, Supabase, external services.
- `src/middleware/` – Authentication, RBAC, audit logging, file upload, rate limiting.
- `src/models/` – SQL queries và Sequelize models (một số model hoặc thuần `pg`).
- `src/services/` – Business logic: AI integration, queue/job management, email, notification, moderation.
- `src/controllers/` – Request validation, service orchestration, HTTP response.
- `src/routes/` – Route definition, middleware mounting, authentication/authorization.
- `src/workers/` – BullMQ job consumers cho moderation queue và notification queue.

**Kiểm thử:** Tests nằm co-located cùng source files (e.g., `authMiddleware.test.js` cạnh `authMiddleware.js`), không trong `__tests__/` riêng. Chạy bằng `npm test` hoặc `npm run test:backend`.

Router được mount trong `app.js`:

```text
/api/auth              Authentication, profile, Google OAuth, OTP
/api/stories           Story, rating, collaborator và nested chapter APIs
/api/reading-history   Progress và read chapters
/api/chapters          AI chapter summary
/api/ai                Recommendations
/api/comments          Comment và vote
/api/follows           Follow state
/api/notifications     Notification và notification preferences
/api/preferences       Reader preferences
/api/upload            Cover/avatar upload
/api/admin             Admin management
/api/moderator         Moderation workflow
/api/tags              Story tags
/api/reports           Reports workflow
/api/rankings          Rankings
/api/audit-logs        Audit query
```

### Quy ước backend

- Controller validate input và trả HTTP response.
- Model/service thực hiện truy vấn hoặc tích hợp bên ngoài.
- Route chịu trách nhiệm authentication/authorization.
- Public resource có thể dùng `optionalAuth` để kiểm tra quyền xem draft.
- Mutation quản trị quan trọng phải qua `auditAction`.
- Transaction phải dùng cùng một client từ `db.connect()` đến `COMMIT/ROLLBACK`.

## Kiểm thử

```bash
npm test                         # Backend baseline test (health, middleware, service)
npm run test:baseline            # Chạy baseline tests (không full coverage)
npm run test:coverage            # Full test coverage
npm run test:backend
npm run test:frontend
npm run test:e2e
npm run test:all
```

Backend dùng Jest/Supertest; frontend dùng Vitest/Testing Library; E2E dùng Playwright. Để tìm test, tìm file `.test.js` hoặc `.test.ts` co-located cùng source.

## Khi thêm tính năng

1. Thêm migration idempotent nếu thay đổi schema.
2. Cập nhật model/service trước controller và route.
3. Bổ sung facade tương ứng trong `frontend/src/services/api.js`.
4. Dùng skeleton cho read/loading state.
5. Chỉ dùng Optimistic UI khi có snapshot và rollback rõ ràng.
6. Cập nhật `API_REFERENCE.md`, test và README nếu hành vi public thay đổi.
