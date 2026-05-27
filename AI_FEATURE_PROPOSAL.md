# AI_FEATURE_PROPOSAL – Đề xuất truyện bằng AI

## 1. Mô tả tính năng

Hệ thống tự động gợi ý truyện phù hợp với từng người dùng dựa trên hành vi đọc thực tế, thay vì chỉ lọc theo thể loại thủ công.

---

## 2. Vấn đề hiện tại

- Người dùng mất thời gian tìm truyện phù hợp
- Gợi ý hiện tại chỉ dựa trên thể loại → thiếu cá nhân hóa
- Tỉ lệ người dùng bỏ app cao do không tìm được truyện hay

---

## 3. Giải pháp AI

### 3.1 Collaborative Filtering
> "Người có gu giống bạn đang đọc gì?"

Phân tích nhóm người dùng có hành vi tương tự → gợi ý truyện mà nhóm đó yêu thích.

### 3.2 Content-Based Filtering
> "Dựa trên những gì bạn đã đọc"

Phân tích nội dung truyện (thể loại, tag, văn phong) + lịch sử đọc của cá nhân → gợi ý truyện tương đồng.

### 3.3 Tín hiệu hành vi (Behavioral Signals)

| Tín hiệu | Ý nghĩa |
|----------|---------|
| Đọc đến chương cuối | Yêu thích cao |
| Bỏ giữa chừng | Không phù hợp |
| Thêm bookmark | Quan tâm |
| Thời gian đọc/chương | Mức độ hứng thú |
| Bình luận | Tương tác sâu |

---

## 4. Luồng hoạt động

```
Người dùng đọc truyện
        ↓
Thu thập tín hiệu hành vi
        ↓
Model AI xử lý & tính điểm
        ↓
Hiển thị danh sách "Gợi ý cho bạn"
```

---

## 5. Độ ưu tiên & Timeline

| Hạng mục | Chi tiết |
|----------|---------|
| Độ ưu tiên | 🔴 Cao |
| Sprint | T2 (tháng 3–4) |
| Điều kiện | Cần ít nhất 500 user có lịch sử đọc |

---

## 6. KPI đo lường thành công

- **CTR** (Click-through rate) gợi ý ≥ 20%
- **Retention D7** tăng ≥ 15% so với nhóm không dùng AI
- **Thời gian đọc/session** tăng ≥ 10%

---

## 7. Rủi ro

- **Cold start** – người dùng mới chưa có dữ liệu → dùng gợi ý theo xu hướng chung
- **Filter bubble** – chỉ gợi ý 1 thể loại → thêm yếu tố khám phá (explore)
- **Chi phí tính toán** – cần cache kết quả, không tính realtime mỗi request
