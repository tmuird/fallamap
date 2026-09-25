-- scripts/schema.sql — fallamap database schema (Supabase project / Postgres 15+)
--
-- Creates everything the app queries: fallas + hubs seed targets, community
-- content (comments / images / image_likes / user_interactions), the
-- `community-content` storage bucket, and contact_submissions.
--
-- Idempotent: safe to run repeatedly (no destructive drops).
-- Apply via:  node scripts/seed_supabase.js   (runs this file first)
--        or:  Supabase Dashboard → SQL Editor → paste → run
--        or:  psql "$SUPABASE_DB_URL" -f scripts/schema.sql
--
-- NOTE: written for Supabase — it expects the `anon` / `authenticated` /
-- `service_role` roles and the `storage` schema to exist. For a local smoke
-- test against vanilla Postgres see scripts/verify_schema_local.sh.
--
-- AUTH MODEL: the app authenticates with Clerk (Supabase third-party auth;
-- see docs/supabase-clerk-auth.md) and writes Clerk user IDs (e.g.
-- "user_2abc…") into `user_id` columns — hence TEXT, not UUID. RLS compares
-- `user_id` against the Clerk JWT `sub` via auth.jwt()->>'sub': users write
-- only their own rows and read private content only when they own it.
-- Moderation: new content is inserted 'pending' (non-admins cannot insert any
-- other status); admins read the full queue and flip `status` via the
-- public.is_admin() JWT-claim override below.

-- ============================================================
-- Tables
-- ============================================================

-- Map monuments. `coordinates` keeps the exact { lng, lat } shape used in
-- src/components/fallas.json so rows merge cleanly over the local dataset.
create table if not exists public.fallas (
  id          uuid primary key default gen_random_uuid(),
  number      text not null unique,
  name        text not null,
  time        text,
  description text,
  is_special  boolean not null default false,
  is_burnt    boolean not null default false,
  coordinates jsonb not null,
  created_at  timestamptz not null default now()
);

-- Official event hubs. `id` matches the ids in src/components/official_events.json
-- (e.g. 'hub-ajuntament'); `events` preserves that file's event refs for T1.5.
create table if not exists public.hubs (
  id          text primary key,
  name        text not null,
  description text,
  type        text,
  coordinates jsonb not null,
  events      jsonb,
  created_at  timestamptz not null default now()
);

-- Community comments. Exactly one target per row: falla_id | hub_id | event_id.
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  text       text not null,
  status     text not null default 'pending'
             check (status in ('pending', 'approved', 'rejected')),
  is_private boolean not null default false,
  falla_id   uuid references public.fallas (id) on delete cascade,
  hub_id     text references public.hubs (id) on delete cascade,
  event_id   text,
  created_at timestamptz not null default now(),
  check (num_nonnulls(falla_id, hub_id, event_id) = 1)
);

-- Community photos (metadata; files live in the community-content bucket).
create table if not exists public.images (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  url        text not null,
  status     text not null default 'pending'
             check (status in ('pending', 'approved', 'rejected')),
  is_private boolean not null default false,
  falla_id   uuid references public.fallas (id) on delete cascade,
  hub_id     text references public.hubs (id) on delete cascade,
  event_id   text,
  created_at timestamptz not null default now(),
  check (num_nonnulls(falla_id, hub_id, event_id) = 1)
);

-- Image likes. FK to images(id) is what makes the app's embedded
-- select("*, likes:image_likes(count)") resolve.
create table if not exists public.image_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  image_id   uuid not null references public.images (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, image_id)
);

-- Like / visited bookmarks. The falla_id FK is what makes
-- select("type, fallas(number)") and the nested PassportView embed
-- fallas(… images(…)) resolve. Exactly one target per row.
create table if not exists public.user_interactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  type       text not null check (type in ('like', 'visited')),
  falla_id   uuid references public.fallas (id) on delete cascade,
  hub_id     text references public.hubs (id) on delete cascade,
  event_id   text,
  created_at timestamptz not null default now(),
  check (num_nonnulls(falla_id, hub_id, event_id) = 1)
);

-- Contact form submissions (insert-only from the app).
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- Upgrade path for partially-created schemas (pre-audit projects):
-- ensure the target columns exist even if the tables predate this file.
alter table public.comments          add column if not exists hub_id   text;
alter table public.comments          add column if not exists event_id text;
alter table public.images            add column if not exists hub_id   text;
alter table public.images            add column if not exists event_id text;
alter table public.user_interactions add column if not exists hub_id   text;
alter table public.user_interactions add column if not exists event_id text;

-- ============================================================
-- Indexes (app query shapes)
-- ============================================================

create index if not exists comments_falla_idx   on public.comments (falla_id);
create index if not exists comments_hub_idx     on public.comments (hub_id);
create index if not exists comments_event_idx   on public.comments (event_id);
create index if not exists comments_user_idx    on public.comments (user_id);
create index if not exists images_falla_idx     on public.images (falla_id);
create index if not exists images_hub_idx       on public.images (hub_id);
create index if not exists images_event_idx     on public.images (event_id);
create index if not exists images_user_idx      on public.images (user_id);
create index if not exists image_likes_img_idx  on public.image_likes (image_id);
create index if not exists interactions_user_idx on public.user_interactions (user_id);
create unique index if not exists interactions_user_type_falla_idx
  on public.user_interactions (user_id, type, falla_id) where falla_id is not null;
create unique index if not exists interactions_user_type_hub_idx
  on public.user_interactions (user_id, type, hub_id) where hub_id is not null;
create unique index if not exists interactions_user_type_event_idx
  on public.user_interactions (user_id, type, event_id) where event_id is not null;

-- ============================================================
-- RLS — keyed on the Clerk JWT `sub` (third-party auth)
-- ============================================================
--
-- With Clerk third-party auth enabled, Supabase accepts Clerk session tokens
-- and auth.jwt() exposes their claims; auth.jwt()->>'sub' is the Clerk user id
-- — the same value the app writes into `user_id`. Model:
--   * reads: map data (fallas/hubs) and approved-public community content are
--     readable by anyone; own rows (incl. private/pending) only by their owner
--   * writes: `authenticated` only, and only for rows whose user_id is the
--     caller's own `sub`; non-admins may only insert status='pending'
--     (moderation queue) and may never update rows (status flips are admin-only)
--   * admins (public.is_admin()): read everything and update `status` only —
--     the update column restriction is enforced with column-level UPDATE
--     grants further below, so even admins cannot rewrite content or
--     impersonate users
--   * contact form: public insert (no user identity involved)
--
-- Admins are recognised by the Clerk session-token claim
-- `public_metadata.role = 'admin'` (Clerk Dashboard → Configure → Sessions →
-- Customize session token; see docs/supabase-clerk-auth.md). The claim is
-- server-verified: a forged role anywhere else grants nothing.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select (select auth.jwt()->'public_metadata'->>'role') = 'admin'
$$;
grant execute on function public.is_admin() to anon, authenticated, service_role;

alter table public.fallas               enable row level security;
alter table public.hubs                 enable row level security;
alter table public.comments             enable row level security;
alter table public.images               enable row level security;
alter table public.image_likes          enable row level security;
alter table public.user_interactions    enable row level security;
alter table public.contact_submissions  enable row level security;

drop policy if exists "fallas read"   on public.fallas;
create policy "fallas read" on public.fallas
  for select to anon, authenticated using (true);

drop policy if exists "hubs read"   on public.hubs;
create policy "hubs read" on public.hubs
  for select to anon, authenticated using (true);

-- Comments: approved-public readable by anyone; own rows always; admins read
-- the full queue. Inserts are owner-keyed and non-admins may only submit
-- status='pending' (content goes through moderation); status flips are
-- admin-only (see the column-level UPDATE grant below).
drop policy if exists "comments read"   on public.comments;
create policy "comments read" on public.comments
  for select to anon, authenticated
  using (
    (status = 'approved' and not is_private)
    or (select auth.jwt()->>'sub') = user_id
    or public.is_admin()
  );
drop policy if exists "comments insert"   on public.comments;
create policy "comments insert" on public.comments
  for insert to authenticated
  with check (
    (select auth.jwt()->>'sub') = user_id
    and (status = 'pending' or public.is_admin())
  );
drop policy if exists "comments update"   on public.comments;
create policy "comments update" on public.comments
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
drop policy if exists "comments delete"   on public.comments;
create policy "comments delete" on public.comments
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- Images: same shape as comments.
drop policy if exists "images read"   on public.images;
create policy "images read" on public.images
  for select to anon, authenticated
  using (
    (status = 'approved' and not is_private)
    or (select auth.jwt()->>'sub') = user_id
    or public.is_admin()
  );
drop policy if exists "images insert"   on public.images;
create policy "images insert" on public.images
  for insert to authenticated
  with check (
    (select auth.jwt()->>'sub') = user_id
    and (status = 'pending' or public.is_admin())
  );
drop policy if exists "images update"   on public.images;
create policy "images update" on public.images
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
drop policy if exists "images delete"   on public.images;
create policy "images delete" on public.images
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- Image likes: counts are public (embedded "likes:image_likes(count)"),
-- writes owner-keyed.
drop policy if exists "image_likes read"   on public.image_likes;
create policy "image_likes read" on public.image_likes
  for select to anon, authenticated using (true);
drop policy if exists "image_likes insert"   on public.image_likes;
create policy "image_likes insert" on public.image_likes
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "image_likes delete"   on public.image_likes;
create policy "image_likes delete" on public.image_likes
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- Interactions (like/visited bookmarks): private to their owner.
drop policy if exists "interactions read"   on public.user_interactions;
create policy "interactions read" on public.user_interactions
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "interactions insert"   on public.user_interactions;
create policy "interactions insert" on public.user_interactions
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "interactions delete"   on public.user_interactions;
create policy "interactions delete" on public.user_interactions
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- Contact form: insert-only from the app, any role (no user identity; no read).
drop policy if exists "contact insert"   on public.contact_submissions;
create policy "contact insert" on public.contact_submissions
  for insert to anon, authenticated with check (true);

-- Supabase grants (fresh projects get these by default; explicit for safety).
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

-- Moderation is status-only: strip table-level UPDATE on comments/images and
-- grant it on the `status` column alone, so even admins (and service_role)
-- cannot rewrite text/url/user_id through the API. RLS above additionally
-- limits status updates to admins.
revoke update on public.comments, public.images
  from anon, authenticated, service_role;
grant update (status) on public.comments, public.images
  to authenticated, service_role;

-- ============================================================
-- Storage: community-content bucket (photo uploads)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-content', 'community-content', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "community-content read" on storage.objects;
create policy "community-content read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'community-content');

-- Uploads require a signed-in user; the bucket is public-read (the app uses
-- getPublicUrl). Per-user path keying lands with T2.6 upload hardening.
drop policy if exists "community-content write" on storage.objects;
create policy "community-content write" on storage.objects
  for insert to authenticated with check (bucket_id = 'community-content');
