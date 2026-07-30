# Bảng test case chức năng upload truyện

Luồng đúng của hệ thống là: Uploader tạo metadata truyện, chờ Moderator duyệt,
sau đó preview/import nội dung chương từ tệp `.txt`, `.md` hoặc `.epub`. Giới hạn
kích thước tệp là 25 MB.

| STT | Test case | Input | Output | Kết quả mong muốn | Kết quả nhận được |
|---:|---|---|---|---|---|
| 1 | Upload tệp TXT hợp lệ vào truyện đã duyệt | Uploader là chủ sở hữu; `truyen.txt`, UTF-8; truyện `approved` | HTTP `201`, `imported_count: 1`, `next_chapter_number: 2` | Tạo chương đúng nội dung và số thứ tự | Tạo 1 chương, số tiếp theo là 2 — **Đạt** |
| 2 | Upload tệp dùng font/mã hóa UTF-16 LE có dấu tiếng Việt | `truyen.txt` có BOM UTF-16 LE và nội dung `Tiếng Việt` | HTTP `200` khi preview, chữ tiếng Việt đúng | Đọc đúng mã hóa, không lỗi font | Tiêu đề và nội dung tiếng Việt giữ nguyên — **Đạt** |
| 3 | Không chọn tệp | Request không có multipart field `file` | HTTP `400`, không tạo chương | Báo thiếu tệp rõ ràng | HTTP `400`, batch insert không được gọi — **Đạt** |
| 4 | Tệp không có nội dung đọc được | `truyen.txt` chỉ chứa byte rỗng/không hợp lệ | HTTP `400`, `success: false` | Không import dữ liệu rác | HTTP `400`, không tạo chương — **Đạt** |
| 5 | Sai đuôi tệp | `truyen.exe`, MIME `application/octet-stream` | HTTP `400`, thông báo chỉ nhận `.txt`, `.md`, `.epub` | Middleware chặn trước controller | HTTP `400`, thông báo đúng loại tệp hỗ trợ — **Đạt** |
| 6 | Đuôi đúng nhưng sai định dạng MIME | `truyen.txt`, MIME `image/png` | HTTP `400`, định dạng không hợp lệ | Không tin riêng phần mở rộng tệp | HTTP `400`, middleware từ chối MIME — **Đạt** |
| 7 | Tệp vượt kích thước | `truyen.txt`, lớn hơn 25 MB | HTTP `400`, mã `LIMIT_FILE_SIZE` | Không nhận tệp quá giới hạn | HTTP `400`, `LIMIT_FILE_SIZE` — **Đạt** |
| 8 | Chưa đăng nhập | Không có `req.user` | HTTP `401`, không đọc/import tệp | Yêu cầu đăng nhập | HTTP `401`, không truy vấn truyện — **Đạt** |
| 9 | Uploader không sở hữu/không cộng tác | User `99` upload vào truyện của user `7` | HTTP `403`, không tạo chương | Chặn truy cập trái phép | HTTP `403`, không tạo chương — **Đạt** |
| 10 | Truyện chưa được Moderator duyệt | Truyện `pending`, `is_published: false` | HTTP `409`, không tạo chương | Chỉ cho import sau khi duyệt | HTTP `409`, không tạo chương — **Đạt** |
| 11 | Database không chạy khi import | Tệp hợp lệ; DB báo `Database unavailable` | HTTP `500`, `success: false`, không báo thành công | Phản hồi lỗi hệ thống và không trả kết quả giả | HTTP `500`, message `Database unavailable` — **Đạt** |

## Cách chạy

```bash
npm test --prefix backend -- src/middleware/uploadStoryFile.test.js src/controllers/chapterController.upload.test.js --runInBand
```

Hai tệp test này cũng được đưa vào bộ test backend chuẩn:

```bash
npm run test:backend
```

Nếu Jest không chạy được, lệnh trả mã thoát khác `0` và in test lỗi cùng stack
trace. Nếu ứng dụng chạy nhưng database/import service gặp lỗi, API phải trả
HTTP `500` với `success: false`; tuyệt đối không trả số chương đã import thành công.
