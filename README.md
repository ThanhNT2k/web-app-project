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
| 1 | Nguyễn Thị Thùy | BAI252513 |  | |
| 2 | 	Trần Thị Kim Uyên | BAI250072 | | |
| 3 | Nguyễn Hải Dương | BAI250020 | | |
| 4 | Nguyễn Tuấn Thành | BAI252417 | | |

---

## 🛠️ Công nghệ & Công cụ Sử dụng

Hệ thống được xây dựng dựa trên các công nghệ hiện đại sau:

### Frontend
*   **Ngôn ngữ/Framework:** HTML5, CSS3, JavaScript (ES6+) / [ReactJS / VueJS / Angular]
*   **Thư viện UI:** [Tailwind CSS / Bootstrap / Ant Design]
*   **Quản lý trạng thái:** [Redux Toolkit / Context API]

### Backend & Database
*   **Runtime/Framework:** [Node.js (Express) / Python (Django/FastAPI) / C# (.NET Core)]
*   **Database:** [MongoDB / MySQL / PostgreSQL / SQL Server]
*   **Xác thực & Bảo mật:** [JWT (JSON Web Token) / Passport.js]

### Công cụ phát triển
*   **Quản lý mã nguồn:** Git, GitHub
*   **Kiểm thử API:** Postman / Insomnia
*   **Môi trường:** VS Code, Docker (nếu có)

---

## 🚀 Tính năng Chính

- [x] **Xác thực người dùng:** Đăng ký, Đăng nhập (JWT), Đăng xuất, Phân quyền (Admin/User).
- [x] **Quản lý sản phẩm/nội dung:** Xem danh sách, tìm kiếm, lọc, xem chi tiết.
- [x] **Giỏ hàng & Thanh toán:** Thêm/sửa/xóa sản phẩm trong giỏ hàng, tích hợp cổng thanh toán Sandbox (vnpay/momo nếu có).
- [ ] **Trang Quản trị (Admin Dashboard):** Thống kê doanh thu, quản lý người dùng, quản lý đơn hàng (Đang phát triển).

---

## 📂 Cấu trúc Thư mục Dự án

```text
web-app-project/
├── server/                  # Backend (hiện dùng Node/Express, roadmap gốc là ASP.NET MVC)
│   ├── Controllers/         # Controllers (page + api)
│   ├── Models/              # Models / Entities (placeholder)
│   ├── Data/                # DB configuration / context (scaffold here)
│   ├── Repositories/        # Data access layer (placeholder)
│   ├── Services/            # Business logic (AI, Identity)
│   ├── Views/               # Server-side templates (EJS placeholders)
│   ├── Routes/              # Express routers (pages, api)
│   ├── wwwroot/             # Static frontend files (HTML/CSS/JS)
│   └── server.js            # App entry point
├── AGENTS.md                # Notes for AI agents and repo mapping
└── README.md                # Project documentation (this file)
```
