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

### Kịch bản 3: Uploader thêm truyện mới (tạo và chờ duyệt)
*   **Tác nhân:** Người đăng truyện (`Uploader`).
*   **Tiền điều kiện:** Đăng nhập thành công với quyền Uploader.
*   **Luồng chính:**
    1.  Người dùng truy cập vào trang Dashboard quản trị.
    2.  Chọn chức năng "Đăng truyện mới" (Add Story).
    3.  Nhập đầy đủ thông tin truyện (tên truyện, tác giả, mô tả, ảnh bìa, thể loại).
    4.  Nhấn nút "Tạo truyện".
    5.  Hệ thống lưu truyện vào cơ sở dữ liệu với trạng thái `moderation_status = 'pending'`.
    6.  Admin/Moderator duyệt: Nếu duyệt ✓, truyện chuyển `approved` và hiển thị công khai; Nếu cần sửa, đánh dấu `changes_requested`.
*   **Kết quả:** Truyện được đăng thành công, chờ duyệt từ Admin/Moderator.

### Kịch bản 3.5: Admin duyệt truyện của Uploader
*   **Tác nhân:** Quản trị viên (`Admin`) hoặc Moderator (`Moderator`).
*   **Tiền điều kiện:** Truyện trong hàng chờ duyệt (trạng thái `pending`).
*   **Luồng chính:**
    1.  Admin truy cập Dashboard hoặc Moderator vào khu vực "Hàng chờ truyện".
    2.  Xem chi tiết truyện: tiêu đề, tác giả, mô tả, 3-5 chương đầu.
    3.  Quyết định: Duyệt ✓, Yêu cầu sửa, hoặc Từ chối.
    4.  Nếu duyệt: truyện chuyển `approved` → hiển thị công khai.
    5.  Ghi log audit: ai duyệt, lúc nào, quyết định gì.
*   **Kết quả:** Truyện được phê duyệt hoặc yêu cầu chỉnh sửa, uploader nhận thông báo.

---

## 🗃️ 5. Nhóm Yêu Cầu Lớn (Epics) & Phân Quyền

| Epic | Mô tả | Uploader | Admin | Moderator | User | Guest |
|------|-------|----------|-------|-----------|------|-------|
| **Epic 1** | Authentication (Xác thực): Đăng ký, đăng nhập JWT, đăng xuất | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Epic 2** | Story Discovery: Tìm, lọc, xem danh sách truyện | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Epic 3** | Reading Experience: Đọc, điều chỉnh giao diện, auto-save progress | ✓ | ✓ | ✓ | ✓ | ~ |
| **Epic 4** | User Engagement: Bình luận, follow, lịch sử đọc | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Epic 5** | User Profile: Thông tin cá nhân, avatar | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Epic 6a** | **Content Creation**: Tạo truyện (chờ duyệt) | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Epic 6b** | **Content Approval**: Duyệt/từ chối truyện chờ | ✗ | ✓ | ✓ | ✗ | ✗ |
| **Epic 6c** | **Content Management**: Sửa/xóa/ẩn truyện | ~ | ✓ | ✓ | ✗ | ✗ |
| **Epic 7** | User Management: Khóa tài khoản, phân quyền | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Epic 8** | Reporting & Analytics: Dashboard thống kê | ✗ | ✓ | ~ | ✗ | ✗ |

**Ký hiệu:** ✓ = Có quyền | ~ = Quyền hạn chế | ✗ = Không có quyền

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
| **US07** | Là một uploader, tôi muốn đăng tải truyện mới, để độc giả có thể tiếp cận nội dung mới sau khi duyệt. | Epic 6 |
| **US07B** | Là một admin/moderator, tôi muốn duyệt truyện chờ, để kiểm chứng nội dung trước khi công khai. | Epic 6 |
| **US08** | Là một admin, tôi muốn xóa/ẩn truyện, để loại bỏ các nội dung không phù hợp hoặc vi phạm chính sách. | Epic 6 |
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
| **PB03** | Add Story (uploader only, pending approval) | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB03B** | Approve Stories (admin/moderator moderation) | Core (Xương sống) | **HIGH** | ☑ Completed |
| **PB04** | Manage Stories (edit/delete/hide) | Core (Xương sống) | **HIGH** | ☑ Completed |
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
