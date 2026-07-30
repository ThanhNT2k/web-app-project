# Ma trận kiểm thử toàn dự án

Tài liệu này ánh xạ các nhóm rủi ro chính sang test tự động. Các test mặc định
không phụ thuộc database, Redis, Supabase hoặc email thật; các dependency được
mock để kết quả CI ổn định.

| Nhóm | Phạm vi đã tự động hóa | Suite chính |
|---|---|---|
| Đăng nhập | Đúng/sai credentials, Unicode full-width, sai email, DB lỗi, không lộ hash | `authController.login.test.js` |
| Đăng ký | Email/username/password sai, trùng username/email, chống gán role, không trả password | `authController.account.test.js` |
| OTP/reset password | Enumeration, email lỗi, OTP sai/hết hạn, password yếu/không khớp, dọn OTP | `authController.account.test.js`, `otpService.test.js` |
| Auth/RBAC | Token thiếu/hợp lệ, optional auth, role không đủ, audit không chứa credentials | `authMiddleware.test.js`, `roleMiddleware.test.js`, `auditMiddleware.test.js` |
| Upload truyện | UTF-8/UTF-16, thiếu tệp, sai extension/MIME, quá 25 MB, quyền, moderation, DB lỗi | `uploadStoryFile.test.js`, `chapterController.upload.test.js` |
| Upload ảnh | JPG/PNG/WebP, script/text giả file, giới hạn 5 MB | `uploadCover.test.js` |
| Workflow truyện | Pending trước khi duyệt, duplicate chapter, tách uploader/tác giả, preview | `storyWorkflow.test.js` |
| Tìm kiếm | Kết hợp query/category/tag/page, chuỗi đặc biệt kiểu injection, kết quả rỗng, ẩn draft | `storyDiscoveryRating.test.js` |
| Follow | Guest, ID sai/âm, follow/unfollow lặp và rollback giao diện | `socialInteractions.test.js`, `FollowButton.test.jsx` |
| Bình luận | Rỗng/quá dài/rating sai, parent khác thread, vote sai, quyền xóa | `socialInteractions.test.js` |
| Rating | Ngoài 1–5, số thập phân, upsert và chỉ xóa rating của chính user | `storyDiscoveryRating.test.js` |
| Report/moderation | Spam, target, comment action, status/filter, lý do xử lý | `reportController.test.js`, `moderatorController.test.js` |
| Ví/chương trả phí | Chương miễn phí, thiếu tiền, mở khóa, request đồng thời/idempotent, che lỗi DB | `chapterUnlock.test.js` |
| Frontend | Route guard, login loading/double-submit/error/role, password UI, optimistic rollback | các test trong `frontend/src` |
| E2E | Login đúng/sai/mất mạng/admin, tìm kiếm và đọc chương | `tests/e2e/main-flows.spec.js` |
| Hiệu năng | Parse tệp 1.000 chương dưới ngân sách thời gian | `storyFileImportService.performance.test.js` |

## Lệnh chạy

```bash
npm test
npm run test:e2e
npm run test:security
npm run test:performance
npm run test:all
```

## Kiểm thử cần môi trường chuyên dụng

Các mục sau không nên giả vờ là unit test và không nằm trong pipeline mặc định:

- Load/stress với hàng trăm người dùng đồng thời: chạy k6/Artillery trên staging.
- Redis, PostgreSQL, Supabase và dịch vụ email thật: chạy integration test trong
  Docker/staging với credentials test tách biệt.
- Kiểm tra CORS/TLS/WAF và rate limit phân tán: chạy trên deployment staging.
- Accessibility toàn trang: chạy axe/Playwright và kiểm tra thủ công bằng screen
  reader, bàn phím, light/dark mode trên các breakpoint.
- Kiểm tra zip bomb/EPUB cực lớn: chạy trong job cô lập có memory/time limit.

Một test chuyên dụng chỉ được đánh dấu đạt khi môi trường tương ứng được cung cấp;
không ghi “Đạt” dựa trên mock cho hành vi của hạ tầng thật.
