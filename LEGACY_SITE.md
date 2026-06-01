# Site HTML cũ → React

Ứng dụng chính nằm trong **`frontend/`** (Vite + React).

## URL cũ → URL mới

| Cũ | Mới |
|----|-----|
| `/pages/story.html` | `/browse` |
| `/pages/story.html?genre=...` | `/browse?category=...` |
| `/pages/reader.html?storyId=1&chapterId=2` | `/story/1/chapter/2` |
| `/pages/profile.html` | `/profile` |
| `/pages/account.html` | `/account` |
| `/pages/admin.html` | `/admin` |

File redirect tĩnh: `frontend/public/pages/*.html` (khi build/deploy cùng domain).

## Đã gỡ (trùng với React)

- `js/` — module HTML cũ (`api.js`, `novels.js`, …)
- `pages/` ở thư mục gốc — thay bằng React + `public/pages/`
- `css/` ở thư mục gốc — style đã gộp vào `frontend/src/styles/`

## Chạy app

```bash
cd frontend && npm run dev
```

Mở http://localhost:3000
