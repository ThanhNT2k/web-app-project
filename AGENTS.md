# Hệ Thống Cá Nhân Hóa Bằng AI (AI Personalization Subsystem)

Tài liệu này đặc tả chi tiết kiến trúc, luồng dữ liệu và giải pháp tích hợp AI/Agent trong hệ thống Đọc Truyện Online phiên bản Next.js & Node.js runtime.

## 🧠 Kiến Trúc AI Engine
Thay vì sử dụng các framework nặng nề của C# như Semantic Kernel, hệ thống tận dụng **Vercel AI SDK** kết hợp trực tiếp với **Google Gemini API**. Sự kết hợp này mang lại khả năng xử lý bất đồng bộ cực nhanh và ép mô hình xuất dữ liệu theo định dạng JSON có cấu trúc (Structured Outputs).

### Công Nghệ Cốt Lõi
- **Core Model:** `gemini-1.5-flash` (Tối ưu hóa về mặt chi phí, tốc độ phản hồi và ngữ cảnh rộng).
- **Integration SDK:** `@ai-sdk/google` (Vercel AI SDK) để quản lý luồng dữ liệu, sinh cấu trúc và tối ưu prompt.

---

## 📊 1. Luồng Khai Thác Dữ Liệu Người Dùng (Telemetry)

Hệ thống ngầm ghi nhận hoạt động của người dùng (chỉ áp dụng đối với nhóm quyền `User` và `Uploader`) thông qua các Client-side Triggers và lưu trữ vào bảng `reading_history`:

1. **Tương tác chủ động (Explicit Signals):**
   - Sự kiện người dùng nhấn "Theo dõi" (Follow) một bộ truyện.
   - Hệ thống tự động phân tách danh sách các thể loại (`categories`) từ các bộ truyện đã follow để tạo hồ sơ sở thích thô.

2. **Hành vi chuyên sâu (Implicit Signals):**
   - **Tần suất mở truyện:** Đếm số lần user truy cập vào một bộ truyện trong tuần/tháng.
   - **Thời gian ở lại (Dwell Time):** Gửi heartbeat định kỳ từ giao diện đọc (`Chapter Page`) về server để tính toán thời gian thực tế user đọc một chương truyện (loại trừ thời gian treo máy).
   - **Tỷ lệ hoàn thành (Completion Rate):** Tính toán bằng công thức: `Số chương đã đọc / Tổng số chương hiện có`. Nếu tỷ lệ thấp và thời gian cập nhật cuối cùng đã lâu, hệ thống đánh dấu bộ truyện đó có nguy cơ bị người dùng "Drop".

---

## 🤖 2. Giải Pháp Tích Hợp AI & Cấu Trúc Agent Backend

Quá trình phân tích và gợi ý được thực hiện hoàn toàn ở phía Backend thông qua Next.js Server Actions hoặc API Routes (`/api/ai`), đảm bảo an toàn cho `GEMINI_API_KEY`.

### Quy Trình Xử Lý 3 Bước:

#### Bước 1: Thu Thập & Đóng Gói Ngữ Cảnh (Context Aggregation)
Khi người dùng truy cập Trang chủ, một Server Action mang tên `getAIPersonalization` được kích hoạt:
- Hệ thống truy vấn bảng `reading_history` và `follows` của `user_id` hiện tại.
- Dữ liệu thô được gộp lại thành một cấu trúc JSON thu gọn chứa: Danh sách truyện vừa đọc, thời gian đọc, thể loại yêu thích nhất, và các truyện đã follow.

#### Bước 2: Kỹ Nghệ Prompt & Gọi Gemini API
Hệ thống sử dụng hàm `generateObject` từ Vercel AI SDK để ép Gemini trả về định dạng chính xác. 

**Mẫu Prompt Nội Bộ Hệ Thống:**
```text
Bạn là một chuyên gia gợi ý truyện online. Dựa trên lịch sử đọc của người dùng dưới đây:
${JSON.stringify(userHistory)}

Và danh sách các truyện hot/mới hiện có trong hệ thống:
${JSON.stringify(availableStories)}

Hãy phân tích gu đọc truyện của người dùng (xu hướng thể loại, độ dài ưa thích, tác giả). Sau đó, hãy chọn ra tối đa 5 bộ truyện phù hợp nhất từ danh sách truyện hiện có. Trả về kết quả theo cấu trúc JSON được yêu cầu, bao gồm lý do gợi ý ngắn gọn cho từng bộ truyện.
```

#### Bước 3: Trả Kết Quả Định Dạng JSON Có Cấu Trúc
Nhờ Vercel AI SDK và Gemini hỗ trợ Structured Outputs, dữ liệu trả về từ API có dạng Type-safe, không cần `try-catch` để `JSON.parse` chuỗi văn bản thuần túy:

```typescript
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function getAIPersonalization(userId: string) {
  // 1. Lấy dữ liệu từ DB (Prisma/Supabase)
  const contextData = await fetchUserTelemetry(userId);
  
  // 2. Gọi Gemini API thông qua Vercel AI SDK
  const { object } = await generateObject({
    model: google('models/gemini-1.5-flash'),
    schema: z.object({
      recommendedStories: z.array(z.object({
        storyId: z.string(),
        reason: z.string().describe('Lý do gợi ý ngắn gọn bằng tiếng Việt hiển thị cho user'),
        matchScore: z.number().min(0).max(100).describe('Độ tương thích (%)')
      })),
      userPersonaAnalysis: z.string().describe('Phân tích ngắn gọn về gu đọc của người dùng')
    }),
    prompt: `...`,
  });

  return object;
}
```

---

## 🧪 3. Kịch Bản Kiểm Thử Tự Động (E2E Tests)
Toàn bộ luồng Telemetry và gọi AI gợi ý được bảo vệ bằng các kịch bản kiểm thử tự động nằm trong thư mục `/tests/playwright`:
- **Test Phân Quyền:** Đảm bảo `Guest` không kích hoạt luồng gọi AI (tránh tốn chi phí API); đảm bảo `User` chỉ thấy dữ liệu cá nhân hóa của riêng họ.
- **Test Mock AI Response:** Giả lập các phản hồi JSON từ Gemini API để kiểm tra khả năng render giao diện mượt mà của `Homepage` khi có kết quả trả về.
