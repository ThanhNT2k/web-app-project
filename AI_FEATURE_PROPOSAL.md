# AI_FEATURE_PROPOSAL.md — CMC Truyện

> **Tính năng AI:** Tóm Tắt Chương/Truyện (AI Chapter & Story Summary)

---

## 1. Tổng Quan

| | Chi tiết |
|----------|----------|
| **Tên tính năng** | **AI Summary** — Tóm tắt chương hoặc cả bộ truyện |
| **Người dùng** | Người đọc muốn nhớ lại cốt truyện hoặc bắt kịp nhanh chóng |
| **Cách sử dụng** | Bấm nút "🤖 Tóm tắt" trên màn hình đọc → AI tạo summary 150-200 từ |

---

## 2. Giá Trị Cho Người Dùng

**Kịch bản thực tế:**

> Minh (sinh viên) đọc "Đỉnh Phong" tới chương 245 rồi bận thi 1 tuần. Khi quay lại, anh không nhớ cốt truyện. Thay vì đọc lại chương 244 (dài 3000 chữ), anh bấm "Tóm tắt chương" — đọc 150 chữ trong 20 giây — rồi tiếp tục chương 245.

**Giá trị:**
- ⏱️ Tiết kiệm 5-10 phút mỗi lần quay lại đọc
- 📖 Giúp bắt kịp cốt truyện dễ dàng
- 🔄 Khuyến khích người dùng quay lại đọc thường xuyên hơn

---

---

## 3. Thiết Kế Tính Năng

### 3.1 Đầu Vào (Input)

```
Người dùng bấm nút "🤖 Tóm tắt" → Backend lấy:
- Nội dung chương hiện tại (max 5000 ký tự)
- Gửi lên Gemini API với system prompt:
  "Bạn là trợ lý tóm tắt truyện. Hãy tóm tắt chương sau 
   trong 150-200 từ bằng Tiếng Việt. Chỉ nêu sự kiện chính."
```

**Không gửi:**
- Thông tin người dùng (email, SĐT)
- Dữ liệu lịch sử đọc cá nhân
- Bất kỳ dữ liệu nhạy cảm nào

### 3.2 Đầu Ra (Output)

**Tóm tắt từ AI (150-200 từ):**
```
Ví dụ output:
"Trong chương này, Lý Tiêu Dao đối mặt với Ma Tôn tại đỉnh Thái Hư. 
Sau trận chiến kéo dài, anh phát hiện bí mật về nguồn gốc của mình..."
```

**Hiển thị trên UI:**
```
┌─────────────────────────────────┐
│ 🤖 Tóm tắt Chương 244 (do AI)  │
│                                 │
│ Trong chương này, Lý Tiêu Dao... │
│                                 │
│ ⚠️ Nội dung do AI tạo, có thể   │
│    không 100% chính xác         │
│                                 │
│ [✓ Tốt] [✗ Bỏ qua]            │
└─────────────────────────────────┘
```

---

---

## 4. Kiểm Soát Con Người

- Tóm tắt **không tự động hiển thị** — chỉ kích hoạt khi người dùng bấm nút
- Rõ ràng ghi **"Do AI tạo"** → người dùng biết đây là AI output
- Cảnh báo: **"Có thể không 100% chính xác"** → người dùng không tin tưởng mù quáng
- Nút [✗ Bỏ qua] → dễ dàng tắt đi nếu không cần

---

## 5. Rủi Ro & Cách Phòng Tránh

| Rủi Ro | Mức Độ | Cách Xử Lý |
|--------|--------|-----------|
| **AI Bịa Đặt** — Tóm tắt sai nội dung chương | Trung bình | Gửi **toàn bộ nội dung** vào AI (không tóm tắt trước) |
| **Spoiler** — Vô tình tiết lộ twist | Thấp | Thêm system prompt: "Nếu có cliffhanger, hãy dừng trước" |
| **Chi Phí API Cao** — Nhiều người bấm cùng lúc | Trung bình | **Cache** tóm tắt mỗi chương (TTL 7 ngày) — cùng chương gọi API 1 lần |
| **Timeout** — API quá chậm | Thấp | Hiển thị "Tóm tắt không khả dụng, thử lại sau" |

---

## 6. Tech Stack

```
Frontend:   Razor Pages / HTML + JavaScript
           → Button "Tóm tắt" trên Chapter Reader

Backend:   ASP.NET Core MVC
           → POST /api/chapters/{chapterId}/summary
           → Cache check → Gemini API call → return text

AI Model:  Gemini 1.5 Flash
           - Rẻ (~$0.075 per 1M input tokens)
           - Nhanh (<2 giây)

Cache:     Redis hoặc In-Memory (TTL 7 ngày)
Database:  PostgreSQL (Chapters table)
```

---

## 7. Timeline

| Giai Đoạn | Công Việc | Thời Gian |
|-----------|-----------|----------|
| **MVP** | Button + API endpoint + caching | 1 tuần |
| **V1.1** | User feedback (good/bad) | Tuần 2 |
| **V1.2** | Tóm tắt toàn bộ truyện (multi-chapter) | Tuần 3+ |

---

*Tài liệu này được cập nhật theo hướng tóm tắt AI — CMC Truyện Team*
