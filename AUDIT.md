# fallamap — Deep QA Audit

Branch: `overnight-polish` @ b9b3ff5 · Audited 2026-09-25 · Dev server (`npm run dev`, Vite :5173) exercised in a real Chromium (headless Chrome for Testing 153, driven over CDP) — every route loaded, console/exception/network output captured, map drawer interactions clicked.

Severity: **P0 broken** · **P1 major** · **P2 minor** · **P3 polish**. Every finding: `severity | file:line | description | fix`.

---

## 1. Runtime (all 9 routes loaded in a browser)

| Sev | Location | Problem | Fix |
|---|---|---|---|
| **P0** | `src/components/MapComponent.tsx:125` + `src/App.tsx:126` | Any `mapboxgl.Map` construction failure (WebGL unavailable: headless browsers, VMs, some locked-down corporate devices) throws out of the effect and React unmounts the **entire app** — verified: `/map` rendered `#root` with 0 children, zero text, no header/footer, no error UI. There is no error boundary anywhere in the tree, so *any* component crash takes the whole site down. | Wrap `new mapboxgl.Map` in try/catch (or gate on `mapboxgl.supported()`), render a static fallback ("map requires WebGL"), and add an error boundary around `<Routes>`. |
| **P2** | `index.html:7` | CSP `connect-src` omits `https://clerk-telemetry.com`; Clerk emits 2 fetch CSP violations + console errors on **every page load** (verified on all 9 routes). | Add `https://clerk-telemetry.com` to `connect-src` (or drop Clerk telemetry). |
| **P2** | `src/components/profile/UserProfile.tsx:19` | `/profile` is public: signed-out users get "Bon dia, Faller" with a broken `<img src={undefined}>` avatar and empty sections; no redirect to sign-in. | Redirect unauthenticated users to `/sign-in` (or render a sign-in CTA instead of the avatar). |
| **P2** | `src/components/admin/ImageReview.tsx:35-37`, `CommentReview.tsx:33-35` | `/dashboard` fires both moderation queries **before** the admin gate returns "Access Denied" — verified console errors `Error fetching images/comments` for a signed-out visitor. | Move `fetchPending*` behind the `isAdmin` check. |
| **P2** | `src/App.tsx:54-60` | Fixed 1.2 s artificial loading screen on every navigation-ready app boot. | Gate on actual Clerk/asset readiness or drop below 300 ms. |
| **P3** | `src/components/MapComponent.tsx:516-520` | Every drawer open logs Radix/Vaul a11y warnings ×4: `Missing Description or aria-describedby for {DialogContent}`. | Add `<Drawer.Description>` (or `aria-describedby={undefined}`). |

Console errors observed (besides the above): `Geolocation error` (headless denies the permission — expected, not counted as a finding), Supabase `ERR_NAME_NOT_RESOLVED` (see §4).

Routes verified rendering correct content: `/` (hero, "80 MONUMENTS", CTA pills), `/schedule` (6-day timeline), `/archive`, `/contact`, `/profile`, `/sign-in` + `/sign-up` (Clerk forms with Google button + email/password rendered live), `/dashboard` ("Access Denied" for anon).

---

## 2. Map flow (MapComponent / MapPage / FallaDetails)

**The known drawer-vs-map-canvas bug class is FIXED and verified working** (see "Verified working"). Remaining issues:

| Sev | Location | Problem | Fix |
|---|---|---|---|
| **P1** | `src/components/ui/FallaDetails.tsx:104,132,137` | DB interaction sync writes/queries `falla_id: falla.id`, but local-JSON fallas have **no `id`** (see §3) → `eq('falla_id', undefined)` / inserts with `falla_id: undefined` fail. localStorage keys use `number`, DB uses `id` — the two stores can never agree for monuments. | Resolve the DB id by `number` (as `useFallaDetails` already does) before read/write; key both stores on `number`. |
| **P2** | `src/components/MapComponent.tsx:104-105` | `refreshInteractions` maps `i.fallas?.number` and `.filter(Boolean)` — hub interactions (`hub_id`) have no `fallas` join, so hub likes/visited are silently erased from local state on every sync. | Also map `i.hubs?.id` (or store hub ids separately). |
| **P3** | `src/components/MapComponent.tsx:474-493` | Autocomplete highlight uses `new RegExp(\`(${searchQuery})\`, 'gi')` then `regex.test(part)` — global regex `lastIndex` is stateful, so highlight matches alternate incorrectly. | Use `part.toLowerCase().includes(searchQuery.toLowerCase())` or reset `regex.lastIndex = 0`. |
| **P3** | `src/components/ui/FallaDetails.tsx:410` | `window.innerWidth` evaluated during render for icon size — stale on resize, breaks SSR. | CSS (`size={28}` + `md:size-9`) or a resize-aware hook. |
| **P3** | `src/components/MapComponent.tsx:247-261` | Two identical cleanup returns from the map effect (geolocation branch + fallback); markers/els refs are cleared twice; `@ts-ignore` on `ThemeContext` at :49-50. | Single cleanup; type the context properly. |
| **P3** | `src/components/MapComponent.tsx:408` | Search blur closes autocomplete after a 200 ms timeout — click-through works today (verified) but is race-prone. | Use `onMouseDown`/`pointerdown` on results instead of blur timeout. |

Marker rendering verified: 85 markers (80 fallas + 5 hubs) with zoom-scaled CSS (`--marker-scale` set on zoom), user-location marker added, visibility filtering per search/filter works.

---

## 3. Data (fallas.json / official_events.json)

`fallas.json` (80 entries) keys per entry: **`number`, `name`, `time`, `coordinates` only**. `official_events.json` (5 hubs): `id`, `name`, `description`, `type`, `coordinates`, `events[]`.

| Sev | Location | Problem | Fix |
|---|---|---|---|
| **P1** | `src/components/fallas.json:1` ↔ `src/components/MapComponent.tsx:29-30,302,338` | No entry has `is_special` or `is_burnt` → the "Special" filter shows **0 of 85 markers** (verified live) and the `.marker.burnt` style (`globals.css:170`) is dead code. No entry has `id` or `description` either → `FallaDetails` hub description block and DB sync (see §2) can never work from local data. | Add the fields to the dataset (or remove the features); generate `id` deterministically if the DB needs one. |
| **P1** | `src/components/SchedulePage.tsx:35-297` | The official program is a ~260-line hardcoded `scheduleData` array, duplicating `official_events.json`'s domain; the hub `events: ["mascleta","crema-muni"]` refs in `official_events.json:1` match no schedule id (`mascleta-14`, …) and are **never read by any code**. Two sources of truth, one half-dead. | Single event dataset (JSON) consumed by both map hubs and the schedule; fix or delete the `events` refs. |
| **P3** | `src/components/FallamapHeader.tsx:34` | "80 Monuments" hardcoded (coincidentally equals current `fallas.json` length). | `localFallas.length` or config. |
| **P3** | `src/components/fallas.json` | Numbers are non-contiguous (1, 3, 4, 6, 7, 8, …) — fine, but "Next" navigation jumps 1 → 3 (verified), which reads as a bug to users; also `.order('number')` on Supabase sorts lexicographically ("1","10","2") for string columns. | Sort numerically client-side; tolerate gaps. |

Note: `MapComponent.tsx:66` merges Supabase rows over local JSON when the DB returns data — since seeded DB rows would lack `is_special/is_burnt` values too, the Special/Burnt features are broken regardless of source.

---

## 4. Backend integration (Supabase + Clerk)

| Sev | Location | Problem | Fix |
|---|---|---|---|
| **P0** | `scripts/seed_supabase.js:24-26` | The seed script creates **no schema at all** — it only upserts `fallas` rows into an assumed-existing table. Nothing in the repo creates `comments`, `images`, `image_likes`, `user_interactions`, the `community-content` storage bucket (`FallaDetails.tsx:193`, `SchedulePage.tsx:387`), the `event_id`/`hub_id` columns (`useEventDetails.ts:9-10`, `useFallaDetails.ts:36-45`), or the FKs needed for embedded selects (`likes:image_likes(count)` at `useFallaDetails.ts:43`, `fallas(number)` at `MapComponent.tsx:100`, nested `fallas(…images(…))` at `PassportView.tsx:27-37`). Against a fresh Supabase project **every** comment/image/like/interaction/moderation call fails (404/400), while the app shows empty states and looks "fine". | Ship a `schema.sql` migration (tables, columns, FKs, RLS, storage bucket + policies) and make the seed script run it first. |
| **P0** | `src/lib/supabase.ts:10` | Clerk↔Supabase auth is **not wired at all**: the client is created with the anon key and no Clerk token is ever attached (no `accessToken` callback, no `setAuth`, no Supabase third-party-auth/Clerk JWT integration anywhere). `user_id` values written are Clerk IDs (`useFallaDetails.ts:70`, `FallaDetails.tsx:135-138`) — on any Supabase project with `auth.uid()`-based RLS these inserts/deletes are rejected; Supabase cannot verify a Clerk JWT at all today. | Use supabase-js `accessToken: () => clerk.session.getToken({ template: 'supabase' })`, enable Supabase third-party auth for Clerk (JWT template), and write RLS policies keyed on the Clerk `sub`. |
| **P1** | `.env:2` (`VITE_SUPABASE_URL`) | The configured project host `pkiqdgbttgngaeespiqy.supabase.co` does not resolve (verified `dig`: NXDOMAIN) — every Supabase call in the running app fails today (`ERR_NAME_NOT_RESOLVED`, captured in browser). Map falls back to `fallas.json` (works); all community features are silently empty. | Point `.env` at a live project (and document setup in README). |
| **P1** | `src/lib/hooks/useFallaDetails.ts:70,81`; `src/lib/hooks/useEventDetails.ts:83,105` | New comments/images are inserted with `status: "approved"` — the moderation pipeline (`ImageReview.tsx:23` pending queue) can never receive anything; moderation is a dead feature while unmoderated content goes straight live. | Insert `status: "pending"` and let the queue approve. |
| **P1** | `src/components/admin/ImageReview.tsx:16,41-44` | Admin check is client-side only (`publicMetadata.role === 'admin'`) and status updates run on the anon client; on a fresh project they either all fail (RLS) or, if RLS is opened up, anyone can approve/reject via REST. Comment at :14 admits "demo purposes". | Enforce admin in RLS (JWT claim) and/or a server function. |
| **P2** | `src/App.tsx:23-25` | Hardcoded fallback Clerk publishable key (`pk_test_YXB0LXNlYWd1bGwtODAuY2xlcmsuYWNjb3VudHMuZGV2JA`) — with a missing env var the app silently runs on someone else's Clerk dev instance; :27-29 `if (!PUBLISHABLE_KEY) throw` is dead code because the fallback is always truthy. | Fail fast on missing key (no fallback), or make the fallback explicit/dev-only. |
| **P2** | `src/lib/hooks/useFallaDetails.ts` vs `useEventDetails.ts` | ~80% duplicated hooks (same fetch/add/like logic, different id column) — drift risk already visible (`useEventDetails` handles errors, `useFallaDetails` mostly swallows them). | One parameterized hook (`entityColumn: 'falla_id' \| 'hub_id' \| 'event_id'`). |
| **P2** | `.env` / Supabase dashboard (n/a) | Photo uploads (`FallaDetails.tsx:193`) use `getPublicUrl` — correct only for a public bucket; no upload size/type validation and no cleanup on failed `addImage`. | Bucket policies + client-side validation + delete-on-failure. |

---

## 5. Code quality

| Sev | Location | Problem | Fix |
|---|---|---|---|
| **P1** | `package.json:11` + `.eslintrc.cjs:1` | `npm run lint` is **completely broken**: installed ESLint 9 requires `eslint.config.js` (flat config) but the repo has legacy `.eslintrc.cjs` — verified: "ESLint couldn't find an eslint.config.(js,mjs,cjs) file." Zero linting is happening. | Migrate to flat config (`eslint.config.js`) or pin ESLint 8. |
| **P2** | `package.json:27-31` | Unused dependencies shipped: `openai`, `react-transition-group`, `mapbox-gl-animated-popup` (only a `declare module` stub in `vite-env.d.ts:2`), `yet-another-react-lightbox` (react-photo-view used instead). | Remove. |
| **P2** | build output | Single JS chunk of **3.17 MB** (878 KB gzip) — Vite warns; all routes, Clerk, Mapbox, HeroUI, tsparticles in one bundle. | Route-level `React.lazy` + `manualChunks`. |
| **P3** | `src/components/SchedulePage.tsx` (955 lines), `MapComponent.tsx` (556) | Components over the 500-line guideline; SchedulePage mixes data, ICS logic, drawer UI, community hub. | Split data / helpers / subcomponents. |
| **P3** | `MapComponent.tsx:50,85`, `FallaDetails.tsx:35,135,198`, hooks (30 total) | 30 `any`/`@ts-ignore` occurrences; `tsc` passes only because of them. | Type the JSON imports + hook return types; kill `@ts-ignore`. |
| **P3** | `CountBtn.tsx`, `primitives.ts`, `BackgroundGradient.tsx`, `ui/background-beams.tsx`, `ui/tracing-beam.tsx`, `ui/infinite-moving-cards.tsx`, `ui/bento-grid.tsx`, `config/site.ts` | Dead code — nothing imports these (verified grep); `config/site.ts` is stock "Next.js + NextUI" template config with dead links. | Delete. |
| **P3** | error handling generally | Most failures are `console.warn`/swallowed (`MapComponent.tsx:111-113`, `useFallaDetails.ts:58-60`); users see empty states with no signal that the backend is down (exactly the current NXDOMAIN situation). | Surface degraded-mode state (banner/toast) when Supabase is unreachable. |

---

## 6. Deployment

| Sev | Location | Problem | Fix |
|---|---|---|---|
| **P1** | `README.md:1` | Still the stock **react-vite-ui template README** ("Clone the repository: github.com/dan5py/react-vite-ui", `pnpm install`) — wrong install command, no env-var docs, no Supabase schema/seed instructions, no deploy notes. Fresh-clone setup is undocumented; the white-label goal has no onboarding at all. | Rewrite: real setup, `.env.example` walkthrough, schema + seed steps, Vercel deploy. |
| **P2** | whole app | White-label blockers while the stated goal is per-company deploys: hardcoded festival copy (`index.html:13` title "valència 2026", `SchedulePage.tsx:35-297` full Las Fallas program, `FallamapHeader.tsx:34`, homepage hero text), Valencia fonts/colors baked into Tailwind config. | Extract into a per-tenant config file (name, copy, events, branding). |
| **P3** | `src/components/SchedulePage.tsx:301-332` | `buildICS` bug: events at 23:59 (4 of them) get `DTEND` = `00:59` the **same date** → invalid calendar entries; also missing `DTSTAMP`/`UID`. | Roll `DTEND` to the next day when `endH < h`; add required ICS fields. |
| **P2** | `src/components/ui/MascletaCountdown.tsx:18-19` | Countdown targets 14:00 in the **browser's local timezone** (not Europe/Madrid) and ignores the schedule data — wrong outside Spain, wrong for non-daily events. | Compute against `Europe/Madrid` (or event timestamps). |
| OK | `vercel.json:1` | SPA rewrite + `installCommand: npm install --legacy-peer-deps` is correct for this dep tree. | — |
| OK | build | `npm run build` (tsc + vite build) succeeds on this checkout; `npx tsc --noEmit` clean. | — |

---

## Verified working (actually tested in a browser / CLI, with evidence)

1. **`npm run build` succeeds** — `tsc && vite build`, 9986 modules, built in 9.1 s (dist/assets/index-BcBQp91_.js). `npx tsc --noEmit` exits 0.
2. **All 9 routes load and render** — driven in headless Chrome via CDP against `npm run dev`; DOM text captured per route (home hero, 6-day schedule timeline, archive/contact copy, profile empty states, Clerk sign-in + sign-up forms with Google button, dashboard "Access Denied").
3. **Map renders with WebGL + valid token** — 85 markers (80 falla + 5 hub), user-location marker, zoom-scaled markers (`--marker-scale: 1.1`), search pill + 5 filter pills (ALL/EVENTS/SPECIAL/LIKED/VISITED) present. No Mapbox 401s observed (token valid).
4. **Drawer isolation (the historical bug class) is fixed** — with drawer open: `mapboxgl-map` computed `pointer-events: none` (plus CSS `[data-drawer-open="true"] .mapboxgl-canvas` in `globals.css:233`), clicking the map area hits the drawer `HEADER` (elementFromPoint) not the canvas; close button restores `pointer-events: auto`, removes overlay, clears `?falla=` — no stuck-state after open/close cycles.
5. **Drawer open paths** — marker click → `/map?falla=1` drawer with "Monument #1 plaza doctor collado"; deep link `?falla=1` opens directly; Next advances `?falla=1`→`?falla=3` (correct — no #2 in the dataset).
6. **Search & filters** — autocomplete (focus + "plaza") returns 5 results (#1, #8, #10, #17, #32), clicking one opens the drawer with map disabled; EVENTS filter → 5 visible markers, ALL → 85; typed query filters markers to 1 visible. (SPECIAL → 0 is the P1 above, i.e. verified *broken*.)
7. **Like / Passport toggles** — clicking Like stores `liked_fallas: ["1"]` in localStorage + "Added! … PASSPORT" toast; Passport button stores `visited_fallas: ["1"]`. Comment composer correctly disabled for signed-out users ("Sign in to share...", send button disabled).
8. **Theme toggle on /map** — switching to dark re-initializes the map: 85 markers, canvas present, no crash, `html.dark` applied.
9. **Clerk integration boots** — sign-in/up pages render Clerk components (Google + email/password); only expected dev-key warning.

## Could not verify (not checked — do not treat as passing)

- **Any behavior against a live Supabase project** — the configured host is NXDOMAIN; RLS/Clerk-JWT acceptance, uploads, moderation, and sync flows are static-analysis findings only.
- **Signed-in / signed-out transitions and admin role flows** — no account was logged into (no credentials used); comment posting, photo upload, moderation approve/reject untested end-to-end.
- **Mapbox token validity in the production bundle** — not re-deployed; per correction the repo `.env` token is real/valid (browser runs showed no Mapbox 401s, consistent).
- **Mobile/touch layout, vaul drag-to-dismiss, safe areas** — tested desktop viewport only.
- **Visual polish / screenshots** — layout-level review (overflow, contrast, spacing) not performed from imagery.
- **Vercel deploy** — `vercel.json` reviewed statically; no actual deployment run.
- **Real geolocation permission flow** — headless browser denies it automatically.
