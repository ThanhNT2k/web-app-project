# ĐẶC TẢ YÊU CẦU PHẦN MỀM - CMC TRUYỆN (REQUIREMENTS.md)

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

## 🎯 1. Tầm Nhìn Sản Phẩm (Product Vision)

CMC Truyện là nền tảng đọc truyện trực tuyến được xây dựng nhằm cung cấp cho người dùng một môi trường đọc truyện hiện đại, thuận tiện và thân thiện. Hệ thống cho phép người dùng tìm kiếm, theo dõi, bình luận và lưu lịch sử đọc truyện, đồng thời cung cấp công cụ quản trị giúp quản lý nội dung và người dùng hiệu quả.

Tầm nhìn của sản phẩm là trở thành nền tảng đọc truyện trực tuyến có trải nghiệm người dùng tốt nhất, không có quảng cáo phiền toái, dễ mở rộng và dễ quản lý.

---

## 👥 2. Chân Dung Người Dùng (Personas)

### 👤 Persona 1 – Độc giả (Reader)
*   **Họ tên:** Nguyễn Hải Dương
*   **Tuổi:** 21
*   **Nghề nghiệp:** Sinh viên Đại học Công nghệ
*   **Trình độ công nghệ:** Tốt (Thường xuyên sử dụng smartphone và laptop)
*   **Mục tiêu:**
    *   Tìm kiếm truyện nhanh chóng.
    *   Đọc truyện trực tuyến mượt mà trên di động vào ban đêm.
    *   Theo dõi và nhận thông báo khi có chương mới của các bộ truyện yêu thích.
    *   Lưu lại vị trí đọc tự động để đọc tiếp trên nhiều thiết bị.
*   **Nhu cầu:**
    *   Giao diện đọc tối giản, hỗ trợ Dark Mode chống mỏi mắt và chỉnh được cỡ chữ lớn.
    *   Tốc độ tải chương cực nhanh.
    *   Không có quảng cáo rác chặn màn hình gây ức chế.
*   **Khó khăn hiện tại:**
    *   Các trang đọc truyện hiện tại quá nhiều quảng cáo pop-up rác dễ click nhầm.
    *   Xóa cache trình duyệt hoặc đổi thiết bị là mất dấu chương đang đọc dở.

### 👤 Persona 2 – Quản trị viên & Kiểm duyệt (Admin/Moderator/Uploader)
*   **Họ tên:** Nguyễn Tuấn Thành
*   **Tuổi:** 26
*   **Vai trò:** Quản trị viên cộng đồng & Dịch giả tự do (Uploader)
*   **Trình độ công nghệ:** Rất tốt (Thành thạo công cụ quản trị web)
*   **Mục tiêu:**
    *   Đăng tải và cập nhật chương mới nhanh chóng hàng ngày.
    *   Quản lý danh sách truyện và phân loại tags chính xác.
    *   Theo dõi báo cáo vi phạm nội dung và lọc bỏ bình luận thô tục của độc giả.
*   **Nhu cầu:**
    *   Dashboard quản trị hiển thị số liệu trực quan (truyện nổi bật, lượt đọc).
    *   Hệ thống kiểm duyệt tự động để giảm bớt công sức rà soát thủ công bình luận rác.
    *   Khả năng khóa nhanh tài khoản spam và ẩn truyện vi phạm chính sách tuyệt đối.
*   **Khó khăn hiện tại:**
    *   Số lượng bình luận và chương truyện quá lớn, không thể rà soát thủ công từng từ.
    *   Giao diện uploader ở các trang cũ quá phức tạp và chậm chạm.

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
| **US09** | Là một admin, tôi muốn quản lý người dùng (khoá/phân quyền), để đảm bảo hệ thống an toàn. | Epic 7 |
| **US10** | Là một admin, tôi muốn xem thống kê hệ thống, để theo dõi hiệu suất. | Epic 8 |
| **US11** | Là một độc giả, tôi muốn báo cáo vi phạm chương truyện, để hệ thống luôn sạch và lành mạnh. | Epic 4 |
| **US12** | Là một admin/moderator, tôi muốn tự động lọc bình luận nhạy cảm, để giảm công sức kiểm duyệt. | Epic 7 |
| **US13** | Là một moderator, tôi muốn xem và xử lý báo cáo vi phạm, để quản lý nội dung nhanh chóng. | Epic 7 |
| **US14** | Là một độc giả, tôi muốn tóm tắt chương truyện bằng AI, để nhanh chóng nắm bắt diễn biến chính. | Epic 3 |
| **US15** | Là một độc giả, tôi muốn nhận gợi ý truyện cá nhân hóa từ AI, để khám phá thêm các truyện phù hợp. | Epic 2 |

---

## 📋 7. Product Backlog (Trạng thái Hiện tại)

Dưới đây là bảng trạng thái danh sách công việc ưu tiên thực hiện tại thời điểm hiện tại:

| ID | User Story / Feature | Phase / Group | Priority | Status |
|---|---|---|---|---|
| **PB01** | View Story Details | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB02** | Read Chapters | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB03** | Add Story (uploader/admin) | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB04** | Manage Stories | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB05** | Admin Dashboard (basic) | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB06** | Search Stories | Expansion (Mở rộng) | **HIGH** | ☑ Completed |
| **PB07** | User Registration | Expansion (Mở rộng) | **HIGH** | ☑ Completed |
| **PB08** | User Login | Expansion (Mở rộng) | **HIGH** | ☑ Completed |
| **PB09** | Favorite Stories | Engagement (Giữ chân) | **MEDIUM** | ☑ Completed |
| **PB10** | Reading History | Engagement (Giữ chân) | **MEDIUM** | ☑ Completed |
| **PB11** | User Profile | Engagement (Giữ chân) | **MEDIUM** | ☑ Completed |
| **PB12** | Summarize story (AI) | Advanced (AI) | **MEDIUM** | ☑ Completed |
| **PB13** | Recommend story (AI) | Advanced (AI) | **MEDIUM** | ☑ Completed |
| **PB14** | Comments | Low / Optional | **LOW** | ☑ Completed |
| **PB15** | Manage Users (Lock/Role) | Low / Optional | **LOW** | ☑ Completed |
| **PB16** | Delete Story (Soft delete) | Low / Optional | **LOW** | ☑ Completed |
| **PB17** | Reports & Analytics | Low / Optional | **LOW** | ⚠️ In Progress |
| **PB18** | Auto Content Moderation (BullMQ/Redis) | Advanced / Safety | **HIGH** | ⚠️ In Progress |
| **PB19** | Violation Reporting (Giao diện Admin & Mod) | Low / Optional | **MEDIUM** | ⚠️ In Progress |
