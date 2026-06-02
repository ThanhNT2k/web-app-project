# CMC Truyện - Frontend Application

Giao diện người dùng (Frontend) được phát triển bằng **React.js** và **Vite** dành cho ứng dụng **CMC Truyện** (nền tảng đọc truyện trực tuyến).

## 🚀 Công Nghệ Sử Dụng

- **React 18**: Thư viện UI cốt lõi.
- **Vite**: Công cụ build và hot reload cực nhanh.
- **React Router DOM 6**: Quản lý điều hướng và định tuyến SPA.
- **Tailwind CSS 3** & **Bootstrap 5**: Giao diện linh hoạt, hiện đại kết hợp tiện ích từ Tailwind và components từ Bootstrap.
- **Axios**: Quản lý các cuộc gọi API hiệu quả với interceptors tự động đính kèm Token Auth.
- **Context API**:
  - `AuthContext`: Quản lý trạng thái đăng ký/đăng nhập, phân quyền người dùng và JWT Token.
  - `ThemeContext`: Quản lý Light/Dark mode (giao diện sáng/tối).

---

## ✨ Tính Năng Chính

1. **Trang Chủ (Home)**: Hiển thị các truyện mới cập nhật, truyện hot, danh sách thể loại và truyện gợi ý từ AI.
2. **Tìm Truyện (Browse)**: Tìm kiếm theo tên truyện, bộ lọc nâng cao theo thể loại, tag và sắp xếp linh hoạt (mới nhất, thịnh hành...).
3. **Đọc Truyện Tiện Lợi**:
   - Giao diện đọc chương truyện trực quan, hỗ trợ điều chỉnh font chữ, cỡ chữ, màu nền qua bảng tùy chỉnh preferences.
   - Thanh tiến trình cuộn trang trực quan.
   - **Tóm Tắt Chương Bằng AI (AI Summary)**: Hỗ trợ tóm tắt nhanh nội dung chương truyện bằng Trí Tuệ Nhân Tạo.
4. **Hệ Thống Tương Tác**: Bình luận (Comment), theo dõi truyện (Follow), lưu lịch sử đọc tự động.
5. **Hệ Thống Phân Quyền & Route Bảo Vệ**:
   - `ProtectedRoute`: Yêu cầu đăng nhập mới được truy cập (Profile).
   - `RoleProtectedRoute`: Giới hạn truy cập cho từng vai trò đặc thù (`Uploader`, `Admin`).
6. **Bảng Điều Khiển (Dashboard & Admin)**:
   - **Uploader Dashboard**: Đăng truyện mới, quản lý chương, tải lên ảnh bìa truyện.
   - **Admin Control Panel**: Xem thống kê hệ thống, quản lý tài khoản người dùng và phân quyền (`User`, `Uploader`, `Admin`), kiểm duyệt bình luận và truyện.
7. **Tương Thích Ngược (Legacy Redirects)**: Tự động chuyển hướng (redirect) các đường dẫn cũ dạng tĩnh (`.html`) của phiên bản trước sang các tuyến React Router tương ứng, tránh bị đứt gãy link khi SEO.

---

## 📁 Cấu Trúc Thư Mục `src`

```
src/
├── components/          # Các Component dùng chung (Navbar, Footer, StoryCard, ReadingPreferencesPanel...)
├── contexts/            # React Contexts quản lý Global State (Auth, Theme)
├── data/                # Mock data hỗ trợ phát triển (mockStories.js)
├── pages/               # Các trang giao diện chính
│   ├── HomePage.jsx          # Trang chủ
│   ├── FindStoriesPage.jsx   # Tìm kiếm và lọc truyện
│   ├── StoryDetailPage.jsx   # Chi tiết truyện & chương
│   ├── ChapterReaderPage.jsx # Giao diện đọc truyện & Tóm tắt AI
│   ├── LoginPage.jsx         # Đăng nhập
│   ├── RegisterPage.jsx      # Đăng ký
│   ├── AccountPage.jsx       # Quản lý tài khoản
│   ├── UserProfilePage.jsx   # Thông tin cá nhân, lịch sử đọc & truyện theo dõi
│   ├── DashboardPage.jsx     # Bảng điều khiển dành cho Uploader / Admin
│   ├── AdminPage.jsx         # Quản trị hệ thống (Stats, Users, Roles)
│   └── NotFoundPage.jsx      # Trang lỗi 404
├── services/            # Axios API clients & Auth services
│   ├── api.js                # Toàn bộ API endpoints
│   └── authService.js        # Logic xử lý Auth & Token
├── styles/              # Stylesheets chính của ứng dụng
│   ├── main.css              # Custom style cơ bản
│   ├── darkMode.css          # Giao diện tối
│   └── reader.css            # Styles tối ưu cho khung đọc truyện
├── utils/               # Tiện ích bổ trợ (slugify, format...)
├── App.jsx              # Cấu hình các Routes chính của React Router
└── main.jsx             # Entry point khởi tạo React App
```

---

## 🛠️ Hướng Dẫn Cài Đặt và Khởi Chạy

### 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js** (Khuyên dùng phiên bản LTS mới nhất).
- Backend server đang hoạt động (mặc định tại `http://localhost:5000/api`).

### 2. Cài đặt các gói phụ thuộc (Dependencies)
Từ thư mục dự án frontend, chạy lệnh:
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```
Cấu hình đường dẫn kết nối API backend của bạn trong `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Khởi chạy dự án ở môi trường Local
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ mặc định: `http://localhost:5173/` (hoặc cổng khác tùy thuộc vào thiết lập Vite của bạn).

---

## 📦 Biên Dịch và Triển Khai (Build & Deployment)

### Biên dịch ứng dụng cho Production
Chạy lệnh sau để build mã nguồn đã tối ưu hóa vào thư mục `dist`:
```bash
npm run build
```

### Kiểm tra bản build tại local (Preview)
Để chạy thử bản build chính thức ở môi trường local trước khi deploy:
```bash
npm run preview
```

### Hướng dẫn Deploy
- **Vercel**: Dự án đã đi kèm cấu hình `vercel.json` phục vụ SPA rewrites. Chỉ cần kết nối repository với Vercel hoặc dùng Vercel CLI để triển khai trực tiếp.
- **Netlify / GitHub Pages / Hostings khác**: Cần đảm bảo cấu hình URL Rewriting trỏ về `index.html` đối với tất cả các tuyến không tìm thấy file vật lý (fallback routing) để tránh lỗi 404 khi tải lại trang và nhấn F5.

---

## 🔐 Xác thực & Phân Quyền (Authentication)

Token JWT được lưu trữ và quản lý tự động thông qua localStorage:
- Key lưu trữ token: `cmc_token`
- Key lưu trữ thông tin user: `cmc_user`

### Cơ chế hoạt động của API Client Interceptor (`src/services/api.js`):
1. **Request Interceptor**: Tự động lấy JWT token từ localStorage và đính kèm vào header dưới dạng `Authorization: Bearer <token>` đối với mỗi request gửi đi.
2. **Response Interceptor**: Lắng nghe phản hồi từ máy chủ. Nếu nhận mã trạng thái `401 Unauthorized` từ các route yêu cầu bảo mật, hệ thống sẽ tự động dọn dẹp localStorage và chuyển hướng người dùng về trang đăng nhập `/login`.

---

## ⚠️ Lưu Ý Khi Phát Triển

- **CORS**: Đảm bảo Backend Server của bạn đã cấu hình CORS cho phép nhận yêu cầu từ domain phát triển frontend này (ví dụ: `http://localhost:5173`).
- **Bảo mật**: Tuyệt đối không lưu trữ thông tin nhạy cảm của người dùng (mật khẩu thô, API key riêng tư) vào localStorage hay ghi cứng trong mã nguồn frontend.
