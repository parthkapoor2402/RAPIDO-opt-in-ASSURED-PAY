# Local Development Setup

**Version:** 0.1 (scaffold)  
**Platform:** Windows, macOS, or Linux  
**Prerequisites:** Node 20+, Python 3.11+, npm, pip, Git

---

## 1. Clone and install

```powershell
cd "c:\RAPIDO project\RAPIDO-opt-in-ASSURED-PAY"

# Root tools (Playwright, concurrently)
npm install

# Frontend
npm install --prefix frontend

# Backend (recommended: use a virtual environment)
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate    # macOS/Linux
pip install -r requirements-dev.txt
cd ..
```

Or from repo root:

```powershell
npm run install:all
```

---

## 2. Environment variables

### Backend

```powershell
copy backend\.env.example backend\.env
```

Key values:

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_VERSION` | `0.1.0` | API version string |
| `API_PREFIX` | `/api` | Router prefix |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Allowed frontend origins |
| `PORT` | `8000` | Uvicorn port |

### Frontend

```powershell
copy frontend\.env.example frontend\.env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI base URL |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Show demo routes |

Restart dev servers after changing env files.

---

## 3. Run development servers

### Option A — UI only (fastest for previewing screens)

Assured Pay pages are static placeholders — **you do not need the backend** to browse the UI.

From repo root:

```powershell
npm run dev:ui
```

Open **http://127.0.0.1:3000/home** (use `127.0.0.1`, not `localhost`, on Windows).

- Server ready: ~2–8s (Turbopack)
- First page compile: ~10–20s — **wait for the terminal to show `Compiled` before refreshing the browser**
- After first load, pages open in under a second

### Option B — Both backend + frontend

From repo root:

```powershell
npm run dev
```

Starts:

- Backend: http://127.0.0.1:8000
- Frontend: http://127.0.0.1:3000

Use this when you need API endpoints (`/docs`, settlement logic, etc.).

### Option C — Separate terminals

**Terminal 1 — Backend:**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend:**

```powershell
cd frontend
npm run dev
```

Open http://127.0.0.1:3000/home

---

## 4. Verify scaffold

### Backend

| URL | Expected |
|-----|----------|
| http://127.0.0.1:8000/health | `{"status":"ok",...}` |
| http://127.0.0.1:8000/api/version | version + policy fields |
| http://127.0.0.1:8000/docs | Swagger UI |

```powershell
cd backend
python -m pytest
```

### Frontend

| URL | Expected |
|-----|----------|
| http://localhost:3000/book | “Book a ride” placeholder |
| http://localhost:3000/captain | Captain wallet placeholder |

```powershell
cd frontend
npm run test
npm run build
```

---

## 5. E2E tests (Playwright)

Install browsers once:

```powershell
npx playwright install chromium
```

Run smoke tests (auto-starts frontend):

```powershell
npm run test:e2e
```

With servers already running:

```powershell
$env:PLAYWRIGHT_SKIP_WEBSERVER="1"
npm run test:e2e
```

Interactive UI:

```powershell
npm run test:e2e:ui
```

---

## 6. Linting & formatting

### Backend

```powershell
cd backend
ruff check app tests
black app tests   # optional format
```

### Frontend

```powershell
cd frontend
npm run lint
```

---

## 7. Project scripts reference

| Script | Location | Description |
|--------|----------|-------------|
| `npm run dev` | root | Backend + frontend |
| `npm run dev:ui` | root | Frontend only (fastest UI preview) |
| `npm run test` | root | pytest + vitest |
| `npm run test:e2e` | root | Playwright |
| `npm run build` | root | Frontend production build |
| `npm run dev` | frontend | Next.js only |
| `python -m pytest` | backend | Backend tests only |

---

## 8. Troubleshooting

### Browser hangs or "connection failed"

1. Use **http://127.0.0.1:3000/home** — avoid `localhost` on Windows (IPv6 delay).
2. Wait until the terminal shows `✓ Ready` **and** `✓ Compiled /home` before opening the browser.
3. Prefer **`npm run dev:ui`** (frontend only) — `npm run dev` also starts Python/uvicorn and feels slower.
4. First compile after startup can take **15–20 seconds**; this is normal. Reload once if it times out.

### CORS errors in browser

- Ensure `CORS_ORIGINS` in `backend/.env` includes your frontend URL.
- Confirm `NEXT_PUBLIC_API_URL` matches backend host/port.

### `ModuleNotFoundError: app`

Run uvicorn from `backend/` directory or set `PYTHONPATH=backend`.

### Port already in use

```powershell
# Change backend port
python -m uvicorn app.main:app --reload --port 8001
# Update NEXT_PUBLIC_API_URL accordingly
```

### Vitest fails on Next.js imports

Mocks live in `frontend/src/test/setup.ts` — extend there for new Next APIs.

### Playwright timeout

- Increase `webServer.timeout` in `playwright.config.ts`.
- Or start frontend manually and set `PLAYWRIGHT_SKIP_WEBSERVER=1`.

---

## 9. IDE tips (Cursor / VS Code)

- Open repo root as workspace folder.
- Python interpreter: `backend/.venv/Scripts/python.exe`
- Recommended extensions: ESLint, Python, Tailwind CSS IntelliSense

---

## 10. Next steps after scaffold

1. **P03** — Frontend design system (`/design-system`)
2. **P04** — Fare engine + settlement domain tests
3. **P05** — Wire `/book` to eligibility API

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) and [PHASE_CHECKLISTS.md](./PHASE_CHECKLISTS.md).

---

## Related documents

- [REPO_STRUCTURE.md](./REPO_STRUCTURE.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)
