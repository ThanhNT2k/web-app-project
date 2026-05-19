# web-app-project
# Học phần: Phát triển Ứng dụng Web (Web Application Development)

Kho lưu trữ này chứa toàn bộ mã nguồn, tài liệu và các bài tập thuộc học phần **Phát triển Ứng dụng Web**. Dự án tập trung vào việc xây dựng một ứng dụng web hoàn chỉnh từ giao diện người dùng (Frontend) đến hệ thống xử lý và cơ sở dữ liệu (Backend).

---

## 📝 Thông tin Đề tài & Thành viên

*   **Tên đề tài/Đồ án:** 
*   **Giảng viên hướng dẫn:** Nguyễn Đức Giang
*   **Thông tin nhóm:**

| STT | Họ và Tên | MSSV | Vai trò trong dự án | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Nguyễn Thị Thùy | BAI252513 | Fullstack / Team Leader | Đóng góp 100% |
| 2 | 	Trần Thị Kim Uyên | BAI250072 | Frontend Developer | Đóng góp 100% |
| 3 | Nguyễn Hải Dương | BAI250020 | Backend Developer | Đóng góp 100% |
| 4 | Nguyễn Tuấn Thành | BAI252417 | Backend Developer | Đóng góp 100% |

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
📁 web-app-repo/
├── 📁 client/                 # Mã nguồn Frontend (React/Vue/HTML...)
│   ├── 📁 public/
│   └── 📁 src/
│       ├── 📁 components/     # Các thành phần giao diện dùng chung
│       ├── 📁 pages/          # Các trang chính (Home, Login, Admin...)
│       └── App.js
├── 📁 server/                 # Mã nguồn Backend (NodeJS/Python...)
│   ├── 📁 config/             # Cấu hình kết nối DB, biến môi trường
│   ├── 📁 controllers/        # Điều hướng và xử lý logic
│   ├── 📁 models/             # Định nghĩa Schema/Bảng Cơ sở dữ liệu
│   ├── 📁 routes/             # Định nghĩa các endpoints API
│   └── server.js              # File chạy chính của Backend
├── .gitignore                 # Các file bỏ qua không push lên GitHub
├── README.md                  # Tài liệu hướng dẫn này
└── docker-compose.yml         # Cấu hình Docker (nếu có)