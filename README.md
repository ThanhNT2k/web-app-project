# web-app-project
# Học phần: Phát triển Ứng dụng Web (Web Application Development)

Kho lưu trữ này chứa toàn bộ mã nguồn, tài liệu và các bài tập thuộc học phần **Phát triển Ứng dụng Web**. Dự án tập trung vào việc xây dựng một ứng dụng web hoàn chỉnh từ giao diện người dùng (Frontend) đến hệ thống xử lý và cơ sở dữ liệu (Backend).

---

## 📝 Thông tin Đề tài & Thành viên

*   **Tên đề tài/Đồ án:** Xây dựng website đọc truyện online
*   **Giảng viên hướng dẫn:** Nguyễn Đức Giang
*   **Thông tin nhóm:**

| STT | Họ và Tên | MSSV | Vai trò trong dự án | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Nguyễn Thị Thùy | BAI252513 | Front-end Developer | |
| 2 | 	Trần Thị Kim Uyên | BAI250072 | Back-end Developer | |
| 3 | Nguyễn Hải Dương | BAI250020 | | |
| 4 | Nguyễn Tuấn Thành | BAI252417 | | |

---

## 🛠️ Công nghệ & Công cụ Sử dụng

Hệ thống được xây dựng dựa trên các công nghệ hiện đại sau:

### Frontend
*   **Ngôn ngữ/Framework:** HTML5, CSS3, JavaScript (ES6+) [ReactJS]
*   **Thư viện UI:** [Tailwind CSS]
*   **Quản lý trạng thái:** [Context API]

### Backend & Database
*   **Runtime/Framework:** [Node.js]
*   **Database:** [PostgreSQL]
*   **Xác thực & Bảo mật:** [JWT]

### Công cụ phát triển
*   **Quản lý mã nguồn:** Git, GitHub
*   **Kiểm thử API:** Insomnia
*   **Môi trường:** VS Code

---

## 🚀 Tính năng Chính

- [x] **Xác thực người dùng:** Đăng ký, Đăng nhập (JWT), Đăng xuất, Phân quyền (Admin/User).
- [x] **Quản lý sản phẩm/nội dung:** Xem danh sách, tìm kiếm, lọc, xem chi tiết.
    - [x] **Trang Quản trị (Admin Dashboard):**

---

## 📂 Cấu trúc Thư mục Dự án

```text
web-app-project/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router (Routing & Pages)
│   │   ├── (auth)/                      # Group các trang Xác thực
│   │   │   ├── 📁 login/page.tsx        # Trang đăng nhập
│   │   │   └── 📁 register/page.tsx     # Trang đăng ký
│   │   ├── 📁 profile/page.tsx          # Trang cá nhân, lịch sử đọc
│   │   ├── 📁 stories/                  # Route liên quan đến truyện
│   │   │   ├── 📁 [id]/                 # Chi tiết truyện
│   │   │   │   ├── 📁 [chapterId]/      # Trang đọc chương truyện
│   │   │   │   └── page.tsx             # Manga Detail Page
│   │   │   └── page.tsx                 # Trang bộ lọc / Danh sách truyện
│   │   ├── 📁 api/                      # RESTful API Endpoints (nếu cần)
│   │   │   └── 📁 ai/route.ts           # Endpoint xử lý gọi Gemini API
│   │   ├── page.tsx                     # Trang chủ (Homepage hiển thị AI Rcm)
│   │   ├── layout.tsx                   # Layout tổng (Header, Footer dùng chung)
│   │   └── middleware.ts                # Next.js Middleware kiểm tra phân quyền (Admin/User)
│   │
│   ├── 📁 components/                   # Các React Components tái sử dụng (Client & Server)
│   │   ├── 📁 ui/                       # Button, Input, Dialog, Card...
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── 📁 lib/                          # Cấu hình các dịch vụ lõi (Core Services)
│   │   ├── 📁 supabase/                 # Cấu hình kết nối Supabase
│   │   │   ├── client.ts                # Supabase Client dùng cho Client Components
│   │   │   └── server.ts                # Supabase Client dùng cho Server Components/Actions
│   │   └── 📁 ai/                       # Cấu hình Vercel AI SDK & Gemini API[cite: 1]
│   │       └── gemini.ts
│   │
│   ├── 📁 services/                     # Tầng logic nghiệp vụ độc lập (Business Logic)
│   │   ├── storyService.ts              # Xử lý CRUD truyện, chương
│   │   └── aiService.ts                 # Xử lý tạo prompt, gửi telemetry cho Gemini
│   │
│   ├── 📁 types/                        # Định nghĩa TypeScript Types / Interfaces
│   │   └── index.ts
│   │
│   └── 📁 utils/                        # Các hàm trợ giúp (Helper functions)
│
├── 📁 prisma/                           # Cấu hình ORM (Nếu chọn Prisma để quản lý DB)
│   └── schema.prisma
├── 📁 tests/                            # Thư mục chứa kịch bản kiểm thử tự động
│   └── 📁 playwright/                   # Các file test E2E cho phân quyền & AI[cite: 1]
├── Dockerfile                           # Đóng gói ứng dụng NodeJS/Nextjs lên Render/Fly.io
├── next.config.js                       # Cấu hình Next.js
├── package.json                         # Khai báo thư viện (React, Next, Vercel AI SDK, Supabase...)[cite: 1]
├── tsconfig.json                        # Cấu hình TypeScript
└── .env.local                           # Biến môi trường (Supabase URL, Gemini API Key)[cite: 1]
```
