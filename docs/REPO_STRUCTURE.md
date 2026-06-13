# Repository Structure

**Version:** 0.1 (scaffold)  
**Monorepo:** Assured Pay MVP — solo-builder friendly, vertical-slice ready

---

## Top-level layout

```
RAPIDO-opt-in-ASSURED-PAY/
├── frontend/                 # Next.js 14 App Router (Vercel deploy root)
├── backend/                  # FastAPI application
├── docs/                     # Product & engineering source of truth
├── tests/
│   └── e2e/                  # Playwright specs (repo-root config)
├── references/               # Local design refs (see README there)
├── .github/
│   └── workflows/ci.yml      # Backend + frontend + E2E on main
├── playwright.config.ts      # E2E runner (starts frontend dev server)
├── package.json              # Root orchestration scripts
├── .env.example              # Combined env reference
├── .gitignore
└── README.md
```

---

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── app/                  # App Router pages (placeholders)
│   │   ├── book/
│   │   ├── ride/[rideId]/
│   │   ├── recovery/
│   │   ├── history/
│   │   ├── captain/
│   │   ├── ops/review/
│   │   ├── demo/
│   │   └── design-system/
│   ├── components/
│   │   └── layout/           # MobileShell, PlaceholderPage
│   ├── lib/
│   │   └── api.ts            # API_BASE_URL helper (P05 wiring)
│   └── test/
│       └── setup.ts          # Vitest + Next.js mocks
├── public/
├── vitest.config.ts
├── vercel.json               # Vercel project hints
├── .env.example
└── package.json
```

### Conventions (from `ARCHITECTURE.md`)

| Layer | Path (future) | Purpose |
|-------|---------------|---------|
| Pages | `src/app/**/page.tsx` | Route entry, data fetch |
| Features | `src/features/*/` | assured-pay, booking, settlement |
| UI | `src/components/ui/` | Design system (P03) |
| Hooks | `src/hooks/` | useAssuredPayEligibility, etc. |
| Tests | Colocated `*.test.tsx` or `__tests__/` | Vitest + RTL |

**Rules:**

- Mobile-first (375px primary).
- Server truth for fares/settlement — never compute final charge client-side.
- `data-testid` on E2E-critical elements (added in feature phases).

---

## Backend (`backend/`)

```
backend/
├── app/
│   ├── main.py               # FastAPI app, CORS, routers
│   ├── config.py             # Pydantic Settings
│   ├── api/v1/               # Versioned HTTP routers
│   │   └── health.py         # /health, /version (scaffold)
│   ├── domain/               # Pure logic — settlement (P04)
│   ├── services/             # Orchestrators (P05+)
│   ├── ports/                # PaymentPort, WalletPort interfaces
│   ├── adapters/             # Mock + future prod adapters
│   ├── models/               # SQLModel entities (P05+)
│   └── schemas/              # Pydantic DTOs
├── tests/
│   └── test_health.py
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml            # pytest, ruff, black config
└── .env.example
```

### API prefix

All feature APIs live under **`/api/v1`** (configurable via `API_PREFIX`).

Scaffold endpoints:

- `GET /health` — root health (no prefix)
- `GET /api/v1/health`
- `GET /api/v1/version`

### Domain rule

**No LLM imports in `app/domain/`** (DEC-002). Settlement is deterministic only.

---

## Documentation (`docs/`)

| File | Purpose |
|------|---------|
| `PRD.md` | Product scope |
| `ARCHITECTURE.md` | System design, APIs, entities |
| `IMPLEMENTATION_PLAN.md` | P01–P14 execution phases |
| `PHASE_CHECKLISTS.md` | Checkbox tracker |
| `DECISION_LOG.md` | Accepted decisions |
| `LOCAL_SETUP.md` | Dev environment |
| `REPO_STRUCTURE.md` | This file |

Planning docs are **source of truth** until code diverges — then update docs in the same PR.

---

## E2E tests (`tests/e2e/`)

- Playwright config at repo root (`playwright.config.ts`).
- Starts `frontend` dev server automatically unless `PLAYWRIGHT_SKIP_WEBSERVER=1`.
- Full journey tests (E1–E8) land in **P12**.

---

## References (`references/`)

- Local Rapido-inspired screenshots for **P13** only.
- Contents gitignored except `README.md` (DEC-025).

---

## CI (`.github/workflows/ci.yml`)

| Job | Runs on | Steps |
|-----|---------|-------|
| `backend` | PR + push | ruff, pytest |
| `frontend` | PR + push | lint, vitest, build |
| `e2e` | push to `main` | Playwright smoke |

---

## Deployment mapping

| Target | Path | Notes |
|--------|------|-------|
| **Vercel** | `frontend/` | Set as project root; `vercel.json` included |
| **Railway** | `backend/` | P11 — Postgres, CORS to Vercel URL |
| **GitHub** | repo root | Actions CI |

---

## What is intentionally empty

Scaffold only — filled in later phases:

- `backend/app/domain/` — settlement engine (**P04**)
- `backend/app/models/` — SQLite entities (**P05**)
- `frontend/src/components/ui/` — design system (**P03**)
- `frontend/src/features/` — feature modules (**P05+**)
- Business API routes (assured-pay, rides, settlement)

---

## Related documents

- [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
