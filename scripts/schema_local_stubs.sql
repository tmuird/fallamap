-- scripts/schema_local_stubs.sql
-- Emulates just enough of a Supabase project for scripts/schema.sql to apply
-- on vanilla Postgres: the API roles, the storage schema (buckets/objects), and
-- auth.jwt() for the Clerk-sub RLS policies. Used by scripts/verify_schema_local.sh
-- — not part of a real deployment.

do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end $$;

-- Supabase's auth.jwt() reads the request's verified JWT claims from the
-- `request.jwt.claims` GUC; this stub reproduces that contract exactly, so the
-- smoke test can impersonate Clerk users via
--   set request.jwt.claims = '{"sub": "user_x"}';
create schema if not exists auth;

create or replace function auth.jwt() returns jsonb
  language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), ''),
    '{}'
  )::jsonb
$$;

-- Policy expressions call auth.jwt() as the querying role.
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.jwt() to anon, authenticated, service_role;

create schema if not exists storage;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz default now()
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets (id),
  name       text,
  owner      text,
  created_at timestamptz default now()
);

alter table storage.objects enable row level security;
