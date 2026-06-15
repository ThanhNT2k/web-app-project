# Nhật Ký Tương Tác AI — TUẦN 4 (ai-logs/week-04.md)

*   **Dự án:** CMC Truyện
*   **Nhóm:** Nhóm 3
*   **Danh sách thành viên:**
    1.  **Nguyễn Thị Thùy** - BAI252513
    2.  **Trần Thị Kim Uyên** - BAI250072
    3.  **Nguyễn Hải Dương** - BAI250020
    4.  **Nguyễn Tuấn Thành** - BAI252417
    5.  **Vũ Viết Trí** - BAI250063
*   **Thời gian:** 02/06/2026 - 09/06/2026
*   **Trợ lý AI sử dụng:** Antigravity (Gemini 3.5 Flash)

---

## 🎯 1. Mục Tiêu Hoạt Động Tuần 4

Trong tuần này, mục tiêu trọng tâm là **thiết lập các yêu cầu nghiệp vụ chuẩn hóa (Requirements), tạo lập Issues và thiết kế các tác vụ sẵn sàng cho Agent (Agent-ready tasks)**. 

Nhóm đã làm việc với trợ lý AI để:
1.  Viết thêm và chuẩn hóa danh sách lên **15 User Stories** bao quát toàn bộ hệ thống (từ đọc truyện, đăng truyện, quản trị user đến báo cáo lỗi và kiểm duyệt bình luận).
2.  Xác định **2 AI User Stories** cốt lõi: Tóm tắt chương bằng AI (US14) và Gợi ý truyện cá nhân hóa bằng AI (US15).
3.  Chuyển đổi toàn bộ User Stories thành các **GitHub Issues** cụ thể có đính kèm **Tiêu chí nghiệm thu (Acceptance Criteria)** rõ ràng.
4.  Tạo tài liệu hướng dẫn giao việc [`PROMPTS.md`](../../PROMPTS.md) định nghĩa cách viết prompt có cấu trúc để AI Agent thực thi code chuẩn xác nhất.

---

## 💬 2. Chi Tiết Lịch Sử Tương Tác Với AI (Prompts & AI Responses)

### 🗓️ Buổi 1: Viết User Stories & Chọn AI User Stories
*   **Mục tiêu:** Định hình tập hợp các yêu cầu nghiệp vụ dưới dạng câu chuyện người dùng chuẩn Agile.
*   **Prompt của Sinh viên:**
    > "Chúng tôi đang thực hiện tuần 4 cho dự án CMC Truyện. Hãy giúp tôi mở rộng danh sách User Stories lên khoảng 12-15 stories bao gồm cả các tính năng quản lý, báo cáo lỗi và kiểm duyệt. Trong đó, hãy đề xuất 2 user stories đặc thù liên quan đến tính năng trí tuệ nhân tạo (AI) mà chúng tôi đã lên kế hoạch từ trước."
*   **Phản hồi của AI:**
    *   AI đã đề xuất danh sách 15 User Stories được phân chia theo các Epic.
    *   Xác định rõ 2 AI User Stories:
        *   `US14`: Độc giả muốn xem tóm tắt chương truyện bằng AI để nắm bắt nhanh cốt truyện (Epic 3).
        *   `US15`: Độc giả muốn nhận đề xuất truyện cá nhân hóa từ AI dựa trên lịch sử đọc (Epic 2).
    *   Hỗ trợ định dạng bảng Markdown để dễ dàng đưa vào tài liệu [`REQUIREMENTS.md`](../product/REQUIREMENTS.md).

### 🗓️ Buổi 2: Thiết kế GitHub Issues & Acceptance Criteria
*   **Mục tiêu:** Chia nhỏ các User Stories thành các công việc cụ thể cho lập trình viên và định nghĩa tiêu chí nghiệm thu.
*   **Prompt của Sinh viên:**
    > "Tôi muốn chuyển các User Story về báo cáo vi phạm chương truyện (US11) và tự động lọc bình luận nhạy cảm (US12) thành các GitHub Issues chi tiết. Hãy viết phần mô tả (Description) và đặc biệt là danh sách tiêu chí nghiệm thu (Acceptance Criteria) dưới dạng checklist để lập trình viên biết khi nào công việc hoàn thành."
*   **Phản hồi của AI:**
    *   AI đã soạn thảo mẫu GitHub Issues chi tiết cho cả hai tính năng trên.
    *   Ví dụ với kiểm duyệt bình luận (US12): Định nghĩa rõ checklist nghiệm thu gồm: bình luận lưu ở trạng thái chờ duyệt -> đẩy vào queue xử lý nền -> worker so khớp từ cấm trong database -> cập nhật trạng thái tương ứng (rejected/masked/flagged).

### 🗓️ Buổi 3: Xây dựng tài liệu PROMPTS.md để giao việc cho AI Agent
*   **Mục tiêu:** Chuẩn bị các prompt kỹ thuật có cấu trúc (Context, Task, Constraints) để ra lệnh cho AI Agent thực thi code tự động.
*   **Prompt của Sinh viên:**
    > "Bây giờ tôi muốn viết một file tài liệu hướng dẫn tên là PROMPTS.md ở gốc dự án. Hãy tổng hợp các prompt mẫu để giao cho AI Agent code các tính năng: Tóm tắt chương, Gợi ý truyện, Kiểm duyệt bình luận tự động và Báo cáo vi phạm. Prompt cần nêu rõ cấu trúc ngữ cảnh codebase hiện tại (Node.js/Express/Postgres pool) và các ràng buộc kỹ thuật."
*   **Phản hồi của AI:**
    *   AI đã thiết lập bộ khung tài liệu [`PROMPTS.md`](../../PROMPTS.md) chuyên nghiệp.
    *   Các prompt mẫu đều chỉ rõ ràng buộc quan trọng của dự án: "sử dụng kết nối Pool của thư viện pg, truy vấn trực tiếp bằng raw SQL, không sử dụng Sequelize". Điều này giúp AI Agent tránh sinh code sai cấu trúc dự án.

---

## 📈 3. Đánh Giá Hiệu Quả Khi Làm Việc Với AI

1.  **Chuẩn hóa quy trình Agile:** Sử dụng AI hỗ trợ viết User Stories giúp nhóm quen thuộc với cách viết nghiệp vụ theo định dạng "Là một... Tôi muốn... Để..." một cách nhanh chóng.
2.  **Định nghĩa rõ ràng tiêu chí nghiệm thu:** Bộ tiêu chí nghiệm thu (Acceptance Criteria) do AI đề xuất giúp các thành viên trong nhóm thống nhất tiêu chuẩn hoàn thành task, giảm thiểu sai lệch kết quả khi tích hợp.
3.  **Tối ưu hóa lập trình bằng Agent:** Việc soạn sẵn các prompt có cấu trúc rõ ràng trong [`PROMPTS.md`](../../PROMPTS.md) giúp nhóm đẩy nhanh tiến độ code, AI Agent sinh ra code chính xác tới 90% ngay trong lần thử đầu tiên.
