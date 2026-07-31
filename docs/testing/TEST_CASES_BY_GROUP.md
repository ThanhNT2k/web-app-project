# Bảng test case theo nhóm chức năng

Kết quả thực tế trong tài liệu được tổng hợp từ các bộ Jest, Vitest và
Playwright đã chạy thành công. Quy ước:

- **Đạt**: kết quả nhận được trùng với kết quả mong muốn.
- HTTP `4xx`: lỗi từ dữ liệu đầu vào, xác thực hoặc phân quyền.
- HTTP `5xx`: lỗi dịch vụ hoặc lỗi hệ thống.

## Nhóm 1 — Đăng nhập/đăng ký

| STT | Test Case | Input | Output | Kết quả mong muốn | Kết quả thực tế |
|---:|---|---|---|---|---|
| 1 | Đăng nhập đúng tài khoản | Email `reader@example.com`, password `Password1!` | HTTP `200`, JWT và user | Đăng nhập thành công; response không chứa password | HTTP `200`, có token, password đã bị loại bỏ — **Đạt** |
| 2 | Đúng email, sai mật khẩu | Email hợp lệ, password `WrongPassword1!` | HTTP `401`, `Email hoặc mật khẩu không chính xác.` | Không cấp token | HTTP `401`, UI hiển thị thông báo tiếng Việt — **Đạt** |
| 3 | Sai email, đúng mật khẩu | Email `unknown@example.com`, password hợp lệ của tài khoản khác | HTTP `401`, `Email hoặc mật khẩu không chính xác.` | Không đăng nhập và không tiết lộ email tồn tại hay không | HTTP `401`, cùng thông báo tiếng Việt — **Đạt** |
| 4 | Email đăng nhập sai định dạng | `reader-at-example.com` | HTTP `400`, `Email không đúng định dạng.` | Chặn trước khi truy vấn database | HTTP `400`, lỗi hiển thị bằng tiếng Việt — **Đạt** |
| 5 | Email dùng ký tự Unicode full-width | `ｒｅａｄｅｒ＠ｅｘａｍｐｌｅ．ｃｏｍ` | HTTP `400`, `Dữ liệu đầu vào không hợp lệ.` | Không chấp nhận định dạng ký tự sai | HTTP `400`, không truy vấn user — **Đạt** |
| 6 | Database lỗi khi đăng nhập | Credentials hợp lệ; DB không khả dụng | HTTP `500`, `Hệ thống đang gặp sự cố. Vui lòng thử lại sau.` | Không cấp token và không lộ lỗi nội bộ | HTTP `500`, thông báo chung bằng tiếng Việt — **Đạt** |
| 7 | Đăng ký hợp lệ | Username `Reader_01`, email hợp lệ, password mạnh | HTTP `201`, token và user role `User` | Tạo tài khoản, hash password, không trả hash | Tạo user role `User`, response không có password — **Đạt** |
| 8 | Username đã tồn tại | Username trùng tài khoản hiện có | HTTP `409` | Không kiểm tra/tạo tiếp bằng email | HTTP `409`, không gọi tạo user — **Đạt** |
| 9 | Email đã tồn tại | Username mới, email trùng | HTTP `409` | Không tạo tài khoản trùng | HTTP `409`, không gọi tạo user — **Đạt** |
| 10 | Username sai định dạng | Username có dấu hoặc khoảng trắng | HTTP `400`, `Dữ liệu đầu vào không hợp lệ.` | Chỉ nhận chữ không dấu, số, `_`, `-` | HTTP `400`, thông báo tiếng Việt — **Đạt** |
| 11 | Mật khẩu đăng ký yếu | `password` | HTTP `400`, thông báo tiêu chí mật khẩu bằng tiếng Việt | Yêu cầu tối thiểu 8 ký tự, chữ hoa, số và ký tự đặc biệt | HTTP `400`, không tạo user — **Đạt** |
| 12 | Chèn role qua request đăng ký | Payload thêm `role: Admin`, `is_active: false` | User được tạo với role `User` | Chống mass assignment | Field lạ bị loại bỏ, role vẫn là `User` — **Đạt** |
| 13 | Quên mật khẩu với email tồn tại/không tồn tại | Hai email có trạng thái khác nhau | Cùng HTTP `200` và cùng message | Chống dò tìm email tài khoản | Hai response giống nhau — **Đạt** |
| 14 | OTP sai hoặc hết hạn | OTP `000000` không hợp lệ | HTTP `400` | Không cho reset password | HTTP `400`, không cập nhật password — **Đạt** |
| 15 | Reset khi chưa xác thực OTP | Password mới hợp lệ nhưng OTP chưa verified | HTTP `403` | Bắt buộc xác thực OTP | HTTP `403`, không cập nhật password — **Đạt** |
| 16 | Reset password thành công | OTP verified; password mạnh và xác nhận khớp | HTTP `200` | Hash password mới và xóa OTP đã dùng | Password được cập nhật, OTP keys được xóa — **Đạt** |
| 17 | Gửi form login hai lần | Double-click nút đăng nhập khi request đang xử lý | Chỉ một request; nút disabled | Không tạo request đăng nhập trùng | Hàm login chỉ được gọi một lần — **Đạt** |
| 18 | Mất mạng khi đăng nhập | API login bị ngắt kết nối | UI giữ nguyên `/login` và hiện lỗi an toàn | Cho phép người dùng thử lại, không crash | Alert lỗi hiển thị, không chuyển trang — **Đạt** |

## Nhóm 2 — Upload truyện, workflow truyện, Moderation

| STT | Test Case | Input | Output | Kết quả mong muốn | Kết quả thực tế |
|---:|---|---|---|---|---|
| 1 | Upload TXT UTF-8 hợp lệ | Truyện đã duyệt; `truyen.txt`; Uploader là chủ sở hữu | HTTP `201`, `imported_count: 1` | Tạo đúng chương và số chương kế tiếp | Tạo 1 chương, `next_chapter_number: 2` — **Đạt** |
| 2 | Upload nội dung UTF-16 LE tiếng Việt | TXT có BOM UTF-16 LE | HTTP `200` khi preview | Không lỗi font hoặc mất dấu | Tiêu đề/nội dung tiếng Việt giữ nguyên — **Đạt** |
| 3 | Không chọn file | Request không có field `file` | HTTP `400` | Không tạo chương, báo thiếu file | HTTP `400`, batch insert không được gọi — **Đạt** |
| 4 | File không có nội dung đọc được | TXT chỉ chứa byte NUL | HTTP `400`, `success: false` | Không import dữ liệu rác | HTTP `400`, không tạo chương — **Đạt** |
| 5 | Sai đuôi file | `truyen.exe` | HTTP `400` | Chỉ chấp nhận `.txt`, `.md`, `.epub` | Middleware từ chối file — **Đạt** |
| 6 | Đuôi đúng nhưng MIME sai | `truyen.txt`, MIME `image/png` | HTTP `400` | Kiểm tra cả extension và MIME | Middleware trả lỗi định dạng — **Đạt** |
| 7 | File vượt 25 MB | TXT có kích thước `25 MB + 1 byte` | HTTP `400`, `LIMIT_FILE_SIZE` | Chặn file quá giới hạn | Nhận đúng mã `LIMIT_FILE_SIZE` — **Đạt** |
| 8 | Chưa đăng nhập khi import | Không có `req.user` | HTTP `401` | Yêu cầu xác thực | HTTP `401`, không truy vấn truyện — **Đạt** |
| 9 | Uploader không sở hữu truyện | User `99` import vào truyện của user `7` | HTTP `403` | Chỉ owner/collaborator/Admin được thao tác | HTTP `403`, không tạo chương — **Đạt** |
| 10 | Import khi truyện chưa duyệt | Truyện `pending`, chưa publish | HTTP `409` | Chỉ import sau khi Moderator duyệt | HTTP `409`, không tạo chương — **Đạt** |
| 11 | Database lỗi khi import | File hợp lệ; DB báo `Database unavailable` | HTTP `500`, `success: false` | Không trả số chương thành công giả | HTTP `500`, không trả success — **Đạt** |
| 12 | Tạo truyện mới | Metadata hợp lệ từ Uploader | HTTP `201`; truyện ở workflow chờ duyệt | Lưu uploader và tên tác giả riêng biệt | `author_id` và `author_name` được lưu đúng — **Đạt** |
| 13 | Thêm chương trước khi truyện được duyệt | Truyện `pending` | HTTP `409` | Không cho thêm chương | HTTP `409`, model tạo chương không được gọi — **Đạt** |
| 14 | Số chương bị trùng | Chapter number đã tồn tại | HTTP `409`, `CHAPTER_NUMBER_EXISTS` | Không trả lỗi máy chủ chung chung | HTTP `409`, đúng mã nghiệp vụ — **Đạt** |
| 15 | Uploader tự publish truyện | Uploader gọi toggle visibility | HTTP `403` | Việc xuất bản phải qua Moderator/Admin | HTTP `403`, không cập nhật truyện — **Đạt** |
| 16 | Preview file truyện | TXT có heading chương | HTTP `200`, danh sách preview | Preview không tạo dữ liệu chương | Có preview, `Chapter.createChapter` không được gọi — **Đạt** |
| 17 | Moderator duyệt truyện pending | Story đang trong moderation queue | HTTP `200` | Chuyển trạng thái đúng và publish | Truyện được duyệt theo workflow — **Đạt** |
| 18 | Moderator yêu cầu sửa có lý do | Action request changes và reason hợp lệ | HTTP thành công, có notification | Lưu lý do và thông báo Uploader | Trạng thái và notification được cập nhật — **Đạt** |
| 19 | Moderator yêu cầu sửa thiếu lý do | Action request changes, reason rỗng | HTTP `400` | Bắt buộc có lý do | HTTP `400`, không cập nhật truyện — **Đạt** |
| 20 | Moderator lọc bình luận | Status/search/page/limit | Danh sách và global status counts | Lọc đúng nhưng count vẫn phản ánh toàn hệ thống | Kết quả lọc và counts đúng — **Đạt** |
| 21 | Xử lý report avatar | Report avatar gắn với user bị báo cáo | HTTP thành công | Cập nhật đúng boolean/status, không nhầm enum | Tham số cập nhật tách biệt đúng — **Đạt** |

## Nhóm 3 — Chức năng người dùng

| STT | Test Case | Input | Output | Kết quả mong muốn | Kết quả thực tế |
|---:|---|---|---|---|---|
| 1 | Upload avatar JPG/PNG/WebP | File nhỏ hơn hoặc bằng 5 MB, MIME ảnh | HTTP `200` qua middleware | Chấp nhận các ảnh hợp lệ | Cả JPG, PNG, WebP đều được nhận — **Đạt** |
| 2 | Upload file script giả avatar | `../attack.svg`, MIME `text/html` | HTTP `400` | Không nhận nội dung không phải ảnh | Middleware từ chối — **Đạt** |
| 3 | Avatar vượt 5 MB | PNG có kích thước `5 MB + 1 byte` | HTTP `400`, `LIMIT_FILE_SIZE` | Chặn file quá lớn | Nhận đúng mã giới hạn — **Đạt** |
| 4 | Tìm kiếm kết hợp | Query có dấu/ký tự `%_'`, category, tag, page | HTTP `200`, stories và pagination | Truyền đúng bộ lọc, không crash vì chuỗi đặc biệt | Model nhận đúng tham số, HTTP `200` — **Đạt** |
| 5 | Tìm kiếm không có kết quả | Từ khóa không tồn tại | HTTP `200`, `stories: []` | Danh sách rỗng không phải lỗi | HTTP `200`, mảng rỗng — **Đạt** |
| 6 | Guest xem truyện nháp | Slug của truyện chưa publish | HTTP `404` | Không lộ nội dung chưa duyệt | HTTP `404` — **Đạt** |
| 7 | Guest kiểm tra follow | Không có user/token | HTTP `200`, `following: false` | Endpoint optional auth không trả `401` | HTTP `200`, `false` — **Đạt** |
| 8 | Follow/unfollow lặp | Gọi follow hai lần, unfollow hai lần | Các request thành công/idempotent | Không gây lỗi hoặc dữ liệu trùng | Controller xử lý các lần gọi ổn định — **Đạt** |
| 9 | Follow với story ID sai | ID `0`, `-1`, `abc` | HTTP `400` | Chỉ nhận ID nguyên dương | Cả ba trường hợp đều bị từ chối — **Đạt** |
| 10 | Follow API thất bại trên UI | UI cập nhật trước; API reject | UI rollback trạng thái | Không để trạng thái giả trên giao diện | Nút follow quay lại trạng thái trước — **Đạt** |
| 11 | Bình luận rỗng/quá dài | Khoảng trắng hoặc hơn 2.000 ký tự | HTTP `400` | Không tạo bình luận sai | HTTP `400`, model create không được gọi — **Đạt** |
| 12 | Reply sang thread khác | Parent thuộc story/chapter khác | HTTP `400` | Không gắn reply sai thread | HTTP `400`, không tạo comment — **Đạt** |
| 13 | User xóa bình luận người khác | User thường không phải owner | HTTP `403` | Bảo vệ quyền sở hữu | HTTP `403`, không xóa — **Đạt** |
| 14 | Admin xóa bình luận | Admin xóa comment của user khác | HTTP `200` | Admin được phép moderation | Comment được xóa — **Đạt** |
| 15 | Vote sai giá trị | Vote `0`, `2`, `-2` | HTTP `400` | Chỉ nhận `1` hoặc `-1` | Cả ba giá trị bị từ chối — **Đạt** |
| 16 | Rating ngoài khoảng | Rating `0`, `6`, `1.5`, `"five"` | HTTP `400` | Chỉ nhận số nguyên 1–5 | Không gọi upsert rating — **Đạt** |
| 17 | Thêm/cập nhật rating | Rating `5` của user đăng nhập | HTTP `200`, summary mới | Upsert rating của đúng user | Model nhận story ID, user ID và rating đúng — **Đạt** |
| 18 | Xóa rating | User xóa rating của chính mình | HTTP `200`, summary mới | Không xóa rating của user khác | Model được gọi với đúng user hiện tại — **Đạt** |
| 19 | Tạo report hợp lệ | User, target story, reason, description | HTTP `201` | Tạo report đúng target | Insert đúng dữ liệu — **Đạt** |
| 20 | Spam report | Đã gửi đủ giới hạn trong một giờ | HTTP `429` | Chặn spam trước khi insert | HTTP `429`, không insert report — **Đạt** |
| 21 | Report avatar từ comment | Comment ID có tác giả | Report gắn `reported_user_id` | Moderator biết đúng user bị báo cáo | User ID được lấy từ tác giả comment — **Đạt** |
| 22 | Cập nhật report không tồn tại | Report ID không có trong DB | HTTP `404` | Không tạo trạng thái giả | HTTP `404` — **Đạt** |
| 23 | Hành động report sai loại target | Dùng chapter action cho comment report | HTTP `400` | Chặn action không tương thích | HTTP `400`, không cập nhật target — **Đạt** |
| 24 | Mở khóa chương miễn phí | Chapter `is_paid: false` | HTTP `409`, không trừ tiền | Không gọi giao dịch ví | Wallet không được gọi — **Đạt** |
| 25 | Mở khóa chương trả phí | Chapter khóa; số dư đủ | HTTP `200`, `CHAPTER_UNLOCKED` | Trừ đúng chi phí và trả số dư mới | Chi phí `10`, số dư mới đúng — **Đạt** |
| 26 | Mở khóa lại/request đồng thời | Wallet báo `already_unlocked: true` | HTTP `200`, cost `0` | Không trừ tiền lần hai | `CHAPTER_ALREADY_UNLOCKED`, cost `0` — **Đạt** |
| 27 | Số dư không đủ | Balance `4`, unlock cost `10` | HTTP `409`, `INSUFFICIENT_CRYSTALS` | Không mở khóa và trả số dư hiện tại | HTTP `409`, balance `4` — **Đạt** |
| 28 | Database lỗi khi mở khóa | DB error chứa dữ liệu nội bộ | HTTP `500`, `Hệ thống đang gặp sự cố. Vui lòng thử lại sau.` | Không lộ chi tiết database | UI chỉ hiển thị thông báo chung bằng tiếng Việt — **Đạt** |
