# Hệ Thống Cá Nhân Hóa AI & Telemetry — CMC Truyện (AI_PERSONALIZATION.md)

---

## 🧠 1. Kiến Trúc AI Engine

Hệ thống CMC Truyện tích hợp AI để giải quyết hai nhu cầu chính: **Tóm tắt chương** và **Gợi ý truyện cá nhân hóa**.

*   **Groq API (Ưu tiên chính):** Sử dụng mô hình `llama-3.1-8b-instant` nhờ tốc độ phản hồi cực nhanh (<2 giây) và độ chính xác cao đối với việc xử lý cấu trúc dữ liệu JSON.
*   **Google Gemini API (Dự phòng):** Sử dụng mô hình `gemini-1.5-flash` làm phương án dự phòng khi Groq gặp lỗi hoặc hết hạn mức (rate limit).
*   **Tích hợp:** Cả hai dịch vụ đều được gọi trực tiếp bằng các yêu cầu HTTP qua **Axios** từ phía Backend thay vì sử dụng SDK nặng nề.

---

## 📊 2. Cơ Chế Thu Thập Dữ Liệu Hành Vi (Telemetry)

Dữ liệu hành vi đọc của tài khoản `User` được ngầm ghi nhận thông qua các tín hiệu từ Client để phục vụ cho thuật toán gợi ý:

1.  **Dwell Time (Thời gian đọc thực tế):**
    *   Trang đọc chương truyện (`ChapterReaderPage.jsx`) gửi tín hiệu Heartbeat định kỳ mỗi **30 giây** về endpoint `/api/reading-history` để tích lũy tổng thời gian đọc (`total_read_time`).
    *   *Chặn treo máy:* Nếu người dùng không cuộn trang hoặc không di chuyển chuột quá 2 phút, client sẽ tạm dừng gửi Heartbeat.
2.  **Tỷ lệ hoàn thành (Completion Rate):**
    *   Công thức: $\text{Completion Rate} = \text{Số chương đã đọc} / \text{Tổng số chương của bộ truyện}$.
3.  **Tín hiệu chủ động (Explicit Signals):**
    *   Hành động nhấn theo dõi truyện (`user_follows`) thể hiện rõ nhất gu đọc của người dùng.

---

## 🤖 3. Quy Trình Gọi AI & Phân Tích Đề Xuất

Khi người dùng kích hoạt API gợi ý `/api/ai/recommendations`:
1.  Backend truy vấn thông tin lịch sử đọc và các thể loại quan tâm của người dùng.
2.  Gộp dữ liệu thành prompt gửi đến AI yêu cầu phân tích gu đọc và đề xuất danh sách ID truyện dạng JSON Array.
3.  Sử dụng biểu thức chính quy (Regex) để trích xuất mảng JSON ID truyện và trả về kết quả cho Client.

### Minh Họa Code Xử Lý Gọi AI & Trích Xuất (Rút gọn từ `aiService.js`)
```javascript
// backend/src/services/aiService.js (tóm tắt)
async function callAI(prompt) {
  if (env.GROQ_API_KEY) {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    }, { headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` } });
    return response.data?.choices?.[0]?.message?.content;
  }
  // Fallback sang Gemini
  if (env.GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    }, { params: { key: env.GEMINI_API_KEY } });
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  }
}

async function generatePersonalRecommendations(userReadingHistory) {
  const prompt = `Dựa trên lịch sử đọc này, hãy trả về CHÍNH XÁC 5 số nguyên là ID truyện được đề xuất (chỉ trả về JSON array, ví dụ [1,2,3,4,5]): \n${JSON.stringify(userReadingHistory)}`;
  const text = await callAI(prompt);
  const match = text.match(/\[[\d,\s]+\]/); // Trích xuất mảng JSON ID truyện bằng Regex
  return match ? JSON.parse(match[0]) : [];
}
```

---

## 💾 4. Tối Ưu Hóa Bộ Nhớ & Caching

Nhằm tiết kiệm số lượt gọi API (giảm chi phí và tránh lỗi Rate Limit):
1.  **RAM Cache (In-memory Cache):** Sử dụng `Map` lưu trữ tạm thời các bản tóm tắt chương hoặc kết quả gợi ý trong RAM với thời gian sống (TTL) mặc định là **1 giờ**.
2.  **Database Cache (Bảng `ai_summaries`):** Các bản tóm tắt chương (`ai_summaries`) sau khi sinh ra lần đầu tiên sẽ được ghi trực tiếp vào PostgreSQL. Các người đọc sau khi mở chương này sẽ lấy trực tiếp từ database mà không cần kích hoạt gọi AI.
3.  **Hạn chế đối tượng:** Tính năng gợi ý cá nhân hóa không áp dụng cho khách vãng lai (`Guest`).
