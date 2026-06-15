# Hướng Dẫn Prompt Giao Việc Cho AI Agent — TUẦN 4 (PROMPTS.md)

Tài liệu này ghi lại các mẫu thiết kế GitHub Issues và Prompts tương ứng để giao việc cho AI Agent (như Cursor, Claude hoặc Antigravity) thực thi các tính năng nghiệp vụ của dự án CMC Truyện.

---

## 🎯 1. Nguyên Tắc Thiết Kế Prompt "Agent-Ready"

Để một AI Agent thực thi code chính xác không bị lỗi, các Issue/Prompt cần tuân thủ cấu trúc 4 phần:
1.  **Context (Ngữ cảnh):** Trạng thái codebase hiện tại, các thư viện đang dùng.
2.  **Task (Nhiệm vụ):** Mô tả chi tiết chức năng cần viết hoặc sửa.
3.  **Constraints (Ràng buộc):** Không được sửa cấu trúc database hiện có, bắt buộc viết kiểm tra quyền, không dùng thư viện ngoài nếu không được phép.
4.  **Acceptance Criteria (Tiêu chí nghiệm thu):** Điều kiện để xác định task đã hoàn thành.

---

## 📋 2. Đặc Tả Các Issues & Prompts Giao Việc Chi Tiết

### 🤖 Issue 1: Tóm tắt nội dung chương truyện bằng AI (US14)
*   **Mô tả:** Tích hợp tính năng gọi AI để tóm tắt văn bản chương truyện cho độc giả.
*   **Acceptance Criteria (Tiêu chí nghiệm thu):**
    *   [✓] Có nút "Tóm tắt" tại giao diện đọc chương.
    *   [✓] Khi nhấn nút, client gọi API `GET /api/chapters/:id/summary`.
    *   [✓] Backend kiểm tra cache: nếu có trong cache (RAM hoặc DB bảng `ai_summaries`) thì trả về ngay.
    *   [✓] Nếu không có trong cache, gọi API AI (Groq `llama-3.1-8b-instant` làm mặc định, Gemini làm dự phòng) qua Axios, lưu kết quả vào cache rồi trả về.
*   **Agent-Ready Prompt:**
    ```text
    Act as a Backend Developer.
    Context: Dự án đang dùng Node.js + Express + pg connection pool. Đã có bảng `ai_summaries` lưu (id, chapter_id, summary, generated_at).
    Task: Viết API endpoint GET /api/chapters/:id/summary để tóm tắt chương truyện.
    Constraints: 
    1. Kiểm tra cache trong RAM trước (dùng Map), sau đó đến bảng `ai_summaries` trong DB.
    2. Nếu cache hit, trả về ngay. Nếu cache miss, gọi API của Groq (llama-3.1-8b-instant) hoặc Gemini (gemini-1.5-flash) bằng Axios. Prompt gửi AI là: "Tóm tắt chương truyện sau bằng tiếng Việt trong 2-3 đoạn văn...".
    3. Lưu kết quả mới vào cache RAM và DB trước khi trả về.
    ```

---

### 🤖 Issue 2: Gợi ý truyện cá nhân hóa bằng AI (US15)
*   **Mô tả:** Đề xuất 5 bộ truyện phù hợp với độc giả dựa trên lịch sử đọc.
*   **Acceptance Criteria:**
    *   [✓] API `/api/ai/recommendations` chỉ cho phép User đã đăng nhập truy cập.
    *   [✓] Backend đọc lịch sử đọc (`reading_history`) lấy thể loại (`category`) và uploader (`author_id`).
    *   [✓] Gửi danh sách lịch sử lên AI yêu cầu phân tích sở thích và trả về mảng JSON gồm 5 ID truyện đề xuất.
    *   [✓] Dùng Regex để bóc tách mảng JSON từ phản hồi của AI an toàn, xử lý lỗi fallback nếu AI bị lỗi.
*   **Agent-Ready Prompt:**
    ```text
    Act as a Node.js Backend Developer.
    Task: Thiết lập hàm `generatePersonalRecommendations(userHistory)` trong `aiService.js` để gợi ý truyện.
    Constraints:
    1. Đầu vào là mảng lịch sử đọc của user.
    2. Prompt gửi AI yêu cầu trả về chính xác một mảng JSON dạng [1, 2, 3, 4, 5].
    3. Dùng regex text.match(/\[[\d,\s]+\]/) để lấy mảng JSON từ string trả về phòng trường hợp AI trả kèm văn bản giải thích.
    4. Nếu API lỗi, lấy các ID truyện trong lịch sử đọc làm danh sách fallback.
    ```

---

### 🛡️ Issue 3: Tự động kiểm duyệt bình luận nhạy cảm (US12)
*   **Mô tả:** Chạy hàng đợi ngầm kiểm duyệt từ ngữ thô tục trong bình luận người dùng.
*   **Acceptance Criteria:**
    *   [✓] Khi người dùng POST bình luận mới, bình luận ở trạng thái chờ duyệt.
    *   [✓] Đẩy job chứa content bình luận vào hàng đợi BullMQ.
    *   [✓] Worker nhận job chạy ngầm, so khớp nội dung bình luận với danh sách `bad_words` từ database.
    *   [✓] Phân loại xử lý: Tier 1 (từ chối bình luận), Tier 2 (che mờ bằng dấu *), Tier 3 (đánh dấu spam/gắn cờ).
*   **Agent-Ready Prompt:**
    ```text
    Act as a Fullstack Developer.
    Task: Thiết lập hệ thống kiểm duyệt bình luận tự động sử dụng BullMQ và Redis.
    Constraints:
    1. Viết `moderationService.js` so khớp từ khóa nhạy cảm trong RAM sau khi nạp từ DB.
    2. Sử dụng BullMQ Worker (`moderationWorker.js`) để lắng nghe queue 'moderationQueue'.
    3. Tùy thuộc vào tier của từ khóa tìm thấy, thực hiện cập nhật cột `status` của bình luận trong database: tier 1 -> 'rejected', tier 2 -> 'masked' (và thay thế từ cấm bằng dấu *), tier 3 -> 'flagged' (is_spam = true).
    ```

---

### 📢 Issue 4: Báo cáo vi phạm chương truyện (US11)
*   **Mô tả:** Cho phép độc giả báo cáo chương truyện lỗi/vi phạm và hiển thị trên trang quản trị.
*   **Acceptance Criteria:**
    *   [✓] Giao diện đọc truyện có nút "Báo cáo lỗi".
    *   [✓] Gửi request `POST /api/reports` lưu thông tin vào bảng `Reports` (lý do báo cáo enum, mô tả).
    *   [✓] Có trang quản trị Admin Reports hiển thị danh sách báo cáo, bộ lọc theo trạng thái (`NEW`, `RESOLVED`, `ALL`).
    *   [✓] Admin có thể nhấn nút "Xử lý" để cập nhật trạng thái báo cáo sang `RESOLVED`.
*   **Agent-Ready Prompt:**
    ```text
    Act as a Fullstack Developer.
    Task: Xây dựng tính năng Báo cáo vi phạm chương truyện.
    Constraints:
    1. Tạo bảng `Reports` với các trường: id, user_id, chapter_id, reason (Enum/Varchar), description (Text), status (Enum: NEW, IN_PROGRESS, RESOLVED, DISMISSED).
    2. Viết API endpoint POST /api/reports (yêu cầu xác thực) và GET /api/reports (chỉ dành cho Admin/Moderator).
    3. Tạo giao diện React `AdminReportsPage.jsx` để hiển thị bảng báo cáo vi phạm, có bộ lọc trạng thái và nút cập nhật trạng thái sang RESOLVED.
    ```
