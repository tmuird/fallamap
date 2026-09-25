# PLAN.md — fallamap overnight refinement

**STATUS: IN PROGRESS** (target: every acceptance criterion below VERIFIED)

Mission: make fallamap work flawlessly — every flow functional, zero console errors,
clean build + lint, graceful degradation, and deployment streamlined so a fresh clone
deploys with documented env vars. Product direction: white-label event social network
(event data config-driven, deployable per event/itinerary).

## Acceptance criteria (definition of "flawless")

- [x] `npm run build` passes (tsc clean, no vite errors)
- [x] `npm run lint` passes with zero warnings (verified 04:58 via T1.3 — `eslint src --report-unused-disable-directives --max-warnings 0`, 0 problems)
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

> Backend-dependent criteria (photo upload, moderation, live user data, end-to-end auth sync) can
> only be fully verified against a live Supabase project — currently unreachable (see Blockers).
> Until then: code must be ready, tested against the schema in `scripts/schema.sql`, and degrade
> with a clear user-facing state.

## Task list

### P0 — broken / blocking
- [x] T0.1 App resilience: error boundary around routes; wrap `mapboxgl.Map` init in try/catch + `mapboxgl.supported()` gate with static "map needs WebGL" fallback (AUDIT §1 — whole app white-screens on map init failure)
- [x] T0.2 `scripts/schema.sql` + seed migration: comments/images/image_likes/user_interactions tables, community-content storage bucket + policies, event_id/hub_id columns, FKs for embedded selects; seed script runs schema first (AUDIT §4) — verified locally via `npm run verify:schema`
- [x] T0.3 Clerk↔Supabase auth wiring: supabase-js `accessToken` callback + SupabaseAuthBridge (Clerk `session.getToken()`; the plan's `template: 'supabase'` path is deprecated since Apr 2025 — see docs/supabase-clerk-auth.md for the third-party-auth setup), RLS keyed on Clerk `sub` in scripts/schema.sql | verified via `npm run verify:schema` + browser runtime probe; live signed-in E2E needs a live Supabase project (Blockers); moderation admin path deferred to T1.2

### P1 — major
- [x] T1.1 Graceful degradation: community-offline state when Supabase is unreachable — reachability probe (src/lib/backendStatus.ts, HEAD probe + 45s retry + browser-online event), global CommunityOfflineBanner, offline-aware empty states in FallaDetails | browser-verified both offline→online→offline transitions on dev server
- [x] T1.2 Real moderation pipeline: hooks insert `status:'pending'` (useFallaDetails/useEventDetails); admin fetches gated behind `isLoaded && isAdmin`; server-side admin enforcement in RLS (`public.is_admin()` on the Clerk claim `public_metadata.role`, status-only column-level UPDATE grants, non-admin inserts forced to 'pending') | verified via `npm run verify:schema` (new admin/queue/self-approve/forged-claim cases all pass) + browser: /dashboard signed-out fires zero moderation queries and zero console errors | live signed-in admin E2E unverified (needs live Supabase + the Clerk session-token claim from docs/supabase-clerk-auth.md)
- [x] T1.3 Make `npm run lint` work: ESLint 9 flat config (`eslint.config.js`) replaces `.eslintrc.cjs`, missing lint devDeps installed (typescript-eslint, eslint-plugin-react-hooks/-refresh, globals), script drops `--ext` | `npm run lint` passes CLEAN (0 problems, `--max-warnings 0`, exit 0); `npm run build` green; browser smoke /map + /schedule | deviations in eslint.config.js comments: storybook preset dropped (no stories), `no-explicit-any` off until T3.5, react-compiler-era react-hooks rules not enabled (11 pre-existing hits = behavioural refactor, see worklog)
- [x] T1.4 fallas.json data model + number-keyed sync: every entry gains `id` (`falla-<number>`)/`description`/`is_special`/`is_burnt` (honest defaults, no fabricated data — fields now mirror the DB columns); seed upserts the new columns; MapComponent merges DB rows over local per `number` (missing fields fall back, AUDIT §3 note); "Special" filter is data-driven — hidden when no monument is flagged, no more "0 of 85"; FallaDetails user_interactions reads/writes use the `number`→DB-id resolution (useFallaDetails exposes `dbId`, reset per entity) and localStorage stays keyed on `number` (AUDIT §2) | verified via `npm run verify:schema` (ALL SCHEMA CHECKS PASSED: enriched-columns + number-resolved interaction cases, seed idempotent) + browser: /map 85 markers, Special pill hidden, ?falla=1 drawer + visited toggle round-trips on `number` keys, ?hub= description block intact, Next nav 1→3, zero new console errors | signed-in DB sync unverified (Supabase NXDOMAIN); the pill reappearing on `is_special:true` data is a one-line conditional, not browser-tested
- [ ] T1.5 One event dataset: move SchedulePage's ~260-line hardcoded scheduleData into official_events.json (single source of truth); fix dead `events` refs in hubs (AUDIT §3)
- [ ] T1.6 Rewrite README.md: real setup, .env.example walkthrough, schema+seed steps, Vercel deploy, white-label config guide (AUDIT §6)
- [ ] T1.7 Hub-interaction data loss: PassportView crash on hub likes (null fallas join) + refreshInteractions erasing hub ids (AUDIT §2)

### P2 — minor
- [ ] T2.1 CSP: add clerk-telemetry.com to connect-src (kills per-page console errors) (AUDIT §1)
- [ ] T2.2 /profile: redirect signed-out users to /sign-in (or render CTA); no broken avatar
- [ ] T2.3 Loading screen: gate on real readiness instead of fixed 1.2s
- [ ] T2.4 Fail fast on missing Clerk key (remove silent fallback instance)
- [ ] T2.5 Merge useFallaDetails/useEventDetails into one parameterized hook (~80% duplicated)
- [ ] T2.6 Photo upload: client-side size/type validation + delete-on-failure
- [ ] T2.7 Bundle: route-level React.lazy + manualChunks (3.17MB single chunk today)
- [ ] T2.8 White-label: extract festival copy/title/branding into per-tenant config (index.html title, hero copy, header counts)
- [ ] T2.9 MascletaCountdown: compute against Europe/Madrid, not browser TZ
- [ ] T2.10 Remove unused deps (openai, react-transition-group, mapbox-gl-animated-popup, yet-another-react-lightbox)
- [ ] T2.11 fallas.json: 11 entries have placeholder `{lat: 0, lng: 0}` coordinates (numbers 8, 122, 129, 144, 171, 177, 181, 309, 310, 325, 375 — from `scripts/fallatojson.py`'s "placeholder lat/lng" never re-geocoded) → markers land at Null Island and flyTo/Directions go there; re-geocode those streets (scripts/geocode.py)

### P3 — polish
- [ ] T3.1 ICS export: fix DTEND rollover for 23:59 events; add DTSTAMP/UID
- [ ] T3.2 Drawer a11y: add Drawer.Description (kills Radix warnings ×4)
- [ ] T3.3 Search highlight regex lastIndex bug; blur-timeout race → pointerdown handlers
- [ ] T3.4 Delete dead code (CountBtn, primitives, BackgroundGradient, background-beams, tracing-beam, infinite-moving-cards, bento-grid, config/site.ts, DashboardLayout.tsx — newly found: unrouted, stray debug log; fixed for lint in T1.3 but still dead)
- [ ] T3.5 Sweep 30 `any`/`@ts-ignore` sites; type JSON imports + hook returns
- [ ] T3.6 Misc: hardcoded "80 Monuments" count; numeric falla-number sorting; single map-effect cleanup; window.innerWidth in render

## Out of scope tonight (record, don't do)

- Dependency upgrades, build-tooling changes, wholesale rewrites
- Anything requiring production secrets (Vercel account, service-role keys)
- Merging to `main` / production deploys (human decision in the morning)

## Blockers / notes

- **BLOCKER — Supabase project dead**: `pkiqdgbttgngaeespiqy.supabase.co` is NXDOMAIN
  (verified: dig + curl, direct and via 1.1.1.1). All community features (comments, photos,
  likes, interactions, moderation) cannot work against ANY project until the user either
  revives this Supabase project or points `.env` at a new one (then run `scripts/schema.sql`
  + seed; also update the Vercel env). Until then: T0.2 ships the schema, T1.1 gives the app
  an honest offline state. USER DECISION REQUIRED in the morning.
- **Mapbox token — RESOLVED**: real token in `.env`; production bundle verified to contain the
  identical token (in-script sha256 match). The earlier "placeholder" observation was secret
  redaction in tool output, not a real broken deploy. No map-token work needed.
- **Live preview**: https://fallamap.muiry.co.uk serves `dist/` from this Mac (LaunchAgent
  `com.tommuir.fallamap` → serve_dist.py on 127.0.0.1:4173, routed by the `muiry-mac`
  Cloudflare tunnel). OPS RULE for every shift: after a verified change run `npm run build`
  so the live site reflects the branch (dist/ is rebuilt, server picks it up instantly).

## Worklog

<!-- newest entries at top; format: HH:MM — what changed | what was verified | what remains -->
- 06:05 — T1.4: fallas.json data model + number-keyed interaction sync — all 80 entries gain `id` (`falla-<number>`)/`description`/`is_special`/`is_burnt` (honest empty/false defaults, NO fabricated real-world data; fields now mirror the DB columns), seed upserts the new columns, MapComponent merges DB rows over local per `number` with field-level fallback, "Special" filter pill hidden unless some POI is flagged (was permanently "0 of 85"), description block renders for any POI with one; FallaDetails user_interactions reads/writes now go through useFallaDetails's `number`→DB-id resolution (`dbId` exposed) instead of `falla.id` (was `eq('falla_id', undefined)` + `falla_id: undefined` inserts) — also fixed a found-by-the-way bug: `internalId` was never reset, so a monument missing from the DB inherited the previous monument's row id | npm run verify:schema ALL SCHEMA CHECKS PASSED (new enriched-columns + number-resolved read/insert/delete cases; seed idempotent 80 fallas/5 hubs); build green (tsc+vite); lint CLEAN (0 problems); browser on dev server: /map 85 markers (80 fallas + 5 hubs) + map canvas + Special pill hidden + pills All/Events/Liked/Visited, ?falla=1 drawer (badge "Monument #1", name, offline copy, empty-description block correctly absent), visited toggle round-trips on `number` keys ([\"1\"]→[] with button flip both ways), ?hub=hub-ajuntament "About this location" block intact, Next nav ?falla=1→?falla=3 (gap-tolerant), zero new console errors (only headless geolocation denial) | signed-in DB sync unverified (Supabase NXDOMAIN); Special-pill reappearing on `is_special:true` data untested (one-line conditional); NEW BUG logged as T2.11: 11 fallas carry {lat:0,lng:0} placeholder coordinates (geocode never re-run)
- 04:58 — T1.3: ESLint 9 flat config migration — eslint.config.js replaces .eslintrc.cjs, lint script drops flat-config-invalid --ext, and the missing lint devDeps installed (typescript-eslint, eslint-plugin-react-hooks/-refresh, globals — the old config referenced them but they were never declared); all findings fixed: 3 unused catch bindings + prefer-const + unused catch param, stale @ts-ignore removed (react-photo-view ships ./dist/index.d.ts now — verified in node_modules), DashboardLayout redirect gated on isLoaded with real deps + stray debug log removed (file is unrouted dead code → noted under T3.4), justified inline suppressions for mount-only effect deps (marker effect setSearchParams, dead marquee effect) and shadcn/context export patterns | npm run lint CLEAN (0 problems, --max-warnings 0, exit 0 — first working lint in this repo); build green (tsc+vite, confirms the @ts-ignore removals were safe); browser smoke: /map 86 markers + ?falla=1 drawer, /schedule timeline render, zero new console errors | deviations documented in eslint.config.js: no-explicit-any off until T3.5, react-compiler-era react-hooks rules not enabled (set-state-in-effect ×9 etc. = behavioural refactor, not config migration)
- 04:39 — T1.2: moderation pipeline is real — hooks (useFallaDetails/useEventDetails) insert status:'pending' (toasts now say "awaiting review"; FallaDetails upload also surfaces insert failures), admin queues fetch only when `isLoaded && isAdmin` and status flips confirm the updated row before removing it from the list; RLS enforces admin server-side (public.is_admin() on Clerk claim public_metadata.role: full reads + status-only updates via column-level UPDATE grant; non-admin inserts forced to 'pending'; owners cannot self-approve or edit content) | npm run verify:schema ALL SCHEMA CHECKS PASSED incl. new cases (admin sees/updates others' queue rows, admin cannot rewrite text or impersonate, non-admin cannot moderate, forged top-level role claim grants nothing); build green (tsc+vite); browser on dev server: signed-out /dashboard fires ZERO moderation queries + zero console errors (was 2 + errors), Access Denied intact, /map?falla=1 drawer + offline states unchanged | live signed-in moderation E2E unverified (Supabase NXDOMAIN; also needs the Clerk session-token claim setup in docs/supabase-clerk-auth.md); lint unchanged (pre-T1.3)
- 03:35 — T1.1: src/lib/backendStatus.ts reachability store (HEAD /rest/v1/ probe: any HTTP response = online, network failure/timeout = offline; 45s re-probe + browser 'online' event) + CommunityOfflineBanner (global, role=status) + FallaDetails empty states swap "be the first" copy for "community features are offline right now" when offline | build green (tsc+vite); browser on dev server (NXDOMAIN backend): banner + offline drawer copy render, stubbed-success probe clears banner and restores normal copy, rejecting probe brings both back — all three states observed, zero new console errors | live-backend online path unverified (needs live Supabase); lint still pre-T1.3-broken (unchanged, not worse) 
- 03:27 — T0.3: Clerk↔Supabase auth wired (src/lib/supabase.ts `accessToken` callback + src/lib/SupabaseAuthBridge.tsx registering Clerk `session.getToken()` — plan's 'supabase' JWT template is deprecated since Apr 2025, deviation documented in docs/supabase-clerk-auth.md incl. one-time third-party-auth setup) + scripts/schema.sql RLS rewritten keyed on auth.jwt()->>'sub': owner-only writes (comments/images/image_likes/interactions), private/pending reads owner-only, interactions fully private, storage uploads require auth; harness stubs got auth.jwt(), smoke tests got sub-keyed positive+negative RLS cases | npm run verify:schema ALL SCHEMA CHECKS PASSED (owner writes pass; cross-user insert/update/delete rejected; private/pending invisible cross-user; anon sees approved-public only, cannot write); build green (tsc+vite); browser on dev server: accessToken runtime probe verified all 4 paths (no getter→anon key, token→Bearer pass-through, throwing/null getter→anon fallback), /map 85 content markers (80 fallas+5 hubs) + ?falla=1 drawer details + open/close, zero new console errors | signed-in E2E vs live Supabase still blocked (NXDOMAIN); moderation queue blocked until T1.2 adds admin JWT-claim override (update policy now owner-only) 
- 02:17 — T0.2: scripts/schema.sql migration (fallas/hubs/comments/images/image_likes/user_interactions/contact_submissions, event_id/hub_id columns, FKs for every embedded select, community-content bucket + policies) + seed script now applies schema first (pg devDep, npm run seed); npm run verify:schema local harness | throwaway Postgres 16 run: schema applies clean + idempotent ×2, seed = schema → 80 fallas + 5 hubs and safe to re-run, smoke tests mirror all app query shapes (likes count embed, fallas(number), PassportView nested fallas→images, hub embed, anon read / authenticated write RLS, one-target CHECK + duplicate-interaction guard) — ALL SCHEMA CHECKS PASSED | RLS is an INTERIM baseline (open writes) — T0.3/T1.2 tighten to Clerk sub + admin; live-project run still blocked (Supabase NXDOMAIN)
- 02:05 — T0.1: ErrorBoundary around Routes (src/components/ui/ErrorBoundary.tsx) + map init gated on mapboxgl.supported() with try/catch and static "Map unavailable / needs WebGL" fallback | browser-verified on dev server: normal /map 85 markers + ?falla=1 drawer/details + 0 console errors; boundary verified via temporary throw route (removed before commit) — fallback card, navbar intact; WebGL blocked via injected getContext shim → fallback rendered, app shell + search→drawer still work, 0 uncaught errors | —
- 01:55 — Deep QA audit complete (AUDIT.md: 3 P0, 9 P1, 13 P2/P3 + verified-working list); findings folded into PLAN.md as T0.1–T3.6 | audit itself browser-verified all 9 routes; Supabase NXDOMAIN claim re-verified independently | first grind shift picks up P0 at 02:04
- 01:40 — Hosted at https://fallamap.muiry.co.uk: serve_dist.py (SPA-fallback static server) + LaunchAgent + cloudflared ingress for `muiry-mac` tunnel | 200s on /, /map, /schedule through public HTTPS (verified via Cloudflare edge); tickets.muiry.co.uk unaffected | local DNS cache on this Mac may lag a few minutes
- 01:33 — Mapbox token added to .env; production bundle token verified identical via in-script hash compare | both hashes compared in-script | AGENTS.md token note correction pending user approval; audit in flight
- 01:15 — PLAN.md, AGENTS.md, .env/.env.example created; branch `overnight-polish` cut | build passes on unmodified main snapshot | audit in flight
