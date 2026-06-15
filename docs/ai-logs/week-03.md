# Nhật Ký Tương Tác AI — TUẦN 3 (ai-logs/week-03.md)

*   **Dự án:** CMC Truyện
*   **Nhóm:** Nhóm 3
*   **Danh sách thành viên:**
    1.  **Nguyễn Thị Thùy** - BAI252513
    2.  **Trần Thị Kim Uyên** - BAI250072
    3.  **Nguyễn Hải Dương** - BAI250020
    4.  **Nguyễn Tuấn Thành** - BAI252417
    5.  **Vũ Viết Trí** - BAI250063
*   **Thời gian:** 25/05/2026 - 01/06/2026
*   **Trợ lý AI sử dụng:** Antigravity (Gemini 3.5 Flash)

---

## 🎯 1. Mục Tiêu Hoạt Động Tuần 3

Trong tuần này, mục tiêu trọng tâm là **đọc hiểu mã nguồn sẵn có** (Codebase Reading) và **phát triển giao diện mẫu tĩnh bằng Mock Data** (UX Prototyping) mà không vội vàng làm backend quá sớm, giúp tối ưu hóa luồng tương tác người dùng.

Cụ thể, nhóm đã tương tác với trợ lý AI để:
1.  Đọc cấu trúc thư mục của dự án cũ (HTML/JS tĩnh) và ánh xạ các trang cũ sang cấu trúc component của **React + Vite**.
2.  Viết các component giao diện React chính (Reader, Navbar, Admin Dashboard) sử dụng Mock dữ liệu và lưu cấu hình độc giả vào `localStorage`.
3.  Tạo tài liệu tổng quan mã nguồn [`CODEBASE_OVERVIEW.md`](../technical/CODEBASE_OVERVIEW.md), tài liệu giao diện mẫu [`UX_PROTOTYPE.md`](../technical/UX_PROTOTYPE.md) và cập nhật [`REQUIREMENTS.md`](../product/REQUIREMENTS.md).

---

## 💬 2. Chi Tiết Lịch Sử Tương Tác Với AI (Prompts & AI Responses)

### 🗓️ Buổi 1: Phân tích cấu trúc thư mục cũ và thiết lập môi trường React
*   **Mục tiêu:** Hiểu cách tổ chức file của phiên bản cũ và khởi tạo thư mục dự án React mới.
*   **Prompt của Sinh viên:**
    > "Tôi có một dự án đọc truyện cũ viết bằng HTML, CSS tĩnh và các file Javascript gọi API đặt trong thư mục `js/` ở gốc. Bây giờ tôi muốn chuyển sang cấu trúc React (sử dụng Vite). Hãy phân tích các file cũ và đề xuất cấu trúc React trong thư mục `frontend/` mới sao cho không bị mất tính năng cũ, đồng thời giữ lại các file chuyển hướng redirect cho URL cũ."
*   **Phản hồi của AI:**
    *   AI đã phân tích các file trong thư mục `js/` cũ (như `novels.js`, `chapters.js`, `auth.js`,...) và chỉ ra rằng chúng nên được gom nhóm lại thành các Service API trong `frontend/src/services/`.
    *   Đề xuất cấu trúc định tuyến bằng **React Router v6**.
    *   Tạo bảng ánh xạ URL cũ sang URL mới.
    *   Đề xuất đặt các file redirect tĩnh như `pages/story.html` vào thư mục `frontend/public/pages/story.html` để phục vụ các liên kết cũ của người dùng.

### 🗓️ Buổi 2: Tạo UX Prototype và Mock Data đọc truyện
*   **Mục tiêu:** Xây dựng màn hình đọc truyện mượt mà, hỗ trợ tăng giảm cỡ chữ và chuyển Dark Mode mà chưa cần kết nối Database thực tế.
*   **Prompt của Sinh viên:**
    > "Hãy giúp tôi viết component `ReadingPreferencesPanel.jsx` và `ChapterReaderPage.jsx` trong React. Tôi muốn lưu các tùy chọn cỡ chữ (từ 16px đến 32px) và Dark Mode vào LocalStorage của trình duyệt để khi user quay lại đọc tiếp không bị mất cấu hình. Sử dụng Tailwind CSS để thiết kế giao diện Glassmorphism mờ kính sang trọng."
*   **Phản hồi của AI:**
    *   AI đã tạo ra mã nguồn chi tiết cho hai component này.
    *   Sử dụng Hook `useState` kết hợp với `useEffect` để đồng bộ cấu hình cỡ chữ và giao diện Dark Mode (`document.documentElement.classList.add('dark')`) trực tiếp từ `localStorage`.
    *   Cung cấp một file Mock dữ liệu truyện mẫu gồm 2 chương truyện tiên hiệp để sinh viên có thể chạy thử giao diện đọc ngay lập tức bằng lệnh `npm run dev`.

### 🗓️ Buổi 3: Cấu trúc hóa tài liệu dự án theo mô hình Agile
*   **Mục tiêu:** Tạo tài liệu đặc tả yêu cầu và tổng quan mã nguồn chuẩn bị nộp bài Tuần 3.
*   **Prompt của Sinh viên:**
    > "Dựa trên các Persona độc giả Nguyễn Hải Dương (45 tuổi) và Admin Nguyễn Tuấn Thành (50 tuổi) cùng các Epic/User Story đã xác định, hãy viết cho tôi 3 file tài liệu chuẩn Agile:
    > 1. CODEBASE_OVERVIEW.md: Bản đồ ánh xạ từ User Story sang các component và file code thực tế.
    > 2. REQUIREMENTS.md: Chứa chi tiết Persona, User Journey, Epic, User Story và trạng thái Product Backlog hiện tại.
    > 3. UX_PROTOTYPE.md: Mô tả trải nghiệm giao diện mẫu và cách sử dụng Mock Data.
    > Tất cả viết bằng tiếng Việt và sử dụng liên kết relative chính xác."
*   **Phản hồi của AI:**
    *   AI đã tạo thành công 3 file tài liệu trong thư mục `docs/`.
    *   Các liên kết mã nguồn trong [`CODEBASE_OVERVIEW.md`](../technical/CODEBASE_OVERVIEW.md) được ánh xạ chính xác đến các file như [`AuthModal.jsx`](../../frontend/src/components/AuthModal.jsx), [`ReadingPreferencesPanel.jsx`](../../frontend/src/components/ReadingPreferencesPanel.jsx) giúp người chấm bài dễ dàng click để xem mã nguồn.

---

## 📈 3. Đánh Giá Hiệu Quả Khi Làm Việc Với AI

1.  **Tốc độ dựng prototype:** Nhờ AI sinh mã nguồn mẫu Tailwind CSS và mock data nhanh, nhóm đã có một bản UI chạy thử hoàn chỉnh trong vòng 2 giờ thay vì mất cả ngày tự code css.
2.  **Đọc hiểu mã nguồn:** Khả năng định vị file của AI giúp nhóm nhanh chóng nhận ra các module JS dư thừa ở thư mục gốc (legacy `js/` folder) và dọn dẹp hệ thống sạch sẽ, chỉ giữ lại tài liệu cần thiết.
3.  **Học tập thực tiễn:** Việc AI khuyến nghị sử dụng `localStorage` để mock hành vi backend giúp nhóm hiểu sâu về quản lý State trong React trước khi bắt tay cấu hình Database ở tuần tiếp theo.
