# AI summary và personalization

## Thành phần

| File | Trách nhiệm |
|---|---|
| `backend/src/services/aiService.js` | Provider fallback, prompt, timeout và memory cache |
| `backend/src/models/AISummary.js` | Cache summary trong PostgreSQL |
| `backend/src/controllers/readingHistoryController.js` | Summary, telemetry và recommendations |
| `backend/src/routes/chapterRoutes.js` | Route chapter summary |
| `backend/src/routes/aiRoutes.js` | Route recommendations |
| `frontend/src/components/AIChapterSummary.jsx` | UI summary |
| `frontend/src/components/RecommendedStories.jsx` | UI recommendation |

## Provider strategy

1. Nếu có `GROQ_API_KEY`, gọi Groq với `llama-3.1-8b-instant`.
2. Nếu Groq không khả dụng và có `GEMINI_API_KEY`, gọi Gemini.
3. Mỗi request có timeout 30 giây.
4. Response rỗng hoặc sai định dạng được coi là lỗi.

Model/provider có thể thay đổi theo cấu hình và code; không hard-code model name ở frontend.

## Cache

AI service dùng key SHA-256 rút gọn theo loại và nội dung đầu vào. Cache RAM giảm request lặp trong cùng process. Summary chapter được lưu thêm ở `ai_summaries`, vì vậy tồn tại qua restart.

Giới hạn hiện tại: cache RAM không chia sẻ giữa nhiều API instance. Nếu scale horizontal, nên bổ sung Redis cache có TTL và prompt-version trong cache key.

## Dữ liệu personalization

Nguồn tín hiệu chính:

- `reading_history`: lần đọc gần nhất, thời gian và completion.
- `user_chapter_reads`: tập chương đã đọc.
- `user_follows`: sở thích chủ động.
- `stories`, `tags`, `story_tags`: metadata ứng viên.

Backend chịu trách nhiệm lọc truyện không published/hidden trước khi trả kết quả.

## API

```http
GET /api/chapters/:id/summary
GET /api/ai/recommendations
Authorization: Bearer <token>
```

Recommendation yêu cầu authentication. Quyền cụ thể của summary phải được xác nhận từ route/controller hiện hành trước khi thay đổi sản phẩm.

## Privacy và safety

- Không đưa JWT, password, OTP, email hoặc service key vào prompt.
- Không log nguyên văn chapter/user profile ở production.
- Chỉ gửi dữ liệu cần thiết cho mục đích summary/recommendation.
- AI output là nội dung tham khảo, phải được escape/render như text an toàn.
- Provider failure không được làm hỏng luồng đọc chương.

## Observability đề xuất

Ghi metric, không ghi nội dung prompt:

- `provider`, `operation`, `cache_hit`.
- latency và timeout count.
- fallback count.
- token/cost nếu provider cung cấp.
- error category đã loại secret.

## Kiểm thử

- Mock Axios/provider; không gọi API thật trong unit test.
- Test cache hit không gọi provider lần hai.
- Test Groq failure chuyển sang Gemini.
- Test cả hai provider lỗi trả error có kiểm soát.
- Test recommendation không trả draft/hidden story.
- Test payload lớn và timeout.

Xem phạm vi sản phẩm tại [AI_FEATURE_PROPOSAL](../product/AI_FEATURE_PROPOSAL.md).
