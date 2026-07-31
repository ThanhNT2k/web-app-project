# Tự động deploy lên VM sau khi test đạt

## Luồng hoạt động

```text
Push lên nhánh mặc định
        ↓
GitHub Actions: Automated Tests
        ↓
Backend + Frontend + Build + Playwright E2E
        ↓
Chỉ khi toàn bộ job thành công
        ↓
Deploy production → SSH vào VM → deploy <commit SHA>
```

Workflow deploy nằm tại `.github/workflows/deploy-production.yml` và lắng nghe
sự kiện hoàn tất của workflow `Automated Tests`.

Một commit chỉ được deploy khi đồng thời thỏa mãn:

1. Workflow test kết thúc với `success`.
2. Workflow test được kích hoạt bởi sự kiện `push`.
3. Commit nằm trên nhánh mặc định (`main` hoặc nhánh mặc định khác của repository).
4. Workflow chạy từ chính repository, không phải fork.

Do đó pull request, branch tính năng, test fail, test bị hủy hoặc workflow từ fork
không thể tự động deploy production.

## Cấu hình GitHub

Tạo GitHub Environment tên `production`, sau đó cấu hình:

### Secrets bắt buộc

| Tên | Nội dung |
|---|---|
| `DEPLOY_SSH_KEY` | Private key chỉ dùng để deploy vào VM |
| `DEPLOY_KNOWN_HOSTS` | Dòng host key của VM, lấy trước bằng `ssh-keyscan` và kiểm tra fingerprint |

### Repository variables tùy chọn

| Tên | Mặc định | Ý nghĩa |
|---|---|---|
| `DEPLOY_HOST` | `157.245.58.32` | IP hoặc hostname của VM |
| `DEPLOY_USER` | `root` | Tài khoản SSH chạy deploy |
| `DEPLOY_PORT` | `22` | Cổng SSH |

Nên đổi sang một tài khoản deploy riêng, chỉ có đúng quyền cần thiết, thay vì dùng
`root`. Có thể bật required reviewers cho environment `production` nếu muốn thêm
bước phê duyệt thủ công sau khi test pass.

## Hợp đồng trên VM

VM phải có lệnh `deploy` trong `PATH` và nhận đúng một tham số là commit SHA đầy
đủ 40 ký tự:

```bash
deploy 0123456789abcdef0123456789abcdef01234567
```

Lệnh này phải:

1. fetch commit từ repository;
2. checkout đúng SHA được truyền vào, không tự lấy `latest`;
3. cài dependency bằng lockfile;
4. build frontend;
5. chạy migration nếu có;
6. restart/reload backend và worker;
7. chỉ trả exit code `0` khi deploy hoàn tất.

Không nên truyền secret ứng dụng qua GitHub Actions. Các biến môi trường production
nên được lưu trực tiếp trên VM hoặc secret manager của hạ tầng.

## Secrets và host key

Tạo key riêng cho deploy:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key
```

- Public key `deploy_key.pub` được thêm vào `authorized_keys` của deploy user.
- Private key `deploy_key` được lưu trong secret `DEPLOY_SSH_KEY`.
- `DEPLOY_KNOWN_HOSTS` phải được đối chiếu fingerprint với VM qua một kênh tin
  cậy trước khi lưu. Workflow bật `StrictHostKeyChecking=yes` và không tự động
  chấp nhận host key mới.

## Kiểm tra hoạt động

1. Push một commit test fail lên nhánh tính năng: không có deploy.
2. Mở PR và để test pass: không có deploy.
3. Merge/push lên nhánh mặc định nhưng test fail: job deploy bị skip.
4. Push commit pass toàn bộ test lên nhánh mặc định: environment `production`
   ghi nhận deployment đúng SHA.
5. Trên VM, kiểm tra SHA đang chạy trùng với SHA trong deployment summary.

Tên workflow `Automated Tests` là một phần của liên kết giữa hai workflow. Nếu đổi
trường `name` trong `tests.yml`, phải cập nhật `workflows: [Automated Tests]` trong
workflow deploy.
