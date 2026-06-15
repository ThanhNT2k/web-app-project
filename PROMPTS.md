# HƯỚNG DẪN TẠO GITHUB ISSUE & ĐÓNG GÓI PROMPT CHO AI AGENT (PROMPTS.md)

Tài liệu này đóng vai trò là bài học hướng dẫn sinh viên cách xây dựng User Stories chất lượng, chuyển đổi chúng thành các **GitHub Issues** chi tiết, và cuối cùng là đóng gói thành các **Prompt có cấu trúc (Structured Prompts)**. 

Mục tiêu tối thượng là giúp sinh viên hiểu cách viết tài liệu giao việc đủ rõ để **AI Coding Agents** (hoặc Lập trình viên mới) có thể tự động lập kế hoạch, viết code chuẩn xác với kiến trúc sẵn có mà không gây ra lỗi hoặc nhầm lẫn công nghệ.

---

## 🎯 MỤC TIÊU BÀI HỌC (Goal)

1. **Hiểu cách tiếp cận Agile trong phát triển sản phẩm:** Biết cách phân rã yêu cầu hệ thống thành các Epic và User Story.
2. **Kỹ năng viết User Story chuẩn:** Viết User Story theo cấu trúc định dạng: *“Là một [vai trò], tôi muốn [hành động], để [lợi ích]”*.
3. **Kỹ năng lập tài liệu Issue "Agent-Ready":** Tạo các GitHub Issues chi tiết đi kèm tiêu chuẩn nghiệm thu (**Acceptance Criteria**) rõ ràng bằng cú pháp Gherkin (`Given - When - Then`).
4. **Kỹ năng đóng gói Prompt giao việc (Prompt Engineering for Agents):** Thiết lập prompt có cấu trúc gồm: Bối cảnh dự án (Context), Nhiệm vụ cụ thể (Task), Các ràng buộc kỹ thuật (Constraints) và Định dạng đầu ra mong muốn (Output format).

---

## 📋 HOẠT ĐỘNG 1: DANH SÁCH 11 USER STORIES (DỰ ÁN CMC TRUYỆN)

Dưới đây là danh sách các User Stories bao quát các chức năng cốt lõi của nền tảng đọc truyện trực tuyến **CMC Truyện** (React + Vite, Node.js + Express, PostgreSQL).

| Mã số | Câu chuyện người dùng (User Story) | Epic liên quan | Loại |
|---|---|---|---|
| **US01** | Là một độc giả, tôi muốn tìm kiếm truyện bằng từ khóa (tên truyện, tác giả) trên thanh tìm kiếm ở trang chủ, để tôi có thể nhanh chóng tìm thấy bộ truyện mong muốn. | Epic 2 - Story Discovery | Standard |
| **US02** | Là một độc giả, tôi muốn lọc danh sách truyện nâng cao theo thể loại, trạng thái hoàn thành và sắp xếp theo lượt xem/ngày cập nhật, để dễ dàng khám phá các truyện phù hợp với sở thích hiện tại. | Epic 2 - Story Discovery | Standard |
| **US03** | Là một độc giả mới, tôi muốn đăng ký và đăng nhập tài khoản bằng email/mật khẩu, để hệ thống có thể nhận diện và lưu trữ dữ liệu cá nhân của tôi. | Epic 1 - Authentication | Standard |
| **US04** | Là một độc giả đã đăng nhập, tôi muốn thay đổi màu nền, cỡ chữ và font chữ khi đọc truyện thông qua bảng cài đặt nhanh (Preferences Panel), để có trải nghiệm đọc tối ưu nhất chống mỏi mắt. | Epic 3 - Reading Experience | Standard |
| **US05** | Là một độc giả đã đăng nhập, tôi muốn hệ thống tự động ghi nhớ chương và vị trí cuộn trang hiện tại của tôi khi đọc, để khi quay lại bằng thiết bị khác, tôi có thể đọc tiếp ngay lập tức mà không cần tìm lại. | Epic 4 - User Engagement | Standard |
| **US06** | Là một độc giả đã đăng nhập, tôi muốn lưu truyện vào danh sách yêu thích (theo dõi), để nhận thông báo hoặc truy cập nhanh từ trang cá nhân khi có chương mới. | Epic 4 - User Engagement | Standard |
| **US07** | Là một độc giả đã đăng nhập, tôi muốn gửi bình luận phản hồi dưới mỗi chương truyện, để chia sẻ cảm xúc và thảo luận nội dung với những độc giả khác. | Epic 4 - User Engagement | Standard |
| **US08** | Là một Uploader, tôi muốn tạo mới truyện, cập nhật thông tin giới thiệu và đăng tải các chương mới trên Dashboard, để làm phong phú kho truyện trên nền tảng. | Epic 6 - Content Management | Standard |
| **US09** | Là một Admin, tôi muốn xem danh sách toàn bộ người dùng, thay đổi vai trò (User/Uploader/Admin) hoặc khóa tài khoản vi phạm chính sách, để bảo vệ sự văn minh và an toàn của hệ thống. | Epic 7 - User Management | Standard |
| **US10** | **Là một độc giả đã đăng nhập, tôi muốn có nút tóm tắt nội dung chương bằng AI, để nhanh chóng nắm bắt diễn biến chính của chương trước khi đọc tiếp nếu tôi bị gián đoạn thời gian dài.** | Epic 3 - Reading Experience | **AI Feature** |
| **US11** | **Là một độc giả đã đăng nhập, tôi muốn nhận gợi ý các truyện có phong cách tương tự dựa trên lịch sử đọc gần đây do AI phân tích, để tôi dễ dàng tìm thấy các tác phẩm hợp gu.** | Epic 2 - Story Discovery | **AI Feature** |

---

## 🤖 HOẠT ĐỘNG 2 & 3: CHUYỂN ĐỔI USER STORIES THÀNH GITHUB ISSUES CHI TIẾT

Chọn 2 AI User Stories (`US10` và `US11`) chuyển đổi thành GitHub Issues chuẩn hóa có Acceptance Criteria.

### 🟢 ISSUE #1: `[AI Feature] AI Chapter Summary - Tóm tắt chương truyện tự động`

*   **Mô tả:** Thêm nút "🤖 Tóm tắt bằng AI" vào giao diện đọc truyện. Khi người dùng click, hệ thống gửi yêu cầu lên Backend để tóm tắt chương hiện tại trong 150-200 từ Tiếng Việt qua Gemini API/Groq. Kết quả được cache lại trong DB để tránh gọi lại API tốn chi phí.
*   **Tiêu chuẩn nghiệm thu (Acceptance Criteria - Gherkin Syntax):**
    
    *   **Kịch bản 1: Yêu cầu tóm tắt thành công (Đã có cache trong DB)**
        *   **Given:** Độc giả đã đăng nhập và đang ở trang đọc chương truyện [ChapterReaderPage.jsx](file:///d:/web-app-project/src/pages/ChapterReaderPage.jsx)
        *   **And:** Chương này đã được tóm tắt trước đó (lưu trong bảng `ai_summaries`)
        *   **When:** Độc giả click nút **"🤖 Tóm tắt nhanh bằng AI"**
        *   **Then:** Khung tóm tắt hiển thị nội dung tóm tắt ngay lập tức (<500ms) từ cơ sở dữ liệu.
        
    *   **Kịch bản 2: Yêu cầu tóm tắt thành công (Chưa có cache, gọi AI lần đầu)**
        *   **Given:** Độc giả đã đăng nhập và đang ở trang đọc chương truyện
        *   **And:** Chương này chưa từng được tóm tắt
        *   **When:** Độc giả click nút **"🤖 Tóm tắt nhanh bằng AI"**
        *   **Then:** Giao diện hiển thị hiệu ứng Loading (shimmer/spinner)
        *   **And:** Backend gửi request kèm nội dung chương lên AI API (Gemini/Groq) với prompt giới hạn 150-200 từ
        *   **And:** Lưu phản hồi thành công vào bảng `ai_summaries`
        *   **And:** Hiển thị nội dung tóm tắt ra màn hình đi kèm nhãn cảnh báo độ chính xác và nút đánh giá `[👍 Hữu ích]` `[👎 Chưa đúng]`.
        
    *   **Kịch bản 3: Độc giả chưa đăng nhập cố gắng sử dụng**
        *   **Given:** Tôi truy cập với tư cách Khách vãng lai chưa đăng nhập
        *   **When:** Tôi xem giao diện đọc truyện
        *   **Then:** Nút **"🤖 Tóm tắt nhanh bằng AI"** bị làm mờ (disabled) và khi hover sẽ hiển thị tooltip: *"Vui lòng đăng nhập để sử dụng tính năng này."*

---

### 🔵 ISSUE #2: `[AI Feature] AI Personalized Recommendation - Gợi ý truyện cá nhân hóa thông minh`

*   **Mô tả:** Hiển thị phần "Gợi ý dành riêng cho bạn" trên Trang chủ [HomePage.jsx](file:///d:/web-app-project/src/pages/HomePage.jsx). Sử dụng AI để phân tích lịch sử đọc của người dùng trong 30 ngày qua và so sánh với kho truyện hiện có để đề xuất 4-6 tác phẩm tương đồng.
*   **Tiêu chuẩn nghiệm thu (Acceptance Criteria - Gherkin Syntax):**

    *   **Kịch bản 1: Người dùng đã đăng nhập và có lịch sử đọc**
        *   **Given:** Tôi là người dùng đã đăng nhập tài khoản có lịch sử đọc truyện
        *   **When:** Tôi truy cập Trang chủ
        *   **Then:** Hệ thống gửi request đến `GET /api/recommendations/personalized`
        *   **And:** Hiển thị danh sách 4-6 truyện gợi ý kèm thẻ tag lý do từ AI (Ví dụ: *"Vì bạn đã thích thể loại kiếm hiệp"*).
        
    *   **Kịch bản 2: Người dùng mới chưa có lịch sử đọc (Fallback)**
        *   **Given:** Tôi là người dùng mới đăng ký và chưa đọc truyện nào
        *   **When:** Tôi truy cập Trang chủ
        *   **Then:** Hệ thống phát hiện lịch sử đọc trống và tự động chuyển sang chế độ dự phòng
        *   **And:** Hiển thị danh sách các truyện thịnh hành có lượt đọc cao nhất hệ thống kèm tag *"Hot"*.
        
    *   **Kịch bản 3: Khách vãng lai chưa đăng nhập**
        *   **Given:** Tôi chưa đăng nhập tài khoản
        *   **When:** Tôi xem Trang chủ
        *   **Then:** Hệ thống hiển thị các truyện được biên tập viên chọn lọc kèm biểu ngữ *"Đăng nhập để nhận gợi ý truyện cá nhân hóa bằng AI"*.

---

## 🚀 HOẠT ĐỘNG 4: ĐÓNG GÓI THÀNH PROMPT CHO AI AGENT THỰC THI (PROMPT TEMPLATES)

Đây là phần quan trọng nhất giúp chuyển đổi các GitHub Issues ở trên thành **Prompt giao việc thực tế**. Bạn chỉ cần sao chép các prompt dưới đây và gửi trực tiếp cho AI Agent để bắt đầu lập trình.

---

### 🧠 Prompt 1: Thực thi Tính năng Tóm tắt chương bằng AI (AI Chapter Summary)

```text
CONTEXT:
Chúng ta đang phát triển dự án "CMC Truyện" (React frontend, Node.js Express backend, PostgreSQL database). Dự án sử dụng kết nối pool của thư viện `pg` để viết truy vấn SQL thô (raw SQL), không sử dụng ORM (như Sequelize hay Prisma). Bạn cần phát triển tính năng tóm tắt chương bằng AI.

TASK:
Hãy tạo và cấu trúc mã nguồn cho tính năng "Tóm tắt chương truyện bằng AI" trên cả Frontend và Backend theo đặc tả sau:

1. DATABASE SCHEMA:
   Tạo bảng `ai_summaries` lưu trữ cache tóm tắt của chương truyện:
   - id (SERIAL PRIMARY KEY)
   - chapter_id (INTEGER, FOREIGN KEY REFERENCES chapters(id) ON DELETE CASCADE)
   - summary_text (TEXT)
   - created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   - updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   (Hãy viết mã SQL tạo bảng và đính kèm vào mã nguồn backend để chạy migrates).

2. BACKEND INTEGRATION (Node.js/Express):
   - Tạo router endpoint: GET /api/chapters/:id/summary (chỉ cho phép user đã đăng nhập thông qua authMiddleware).
   - Logic endpoint:
     a. Truy vấn bảng `ai_summaries` tìm summary theo chapter_id. Nếu có, trả về ngay lập tức để tiết kiệm chi phí API.
     b. Nếu chưa có, truy vấn nội dung chương (trường `content` trong bảng `chapters`).
     c. Gọi Gemini API (Sử dụng model gemini-1.5-flash) với prompt:
        "Hãy tóm tắt nội dung chương truyện sau bằng Tiếng Việt. Độ dài từ 150-200 từ. Chỉ nêu sự kiện chính, không sử dụng gạch đầu dòng."
     d. Lưu kết quả trả về từ Gemini vào bảng `ai_summaries` rồi phản hồi JSON về cho client: { status: 'success', summary: '...' }
     e. Xử lý ngoại lệ: Nếu API Gemini lỗi hoặc timeout, hãy trả về mã lỗi 500 kèm message rõ ràng để client xử lý.

3. FRONTEND INTEGRATION (React / Vite + Tailwind):
   - Chỉnh sửa file `src/pages/ChapterReaderPage.jsx`.
   - Thêm nút "🤖 Tóm tắt nhanh bằng AI" phía trên khu vực đọc truyện. Nút này bị disabled nếu người dùng chưa đăng nhập.
   - Khi click nút:
     a. Hiển thị Loading State dạng shimmer/spinner tại khung hiển thị tóm tắt.
     b. Gửi request Axios gọi API GET /api/chapters/:id/summary (kèm Authorization token).
     c. Hiển thị khung tóm tắt (màu nền dịu mắt, có bo góc, tương thích cả Dark Mode).
     d. Hiển thị nhãn: "⚠️ Nội dung do AI tạo lập, có thể không chính xác 100%." và nút [👍 Hữu ích], [👎 Chưa đúng], [✕ Đóng].
     e. Nếu xảy ra lỗi, hiển thị thông báo lỗi kèm nút "Thử lại".

CONSTRAINTS:
- Viết raw SQL query bằng pg pool, không dùng ORM.
- Đảm bảo xử lý triệt để giao diện Light/Dark Mode của Tailwind thông qua ThemeContext.
- Code phải gọn gàng, có comment giải thích các hàm xử lý API và AI.
```

---

### 🧠 Prompt 2: Thực thi Tính năng Gợi ý truyện cá nhân hóa (AI Personalized Recommendation)

```text
CONTEXT:
Chúng ta đang phát triển dự án "CMC Truyện". Bạn cần thực hiện tính năng "Gợi ý truyện cá nhân hóa bằng AI" hiển thị trên Trang Chủ. Nền tảng sử dụng Express backend, cơ sở dữ liệu PostgreSQL vật lý kết nối qua thư viện `pg` và sử dụng Gemini API để phân tích đề xuất.

TASK:
Hãy triển khai đầy đủ logic Backend API và giao diện Frontend cho tính năng gợi ý cá nhân hóa:

1. BACKEND INTEGRATION (Express Controller & Router):
   - Tạo endpoint: GET /api/recommendations/personalized
   - Kiểm tra Token JWT của người dùng:
     - Nếu người dùng CHƯA ĐĂNG NHẬP: Truy vấn 6 bộ truyện có lượt xem (`views`) cao nhất trong bảng `stories` và trả về danh sách kèm tag "Hot" (Fallback Mode).
     - Nếu người dùng ĐÃ ĐĂNG NHẬP:
       a. Truy vấn lịch sử đọc của người dùng trong 30 ngày qua từ bảng `reading_history` liên kết với bảng `stories` và `chapters` để lấy danh sách các thể loại truyện họ đọc nhiều nhất.
       b. Truy vấn danh sách truyện họ đã bấm yêu thích từ bảng `user_follows`.
       c. Gom các thông tin sở thích này thành một chuỗi văn bản (ví dụ: "Người dùng thích đọc truyện Tiên hiệp, Đô thị. Tác phẩm đã đọc gần đây: Đấu Phá Thương Khung").
       d. Lấy danh sách 20 truyện khác đang có trên hệ thống kèm mô tả tóm tắt.
       e. Gửi yêu cầu lên Gemini API (model gemini-1.5-flash) để so khớp và chọn ra 4 truyện phù hợp nhất. Prompt yêu cầu trả về chuỗi JSON thô:
          [{"story_id": 1, "reason": "Giải thích ngắn gọn lý do gợi ý"}, ...]
       f. Backend phân tích chuỗi JSON này, join với bảng `stories` để lấy thông tin chi tiết (ảnh bìa, tên truyện, tác giả) và trả về cho client.
       g. Caching: Lưu kết quả gợi ý của mỗi User ID vào Redis hoặc một biến cache trong bộ nhớ với TTL là 12 giờ để giảm tải API.

2. FRONTEND INTEGRATION (React + Tailwind):
   - Chỉnh sửa file `src/pages/HomePage.jsx`.
   - Tạo một section mới: "✨ Gợi ý dành riêng cho bạn" đặt dưới mục truyện Hot.
   - Khi trang chủ tải:
     - Hiển thị 4-6 skeleton cards làm màn hình chờ.
     - Gọi API GET /api/recommendations/personalized.
     - Hiển thị các bộ truyện đề xuất dạng Grid. Mỗi card truyện hiển thị tag nhỏ ghi lý do gợi ý của AI (Ví dụ: "Do bạn thích thể loại Tiên hiệp").
     - Nếu chưa đăng nhập, hiển thị thêm banner khuyến khích: "Đăng nhập để nhận gợi ý truyện bằng AI phù hợp với gu đọc của bạn!" trỏ sang trang `/login`.

CONSTRAINTS:
- Sử dụng raw SQL với pg pool.
- Xử lý kỹ phần fallback JSON parse khi Gemini API không trả về đúng định dạng mong muốn (phải bọc trong block try-catch và dùng fallback truyện hot nếu JSON parse lỗi).
```

---

### 🧠 Prompt 3: Thực thi Tính năng Kiểm duyệt bình luận tự động (Auto Comment Moderation)

```text
CONTEXT:
Hệ thống CMC Truyện đang gặp tình trạng spam bình luận và bình luận thô tục từ độc giả. Chúng ta cần triển khai hàng đợi kiểm duyệt tự động sử dụng Redis + BullMQ và cơ sở dữ liệu PostgreSQL (pg pool, raw SQL).

TASK:
Hãy viết code triển khai luồng kiểm duyệt bình luận tự động ngầm dưới nền:

1. DATABASE SCHEMA:
   Đảm bảo có các bảng:
   - `comments` có trường `status` (ENUM: 'pending', 'approved', 'rejected', 'masked', 'flagged'). Mặc định khi tạo bình luận là 'pending'.
   - `bad_words` gồm các trường:
     - word (VARCHAR, UNIQUE)
     - severity_tier (INTEGER: 1, 2, 3)

2. QUEUE & WORKER SETUP (Backend):
   - Cấu hình Redis Connection và khởi tạo hàng đợi BullMQ tên là `commentModerationQueue`.
   - Khi người dùng gửi bình luận mới (POST /api/comments):
     a. Lưu bình luận vào bảng `comments` với trạng thái `status = 'pending'`.
     b. Đẩy một job chứa `comment_id` và `content` vào `commentModerationQueue`.
     c. Trả về phản hồi cho client: { status: 'pending', message: 'Bình luận đang được xử lý...' }.
   - Viết `commentModerationWorker`:
     a. Lắng nghe job từ hàng đợi.
     b. Truy vấn danh sách từ cấm từ bảng `bad_words`.
     c. Quét nội dung bình luận để tìm các từ nhạy cảm:
        - Nếu chứa từ cấm Tier 1: Cập nhật `comments` set `status = 'rejected'`.
        - Nếu chứa từ cấm Tier 2: Thay thế các ký tự của từ cấm đó bằng dấu sao (ví dụ: "d**g") và cập nhật `comments` set `status = 'masked'`, lưu nội dung đã lọc.
        - Nếu chứa từ cấm Tier 3: Cập nhật `comments` set `status = 'flagged'` và gửi log cảnh báo cho quản trị viên.
        - Nếu không vi phạm: Cập nhật `comments` set `status = 'approved'`.

3. FRONTEND INTEGRATION:
   - Cập nhật Component hiển thị bình luận: Chỉ những bình luận có status là 'approved' hoặc 'masked' mới được hiển thị công khai.
   - Nếu bình luận ở trạng thái 'pending', hiển thị thông báo mờ: *"Bình luận của bạn đang chờ kiểm duyệt..."* đối với chính tài khoản gửi bình luận đó.

CONSTRAINTS:
- Sử dụng thư viện `bullmq` và `ioredis`.
- Logic worker phải chạy độc lập dưới nền mà không gây block luồng chính của Express server.
- Viết câu lệnh SQL cập nhật trạng thái rõ ràng, tối ưu hóa transaction.
```

---

### 🧠 Prompt 4: Thực thi Tính năng Báo cáo vi phạm (Violation Reporting)

```text
CONTEXT:
Chúng ta cần xây dựng hệ thống báo cáo nội dung chương truyện vi phạm chính sách hoặc lỗi dịch để Admin/Moderator kịp thời xử lý. Hệ thống sử dụng React frontend và Express backend + PostgreSQL (pg pool, raw SQL).

TASK:
Hãy lập trình tính năng Báo cáo vi phạm theo các yêu cầu sau:

1. DATABASE SCHEMA:
   Tạo bảng `reports`:
   - id (SERIAL PRIMARY KEY)
   - user_id (INTEGER, FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL)
   - chapter_id (INTEGER, FOREIGN KEY REFERENCES chapters(id) ON DELETE CASCADE)
   - reason_type (VARCHAR - ví dụ: 'copyright', 'translation_error', 'abuse', 'other')
   - details (TEXT)
   - status (VARCHAR - mặc định 'pending', có thể chuyển sang 'resolved' hoặc 'dismissed')
   - created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

2. BACKEND API:
   - GET /api/reports: Chỉ Admin và Moderator được truy cập. Lấy toàn bộ danh sách báo cáo kèm thông tin tên truyện, chương truyện và email người báo cáo.
   - POST /api/reports: Cho phép người dùng (đã đăng nhập) gửi báo cáo. Thực hiện kiểm tra trùng lặp (nếu user đã báo cáo chương này trong vòng 24 giờ qua với cùng một lý do, trả về lỗi 400).
   - PUT /api/reports/:id: Chỉ Admin/Moderator được truy cập để đổi trạng thái sang 'resolved' hoặc 'dismissed'.

3. FRONTEND INTEGRATION:
   - Trên trang đọc [ChapterReaderPage.jsx](file:///d:/web-app-project/src/pages/ChapterReaderPage.jsx), thêm nút "⚠️ Báo cáo lỗi/vi phạm".
   - Khi click, hiển thị một Modal Popup chứa:
     - Dropdown lựa chọn lý do: Bản quyền, Lỗi dịch thuật, Nội dung thô tục, Lý do khác.
     - Ô nhập chi tiết (Textarea).
     - Nút "Gửi báo cáo" và "Hủy".
   - Tại trang [AdminPage.jsx](file:///d:/web-app-project/src/pages/AdminPage.jsx) (Dashboard dành cho Admin/Mod):
     - Thêm tab "Quản lý Báo cáo".
     - Hiển thị danh sách báo cáo dưới dạng bảng biểu.
     - Cung cấp hai nút hành động nhanh: [Duyệt đã xử lý (Resolve)] và [Bỏ qua (Dismiss)] cho mỗi dòng báo cáo.

CONSTRAINTS:
- Xác thực phân quyền chặt chẽ bằng Role Middleware ở các route quản trị báo cáo.
- Thiết kế Modal Popup bằng CSS Tailwind đồng bộ với phong cách Glassmorphism của các component khác.
```
