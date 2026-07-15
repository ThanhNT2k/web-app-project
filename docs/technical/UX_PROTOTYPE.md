# Tài Liệu Giao Diện Mẫu — UX PROTOTYPE (UX_PROTOTYPE.md)

---

## 👥 THÔNG TIN NHÓM THỰC HIỆN

*   **Nhóm:** Nhóm 3
*   **Danh sách thành viên:**
    1.  **Nguyễn Thị Thùy** - BAI252513
    2.  **Trần Thị Kim Uyên** - BAI250072
    3.  **Nguyễn Hải Dương** - BAI250020
    4.  **Nguyễn Tuấn Thành** - BAI252417
    5.  **Vũ Viết Trí** - BAI250063

---

## 🎯 1. Mục Tiêu Bản UX Prototype & Trạng Thái Tích Hợp

Mục tiêu ban đầu của bản UX Prototype là kiểm thử nhanh giao diện người dùng và hành trình đọc giả/admin mà không bị phụ thuộc vào sự sẵn sàng của Backend.

**Trạng thái tích hợp hiện tại:**
*   Toàn bộ giao diện mẫu đã được kết nối hoàn chỉnh với **Node.js Express Backend** và **Supabase PostgreSQL Database**.
*   Các tương tác của người dùng (như theo dõi truyện, bình luận, thay đổi tuỳ chọn đọc, tiến độ đọc và tóm tắt AI) hiện không còn chạy trên mock data tĩnh mà được lưu trữ và đồng bộ thời gian thực qua API.
*   Dữ liệu mẫu (`frontend/src/data/`) vẫn được giữ lại để phục vụ cho các trường hợp kiểm thử cục bộ hoặc fallback.

---

## 🛠️ 2. Công Nghệ & Thẩm Mỹ Giao Diện (Aesthetics & Design System)

*   **Bộ mã nguồn:** Được xây dựng hoàn toàn bằng **React 18** và **Tailwind CSS**.
*   **Aesthetics Premium:** Giao diện sử dụng phong cách **Glassmorphism** (hiệu ứng mờ kính hiện đại), bảng màu tối (Sleek Dark Mode) với độ tương phản tốt giúp người đọc truyện ban đêm không bị mỏi mắt.
*   **Typography:** Sử dụng font chữ **Inter** và **Playfair Display** (tối ưu cho đọc truyện chữ chữ lớn).
*   **Tương tác động (Micro-animations):** Hover các thẻ truyện có hiệu ứng zoom nhẹ, nút "Theo dõi" chuyển đổi mượt mà bằng CSS transitions, modal trượt nhẹ khi xuất hiện.

---

## 💾 3. Giải Pháp Dữ Liệu Giả Lập (Mock Data Layer)

Toàn bộ dữ liệu được giả lập trong thư mục `frontend/src/data/` trước khi Backend sẵn sàng:

### A. Dữ liệu truyện giả lập (`mockStories.js`)
```javascript
export const MOCK_STORIES = [
  {
    id: "1",
    title: "CMC Truyện Truyền Kỳ",
    slug: "cmc-truyen-truyen-ky",
    author: "ThanhNT",
    category: "Tiên Hiệp",
    status: "Ongoing",
    cover_image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
    description: "Câu chuyện kể về cuộc phiêu lưu của một lập trình viên AI lạc vào thế giới tu tiên...",
    chapter_count: 120,
    chapters: [
      { id: "101", title: "Chương 1: Lạc vào Code giới", content: "Nội dung chương 1 giả lập..." },
      { id: "102", title: "Chương 2: Luyện khí bằng Prompt", content: "Nội dung chương 2 giả lập..." }
    ]
  }
];
```

### B. Cơ chế lưu trữ trạng thái giả lập (Simulated State via LocalStorage)
Các tương tác thay đổi trạng thái như bookmark chương đang đọc, thêm vào danh sách yêu thích, hoặc lưu cấu hình cỡ chữ đọc truyện được lưu trữ trực tiếp tại `localStorage` để khi refresh trang không bị mất dữ liệu:
*   `cmc_favorites` -> Lưu danh sách ID các truyện đã bấm Yêu thích.
*   `cmc_reading_history` -> Lưu lịch sử đọc: `{ storyId: "1", lastChapterId: "102", scrollPercent: 45 }`.
*   `cmc_reader_preferences` -> Lưu cỡ chữ và độ giãn dòng của độc giả.

---

## 🖥️ 4. Các Màn Hình Trải Nghiệm Chính (Key Screens)

### Màn hình 1: Trang chủ (Homepage)
*   **Header:** Thanh điều hướng responsive, chứa ô tìm kiếm nhanh, nút đổi giao diện Light/Dark Mode, và nút Đăng ký/Đăng nhập.
*   **Hero Section:** Banner giới thiệu bộ truyện nổi bật nhất tuần với ảnh nền mờ nghệ thuật.
*   **Gợi ý từ AI (AI Recommendation Block):** Hiển thị danh sách 5 bộ truyện giả lập kèm dòng lý do gợi ý do AI phân tích, ví dụ: *"Gợi ý vì bạn đã đọc nhiều truyện Tiên Hiệp tuần qua (Tương thích 95%)"*.
*   **Danh sách:** Phân loại "Truyện Hot" và "Truyện Mới Cập Nhật" dưới dạng Grid card mượt mà.

### Màn hình 2: Trang Đọc Truyện (Chapter Reader)
*   **Khu vực chính:** Khung đọc truyện chữ lớn, căn lề hai bên tinh tế, màu nền tối ngả vàng nhẹ để bảo vệ mắt.
*   **Collapsible Toolbar:** Thanh công cụ nổi thông minh (Floating Toolbar). Khi độc giả click chuột hoặc chạm màn hình, thanh công cụ xuất hiện cho phép:
    *   Tăng/giảm cỡ chữ từ `16px` đến `32px`.
    *   Thay đổi phông chữ (Serif / Sans-serif).
    *   Chuyển chương nhanh (Chương trước / Chương sau).
*   **AI Summary Card:** Hộp tóm tắt chương gọi backend thật. Backend ưu tiên cache, sau đó gọi Groq và fallback sang Gemini; giao diện hiển thị skeleton trong lúc chờ và thông báo lỗi có thể thử lại.

### Màn hình 3: Dashboard Quản Trị Viên (Admin Dashboard)
*   **Thẻ thống kê nhanh:** Hiển thị 3 chỉ số chính bằng đồ họa CSS đẹp mắt:
    *   *Tổng số truyện:* 1,240 bộ truyện.
    *   *Tổng số chương:* 154,200 chương.
    *   *Số người dùng hoạt động:* 4,520 người dùng.
*   **Bảng quản lý truyện:** Danh sách truyện kèm các nút hành động nhanh (Đăng chương mới, Sửa thông tin, Xóa). Khi nhấn "Xóa", hệ thống hiển thị Dialog xác nhận mượt mà.
