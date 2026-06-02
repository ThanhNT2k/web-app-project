# Nhật Ký Tương Tác AI — TUẦN 2: Phân Tích Sản Phẩm & Thiết Kế AI Personalization (ai-logs/week-02.md)

*   **Dự án:** CMC Truyện
*   **Mã số nhóm:** Nhóm CMC Truyện — Khóa Phát Triển Phần Mềm Hướng AI
*   **Thời gian:** Tuần 2 (Cuối tháng 5/2026)
*   **Trợ lý AI sử dụng:** Claude.ai Web, VS Code Copilot Chat
*   **Kiến trúc thống nhất:** React + Vite (Frontend) + Node.js Express (Backend) + PostgreSQL (Supabase)

---

## 👥 Session 1 — Phân Tích MVP Ưu Tiên Bằng Phương Pháp RICE Scoring

*   **Ngày:** Tuần 2, Ngày 1
*   **Công cụ:** Claude.ai Web
*   **Mục tiêu:** Phân tích các tính năng cần ưu tiên thực hiện cho phiên bản thử nghiệm tối giản (MVP) dựa trên nguồn lực giới hạn của nhóm sinh viên (làm việc trong 8 tuần).

### 🔵 Prompt đã dùng:
```text
Hãy đóng vai một nhà phân tích sản phẩm (Product Analyst). 

Chúng tôi đang phát triển dự án "CMC Truyện" với stack React + Node.js Express + Supabase. Nhóm gồm 3 thành viên hoạt động bán thời gian (~10 tiếng/tuần mỗi người). Tổng quỹ thời gian cho dự án là khoảng 240 giờ làm việc thực tế.

Hãy giúp tôi áp dụng mô hình chấm điểm RICE (Reach, Impact, Confidence, Effort) để đánh giá việc giải quyết các điểm nghẽn (pain points) sau đây và chọn ra phạm vi MVP tối ưu nhất:
1. Gỡ bỏ quảng cáo hoàn toàn khỏi giao diện đọc.
2. Tích hợp thanh tùy biến giao diện đọc (Dark Mode, giãn dòng, thay đổi cỡ chữ).
3. Lưu bookmark tự động để khi quay lại mở đúng chương đang đọc.
4. Crawler tự động quét truyện từ các nguồn khác về.
5. Hệ thống phần thưởng/thành tích (Gamification) để giữ chân độc giả.

Hãy lập bảng chấm điểm RICE chi tiết và giải thích lý do lựa chọn hoặc loại bỏ.
```

### 🟢 Phản hồi của AI & Key Insights được áp dụng:
AI đã cung cấp bảng phân tích chấm điểm RICE:

| Tính năng | Reach (1-10) | Impact (0.25-3) | Confidence (10%-100%) | Effort (Người-Tuần) | RICE Score | Quyết định |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Trình đọc không quảng cáo** | 10 | 3.0 | 100% | 0.5 | **60.0** | **Chọn vào MVP** |
| **2. Tùy biến Dark Mode/Cỡ chữ** | 9 | 2.0 | 95% | 1.0 | **17.1** | **Chọn vào MVP** |
| **3. Bookmark tự động** | 9 | 2.0 | 90% | 0.8 | **20.2** | **Chọn vào MVP** |
| **4. Hệ thống Crawler tự động** | 6 | 1.5 | 50% | 3.0 | **1.5** | *Loại bỏ (Dùng Seeder/Mock)* |
| **5. Gamification (Phần thưởng)** | 3 | 0.5 | 60% | 2.5 | **0.36**| *Loại bỏ (Chưa cần thiết)* |

*   **Lý giải của AI:** Để giải quyết 3 pain points lớn nhất của độc giả (quảng cáo, mỏi mắt, mất vị trí đọc) trong giới hạn 240 giờ, nhóm chỉ nên tập trung xây dựng tính năng 1, 2, 3 và sử dụng script Seeding dữ liệu PostgreSQL mẫu thay vì viết hệ thống crawler phức tạp.
*   **Bài học rút ra:** Nhóm quyết định bỏ qua crawler và hệ thống điểm thưởng, tập trung hoàn thiện giao diện đọc truyện (Reader UI) chất lượng cao trước.

---

## 👥 Session 2 — Brainstorm & Đề Xuất Tính Năng AI Phù Hợp

*   **Ngày:** Tuần 2, Ngày 2
*   **Công cụ:** Claude.ai Web
*   **Mục tiêu:** Xác định tính năng AI thiết thực, có khả năng tích hợp nhanh bằng Google Gemini API.

### 🔵 Prompt đã dùng:
```text
Dự án đọc truyện CMC Truyện của chúng tôi có backend Node.js và tích hợp Google Gemini API.
Chúng tôi muốn tích hợp tính năng AI vào nền tảng đọc truyện nhưng phải đáp ứng:
- Thời gian xây dựng và tích hợp chỉ dưới 2 tuần.
- Không cần huấn luyện lại mô hình (sử dụng API sẵn có).
- Hỗ trợ tốt tiếng Việt.
- Giới hạn chi phí gọi API tối đa.

Hãy brainstorm 3 ý tưởng tính năng AI thực tế nhất, mô tả luồng dữ liệu (Input/Output) và cách tối ưu hóa chi phí cho từng tính năng.
```

### 🟢 Các ý tưởng AI được đề xuất và phân tích:
1.  **AI Chapter Summary (Tóm tắt chương truyện):**
    *   *Input:* Nội dung chương truyện chữ (khoảng 2000 - 5000 từ).
    *   *Output:* Tóm tắt bằng tiếng Việt khoảng 3-4 câu (150 từ).
    *   *Tối ưu chi phí:* Lưu trữ kết quả tóm tắt vào bảng database `ai_summaries` (Caching). Nếu chương đã được tóm tắt một lần, hệ thống sẽ lấy từ database thay vì gọi lại Gemini API.
2.  **AI Reading Persona & Personalized Recommendations (Gợi ý truyện cá nhân hóa):**
    *   *Input:* Danh sách lịch sử đọc (dwell time, tỷ lệ đọc hết truyện) và danh sách truyện hiện có.
    *   *Output:* JSON chứa 5 truyện được đề xuất nhiều nhất kèm lý do phù hợp bằng tiếng Việt.
    *   *Tối ưu chi phí:* Chỉ kích hoạt khi người dùng là thành viên đã đăng nhập và có hoạt động mới, giới hạn tần suất cập nhật đề xuất tối đa 24 giờ một lần.

**Hành động của nhóm:** Nhóm quyết định triển khai **cả hai tính năng này** vì chúng bổ trợ rất tốt cho nhau: Tóm tắt chương giúp tăng trải nghiệm đọc nhanh, còn gợi ý cá nhân hóa giúp độc giả khám phá nội dung mới hiệu quả.

---

## 👥 Session 3 — Phân Tích Rủi Ro Khi Sử Dụng AI & Thiết Kế Telemetry

*   **Ngày:** Tuần 2, Ngày 3
*   **Công cụ:** Claude.ai Web
*   **Mục tiêu:** Thiết kế hệ thống thu thập hành vi người dùng (Telemetry) để làm đầu vào cho AI gợi ý truyện.

### 🔵 Prompt đã dùng:
```text
Để phục vụ tính năng AI gợi ý truyện, tôi cần thiết kế một hệ thống Telemetry thu thập ngầm hành vi người dùng ở phía client-side:
- Các tín hiệu chủ động (Explicit): nhấn Follow truyện.
- Các tín hiệu ngầm (Implicit): đếm số lần truy cập truyện, đo thời gian đọc thực tế của chương (Dwell Time) và tính tỷ lệ hoàn thành (Completion Rate).

Hãy:
1. Phân tích các rủi ro kỹ thuật (như spam request gửi liên tục, treo máy gây sai số Dwell Time).
2. Đề xuất các giải pháp lập trình và thiết kế cơ sở dữ liệu để hạn chế các rủi ro này.
```

### 🟢 Phản hồi của AI:
AI chỉ ra 3 rủi ro lớn nhất và cách khắc phục:
1.  **Rủi ro Treo máy (Idle State):** Người dùng mở tab đọc truyện rồi bỏ đi, khiến thời gian đọc thực tế tăng vọt không chính xác.
    *   *Giải pháp:* Sử dụng thuộc tính `document.visibilityState` và bắt các sự kiện di chuột/cuộn trang ở client. Nếu quá 2 phút không có tương tác, tạm dừng gửi request Heartbeat lên server.
2.  **Spam Request:** Heartbeat gửi quá dày làm nghẽn server và database.
    *   *Giải pháp:* Thiết lập khoảng thời gian gửi Heartbeat hợp lý (ví dụ: mỗi 30 giây gửi một lần tích lũy thời gian đọc).
3.  **Lạm dụng API Gemini gây quá tải chi phí:**
    *   *Giải pháp:* Chỉ áp dụng tính năng cá nhân hóa AI cho tài khoản có quyền `User` hoặc `Uploader` (loại trừ `Guest`). Sử dụng mô hình `gemini-1.5-flash` và thiết lập caching tối đa.

---

## 📊 4. Tổng Kết Tuần 2

| Hạng mục | Kết quả |
| :--- | :--- |
| **Số Session tương tác AI** | 3 session |
| **Các tài liệu được tạo ra** | `PRODUCT_ANALYSIS.md`, `AI_FEATURE_PROPOSAL.md` |
| **Tính năng AI lựa chọn** | Chapter Summary (có Cache) & Personalized Recommendations (qua Telemetry) |
| **Phương pháp kiểm chứng** | Thiết lập chấm điểm RICE và thiết kế Zod schema |

### Kỹ thuật Prompting đã áp dụng hiệu quả:
*   **RICE Matrix Generation Prompt:** Sử dụng AI để thiết lập bảng trọng số giúp đưa ra quyết định lý trí về mặt tính năng.
*   **Constrained Brainstorming:** Đặt giới hạn nguồn lực và thời gian chặt chẽ trước khi yêu cầu AI đề xuất tính năng để tránh tình trạng đề xuất lan man, quá tải.
