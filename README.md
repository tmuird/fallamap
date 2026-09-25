# fallamap

An event-focused social platform — a live map of an event's points of interest,
a photo/comment community layer, an official programme/schedule, user profiles
with passport & collection features, and an admin moderation dashboard.

Originally built for **Las Fallas 2026 (València)** as a live map of festival
monuments. The product direction is a white-label "events social network": point
the app at a different event dataset and it deploys per event/company — see
[White-labeling](#white-labeling) below.

Live demo: https://fallamap.muiry.co.uk (served from this repo's `dist/`).

## Stack

- **Vite 6 + React 19 + TypeScript** — build & UI runtime
- **Tailwind CSS + HeroUI / shadcn-style components** — styling (`src/styles/globals.css`
  + `tailwind.config.js` hold the design tokens)
- **Mapbox GL** — map canvas, markers, clustering
- **Clerk** — authentication (sign-up / sign-in / sessions)
- **Supabase** — Postgres data, storage (photos), row-level security
- **Framer Motion / vaul / sonner** — animation, drawers, toasts

## Prerequisites

- **Node.js 18 / 20 / 22+** (Vite 6 requirement; 20 LTS recommended)
- **npm** — installs must use `--legacy-peer-deps` (the dep tree mixes React 19
  with HeroUI; `vercel.json` already bakes this into the deploy install command)
- **Docker** — only for `npm run verify:schema` (local schema smoke tests)
- A **Supabase project** and a **Clerk application** for full functionality
  (the app degrades gracefully without them — see below)

## Getting started

```bash
git clone <this repo> fallamap
cd fallamap
npm install --legacy-peer-deps
cp .env.example .env   # then fill in — see next section
npm run dev            # http://localhost:5173
```

### Environment variables (`.env`)

`.env` is gitignored; `.env.example` is the template. All `VITE_`-prefixed
values are **bundled into the client** and are public by design — RLS and Clerk
are the security boundaries, not these keys.

| Variable | What it is | Where to get it |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_…` / `pk_live_…`) | Clerk Dashboard → API keys |
| `VITE_SUPABASE_URL` | Supabase project base URL (no `/rest/v1` suffix) | Supabase → Project Settings → Data API |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable / anon key (`sb_publishable_…`) | Supabase → Project Settings → API Keys |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox public token (`pk.…`) | Mapbox → Access tokens |
| `SUPABASE_DB_URL` | **Server-side only** (never bundled): Postgres connection string used by `npm run seed` | Supabase → Project Settings → Connect → Session pooler → URI |

Missing/invalid values degrade rather than white-screen:

- No Mapbox token or no WebGL → the map shows a clear "map unavailable" fallback
  card instead of a blank canvas.
- Supabase unreachable → a global "community features are offline" banner and
  offline-aware empty states; the map still renders from local data.

## Database setup (Supabase)

1. **Create a Supabase project** and put its URL + anon key in `.env`.
2. **Wire Clerk as Supabase's auth provider** (one-time, third-party auth):
   follow [docs/supabase-clerk-auth.md](docs/supabase-clerk-auth.md) — Clerk
   session tokens are passed as Bearer tokens and RLS keys on the Clerk `sub`
   claim. Do this before relying on any signed-in writes.
3. **Apply schema + seed data**:

   ```bash
   SUPABASE_DB_URL='postgres://…' npm run seed
   ```

   `scripts/seed_supabase.js` applies `scripts/schema.sql` first (tables, FKs,
   RLS policies, the `community-content` storage bucket), then seeds monuments
   from `src/components/fallas.json` and hubs from
   `src/components/official_events.json`. It is **idempotent** — safe to re-run
   after data edits.

4. **Optional — verify the schema locally** (no network, no real Supabase):

   ```bash
   npm run verify:schema   # requires Docker
   ```

   Spins up a throwaway Postgres 16 container, applies the schema twice
   (idempotency), runs the seed, and replays every app query shape (embedded
   selects, RLS positive/negative cases, constraints) from
   `scripts/schema_smoke_test.sql`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | `tsc && vite build` → `dist/` |
| `npm run lint` | ESLint 9 flat config, `--max-warnings 0` (must stay clean) |
| `npm run seed` | Apply `scripts/schema.sql` + seed data (needs `SUPABASE_DB_URL`) |
| `npm run verify:schema` | Local schema/seed/RLS smoke tests (needs Docker) |
| `npm run preview` | Serve the production build locally |

**Verification standard:** a change is not done until `npm run build` AND
`npm run lint` pass; UI changes additionally get exercised in a real browser
with zero new console errors.

## Project structure

```
src/
  App.tsx                  routes, ClerkProvider, toaster, footer
  components/
    MapPage.tsx            map route (markers, clustering, search pill)
    MapComponent.tsx       Mapbox GL wrapper + POI markers
    ui/FallaDetails.tsx    monument/POI detail drawer
    SchedulePage.tsx       official programme (timeline, day tabs, ICS export)
    HomePage.tsx, ArchivePage.tsx, ContactPage.tsx, Navbar.tsx, …
    profile/               user profile: ActivityView, CollectionView, PassportView
    admin/                 moderation dashboard (image/comment review)
    fallas.json            POI/monument dataset (map + profile views)
    official_events.json   event dataset: { hubs, schedule }
  lib/
    supabase.ts            Supabase client (Clerk accessToken callback)
    SupabaseAuthBridge.tsx registers Clerk session.getToken() with Supabase
    backendStatus.ts       Supabase reachability probe (community-offline state)
    eventData.ts           typed access to official_events.json, eventsForHub()
    hooks/                 useFallaDetails / useEventDetails (community data)
  styles/globals.css       design tokens (--falla-* colors, fonts, shadows)
scripts/
  schema.sql               full DB schema + RLS (applied by seed)
  seed_supabase.js         schema + data seeding (idempotent)
  verify_schema_local.sh   Docker-based schema smoke tests
  serve_dist.py            static SPA server for dist/ (history fallback)
  fallatojson.py, geocode.py   one-off data import helpers (legacy)
docs/supabase-clerk-auth.md    Clerk ↔ Supabase third-party auth setup
```

## White-labeling

Event-specific **data** is config-driven — swap these to deploy for another
event and the map, schedule, drawers, and profile views follow:

- **`src/lib/siteConfig.ts`** — per-tenant branding & copy (T2.8): brand name,
  page title (injected into the HTML `<title>` by the `siteTitle` plugin in
  `vite.config.ts` on serve and on build), event name/filename slug (ICS and
  share exports), monument nouns ("Falla #3", "80 Monuments"), city/district/
  copyright, header labels, hero copy, contact copy, profile greeting/tagline/
  rank titles, mascot-countdown labels + daily start time/timezone, and admin
  copy. Components read all such strings from `SITE` — nothing in
  `src/components` hardcodes festival wording.
- **`src/components/fallas.json`** — the POIs/monuments. Each entry:
  `number` (stable key used for DB sync and localStorage), `id`
  (`falla-<number>`), `name`, `description`, `time`, `is_special`, `is_burnt`,
  `coordinates: { lng, lat }`. The header monument count is derived from this
  file's length, not hardcoded.
- **`src/components/official_events.json`** — `{ hubs, schedule }`.
  - `hubs[]`: `id`, `name`, `description`, `type`, `coordinates` — map
    locations shown with their own drawer ("About this location" + derived
    "Events at this location").
  - `schedule[]`: days (`id`, `day`, `subtitle`, `date`) with `events[]`:
    `id` (used in URLs like `/schedule?day=<dayId>&event=<eventId>`), `time`,
    `title`, `location`, `description`, `type`, `icon` (a key into the icon map
    in `SchedulePage.tsx`), `color`, `isLive`, and `hubId` linking the event to
    its venue hub (optional).
- **`index.html`** — webfonts, CSP allow-list (add any new third-party
  origins to `connect-src`). The `<title>` is a placeholder — the real title
  comes from `SITE.brand.pageTitle` via the `siteTitle` plugin.
- **`src/styles/globals.css` + `tailwind.config.js`** — the `--falla-*` design
  tokens (paper/ink/fire/sage/sand), fonts, `ink-border` / `soft-shadow` styles.

Remaining hardcoded strings are generic UI copy only (buttons, form labels)
plus the brand-voice sign-in/sign-up headings ("Join the Tribe", "…through
the flames") in `SignInPage.tsx`/`SignUpPage.tsx` — no event, city, or
festival-specific strings remain outside the config and data files above.

## Deployment

### Vercel (production)

`vercel.json` already contains the SPA rewrite and
`installCommand: npm install --legacy-peer-deps`. Steps:

1. Import the repo into Vercel (framework preset: **Vite**; build `npm run build`, output `dist`).
2. Add the four `VITE_*` env vars from [.env](#environment-variables-env) in
   Project → Settings → Environment Variables.
3. Deploy. Merges to `main` auto-deploy — feature work happens on
   `overnight-polish` branches and is merged deliberately.

### Static host / tunnel (how the demo runs)

`dist/` is a static SPA; any static host works as long as unknown paths fall
back to `index.html`. Bundled helper:

```bash
npm run build
python3 scripts/serve_dist.py --root dist --port 4173   # SPA history fallback
```

The demo at `fallamap.muiry.co.uk` is this server bound to `127.0.0.1:4173`
behind a Cloudflare tunnel (`muiry-mac` ingress) — replicate by pointing your
own tunnel/reverse proxy at the port.

## License

MIT — see [LICENSE](LICENSE).
