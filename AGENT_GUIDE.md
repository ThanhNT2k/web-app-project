# AGENT_GUIDE.md — CMC Truyện

> Tài liệu này định nghĩa cách nhóm CMC Truyện thiết lập, sử dụng và quản lý các công cụ AI Agent trong suốt vòng đời dự án.

---

## 1. Triết Lý Sử Dụng Agent

> *"AI là thành viên junior trong nhóm — rất thạo kỹ thuật, nhưng cần được giao việc rõ ràng và luôn cần review trước khi merge."*

Nhóm không sử dụng AI như một **hộp đen tự động**. Mọi output của AI đều được một thành viên con người đọc, hiểu và chịu trách nhiệm trước khi đưa vào codebase.

---

## 2. Bộ Công Cụ AI Agent

### 2.1 Cloud Agent Chính — **Cursor IDE + Claude Sonnet**

| Thông tin | Chi tiết |
|-----------|----------|
| Công cụ | Cursor IDE (tích hợp sẵn Claude Sonnet / GPT-4o) |
| Vai trò chính | Viết code, refactor, debug, giải thích logic, sinh test |
| Khi nào dùng | Toàn bộ quá trình phát triển hàng ngày |
| Điểm mạnh | Hiểu context cả project (multi-file), inline suggestion thời gian thực |
| Giới hạn | ~500 request/tháng (gói Pro), có thể hết quota gần deadline |

**Cách thiết lập:**
```bash
# 1. Download Cursor tại https://cursor.sh
# 2. Đăng nhập bằng tài khoản GitHub của nhóm
# 3. Trong Settings > Models: chọn claude-sonnet-4 làm model mặc định
# 4. Bật tính năng "Codebase Indexing" để Agent hiểu toàn bộ project
```

**Prompt template chuẩn cho Cursor:**
```
Act as a Senior Frontend Developer.
Context: [Mô tả ngắn gọn task hiện tại]
Task: [Yêu cầu cụ thể]
Constraints: [Giới hạn: không dùng library X, phải tương thích với Y]
Output format: [Code only / Code + explanation / Just explanation]
```

---

### 2.2 Agent Dự Phòng / Mã Nguồn Mở — **Cline (VSCode Extension)**

| Thông tin | Chi tiết |
|-----------|----------|
| Công cụ | Cline — VSCode Extension (mã nguồn mở) |
| Repo | https://github.com/cline/cline |
| Vai trò | Thay thế Cursor khi hết quota; chạy được với local model |
| Điểm mạnh | Hỗ trợ Ollama/LM Studio, không phụ thuộc cloud |
| Khi nào kích hoạt | Khi Cursor báo "Rate limit exceeded" hoặc hết token tháng |

**Cách thiết lập Cline với Ollama (local fallback):**
```bash
# 1. Cài Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull model phù hợp (chọn 1 trong 2)
ollama pull qwen2.5-coder:7b      # Nhẹ hơn, chạy được trên 8GB RAM
ollama pull codellama:13b          # Mạnh hơn, cần 16GB RAM

# 3. Trong Cline Settings:
#    - Provider: Ollama
#    - Base URL: http://localhost:11434
#    - Model: qwen2.5-coder:7b
```

---

### 2.3 Agent Bổ Trợ — **Claude.ai Web (chat)**

| Thông tin | Chi tiết |
|-----------|----------|
| Công cụ | Claude.ai (trình duyệt) |
| Vai trò | Phân tích yêu cầu, lên kế hoạch, viết tài liệu, review thiết kế |
| Khi nào dùng | Lúc cần "tư duy" nhiều hơn "code" — planning, research, viết doc |

---

## 3. Kế Hoạch Dự Phòng (Fallback Plan)

```
Cursor (Cloud, Pro) 
    ↓ [Hết quota hoặc lỗi mạng]
Cline + Ollama Local (qwen2.5-coder:7b)
    ↓ [RAM không đủ chạy local model]
Chia nhỏ task → thực hiện thủ công từng phần
    ↓ [Task quá phức tạp để làm thủ công]
Nhờ Claude.ai Web (free tier) để phân tích, sau đó tự code
```

**Nguyên tắc khi fallback:** Không bao giờ bỏ qua bước review chỉ vì áp lực thời gian. Nếu thiếu công cụ, thà làm ít nhưng đúng, còn hơn làm nhiều mà sai.

---

## 4. Phân Công Agent Theo Vai Trò

| Nhiệm vụ | Agent được dùng | Người review |
|----------|----------------|-------------|
| Viết component React | Cursor | Thành viên 1 |
| Viết API endpoint | Cursor | Thành viên 2 |
| Review & refactor code | Cursor / Cline | Trưởng nhóm |
| Viết tài liệu (MD files) | Claude.ai Web | Cả nhóm |
| Debug lỗi khó | Cursor (với full context) | Người gặp bug |
| Phân tích yêu cầu mới | Claude.ai Web | Trưởng nhóm |

---

## 5. Quy Trình Làm Việc Với Agent (Agent Workflow)

```
1. DEFINE   → Xác định rõ task trước khi mở chat với AI
2. PROMPT   → Viết prompt theo template chuẩn (Act as / Context / Task / Constraints)
3. REVIEW   → Đọc và hiểu 100% output trước khi copy
4. TEST     → Chạy thử code, kiểm tra edge cases
5. LOG      → Lưu prompt + output vào ai-logs/week-XX.md
6. COMMIT   → Tạo commit với message rõ ràng, ghi chú phần nào AI hỗ trợ
```

---

*Tài liệu này sẽ được cập nhật mỗi tuần nếu có thay đổi về công cụ hoặc quy trình.*

*CMC Truyện Team — Tuần 1*
