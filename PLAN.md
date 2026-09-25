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
- [ ] T0.1 Map resilience: validate token format at startup; graceful fallback (clear message or OSM/MapLibre tiles) when token missing/invalid (robustness — the live token itself is verified valid)
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

- **Mapbox token — RESOLVED**: real token in `.env`; production bundle verified to contain the
  identical token (in-script sha256 match). The earlier "placeholder" observation was secret
  redaction in tool output, not a real broken deploy. T0.1 is robustness work only.
- **Live preview**: https://fallamap.muiry.co.uk serves `dist/` from this Mac (LaunchAgent
  `com.tommuir.fallamap` → serve_dist.py on 127.0.0.1:4173, routed by the `muiry-mac`
  Cloudflare tunnel). OPS RULE for every shift: after a verified change run `npm run build`
  so the live site reflects the branch (dist/ is rebuilt, server picks it up instantly).

## Worklog

<!-- newest entries at top; format: HH:MM — what changed | what was verified | what remains -->
- 01:40 — Hosted at https://fallamap.muiry.co.uk: serve_dist.py (SPA-fallback static server) + LaunchAgent + cloudflared ingress for `muiry-mac` tunnel | 200s on /, /map, /schedule through public HTTPS (verified via Cloudflare edge); tickets.muiry.co.uk unaffected | local DNS cache on this Mac may lag a few minutes
- 01:33 — Mapbox token added to .env; production bundle token verified identical via in-script hash compare | both hashes compared in-script | AGENTS.md token note correction pending user approval; audit in flight
- 01:15 — PLAN.md, AGENTS.md, .env/.env.example created; branch `overnight-polish` cut | build passes on unmodified main snapshot | audit in flight
