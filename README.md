# CMC Truyện — Nền Tảng Đọc Truyện Chữ Trực Tuyến

## 📖 Giới Thiệu Dự Án

CMC Truyện là một nền tảng đọc truyện chữ trực tuyến được thiết kế dành cho độc giả Việt Nam. Sản phẩm tập trung vào **trải nghiệm đọc sạch, nhanh và không bị làm phiền bởi quảng cáo**, kết hợp với công nghệ AI để cá nhân hóa gợi ý truyện cho mỗi người dùng.

### 🎯 Lý Do Xây Dựng

Các nền tảng đọc truyện hiện tại (Truyện Full, TruyenGG, Metruyện) đều gặp các vấn đề:
- **Quảng cáo xâm phạm** → popup, video tự phát gián đoạn đọc
- **Giao diện chói mắt** → không dark mode, không điều chỉnh cỡ chữ
- **Mất vị trí đọc** → không lưu tự động, phải nhớ chương bằng tay

CMC Truyện được xây dựng để **giải quyết hoàn toàn những vấn đề này**.

---

## 🏗️ Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình **Decoupled Architecture** với hai repository riêng biệt:

- **Backend (C# / ASP.NET Core)** — Xử lý logic nghiệp vụ, quản lý dữ liệu, tích hợp AI
- **Frontend (HTML / CSS / JavaScript)** — Giao diện hiển thị, tương tác người dùng

### Backend Stack
- **Framework:** ASP.NET Core MVC
- **ORM:** Entity Framework Core
- **Database:** PostgreSQL (Supabase)
- **AI Integration:** Gemini API (Google)
- **Authentication:** ASP.NET Core Identity

### Frontend Stack
- **Views:** Razor Pages / HTML
- **Styling:** CSS / Tailwind CSS
- **Interactivity:** Vanilla JavaScript

---

## 📁 Cấu Trúc Thư Mục Backend

```
web-app-backend/
├── Controllers/                 # Tiếp nhận request, xử lý điều hướng
├── Models/                      # ViewModels và các class phụ trợ
├── Data/                        # Cấu hình Database & Entity Framework Core
│   ├── Entities/               # Các bảng Database (Code-First Models)
│   └── ApplicationDbContext.cs # DbContext chính
├── Repositories/               # Tầng CRUD trực tiếp với DB
├── Services/                   # Tầng xử lý logic nghiệp vụ
│   ├── AI/                     # Tích hợp Gemini API, xử lý Prompt
│   └── Identity/               # Phân quyền (Admin, Uploader, User)
├── Views/                      # Giao diện Razor (Trang chủ, Đọc truyện, etc.)
│   ├── Home/                   # Trang chủ + AI Personalization
│   ├── Story/                  # Chi tiết truyện, danh sách chương
│   ├── Account/                # Đăng ký, đăng nhập
│   ├── Profile/                # Lịch sử đọc, truyện theo dõi
│   └── Shared/                 # Layout chung (Header, Footer)
├── wwwroot/                    # File tĩnh (CSS, JS, Images)
├── Program.cs                  # Cấu hình khởi tạo DI, Middleware
├── appsettings.json           # Connection String, Gemini Key
└── Dockerfile                  # Đóng gói cho deployment
```

---

## 🔐 Hệ Thống Phân Quyền

CMC Truyện chia 4 nhóm quyền hạn sử dụng **ASP.NET Core Identity**:

| Vai Trò | Quyền Hạn |
|---------|-----------|
| **Admin** | Toàn quyền — quản lý users, truyện, chương, bình luận |
| **Uploader** | Đăng/xóa truyện riêng, + toàn bộ quyền User |
| **User** | Đọc truyện, lưu lịch sử, follow, bình luận |
| **Guest** | Chỉ đọc truyện + xem thông tin công khai |

---

## 🤖 AI Feature: Tóm Tắt Chương/Truyện

Khi người dùng đọc truyện, họ có thể bấm nút **"🤖 Tóm tắt"** để AI tạo bản tóm tắt ngắn gọn của chương hiện tại hoặc cả bộ truyện.

**Lợi ích:**
- Giúp người dùng nhớ lại cốt truyện khi đọc gián đoạn
- Tiết kiệm thời gian trong việc bắt kịp nội dung
- Dễ chia sẻ summary với bạn bè

### Các Trang Chính Cần Có

- **Homepage** — Danh sách truyện hot, mới cập nhật
- **Story Detail** — Tóm tắt truyện, danh sách chương
- **Chapter Reader** — Nội dung + nút "Tóm tắt chương" (AI)
- **Profile** — Lịch sử đọc, truyện theo dõi
- **Account** — Đăng ký, đăng nhập

---

## 🚀 Tiêu Chí Thành Công (MVP)

✅ Người dùng vào trang → tìm truyện → đọc → chuyển chương **trong 30 giây**

✅ Sau khi thoát, quay lại hệ thống **tự mở đúng chương đang đọc**

✅ **Không có quảng cáo** trong màn hình đọc

✅ Giao diện có **dark mode**, **điều chỉnh cỡ chữ**, **auto-bookmark**

---

## 📚 Tài Liệu Chi Tiết

- [`PRODUCT_DIRECTION.md`](./PRODUCT_DIRECTION.md) — Tầm nhìn sản phẩm, MVP scope
- [`PRODUCT_ANALYSIS.md`](./PRODUCT_ANALYSIS.md) — Phân tích người dùng, pain points
- [`AI_FEATURE_PROPOSAL.md`](./AI_FEATURE_PROPOSAL.md) — Thiết kế tính năng cá nhân hóa AI
- [`AI_USAGE_POLICY.md`](./AI_USAGE_POLICY.md) — Hướng dẫn dùng AI an toàn
- [`AGENT_GUIDE.md`](./AGENT_GUIDE.md) — Hướng dẫn làm việc với AI agents

---

**Dự án được phát triển bởi nhóm CMC Truyện — Khóa Phát Triển Phần Mềm Hướng AI**