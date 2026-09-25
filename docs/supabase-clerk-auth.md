# Clerk ↔ Supabase auth (third-party auth)

fallamap uses **Clerk for identity** and **Supabase for data/storage**. Supabase
never talks to Clerk directly: each Supabase request carries the user's Clerk
session token, Supabase verifies it as a third-party auth provider, and RLS
policies key on the token's `sub` claim (the Clerk user id) — the same value the
app writes into `user_id` columns.

All of this is verified end-to-end against a local Postgres emulation
(`npm run verify:schema`); live verification against a real Supabase project is
pending (the configured project host is currently NXDOMAIN — see PLAN.md
Blockers).

## One-time project setup

1. **Activate the Clerk Supabase integration** — Clerk Dashboard →
   [Supabase integration setup](https://dashboard.clerk.com/setup/supabase) →
   choose options → **Activate Supabase integration**. This adds the
   `role: "authenticated"` claim to your instance's session tokens (Supabase
   needs it to map requests onto PostgREST roles) and reveals your **Clerk
   domain**. Save it.
2. **Register Clerk with Supabase** — Supabase Dashboard →
   Authentication → Sign In / Providers → Third-Party Auth → **Add provider →
   Clerk** → paste the Clerk domain from step 1.
   - Local/self-hosted (Supabase CLI) instead: in `supabase/config.toml`
     ```toml
     [auth.third_party.clerk]
     enabled = true
     domain = "example.clerk.accounts.dev"
     ```
3. **Apply the schema** — run `scripts/schema.sql` (the seed script does this
   first: `npm run seed`), which enables RLS keyed on `auth.jwt()->>'sub'`.

## Environment variables

| Var | Where it comes from |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API keys (publishable) |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → Data API (base project URL, no `/rest/v1`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys (publishable / anon key) |

The anon key is public by design — RLS is the security boundary, not the key.

## How the client is wired

- `src/lib/supabase.ts` — creates the shared `supabase` client with an
  `accessToken` callback. Before every request supabase-js calls it:
  - a registered Clerk session token is sent as `Authorization: Bearer <token>`
    (request runs as that Clerk user; `sub` maps to `auth.jwt()->>'sub'`);
  - returning `null` (signed out, or token fetch failure) falls back to the
    anon key (unauthenticated; public reads only).
  - Requires `@supabase/supabase-js` with `accessToken` support (installed
    here: 2.98.0).
- `src/lib/SupabaseAuthBridge.tsx` — mounted once inside `<ClerkProvider>`
  (`src/App.tsx`); registers `session.getToken()` as the token getter and
  clears it on sign-out.
- Hooks/components keep writing `user_id` = Clerk `user.id`, which equals the
  token's `sub`.

## RLS model (scripts/schema.sql)

- `fallas`, `hubs` (map data): readable by anyone.
- `comments`, `images`: approved + non-private rows readable by anyone; a user
  always sees their own rows (incl. private/pending). Inserts: `authenticated`,
  owner only (`user_id = auth.jwt()->>'sub'`), and non-admins may only insert
  `status = 'pending'` — new content always enters the moderation queue.
  Status flips are admin-only (below); deletes are owner only.
- `image_likes`: counts readable by anyone (embedded `likes:image_likes(count)`);
  writes owner only.
- `user_interactions` (like/visited): fully private to their owner.
- `contact_submissions`: insert-only for anyone (public form; no user identity).
- Storage `community-content` bucket: public read (the app uses `getPublicUrl`),
  upload requires `authenticated`.
- Column-level UPDATE grants restrict `comments`/`images` updates to the
  `status` column alone — even admins cannot rewrite `text`/`url`/`user_id`
  through the API (per-user upload paths land in T2.6).

## Admin moderation (JWT claim)

The moderation dashboard (`/dashboard`, `src/components/admin/`) reads the
pending queue and approves/rejects rows. The client-side check
(`user.publicMetadata.role === 'admin'`) is UX only — enforcement is
server-side via `public.is_admin()` in `scripts/schema.sql`, which reads the
Clerk session-token claim `public_metadata.role`. One-time setup:

1. **Expose the role in the session token** — Clerk Dashboard → Configure →
   Sessions → **Customize session token** → add a claim:
   ```json
   {
     "public_metadata": "{{user.public_metadata}}"
   }
   ```
   The exact key matters: RLS reads `auth.jwt()->'public_metadata'->>'role'`.
2. **Promote a user** — Clerk Dashboard → Users → (user) → **Metadata
   (public)** → `{ "role": "admin" }` (or `user.update({ publicMetadata:
   { role: 'admin' } })` from code).
3. Re-run `scripts/schema.sql` (idempotent) so the policies land.

What an admin can then do: read all rows (incl. pending/private) and update
`status` on any comment/image. What an admin cannot do: rewrite content,
impersonate users, or touch other columns — enforced by both RLS and the
column-level grants. A `role` claim outside `public_metadata` grants nothing.

## Why there is no `supabase` JWT template

The plan originally specified a Clerk JWT template named `supabase`
(`getToken({ template: 'supabase' })`). That integration was **deprecated on
1 April 2025** by both Clerk and Supabase in favour of the native third-party
auth described above, which uses the plain session token — no template, no
shared JWT secret, no per-request token minting. Sources (retrieved 2026-09-25):

- https://clerk.com/docs/guides/development/integrations/databases/supabase
  (sections *What does the Clerk Supabase integration do?* and *Supabase JWT
  template deprecation*)
- https://supabase.com/docs/guides/auth/third-party/clerk (section *Deprecated
  integration with JWT templates*)

If you must integrate with a legacy project that predates third-party auth,
swap `session.getToken()` for `session.getToken({ template: 'supabase' })` in
`src/lib/SupabaseAuthBridge.tsx` and add the template in Clerk (claims: `sub`
= user id, `role` = `authenticated`); the RLS policies work unchanged either
way since they only read `sub`.

## Verifying the integration live

1. Sign up / sign in (Clerk), then post a comment — it enters the queue as
   `pending`, is visible only to its author, and appears publicly after an
   admin approves it on `/dashboard`.
2. In Supabase → Table editor, the row's `user_id` must equal the Clerk user id.
3. As a second account, the first account's private comments must be invisible,
   and writing a row with the first account's `user_id` must fail with an RLS
   violation (42501).
4. Signed out: community content reads still work, writes are rejected.
5. As a non-admin, PATCHing another user's `status` must affect 0 rows; as an
   admin (with the session-token claim from step 1 above) the flip must work,
   and PATCHing `text` must fail with a permission error.
