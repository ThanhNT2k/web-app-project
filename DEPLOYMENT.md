# Deployment Guide — CMC Truyện

## Backend (Railway / Render / Heroku)

1. Set environment variables:
   - `DATABASE_URL` — production PostgreSQL connection string
   - `NODE_ENV=production`
   - `JWT_SECRET` — strong random secret
   - `GEMINI_API_KEY` — Google Gemini API key
   - `FRONTEND_URL` — deployed frontend URL (for CORS)

2. Start command: `npm start` (runs `node src/server.js`)

3. Run migrations once: `npm run db:init` or `npm run db:migrate`

## Frontend (Vercel / Netlify)

1. Build: `npm run build` (output in `dist/`)

2. Environment variable:
   - `VITE_API_URL=https://your-api-domain.com/api`

3. Deploy the `dist` folder or connect the repo with build command `npm run build`

## Local testing (Step 7)

```bash
# Terminal 1
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2
cd frontend
cp .env.example .env
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/api/health
- Chapter summary: `GET /api/chapters/:id/summary`
