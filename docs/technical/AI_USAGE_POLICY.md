# AI_USAGE_POLICY.md — CMC Truyện

> **Phiên bản:** 1.0 | **Áp dụng từ:** Tuần 1 | **Đối tượng:** Toàn bộ thành viên nhóm CMC Truyện

---

## Lời Mở Đầu

Tài liệu này là **bộ quy tắc bắt buộc** cho mọi thành viên khi sử dụng công cụ AI trong dự án CMC Truyện. Mọi vi phạm đều được ghi nhận trong buổi retrospective nhóm.

> *"Chúng ta chịu trách nhiệm về mọi dòng code được đưa vào repo — dù AI hay con người viết ra nó."*

---

## 1. Nguyên Tắc Bảo Mật Dữ Liệu

### 1.1 ❌ Tuyệt Đối Không Đưa Vào Prompt

- **API Keys, Secret Keys, Token** của bất kỳ dịch vụ nào (OpenAI, Anthropic, Firebase, AWS, v.v.)
- **Credentials** (username/password, connection string database)
- **Thông tin cá nhân thật** của người dùng (họ tên, CMND, số điện thoại, email thật)
- **Nội dung bản quyền** chưa được phép (toàn bộ nội dung truyện từ site khác)

### 1.2 ✅ Quản Lý API Key Đúng Cách

**Quy tắc bắt buộc:** Mọi API key và biến môi trường nhạy cảm **chỉ được lưu trong file `.env`** và file này **luôn nằm trong `.gitignore`**.

```bash
# .gitignore — BẮT BUỘC có dòng này
.env
.env.local
.env.production
```

**Thay vào đó, commit file `.env.example`** với placeholder:

```bash
# .env.example — File NÀY được commit lên repo
DATABASE_URL=your_database_url_here
OPENAI_API_KEY=your_openai_key_here
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Kiểm tra trước mỗi commit:**
```bash
# Chạy lệnh này để đảm bảo không có secret bị lọt
git diff --staged | grep -i "api_key\|secret\|password\|token"
```

### 1.3 Xử Lý Khi Lỡ Commit Secret

Nếu phát hiện đã commit nhầm API key:
1. **Ngay lập tức** revoke key cũ trên dashboard của nhà cung cấp
2. Tạo key mới
3. Dùng `git filter-branch` hoặc `BFG Repo Cleaner` để xóa khỏi lịch sử git
4. Báo cáo ngay cho trưởng nhóm

---

## 2. Nguyên Tắc Review Code AI

### 2.1 Quy Tắc "Không Merge Nếu Chưa Hiểu"

Mọi thành viên **phải đọc và giải thích được** code AI sinh ra trước khi tạo Pull Request. Cụ thể:

- ✅ Đọc từng dòng, hiểu logic tổng thể
- ✅ Chạy thử code trên local, kiểm tra các trường hợp biên (edge cases)
- ✅ Có thể giải thích cho người khác trong nhóm khi được hỏi
- ❌ **Không copy-paste toàn bộ output AI vào file mà không đọc**
- ❌ **Không commit với lý do "AI nói đúng rồi, tin tưởng được"**

### 2.2 Checklist Trước Khi Tạo PR

```markdown
## PR Checklist (bắt buộc điền)
- [ ] Tôi đã đọc và hiểu toàn bộ code trong PR này
- [ ] Code đã được chạy thử trên môi trường local
- [ ] Không có API key hay secret nào bị lộ
- [ ] Tôi có thể giải thích logic của đoạn code quan trọng nhất
- [ ] Đã ghi chú phần nào do AI tạo ra trong commit message
```

### 2.3 Ghi Nhãn Code Do AI Sinh Ra

Trong commit message, ghi rõ:
```
feat: thêm tính năng dark mode cho reading view

- Thêm toggle button dark/light trong toolbar
- Lưu preference vào localStorage
[AI-assisted: Cursor giúp viết CSS variables và toggle logic]
```

---

## 3. Nguyên Tắc Sử Dụng Prompt

### 3.1 Không Gửi Context Nhạy Cảm Của Người Dùng

Khi cần AI giúp debug hoặc phân tích lỗi liên quan đến dữ liệu người dùng, **phải ẩn danh hóa** trước:

```
❌ SAI: "Tại sao user Nguyễn Văn A, email a@gmail.com không đăng nhập được?"
✅ ĐÚNG: "Tại sao một user có email hợp lệ không đăng nhập được, lỗi trả về là 401?"
```

### 3.2 Giới Hạn Scope Prompt

Mỗi prompt chỉ nên giải quyết **1 vấn đề cụ thể**. Tránh prompt quá rộng:
```
❌ SAI: "Viết toàn bộ backend cho web truyện"
✅ ĐÚNG: "Tối ưu endpoint GET /api/stories/:id bằng Express.js và PostgreSQL, giữ nguyên response contract và bổ sung test"
```

---

## 4. Giới Hạn Tin Tưởng AI (Trust Boundaries)

| Loại output AI | Mức tin tưởng | Hành động cần làm |
|----------------|--------------|-------------------|
| Giải thích khái niệm | Cao | Có thể dùng ngay, kiểm chứng nhanh |
| Viết code | Trung bình | **Bắt buộc review + test** |
| Thông tin về thư viện/version | Thấp | **Tự kiểm tra lại trên docs chính thức** |
| Số liệu, thống kê | Rất thấp | **Tự tìm nguồn gốc độc lập** |
| Quyết định kiến trúc hệ thống | Tham khảo | **Thảo luận nhóm + quyết định con người** |

> **Lưu ý quan trọng:** AI có thể "hallucinate" (bịa đặt) tên hàm, tên package hoặc cú pháp không tồn tại. Luôn kiểm tra trên documentation chính thức.

---

## 5. Cam Kết Của Thành Viên

Bằng việc tham gia dự án CMC Truyện, mỗi thành viên cam kết:

1. **Đọc và ký nhận** tài liệu này trước khi bắt đầu làm việc
2. **Tuân thủ** toàn bộ quy tắc trên
3. **Báo cáo ngay** nếu phát hiện vi phạm (của bản thân hoặc thành viên khác)
4. **Chịu trách nhiệm** về mọi code được merge vào nhánh `main`

---

*CMC Truyện Team — Tuần 1 | Tài liệu này là một phần của bộ tài liệu Agent Onboarding*
