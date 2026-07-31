# Bảng test case chức năng đăng nhập

Hệ thống hiện đăng nhập bằng **email và mật khẩu**. Trong bảng dưới đây, yêu cầu
“username” được ánh xạ sang trường email của form đăng nhập.

| STT | Test case | Input | Output | Kết quả mong muốn | Kết quả nhận được |
|---:|---|---|---|---|---|
| 1 | Đúng email, đúng mật khẩu | `reader@example.com` / `Password1!` | HTTP `200`, JWT và thông tin user không chứa password | Đăng nhập thành công, cấp token an toàn | HTTP `200`, có token, password đã được loại bỏ — **Đạt** |
| 2 | Đúng email, sai mật khẩu | `reader@example.com` / `WrongPassword1!` | HTTP `401`, `Email hoặc mật khẩu không chính xác.` | Không đăng nhập, không cấp token | HTTP `401`, thông báo tiếng Việt — **Đạt** |
| 3 | Sai email, mật khẩu đúng của tài khoản khác | `unknown@example.com` / `Password1!` | HTTP `401`, `Email hoặc mật khẩu không chính xác.` | Không đăng nhập; không tiết lộ email có tồn tại hay không | HTTP `401`, cùng thông báo tiếng Việt; không so sánh mật khẩu — **Đạt** |
| 4 | Nhập sai font/ký tự Unicode full-width | `ｒｅａｄｅｒ＠ｅｘａｍｐｌｅ．ｃｏｍ` / `Password1!` | HTTP `400`, `Dữ liệu đầu vào không hợp lệ.` | Chặn đầu vào trước khi truy vấn tài khoản | HTTP `400`, lỗi được chuyển sang tiếng Việt — **Đạt** |
| 5 | Email sai định dạng | `reader-at-example.com` / `Password1!` | HTTP `400`, `Email không đúng định dạng.` | Chặn đầu vào trước khi truy vấn tài khoản | HTTP `400`, thông báo tiếng Việt — **Đạt** |
| 6 | Hệ thống/DB không chạy khi đăng nhập | `reader@example.com` / `Password1!`, DB không khả dụng | HTTP `500`, `Hệ thống đang gặp sự cố. Vui lòng thử lại sau.` | Không lộ lỗi nội bộ và không cấp token | HTTP `500`, thông báo chung bằng tiếng Việt — **Đạt** |

## Cách chạy

Chạy riêng test đăng nhập:

```bash
npm test --prefix backend -- src/controllers/authController.login.test.js --runInBand
```

Chạy bộ test backend chuẩn của dự án (đã bao gồm test đăng nhập):

```bash
npm run test:backend
```

Nếu test không chạy được, Jest phải trả về mã thoát khác `0` và in tên test cùng
stack trace. Nếu ứng dụng đang chạy nhưng database gặp sự cố, controller chuyển
lỗi cho error middleware để trả phản hồi lỗi máy chủ; hệ thống không được trả token
hoặc báo đăng nhập thành công.
