# ĐẶC TẢ YÊU CẦU PHẦN MỀM - CMC TRUYỆN (REQUIREMENTS.md)

Tài liệu này ghi nhận toàn bộ yêu cầu nghiệp vụ, chân dung người dùng (Persona), kịch bản sử dụng (Scenario), và danh sách các câu chuyện người dùng (User Stories) trong dự án CMC Truyện.

---

## 🎯 1. Tầm Nhìn Sản Phẩm (Product Vision)

CMC Truyện là nền tảng đọc truyện trực tuyến được xây dựng nhằm cung cấp cho người dùng một môi trường đọc truyện hiện đại, thuận tiện và thân thiện. Hệ thống cho phép người dùng tìm kiếm, theo dõi, bình luận và lưu lịch sử đọc truyện, đồng thời cung cấp công cụ quản trị giúp quản lý nội dung và người dùng hiệu quả.

Tầm nhìn của sản phẩm là trở thành nền tảng đọc truyện trực tuyến có trải nghiệm người dùng tốt nhất, không có quảng cáo phiền toái, dễ mở rộng và dễ quản lý.

---

## 👥 2. Chân Dung Người Dùng (Personas)

### 👤 Persona 1 – Độc giả (Reader)
*   **Họ tên:** Nguyễn Hải Dương
*   **Tuổi:** 45
*   **Nghề nghiệp:** Sinh viên Đại học (Học viên hệ vừa học vừa làm)
*   **Trình độ công nghệ:** Trung bình – Khá
*   **Mục tiêu:**
    *   Tìm kiếm truyện nhanh chóng.
    *   Đọc truyện trực tuyến trên nhiều thiết bị (điện thoại, máy tính bảng, PC).
    *   Theo dõi các bộ truyện yêu thích.
    *   Lưu lại tiến độ đọc tự động.
*   **Nhu cầu:**
    *   Giao diện đơn giản, trực quan, hỗ trợ Dark Mode giảm mỏi mắt.
    *   Tốc độ tải trang nhanh và mượt mà.
    *   Có chức năng tìm kiếm và bộ lọc truyện thông minh.
*   **Khó khăn hiện tại:**
    *   Khó nhớ đang đọc đến chương nào khi truy cập lại.
    *   Khó theo dõi nhiều bộ truyện cùng lúc trên các trang web khác nhau.
    *   Các website đọc truyện hiện tại quá nhiều quảng cáo rác, pop-up tự bật làm gián đoạn đọc.

### 👤 Persona 2 – Quản trị viên (Administrator)
*   **Họ tên:** Nguyễn Tuấn Thành
*   **Tuổi:** 50
*   **Vai trò:** Quản trị nội dung & Người đăng truyện (Uploader)
*   **Mục tiêu:**
    *   Quản lý thông tin và dữ liệu các bộ truyện trên hệ thống.
    *   Theo dõi hoạt động bình luận, tương tác của người dùng.
    *   Cập nhật nhanh chóng nội dung chương mới.
*   **Nhu cầu:**
    *   Giao diện dashboard quản trị đơn giản, dễ thao tác.
    *   Dễ dàng Thêm, Sửa, Xóa thông tin truyện và chương truyện.
    *   Theo dõi thống kê tổng quan (số lượt đọc, truyện hot, người dùng hoạt động).
*   **Khó khăn hiện tại:**
    *   Quản lý dữ liệu thủ công mất nhiều thời gian.
    *   Khó kiểm soát lượng nội dung chương truyện khổng lồ.

---

## 🗺️ 3. Hành Trình Người Dùng (User Journeys)

### Hành trình Độc giả (Reader Journey)
```
Truy cập website ──> Tìm kiếm truyện ──> Xem thông tin truyện ──> Đọc chương truyện ──> Đăng nhập tài khoản ──> Thêm vào danh sách yêu thích ──> Bình luận ──> Lưu lịch sử đọc tự động ──> Tiếp tục đọc ở lần truy cập sau
```

### Hành trình Quản trị viên (Admin Journey)
```
Đăng nhập Admin ──> Truy cập Dashboard ──> Theo dõi thống kê ──> Thêm truyện mới ──> Quản lý danh sách truyện ──> Quản lý người dùng ──> Xuất báo cáo hệ thống
```

---

## 🎭 4. Kịch Bản Sử Dụng (Scenarios)

### Kịch bản 1: Người dùng tìm kiếm và đọc truyện
*   **Tác nhân:** Độc giả (Guest hoặc User).
*   **Tiền điều kiện:** Website hoạt động bình thường, có kết nối mạng.
*   **Luồng chính:**
    1.  Người dùng truy cập vào trang chủ website.
    2.  Người dùng nhập từ khóa vào ô tìm kiếm.
    3.  Hệ thống hiển thị danh sách các truyện phù hợp với từ khóa.
    4.  Người dùng chọn một bộ truyện từ kết quả.
    5.  Hệ thống hiển thị trang chi tiết truyện (tác giả, mô tả, danh sách chương).
    6.  Người dùng bấm chọn một chương để đọc.
    7.  Hệ thống hiển thị nội dung chương truyện tương ứng.
*   **Kết quả:** Người dùng đọc được truyện mong muốn một cách suôn sẻ.

### Kịch bản 2: Người dùng thêm truyện yêu thích (Follow)
*   **Tác nhân:** Người dùng đã đăng nhập (`User` hoặc `Uploader`).
*   **Tiền điều kiện:** Người dùng đã đăng nhập tài khoản hợp lệ.
*   **Luồng chính:**
    1.  Người dùng mở trang chi tiết một bộ truyện chưa theo dõi.
    2.  Người dùng chọn nút "Theo dõi" hoặc "Yêu thích".
    3.  Hệ thống lưu bộ truyện đó vào danh sách theo dõi của tài khoản trong database.
    4.  Hệ thống hiển thị thông báo thành công và cập nhật nút trạng thái thành "Đang theo dõi".
*   **Kết quả:** Bộ truyện được hiển thị trong danh sách yêu thích tại trang cá nhân của người dùng.

### Kịch bản 3: Admin/Uploader thêm truyện mới
*   **Tác nhân:** Quản trị viên (`Admin`) hoặc Người đăng truyện (`Uploader`).
*   **Tiền điều kiện:** Đăng nhập thành công với quyền hợp lệ.
*   **Luồng chính:**
    1.  Người dùng truy cập vào trang Dashboard quản trị.
    2.  Chọn chức năng "Đăng truyện mới" (Add Story).
    3.  Nhập đầy đủ thông tin truyện (tên truyện, tác giả, mô tả, ảnh bìa, thể loại).
    4.  Nhấn nút "Tạo truyện".
    5.  Hệ thống kiểm tra tính hợp lệ của dữ liệu và lưu vào cơ sở dữ liệu.
*   **Kết quả:** Truyện mới được đăng thành công và hiển thị công khai trên hệ thống.

---

## 🗃️ 5. Nhóm Yêu Cầu Lớn (Epics)

1.  **Epic 1 - Authentication (Xác thực):** Đăng ký tài khoản, đăng nhập JWT, đăng xuất.
2.  **Epic 2 - Story Discovery (Khám phá):** Xem danh sách truyện, tìm kiếm truyện theo từ khóa, lọc theo thể loại.
3.  **Epic 3 - Reading Experience (Trải nghiệm đọc):** Xem trang chi tiết truyện, đọc chương truyện, điều chỉnh giao diện đọc (Dark Mode, cỡ chữ), chuyển chương nhanh.
4.  **Epic 4 - User Engagement (Tương tác độc giả):** Viết bình luận, quản lý danh sách truyện yêu thích, lưu tự động lịch sử đọc.
5.  **Epic 5 - User Profile (Thông tin cá nhân):** Xem thông tin cá nhân, cập nhật tài khoản (mật khẩu, avatar).
6.  **Epic 6 - Content Management (Quản lý nội dung):** Thêm, sửa, xóa truyện và đăng chương mới (dành cho Admin/Uploader).
7.  **Epic 7 - User Management (Quản lý người dùng):** Xem danh sách người dùng, thay đổi quyền hạn tài khoản (dành cho Admin).
8.  **Epic 8 - Reporting & Analytics (Thống kê báo cáo):** Dashboard trực quan hóa số lượng truyện, lượt đọc và người dùng đăng ký.

---

## 📌 6. Câu Chuyện Người Dùng (User Stories)

| Mã số | Câu chuyện người dùng (User Story) | Epic liên quan |
|---|---|---|
| **US01** | Là một độc giả, tôi muốn tìm kiếm truyện, để có thể nhanh chóng tìm thấy bộ truyện mong muốn. | Epic 2 |
| **US02** | Là một độc giả, tôi muốn xem chi tiết bộ truyện, để nắm được nội dung cốt truyện trước khi đọc. | Epic 3 |
| **US03** | Là một thành viên đã đăng ký, tôi muốn đăng nhập, để truy cập các tính năng cá nhân hóa. | Epic 1 |
| **US04** | Là một thành viên đã đăng ký, tôi muốn lưu truyện yêu thích, để dễ dàng đọc lại sau này. | Epic 4 |
| **US05** | Là một thành viên đã đăng ký, tôi muốn bình luận truyện, để thảo luận với các độc giả khác. | Epic 4 |
| **US06** | Là một thành viên đã đăng ký, tôi muốn lưu lại lịch sử đọc truyện, để có thể đọc tiếp từ vị trí tạm dừng trước đó. | Epic 4 |
| **US07** | Là một uploader/admin, tôi muốn đăng tải truyện mới, để độc giả có thể tiếp cận nội dung mới. | Epic 6 |
| **US08** | Là một admin, tôi muốn xóa truyện, để loại bỏ các nội dung không phù hợp hoặc vi phạm chính sách. | Epic 6 |
| **US09** | Là một admin, tôi muốn quản lý người dùng, để đảm bảo hệ thống an toàn và có tổ chức tốt. | Epic 7 |
| **US10** | Là một admin, tôi muốn xem thống kê hệ thống, để theo dõi hiệu suất và tăng trưởng của nền tảng. | Epic 8 |

---

## 📋 7. Product Backlog

Dưới đây là danh sách ưu tiên thực hiện các tính năng đến thời điểm Tuần 3:

| ID | Tính năng (Product Backlog Item) | Mức độ ưu tiên | Trạng thái hiện tại |
|---|---|---|---|
| **PB01** | Đăng ký tài khoản (User Registration) | High | ✅ Completed |
| **PB02** | Đăng nhập tài khoản (User Login) | High | ✅ Completed |
| **PB03** | Tìm kiếm truyện (Search Stories) | High | ✅ Completed |
| **PB04** | Xem thông tin truyện (View Story Details) | High | ✅ Completed |
| **PB05** | Đọc chương truyện (Read Chapters) | High | ✅ Completed |
| **PB06** | Theo dõi truyện yêu thích (Favorite/Follow Stories) | High | ✅ Completed |
| **PB07** | Lưu lịch sử đọc tự động (Reading History) | Medium | ✅ Completed |
| **PB08** | Hệ thống bình luận (Comments) | Medium | ✅ Completed |
| **PB09** | Trang cá nhân người dùng (User Profile) | Medium | ✅ Completed |
| **PB10** | Trang tổng quan quản trị (Admin Dashboard) | High | ✅ Completed |
| **PB11** | Đăng truyện mới (Add Story) | High | ✅ Completed |
| **PB12** | Quản lý danh sách truyện (Manage Stories) | High | ✅ Completed |
| **PB13** | Xóa truyện khỏi hệ thống (Delete Story) | Medium | 🔄 In Progress |
| **PB14** | Quản lý tài khoản người dùng (Manage Users) | Medium | 🔄 In Progress |
| **PB15** | Báo cáo chi tiết & Thống kê sâu (Reports & Analytics) | Low | 🔄 In Progress |
