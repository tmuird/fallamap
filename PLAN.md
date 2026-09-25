# PLAN.md — fallamap overnight refinement

**STATUS: IN PROGRESS** (target: every acceptance criterion below VERIFIED)

Mission: make fallamap work flawlessly — every flow functional, zero console errors,
clean build + lint, graceful degradation, and deployment streamlined so a fresh clone
deploys with documented env vars. Product direction: white-label event social network
(event data config-driven, deployable per event/itinerary).

## Acceptance criteria (definition of "flawless")

- [ ] `npm run build` passes (tsc clean, no vite errors)
- [ ] `npm run lint` passes with zero warnings
- [ ] Every route (/, /map, /schedule, /archive, /contact, /profile, /sign-in, /sign-up, /dashboard) renders with zero console errors
- [ ] Map: renders tiles, shows monument markers from fallas.json, marker → drawer open/close works repeatedly without pointer-event or stacking interference, no blank canvas on bad/missing token (graceful fallback)
- [ ] Auth: sign-up / sign-in / sign-out flows work end to end (Clerk)
- [ ] Photo upload flow works against Supabase (or degrades with a clear user-facing message)
- [ ] Schedule page renders official events correctly from data
- [ ] Profile: activity, collection, passport views render and load user data safely (no crash when logged out / no data)
- [ ] Admin moderation dashboard renders and its review actions behave
- [ ] Responsive layout: no horizontal scroll / broken overlays on laptop + mobile widths
- [ ] Deployment: README rewritten (real project README, setup, env vars, deploy steps), `.env.example` accurate, fresh-clone → build → deploy path documented and verified
- [ ] White-label readiness: event-specific strings/data all sourced from data/config files (no new hardcoded Valencia/Fallas strings in components)
- [ ] All work committed on `overnight-polish`, pushed to origin, merge-ready (no conflicts with main)

## Task list

### P0 — broken / blocking
- [ ] T0.1 Replace broken Mapbox token handling: validate token format at startup, graceful fallback (clear message or OSM/MapLibre tiles) when missing/invalid
- [ ] *(audit findings to be inserted here)*

### P1 — major
- [ ] *(audit findings to be inserted here)*

### P2 — minor
- [ ] *(audit findings to be inserted here)*

### P3 — polish / white-label
- [ ] T3.1 Replace stock template README.md with real project README
- [ ] T3.2 Sweep hardcoded Valencia/Fallas strings in components → data/config modules

## Out of scope tonight (record, don't do)

- Dependency upgrades, build-tooling changes, wholesale rewrites
- Anything requiring production secrets (Vercel account, service-role keys)
- Merging to `main` / production deploys (human decision in the morning)

## Blockers / notes

- **Mapbox token**: production Vercel env contains a placeholder (`pk.eyJ1Ij...Oskg`) — user
  will paste a real token. Until then T0.1's fallback keeps the map usable.

## Worklog

<!-- newest entries at top; format: HH:MM — what changed | what was verified | what remains -->
- 01:30 — PLAN.md, AGENTS.md, .env/.env.example created; branch `overnight-polish` cut | build passes on unmodified main snapshot | audit in flight
