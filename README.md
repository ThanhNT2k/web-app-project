# CMC Truyện

CMC Truyện là nền tảng đọc và quản lý truyện chữ trực tuyến dành cho người dùng Việt Nam. Hệ thống gồm giao diện React, REST API Express, PostgreSQL và Redis/BullMQ cho các tác vụ nền. Dự án hỗ trợ đọc truyện, theo dõi tiến độ, đánh giá, bình luận, thông báo, kiểm duyệt nội dung và các tính năng AI.

## Tính năng chính

### Dành cho độc giả

- Khám phá, tìm kiếm, lọc theo tag và xem bảng xếp hạng truyện.
- Đọc chương theo URL thân thiện, lưu lịch sử và tiến độ đọc.
- Theo dõi truyện, nhận thông báo chương mới và quản lý tủ sách.
- Đánh giá sao, bình luận, trả lời và bình chọn bình luận.
- Giao diện sáng/tối và tùy chỉnh trải nghiệm đọc.
- Skeleton screen cho trạng thái tải và Optimistic UI cho các tương tác phù hợp.

### Dành cho uploader

- Tạo và chỉnh sửa truyện, quản lý tag và cộng tác viên.
- Import/preview nội dung chương từ tệp văn bản hoặc EPUB.
- Quản lý chương sau khi truyện được Moderator duyệt.
- Theo dõi trạng thái kiểm duyệt và yêu cầu chỉnh sửa.

### Dành cho Moderator và Admin

- Duyệt truyện, avatar, bình luận và báo cáo vi phạm.
- Quản lý người dùng, vai trò, trạng thái tài khoản và truyện.
- Quản lý bộ từ khóa kiểm duyệt theo tier.
- Xem dashboard và nhật ký audit.

### AI và xử lý nền

- Tóm tắt chương bằng Groq, fallback sang Google Gemini.
- Gợi ý truyện cá nhân hóa.
- Cache kết quả AI để hạn chế request trùng lặp.
- BullMQ và Redis phục vụ notification/moderation worker.

## Kiến trúc

```text
Browser
  └─ React 18 + Vite + React Router + Axios
       └─ REST API /api
            └─ Node.js + Express
                 ├─ PostgreSQL (pg pool và một số Sequelize model)
                 ├─ Redis + BullMQ workers
                 ├─ Supabase Storage
                 ├─ Groq / Gemini
                 └─ Resend email
```

Các thư mục quan trọng:

```text
backend/
  scripts/                    Schema, seed và tiện ích dữ liệu
  src/config/                 Environment, PostgreSQL, Redis, Supabase
  src/controllers/            Xử lý request/response
  src/middleware/             JWT, RBAC, audit, upload, rate limit
  src/models/                 Truy vấn và model dữ liệu
  src/routes/                 REST API routes
  src/scripts/migrations/     SQL migration tăng dần
  src/services/               AI, queue, email, notification, moderation
  src/workers/                Background workers

frontend/
  public/pages/               Redirect tương thích URL cũ
  src/components/             Component dùng chung
  src/contexts/               Auth và theme state
  src/layouts/                User/Admin/Moderator layouts
  src/pages/                  Các trang React
  src/services/               Axios API client
  src/styles/                 CSS giao diện và responsive

docs/                         Tài liệu sản phẩm và kỹ thuật
tests/e2e/                    Playwright end-to-end tests
```

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Axios, Bootstrap, Tailwind CSS, Font Awesome |
| Backend | Node.js, Express 4, Joi/Zod, JWT, bcryptjs |
| Database | PostgreSQL 15, `pg`, Sequelize |
| Queue | Redis 7, BullMQ |
| Storage | Supabase Storage |
| AI | Groq và Google Gemini |
| Email/OAuth | Resend, Google Auth Library |
| Test | Jest, Supertest, Vitest, Testing Library, Playwright |
| Deploy | Render (backend/worker), Vercel (frontend) |

## Vai trò và phân quyền

| Vai trò | Khả năng chính |
|---|---|
| Guest | Xem, tìm kiếm và đọc truyện công khai |
| User | Guest + lịch sử đọc, follow, rating, bình luận, báo cáo và tùy chỉnh |
| Uploader | User + tạo truyện, import và quản lý nội dung được cấp quyền |
| Moderator | Duyệt truyện/nội dung, xử lý báo cáo và xem audit thuộc phạm vi Moderator |
| Admin | Quản trị toàn hệ thống |

## Yêu cầu môi trường

- Node.js 18 trở lên.
- npm.
- PostgreSQL 15 và Redis 7, hoặc Docker Desktop.

## Cấu hình biến môi trường

Tạo `backend/.env`:

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Có thể dùng DATABASE_URL hoặc nhóm DB_* bên dưới
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/cmc_truyen
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=cmc_truyen
# DB_USER=your_user
# DB_PASSWORD=your_password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
REDIS_URL=redis://localhost:6379

# Tùy chọn theo tính năng
GROQ_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GOOGLE_CLIENT_ID=
RESEND_API_KEY=
RESEND_FROM_EMAIL=CMC Truyện <no-reply@example.com>
```

Tạo `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
```

Không commit `.env` hoặc service-role key lên Git.

## Chạy dự án trên máy local

### 1. Cài dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Khởi động PostgreSQL và Redis

```bash
cd backend
npm run infra:up
```

Docker Compose tạo `cmc_postgres` tại cổng `5432` và `cmc_redis` tại cổng `6379`. Nếu các container này đã tồn tại, dùng `docker start cmc_postgres cmc_redis` thay vì tạo một Compose project thứ hai.

### 3. Khởi tạo database

Với database mới:

```bash
cd backend
npm run db:init
npm run db:migrate
npm run db:seed       # tùy chọn
```

Với database đã có schema, chỉ cần:

```bash
cd backend
npm run db:migrate
```

`db:migrate` chỉ chạy migration; lệnh này không tự khởi động Docker.

### 4. Chạy backend, worker và frontend

Mở các terminal riêng:

```bash
cd backend
npm run dev
```

```bash
cd backend
node src/startWorker.js
```

```bash
cd frontend
npm run dev -- --port 3000
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

Worker chỉ bắt buộc khi kiểm thử các luồng queue/notification/moderation.

## Scripts thường dùng

### Tại thư mục gốc

```bash
npm test              # backend baseline + frontend tests
npm run test:backend
npm run test:frontend
npm run test:e2e
npm run test:all
```

### Backend

```bash
npm run dev
npm start
npm test
npm run test:baseline
npm run test:coverage
npm run db:init
npm run db:migrate
npm run db:seed
npm run db:sync-tags
npm run infra:up
npm run infra:down
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm test
npm run test:watch
npm run test:coverage
```

## Route giao diện chính

| Route | Mô tả |
|---|---|
| `/` | Trang chủ và carousel truyện nổi bật |
| `/tim-truyen`, `/browse` | Tìm và lọc truyện |
| `/bang-xep-hang` | Bảng xếp hạng |
| `/story/:slug` | Chi tiết truyện |
| `/:storySlug/:chapterNumber` | Đọc chương |
| `/account/*` | Tủ sách, lịch sử và cài đặt |
| `/dashboard` | Quản lý nội dung của Uploader/Admin |
| `/moderator/*` | Không gian Moderator |
| `/admin/*` | Không gian Admin |

API dùng prefix `/api`. Danh sách endpoint chi tiết nằm tại [API_REFERENCE.md](docs/technical/API_REFERENCE.md).

## Hiệu năng và trải nghiệm

- PostgreSQL connection pool và index cho các truy vấn story/chapter/comment phổ biến.
- API danh sách chương không trả nội dung chương, giảm kích thước response.
- Giới hạn kích thước trang API để tránh request quá lớn.
- Skeleton screen dùng chung giúp giảm cảm giác chờ và hạn chế layout shift.
- Optimistic UI có rollback cho follow, rating, vote bình luận và thông báo.
- Hai danh sách “Được quan tâm” và “Cập nhật gần đây” cuộn thủ công; carousel hero tự chuyển mỗi 8 giây.

## Tài liệu liên quan

- [Kiến trúc hệ thống](docs/technical/ARCHITECTURE.md)
- [Tham chiếu API](docs/technical/API_REFERENCE.md)
- [Chính sách sử dụng AI](docs/technical/AI_USAGE_POLICY.md)
- [AI personalization](docs/technical/AI_PERSONALIZATION.md)
- [Yêu cầu sản phẩm](docs/product/REQUIREMENTS.md)
- [Định hướng sản phẩm](docs/product/PRODUCT_DIRECTION.md)
- [Changelog](docs/CHANGELOG.md)

## Lưu ý đóng góp

- Không commit secret, token, `.env`, file upload hoặc dữ liệu production.
- Chạy test phù hợp và `npm run build --prefix frontend` trước khi tạo pull request.
- Migration mới phải có thể chạy lặp lại an toàn khi có thể (`IF NOT EXISTS`, kiểm tra dữ liệu trước khi thay đổi constraint).
- Giữ tương thích với các redirect cũ trong `frontend/public/pages/`.
