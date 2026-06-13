# Release & Demo Checklist

Use this before pushing to GitHub, deploying to Vercel, or presenting the prototype.

---

## 1. Environment

- [ ] `backend/.env` copied from `backend/.env.example` (not committed)
- [ ] `frontend/.env.local` copied from `frontend/.env.example`
- [ ] `NEXT_PUBLIC_API_URL` has **no trailing slash**
- [ ] `GROK_COPY_ENABLED=false` unless demoing Grok assist explicitly
- [ ] Production: `CORS_ORIGINS` includes Vercel preview + production URLs

## 2. Local smoke (frontend-only OK)

```powershell
npm run dev:frontend
```

- [ ] http://localhost:3000/home loads
- [ ] `/booking` shows Assured Pay discovery card
- [ ] `/ride/live` → "Explain my fare" shows **Policy summary** (Grok off)
- [ ] `/ride/completed?outcome=valid_overage` shows residual due
- [ ] `/ride/completed?outcome=suspicious_overage` shows under review
- [ ] Demo scenarios → **Open residual due** → recovery banner on `/home`

## 3. Full stack smoke (recommended)

```powershell
npm run dev
```

- [ ] http://localhost:8000/docs loads
- [ ] `GET /api/version` returns JSON
- [ ] Frontend settlement/recovery hit API (Network tab — not only mock fallback)

## 4. Automated tests

```powershell
npm run test
npm run test:e2e
npm run build
```

- [ ] Backend pytest green
- [ ] Frontend Vitest green
- [ ] Playwright demo flows green (9 tests)
- [ ] `npm run build` succeeds

## 5. GitHub

- [ ] No secrets in diff (`.env`, API keys)
- [ ] `.gitignore` covers `backend/.env`, `frontend/.env.local`
- [ ] CI workflow passes on `main`

## 6. Vercel

- [ ] Root Directory = `frontend`
- [ ] `NEXT_PUBLIC_API_URL` set in project env
- [ ] Preview deploy loads `/home` and `/booking`
- [ ] If backend deployed: CORS allows Vercel origin

## 7. Demo-day kit

- [ ] [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) printed or on second monitor
- [ ] Default persona: **Time-critical commuter**
- [ ] Backup: frontend-only mode if backend host is down (mocks activate)
- [ ] Grok disabled unless key verified on stage Wi‑Fi

---

## Known prototype limits (do not claim in demo)

| Limit | Impact |
|-------|--------|
| In-memory data | Refresh may reset state unless backend running |
| No real payments | Pay CTAs simulate success |
| No auth | Anyone can switch personas via `/demo/scenarios` |
| Analytics seeded | KPIs are illustrative, not live |

## Demo-day risks

| Risk | Mitigation |
|------|------------|
| Backend cold start / down | Frontend mocks cover core flows; run backend locally as backup |
| Grok API timeout | Default off; fallback always shows Policy summary |
| Vercel env misconfigured | Verify `NEXT_PUBLIC_API_URL` in deploy logs |
| Mobile viewport | Demo on Pixel-width browser; bottom nav uses fixed layout |
| CORS mismatch | Match exact Vercel URL in `CORS_ORIGINS` |

---

**Sign-off:** _______________ **Date:** _______________
