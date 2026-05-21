# AGENTS.md

This repository was reorganized to follow the MVC-style structure described in the roadmap. The implementation currently uses a Node.js/Express backend with a static frontend served from `server/wwwroot` (this maps to the `wwwroot` concept in the roadmap).

Quick mapping (roadmap → repository):
- `Controllers/`  : `server/Controllers/` (Express controllers that return pages and API data)
- `Models/`       : `server/Models/` (placeholder data models)
- `Data/`         : `server/Data/` (DB config / EF equivalent — currently empty)
- `Repositories/` : `server/Repositories/` (data-access layer — placeholder)
- `Services/`     : `server/Services/` (AI/Identity helpers — placeholders under `AI` and `Identity`)
- `Views/`        : `server/Views/` (server-side templates — placeholder EJS)
- `wwwroot/`      : `server/wwwroot/` (static frontend: HTML/CSS/JS)
- `Tests/Playwright`: `server/Tests/Playwright/` (E2E tests)
- Entry point     : `server/server.js`

Notes for AI agents and contributors:
- The current backend is Node/Express (not ASP.NET). The roadmap's high-level MVC layout is preserved conceptually.
- Static frontend files (previously under `client/`) have been moved to `server/wwwroot/` so the server can serve them directly.
- If you add real DB integration, place DB configuration and context in `server/Data/` and data access logic in `server/Repositories/`.
- For AI personalization, implement services under `server/Services/AI/` and call them from controllers.

Run the app (from repository root):
```powershell
node server/server.js
```

If you want, I can now:
- scaffold `server/Data/ApplicationDbContext` and a minimal `package.json` for the server,
- add a sample `/api` endpoint (already present), or
- generate a 10-week implementation plan that maps roadmap items to sprints.

