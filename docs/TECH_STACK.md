# Assured Pay — Technology Stack

**Version:** 0.1  
**Purpose:** Concrete tooling choices for solo-founder build with Cursor + Claude Sonnet, optimized for MVP prototype → GitHub → Vercel.

---

## 1. Stack summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+, React 18, TypeScript | App Router, Vercel-native, strong DX |
| **Styling** | Tailwind CSS | Fast polished UI without design system overhead |
| **Server state** | TanStack Query | Cache, retry, loading states for API |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2 | Fast API dev, excellent typing, OpenAPI |
| **ORM** | SQLModel or SQLAlchemy 2.0 | Simple models; migrate to Postgres |
| **DB (MVP)** | SQLite | Zero infra locally; optional Vercel Postgres later |
| **DB (prod target)** | PostgreSQL 15+ | Standard for ledger-adjacent data |
| **API docs** | OpenAPI (auto from FastAPI) | Contract for frontend + tests |
| **Unit tests (BE)** | pytest, pytest-asyncio, httpx | FastAPI TestClient |
| **Unit tests (FE)** | Vitest, React Testing Library | Component + hook tests |
| **E2E** | Playwright | Cross-flow assurance |
| **Lint/format** | Ruff + Black (Python), ESLint + Prettier (TS) | Low-config quality |
| **Type check** | mypy (optional MVP), TypeScript strict | Catch contract drift |
| **CI** | GitHub Actions | Test on PR |
| **Frontend deploy** | Vercel | Preview + production |
| **Backend deploy (MVP)** | Railway / Render / Fly.io | Simple Python hosting |
| **Monorepo** | Single repo, `/frontend` + `/backend` | Solo builder simplicity |

---

## 2. Frontend details

### Core dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "@tanstack/react-query": "^5.x",
  "zod": "^3.x"
}
```

### Dev dependencies

```json
{
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "@playwright/test": "^1.x",
  "eslint": "^8.x",
  "prettier": "^3.x"
}
```

### Conventions

- App Router with `loading.tsx` / `error.tsx` for key routes
- Feature folders colocate components + hooks + tests
- API types generated from OpenAPI *or* shared Zod schemas (manual MVP OK)
- Mobile-first layouts (375px primary)

---

## 3. Backend details

### Core dependencies

```
fastapi>=0.110
uvicorn[standard]>=0.27
pydantic>=2.6
sqlmodel>=0.0.16  # or sqlalchemy>=2.0
alembic>=1.13
python-dotenv>=1.0
httpx>=0.27
```

### Dev dependencies

```
pytest>=8.0
pytest-asyncio>=0.23
pytest-cov>=4.1
ruff>=0.3
black>=24.0
```

### Conventions

- Router per domain (`assured_pay`, `settlement`, `rides`)
- Pydantic schemas separate from ORM models
- Domain logic pure functions in `domain/` — no FastAPI imports
- Ports/adapters for Payment and Wallet

---

## 4. Local development

### Option A: Split terminals (recommended MVP)

```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

`NEXT_PUBLIC_API_URL=http://localhost:8000`

### Option B: docker-compose

- `backend` service on 8000
- `frontend` service on 3000
- Volume mount SQLite for persistence

---

## 5. Environment variables

### Frontend (Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `NEXT_PUBLIC_DEMO_MODE` | Show `/demo` toggles |

### Backend

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite or Postgres connection |
| `CORS_ORIGINS` | Vercel preview + prod URLs |
| `SETTLEMENT_POLICY_VERSION` | Audit trail |
| `BUFFER_AMOUNT_INR` | Default buffer (e.g. 7) |
| `SMALL_EXCESS_MAX_INR` | Residual auto threshold |
| `MOCK_PAYMENT_DEFAULT` | success / failure |

---

## 6. GitHub repository structure

```
RAPIDO-opt-in-ASSURED-PAY/
  .github/workflows/ci.yml
  docs/
  frontend/
    package.json
    src/ or app/
  backend/
    pyproject.toml or requirements.txt
    app/
    tests/
  e2e/
    playwright.config.ts
  README.md
  .gitignore
  docker-compose.yml (optional)
```

### `.gitignore` essentials

- `node_modules/`, `.next/`, `__pycache__/`, `.venv/`
- `.env`, `.env.local`
- `*.db` (SQLite local)
- No secrets, no real payment keys

---

## 7. CI pipeline (GitHub Actions)

```yaml
# Conceptual jobs
jobs:
  backend-test:
    - setup Python 3.11
    - pip install -r requirements.txt
    - ruff check .
    - pytest --cov=app

  frontend-test:
    - setup Node 20
    - npm ci
    - npm run lint
    - npm run test
    - npm run build

  e2e (optional on main):
    - docker-compose up -d
    - npx playwright test
```

PRs: backend + frontend required. E2E on merge to `main`.

---

## 8. Vercel deployment strategy

### Frontend (native)

1. Import GitHub repo in Vercel
2. Set root directory: `frontend`
3. Framework preset: Next.js
4. Env: `NEXT_PUBLIC_API_URL` → production backend URL
5. Enable preview deployments for all PRs

### Backend (not on Vercel Python for MVP complexity)

**Recommended:** Deploy FastAPI to **Railway** or **Render**:

1. Connect same GitHub repo; root `backend`
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Postgres addon when graduating from SQLite
4. Set CORS to Vercel production + preview domains

### Alternative: Next.js Route Handlers as BFF

For simplest single-Vercel deploy, proxy critical endpoints through Next.js API routes calling embedded Python *not recommended*—keep Python backend separate for clarity.

### Custom domain (optional)

- `assured-pay-demo.vercel.app` for prototype
- Production pilot: subdomain of main app (future)

---

## 9. OpenAPI / contract workflow

1. FastAPI generates `/openapi.json`
2. Frontend copies types manually (MVP) or uses `openapi-typescript`
3. Contract tests: pytest snapshots of response schemas
4. Breaking API changes require version bump `/api/v2`

---

## 10. Observability (MVP → prod)

| Stage | Tooling |
|-------|---------|
| MVP | Python `structlog` → stdout; Vercel logs |
| Pilot | Sentry (FE + BE errors) |
| Scale | Datadog / Grafana + metrics from `MetricsEvent` pipeline |

---

## 11. AI tooling boundaries (Cursor / Claude / Grok)

| Tool | Allowed use in this project |
|------|----------------------------|
| **Cursor + Claude Sonnet** | Code generation, docs, tests, refactors |
| **Grok API (free tier)** | See `ROADMAP.md` — Phase 3+ optional for copy variants / ops summarization only |
| **AI in production settlement** | **Prohibited** for charge decisions |

---

## 12. Why this stack for a solo builder

- **Next.js + Vercel:** Fastest path to polished public demo URL
- **FastAPI:** Clear domain separation, auto API docs, pytest-friendly
- **SQLite → Postgres:** No DB ops until needed
- **Playwright:** One suite proves full Assured Pay journeys
- **Monorepo:** Single PR for vertical slices

---

## 13. Related documents

- `ARCHITECTURE.md` — system design and APIs
- `TEST_STRATEGY.md` — what to test where
- `ROADMAP.md` — when to adopt Postgres, screenshots, Grok
