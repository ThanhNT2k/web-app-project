# Hệ Thống Cá Nhân Hóa AI & Telemetry - CMC Truyện (AI_PERSONALIZATION.md)

Tài liệu này đặc tả chi tiết kiến trúc, cơ chế thu thập dữ liệu hành vi người dùng (Telemetry) và giải pháp tích hợp AI Gemini trong CMC Truyện.

---

## 🧠 1. Kiến Trúc AI Engine

Hệ thống tận dụng **Vercel AI SDK** kết hợp trực tiếp với **Google Gemini API** tại phía Backend để xử lý dữ liệu và ép dữ liệu đầu ra theo cấu trúc chuẩn (Structured Outputs).

*   **Core Model:** `gemini-1.5-flash` (tối ưu hóa về tốc độ phản hồi, chi phí API thấp và hỗ trợ ngữ cảnh rộng).
*   **SDK tích hợp:** `@ai-sdk/google` dùng hàm `generateObject` để ép dữ liệu trả về kiểu JSON type-safe mà không cần parse thủ công.

---

## 📊 2. Luồng Khai Thác Dữ Liệu Hành Vi (Telemetry Flow)

Hệ thống ngầm ghi nhận hoạt động đọc truyện của người dùng (chỉ áp dụng đối với nhóm tài khoản có quyền `User` và `Uploader`) thông qua các Client-side Triggers để cập nhật cơ sở dữ liệu `reading_history`:

### A. Tương tác chủ động (Explicit Signals)
*   **Hành động:** Người dùng bấm "Theo dõi" (Follow) bộ truyện.
*   **Xử lý:** Hệ thống tự động phân tách danh sách các thể loại (`categories`) từ các bộ truyện đã theo dõi để tạo hồ sơ sở thích thô của người dùng.

### B. Hành vi ngầm (Implicit Signals)
Hệ thống sử dụng các phép đo sâu để đánh giá mức độ yêu thích thực sự của người dùng:
1.  **Dwell Time (Thời gian ở lại trang đọc):**
    *   Client-side trên giao diện đọc (`Chapter Page`) gửi tín hiệu Heartbeat (định kỳ mỗi 30 giây) về API để tính thời gian thực tế user đọc chương truyện.
    *   *Loại trừ treo máy:* Nếu không có hành vi cuộn trang hoặc tương tác chuột quá 2 phút, Client-side tự động dừng gửi Heartbeat để tránh sai số Dwell Time.
2.  **Tần suất mở truyện (Access Frequency):**
    *   Đếm số lần người dùng truy cập vào một bộ truyện trong tuần hoặc tháng.
3.  **Tỷ lệ hoàn thành (Completion Rate):**
    *   Được tính theo công thức:
        $$\text{Completion Rate} = \frac{\text{Số chương đã đọc}}{\text{Tổng số chương hiện có}}$$
    *   Nếu tỷ lệ hoàn thành thấp và thời gian cập nhật lần cuối đã quá lâu, hệ thống sẽ đánh dấu bộ truyện này có nguy cơ cao bị người dùng bỏ dở ("Drop").

---

## 🤖 3. Gọi Gemini API & Cấu Trúc Đề Xuất

Khi người dùng truy cập trang chủ hoặc mục gợi ý, API `/api/recommendations/personalized` được kích hoạt:

```
[Telemetry DB] ──> [Gộp dữ liệu người dùng & danh sách truyện] ──> [Gọi Gemini (Structured Output)] ──> [Hiển thị React UI]
```

### A. Định nghĩa Prompt nội bộ
Hệ thống gộp lịch sử đọc và danh sách truyện khả dụng thành ngữ cảnh gửi cho Gemini:

```text
Bạn là một chuyên gia gợi ý truyện online. Dựa trên lịch sử đọc của người dùng dưới đây:
${JSON.stringify(userHistory)}

Và danh sách các truyện hot/mới hiện có trong hệ thống:
${JSON.stringify(availableStories)}

Hãy phân tích gu đọc truyện của người dùng (xu hướng thể loại, độ dài ưa thích, tác giả). Sau đó, hãy chọn ra tối đa 5 bộ truyện phù hợp nhất từ danh sách truyện hiện có. Trả về kết quả theo cấu trúc JSON được yêu cầu, bao gồm lý do gợi ý ngắn gọn cho từng bộ truyện.
```

### B. Bắt buộc định dạng dữ liệu (Structured Outputs via Zod Schema)
Chúng ta định nghĩa cấu trúc dữ liệu mong muốn bằng thư viện `zod` để ép Gemini API chỉ trả về dữ liệu tương thích hoàn hảo với TypeScript/JavaScript:

```typescript
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function getAIPersonalization(userId: string) {
  // 1. Thu thập Telemetry của User
  const contextData = await fetchUserTelemetry(userId);
  const availableStories = await getActiveStoriesList();
  
  // 2. Gọi Gemini API qua Vercel AI SDK
  const { object } = await generateObject({
    model: google('models/gemini-1.5-flash'),
    schema: z.object({
      recommendedStories: z.array(z.object({
        storyId: z.string().describe('ID của truyện được gợi ý'),
        reason: z.string().describe('Lý do gợi ý ngắn gọn bằng tiếng Việt hiển thị cho user'),
        matchScore: z.number().min(0).max(100).describe('Độ tương thích tính theo %')
      })),
      userPersonaAnalysis: z.string().describe('Phân tích ngắn gọn về gu đọc của người dùng bằng tiếng Việt')
    }),
    prompt: `Dữ liệu lịch sử: ${JSON.stringify(contextData)}. Truyện khả dụng: ${JSON.stringify(availableStories)}`,
  });

  return object;
}
```

---

## 💾 4. Tối Ưu Chi Phí & Caching (Cost Optimization)

Để kiểm soát hóa đơn sử dụng API và tránh quá tải rate-limit của Google Gemini API:
1.  **AI Summary Caching:** Bản tóm tắt chương sau khi được tạo ra lần đầu sẽ được lưu trữ vào bảng `ai_summaries` trong cơ sở dữ liệu. Mọi lượt truy cập sau đó của tất cả người đọc vào chương đó sẽ lấy trực tiếp bản tóm tắt từ database mà không cần gọi lại Gemini API.
2.  **Giới hạn quyền truy cập:** Khách vãng lai (`Guest`) sẽ không kích hoạt luồng Telemetry cũng như gợi ý cá nhân hóa nhằm tiết kiệm tài nguyên API.
3.  **Tần suất chạy ngầm:** Bản phân tích xu hướng đọc chỉ chạy khi người dùng có lịch sử đọc mới hoặc sau mỗi 24 giờ kể từ phiên cập nhật cuối cùng, kết quả phân tích được lưu trữ tạm thời trong session.
