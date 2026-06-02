# Nhật Ký Tương Tác AI — TUẦN 1: Khởi Động Dự Án & Định Hướng Sản Phẩm (ai-logs/week-01.md)

*   **Dự án:** CMC Truyện
*   **Mã số nhóm:** Nhóm CMC Truyện — Khóa Phát Triển Phần Mềm Hướng AI
*   **Thời gian:** Tuần 1 (Bắt đầu từ giữa tháng 5/2026)
*   **Trợ lý AI sử dụng:** Claude.ai Web, VS Code Copilot Chat
*   **Kiến trúc thống nhất:** React + Vite (Frontend) + Node.js Express (Backend) + PostgreSQL (Supabase)

---

## 👥 Session 1 — Phân Tích Độc Giả Việt Nam & Điểm Yếu Của Nền Tảng Cũ

*   **Ngày:** Tuần 1, Ngày 1
*   **Công cụ:** Claude.ai Web
*   **Mục tiêu:** Sử dụng AI để đóng vai chuyên gia nghiên cứu trải nghiệm (UX Researcher) nhằm phân tích các nền tảng đọc truyện online hiện nay tại Việt Nam.

### 🔵 Prompt đã dùng:
```text
Hãy đóng vai một chuyên gia nghiên cứu trải nghiệm người dùng (UX Researcher) có 5 năm kinh nghiệm trong việc phát triển ứng dụng di động và web tiêu dùng tại thị trường Việt Nam.

Tôi đang xây dựng một nền tảng đọc truyện chữ trực tuyến mới dành cho người dùng Việt (đối tượng chính là sinh viên và nhân viên văn phòng) hay đọc truyện tiên hiệp, ngôn tình, đô thị...

Hãy phân tích thực trạng các website đọc truyện hiện nay (Truyện Full, TruyenGG, Metruyện) và xác định:
1. Top 3 điểm gây ức chế nhất (critical pain points) khiến người đọc khó chịu.
2. Điểm ức chế nào ảnh hưởng diện rộng nhất đối với mọi phân khúc người dùng.
3. Giải pháp thiết kế hoặc mô hình tương tác nào có thể giúp một sản phẩm mới ra mắt tạo nên sự khác biệt ngay lập tức.

Yêu cầu phân tích cụ thể, tránh các lời khuyên chung chung.
```

### 🟢 Phản hồi của AI & Key Insights được áp dụng:
AI đã phân tích và phân loại 3 pain points lớn nhất:
1.  **Quảng cáo rác tràn lan (Intrusive Ads):** Các quảng cáo tự động bật lên (pop-up), video tự phát che khuất dòng chữ đang đọc, nút đóng giả mạo làm lừa người dùng click. Đây là điểm gây ức chế số 1 ảnh hưởng đến 100% người dùng.
2.  **Màn hình đọc thiếu tùy biến:** Màu nền quá chói (thiếu chế độ đọc đêm thực sự), cỡ chữ quá nhỏ hoặc không cho chỉnh font chữ khiến độc giả mỏi mắt khi đọc liên tục trên 30 phút.
3.  **Mất vị trí đọc (Loss of Reading State):** Khi tắt trình duyệt hoặc đổi thiết bị, người dùng phải tự nhớ xem mình đang đọc dở chương nào, dòng nào.

**Hành động của nhóm:** Nhóm đã lấy các điểm ức chế này làm cốt lõi để đưa vào tài liệu `PRODUCT_ANALYSIS.md` nhằm định hướng xây dựng MVP tập trung giải quyết triệt để 3 vấn đề này (Không quảng cáo, tích hợp Dark Mode/cỡ chữ linh hoạt và Auto-Bookmark).

---

## 👥 Session 2 — Thảo Luận Lựa Chọn Stack Đồng Nhất & Cấu Trúc Thư Mục

*   **Ngày:** Tuần 1, Ngày 2
*   **Công cụ:** Claude.ai Web
*   **Mục tiêu:** Thiết kế mô hình kiến trúc và phân chia thư mục cho dự án.

### 🔵 Prompt đã dùng:
```text
Hãy đóng vai Kiến trúc sư phần mềm (Software Architect).
Chúng tôi ban đầu định hướng làm backend C# ASP.NET Core và frontend Razor Pages. Tuy nhiên, sau khi xem xét yêu cầu tích hợp sâu AI Gemini qua Vercel AI SDK cũng như tối ưu hóa SPA của frontend, chúng tôi muốn đổi sang stack JavaScript đồng nhất: React 18 (Vite) ở Frontend và Node.js Express ở Backend, sử dụng cơ sở dữ liệu PostgreSQL (Supabase).

Hãy:
1. Đánh giá tính khả thi và ưu điểm của việc đổi stack này đối với một nhóm sinh viên làm dự án trong 8 tuần.
2. Đề xuất cấu trúc thư mục của một dự án tách rời (Decoupled) gồm 2 phần độc lập: frontend/ và backend/.
```

### 🟢 Phản hồi của AI:
AI phân tích rằng việc chuyển đổi sang stack JavaScript đồng nhất là quyết định sáng suốt vì:
*   **Single Language:** Cả frontend và backend đều dùng JS/TS giúp giảm tải việc chuyển đổi ngữ cảnh tư duy giữa hai ngôn ngữ.
*   **Vercel AI SDK Integration:** SDK này hỗ trợ tốt nhất trên Node.js runtime, giúp tích hợp Gemini API nhanh chóng, đặc biệt là tính năng trả về JSON cấu trúc qua Zod schema (`generateObject`).
*   **Lightweight:** Node.js Express khởi động cực nhanh, dễ triển khai lên các dịch vụ deploy miễn phí như Railway, Render hoặc Vercel.

AI đề xuất cấu trúc thư mục dự án gồm hai phần độc lập `frontend/` và `backend/` tương tự như cấu trúc hiện tại của dự án:
```
web-app-project/
├── backend/
│   ├── src/ (config, controllers, models, routes, middleware, services, app.js, server.js)
│   └── package.json
├── frontend/
│   ├── src/ (components, pages, services, styles, App.jsx, main.jsx)
│   └── package.json
```

**Hành động của nhóm:** Nhóm thống nhất loại bỏ phương án C# cũ, chuyển hoàn toàn sang Node.js + React. AI hỗ trợ tạo cấu trúc Boilerplate giúp team tiết kiệm được khoảng 3 tiếng thiết lập ban đầu.

---

## 👥 Session 3 — Soạn Thảo Product Vision & Định Hướng MVP

*   **Ngày:** Tuần 1, Ngày 3
*   **Công cụ:** Claude.ai Web
*   **Mục tiêu:** Soạn thảo tuyên bố tầm nhìn sản phẩm chuyên nghiệp.

### 🔵 Prompt đã dùng:
```text
Tôi cần viết phần "Tuyên bố tầm nhìn sản phẩm" (Vision Statement) cho dự án CMC Truyện.
Ý tưởng cốt lõi là tạo một ứng dụng đọc truyện chữ cực sạch, không quảng cáo, tối ưu cho việc đọc lâu và ghi nhớ chương tự động. Đối tượng là sinh viên và dân văn phòng Việt Nam.
Hãy viết một đoạn tầm nhìn bằng tiếng Việt khoảng 3-4 câu ngắn gọn, súc tích, mang tính định hướng sản phẩm cao, tránh sử dụng các từ sáo rỗng như "cách mạng" hay "đột phá".
```

### 🟢 Phản hồi của AI:
AI đề xuất Vision Statement:
> *"CMC Truyện ra đời từ một triết lý đơn giản: đọc sách là một trải nghiệm cần sự tập trung tuyệt đối. Trong khi các nền tảng hiện tại biến nội dung thành công cụ hiển thị quảng cáo, chúng tôi đặt người đọc làm trọng tâm — xây dựng một không gian đọc sạch, tải nhanh và dễ dàng cá nhân hóa để độc giả hoàn toàn chìm đắm vào câu chữ."*

**Hành động của nhóm:** Nhóm đã đưa tuyên bố tầm nhìn này vào trực tiếp phần giới thiệu dự án trong file [`README.md`](../README.md).

---

## 📊 3. Tổng Kết Tuần 1

| Hạng mục | Kết quả |
| :--- | :--- |
| **Số Session tương tác AI** | 3 session lớn |
| **Tổng số prompt sử dụng** | 5 prompt |
| **Số lần điều chỉnh hướng đi** | 1 lần (Đổi từ C# sang JavaScript/Node.js stack) |
| **Ước tính thời gian tiết kiệm** | ~4-5 giờ thảo luận và viết tài liệu |

### Bài học kinh nghiệm:
*   Mô hình gợi ý vai trò (Persona prompting) của AI giúp định hình tài liệu hướng người dùng rất tốt.
*   Việc chuyển đổi công nghệ sang Node.js ở tuần 1 là quyết định then chốt giúp nhóm dễ dàng tích hợp Gemini API qua Vercel AI SDK ở các bước sau này mà không vấp phải các vấn đề về thư viện lỗi thời trên .NET.
