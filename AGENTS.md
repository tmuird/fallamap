# AGENTS.md — fallamap

Operating manual for any agent working in this repo. Read this fully before touching code.

## What this is

`fallamap` is an event-focused social platform, originally built for Las Fallas (Valencia):
a live map of festival monuments, photo uploads, an official schedule, user profiles with
passport/collection features, and an admin moderation dashboard. The product direction is a
white-label "events social network": given an event itinerary/plan, it deploys per company/event.

Stack: Vite 6 + React 19 + TypeScript + Tailwind + HeroUI/shadcn, Mapbox GL (map),
Clerk (auth), Supabase (data/storage), Framer Motion, sonner (toasts). Deployed on Vercel
(https://fallamap.vercel.app), SPA rewrite in `vercel.json`.

## Commands

```bash
npm install --legacy-peer-deps   # install (legacy peer deps REQUIRED)
npm run build                    # tsc && vite build — MUST pass before every commit
npm run lint                     # eslint, --max-warnings 0 — MUST pass before every commit
npm run dev                      # dev server (http://localhost:5173)
```

Env vars come from `.env` (gitignored; see `.env.example`). Never commit `.env` and never
change its values in place unless explicitly instructed.

## Verification standard ("works flawlessly")

- A change is not done until `npm run build` AND `npm run lint` pass.
- UI changes are not done until the affected flow is exercised in a real browser
  (dev server) with zero new console errors.
- Never claim something works that you did not observe working. Mark unverified items
  explicitly in the plan/worklog.

## Git discipline (hard rules)

- Work happens on branch `overnight-polish` (or a branch cut from it). NEVER commit to
  `main`, never force-push, never rewrite history. `main` auto-deploys to production Vercel.
- Conventional commits, matching repo history: `fix: ...`, `feat: ...`, `style: ...`,
  `refactor: ...`, `chore: ...`. One logical change per commit. Commit early and often.
- Push the working branch to `origin` after each completed task (`git push origin overnight-polish`).
- Do not touch anything outside this repo. Do not run destructive git commands
  (`reset --hard`, `clean -fd`, `checkout --` on other people's work).

## Architecture map

- `src/App.tsx` — routes, ClerkProvider (incl. appearance theming), Toaster, footer, loading screen.
- `src/components/MapPage.tsx` + `MapComponent.tsx` — the map: markers, clustering, search pill.
- `src/components/ui/FallaDetails.tsx` — monument detail drawer (overlay over map).
- `src/components/{HomePage,SchedulePage,ArchivePage,ContactPage,Navbar,SignInPage,SignUpPage}.tsx` — pages.
- `src/components/profile/` — user profile: ActivityView, CollectionView, PassportView.
- `src/components/admin/` — moderation dashboard (image/comment review).
- `src/components/fallas.json`, `official_events.json` — event data consumed by map/schedule.
- `src/lib/supabase.ts` — Supabase client; `src/lib/hooks/` — data hooks.
- `src/styles/globals.css` + `tailwind.config.js` — design tokens (`falla-*` colors,
  `ink-border`, `soft-shadow`, custom fonts in `src/assets/`).

## Known war zones (read before editing)

- **Monument drawer vs map canvas**: the drawer and the Mapbox canvas have repeatedly
  interfered (pointer events bleeding through, stacking-context fights). Current mitigations:
  body classes when the drawer is open + absolute top-layer stacking + disabling map pointer
  events while the drawer is active. If you touch the drawer or map events, test open/close
  repeatedly and check nothing else on the page stops responding.
- **Mapbox token**: `VITE_MAPBOX_ACCESS_TOKEN` must be a real `pk.eyJ...` token. The
  production Vercel env currently holds a broken placeholder (`pk.eyJ1Ij...Oskg`) — the map
  cannot load tiles without a valid token. Code must degrade gracefully when the token is
  missing/invalid (clear in-app message or token-free map fallback), never a blank canvas.

## Product direction (guides all refactors)

- Event-specific data (names, dates, coordinates, branding strings) must live in data/config
  files (JSON / constants module), not scattered through components. No new hardcoded
  "Valencia"/"Fallas" strings in components.
- The app should look and behave identically when pointed at a different event dataset.
- Prefer targeted fixes and small cleanups over rewrites. Do not upgrade dependencies or
  change build tooling as part of bugfix work.

## Plan & worklog protocol

- `PLAN.md` is the source of truth for task state. Before starting work: read it. After each
  task: tick it off (or record status), append a dated entry to `## Worklog` (what changed,
  what was verified, what remains). Keep entries short and factual.
- If you discover a new bug, add it to PLAN.md under the right priority bucket rather than
  silently expanding scope. P0/P1 before P2/P3.
