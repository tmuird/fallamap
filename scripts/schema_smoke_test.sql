-- scripts/schema_smoke_test.sql
-- Mirrors every query/write shape the app issues (see AUDIT §2/§4) against the
-- schema created by scripts/schema.sql and the rows seeded by seed_supabase.js.
-- Any statement failing (ON_ERROR_STOP) fails the run. Run AFTER seeding.

-- MapComponent: supabase.from("fallas").select("*").order("number")
select * from fallas order by number;

-- T1.4: fallas.json enrichment (id/description/is_special/is_burnt) seeds through
do $$
declare n int;
begin
  select count(*) into n from fallas
    where description is null or is_special is null or is_burnt is null;
  if n <> 0 then raise exception 'FAIL: % fallas missing enriched columns', n; end if;
end $$;

-- useFallaDetails: .select("id").eq("number", n).single()
select id from fallas where number = '1';

-- useFallaDetails addComment/addImage (falla-targeted; hooks insert 'pending')
insert into comments (user_id, text, status, is_private, falla_id)
  values ('user_test', 'hello', 'pending', false, (select id from fallas where number = '1'));
insert into images (user_id, url, status, is_private, falla_id)
  values ('user_test', 'https://example.com/1.png', 'pending', false,
          (select id from fallas where number = '1'));

-- useEventDetails (event-targeted rows; ids like schedule events)
insert into comments (user_id, text, status, event_id)
  values ('user_test', 'evt comment', 'pending', 'mascleta-14');
insert into images (user_id, url, status, event_id)
  values ('user_test', 'https://example.com/e.png', 'pending', 'mascleta-14');

-- image_likes + the embedded count shape "likes:image_likes(count)"
insert into image_likes (user_id, image_id)
  values ('user_test', (select id from images where url = 'https://example.com/1.png'));
select i.url, (select count(*) from image_likes il where il.image_id = i.id) as like_count
  from images i where i.url = 'https://example.com/1.png';

-- FallaDetails hub-targeted write + like/visited interactions
insert into comments (user_id, text, status, hub_id)
  values ('user_test', 'hub comment', 'pending', 'hub-ajuntament');
insert into user_interactions (user_id, type, falla_id)
  values ('user_test', 'visited', (select id from fallas where number = '1'));
insert into user_interactions (user_id, type, hub_id)
  values ('user_test', 'like', 'hub-ajuntament');
insert into user_interactions (user_id, type, hub_id)
  values ('user_test', 'visited', 'hub-ajuntament');

-- FallaDetails interaction sync (T1.4): rows are resolved by `number` before
-- read/write (useFallaDetails dbId); localStorage keys stay on `number`
select ui.type from user_interactions ui
  where ui.user_id = 'user_test'
    and ui.falla_id = (select id from fallas where number = '3');
insert into user_interactions (user_id, type, falla_id)
  values ('user_test', 'like', (select id from fallas where number = '3'));
select ui.type from user_interactions ui
  where ui.user_id = 'user_test'
    and ui.falla_id = (select id from fallas where number = '3');
delete from user_interactions
  where user_id = 'user_test' and type = 'like'
    and falla_id = (select id from fallas where number = '3');

-- MapComponent refreshInteractions / CollectionView (T1.7):
-- select("type, fallas(number), hubs(id)") — mixed monument+hub targets must
-- ALL resolve (hub rows join `hubs`, not `fallas`)
select ui.type, f.number, h.id
  from user_interactions ui
  left join fallas f on f.id = ui.falla_id
  left join hubs h on h.id = ui.hub_id
  where ui.user_id = 'user_test';
do $$
declare n int;
begin
  select count(*) into n from user_interactions ui
    left join fallas f on f.id = ui.falla_id
    left join hubs h on h.id = ui.hub_id
    where ui.user_id = 'user_test' and coalesce(f.number, h.id) is null;
  if n <> 0 then raise exception 'FAIL: % interaction rows resolved to no target', n; end if;
  select count(*) into n from user_interactions ui
    where ui.user_id = 'user_test' and ui.type = 'visited' and ui.falla_id is not null;
  if n <> 1 then raise exception 'FAIL: monument visited rows % (expected 1)', n; end if;
  select count(*) into n from user_interactions ui
    where ui.user_id = 'user_test' and ui.type = 'visited' and ui.falla_id is null and ui.hub_id is not null;
  if n <> 1 then raise exception 'FAIL: hub-targeted visited rows % (expected 1 — the PassportView crash shape)', n; end if;
end $$;

-- PassportView nested embed (T1.7): user_interactions → fallas → images OR hubs;
-- hub rows have a NULL `fallas` join and must not break the projection
select f.id, f.number, f.name, i.url, i.status, h.id as hub_id, h.name as hub_name
  from user_interactions ui
  left join fallas f on f.id = ui.falla_id
  left join images i on i.falla_id = f.id
  left join hubs h on h.id = ui.hub_id
  where ui.user_id = 'user_test' and ui.type = 'visited';

-- ActivityView / admin embeds: comments|images → fallas(name, number)
select c.text, f.name, f.number
  from comments c left join fallas f on f.id = c.falla_id where c.user_id = 'user_test';
select i.url, f.name, f.number
  from images i left join fallas f on f.id = i.falla_id where i.user_id = 'user_test';

-- hub embed (refreshInteractions hub fix relies on this FK)
select ui.type, h.id
  from user_interactions ui join hubs h on h.id = ui.hub_id where ui.hub_id is not null;

-- ContactPage insert
insert into contact_submissions (name, email, message) values ('T', 't@example.com', 'hi');

-- Constraints: exactly-one-target checks and duplicate-interaction guard
do $$
begin
  begin
    insert into comments (user_id, text, falla_id, hub_id)
      values ('u', 'x', (select id from fallas limit 1), 'hub-ajuntament');
    raise exception 'FAIL: comment accepted two targets';
  exception when check_violation then null;
  end;
  begin
    insert into user_interactions (user_id, type) values ('u', 'like');
    raise exception 'FAIL: interaction accepted zero targets';
  exception when check_violation then null;
  end;
  begin
    insert into user_interactions (user_id, type, falla_id)
      values ('user_test', 'visited', (select id from fallas where number = '1'));
    raise exception 'FAIL: duplicate interaction accepted';
  exception when unique_violation then null;
  end;
end $$;

-- ==================================================================
-- RLS — Clerk `sub`-keyed policies (Supabase third-party auth)
-- The harness impersonates Clerk users by setting `request.jwt.claims`
-- to a session-token shape; schema_local_stubs.sql's auth.jwt() reads it.
-- ==================================================================

-- Fixtures (as owner, bypassing RLS) for the visibility checks below
insert into comments (user_id, text, status, is_private, falla_id)
  values ('user_other', 'secret', 'approved', true, (select id from fallas where number = '1'));
insert into comments (user_id, text, status, is_private, falla_id)
  values ('user_other', 'unreviewed', 'pending', false, (select id from fallas where number = '1'));
insert into comments (user_id, text, status, is_private, falla_id)
  values ('user_seed', 'public ok', 'approved', false, (select id from fallas where number = '1'));
insert into images (user_id, url, status, is_private, falla_id)
  values ('user_seed', 'https://example.com/seed.png', 'approved', false,
          (select id from fallas where number = '1'));
insert into user_interactions (user_id, type, falla_id)
  values ('user_other', 'like', (select id from fallas where number = '1'));

-- Owner path: a signed-in user (Clerk sub = user_rls) writes their own rows
set role authenticated;
set request.jwt.claims = '{"sub": "user_rls"}';
insert into comments (user_id, text, status, falla_id)
  values ('user_rls', 'via rls', 'pending', (select id from fallas where number = '1'));
insert into images (user_id, url, status, falla_id)
  values ('user_rls', 'https://example.com/rls.png', 'pending', (select id from fallas where number = '1'));
insert into user_interactions (user_id, type, hub_id) values ('user_rls', 'visited', 'hub-ajuntament');

do $$
declare n int;
begin
  -- Own rows are visible/deletable even when private or pending
  select count(*) into n from comments where user_id = 'user_rls';
  if n <> 1 then raise exception 'FAIL: owner sees % own rows (expected 1)', n; end if;
  delete from user_interactions where user_id = 'user_rls' and hub_id = 'hub-ajuntament';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: owner delete affected % rows', n; end if;

  -- Moderation is enforced server-side: owners cannot self-approve …
  update comments set status = 'approved' where user_id = 'user_rls';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: owner self-approved % rows', n; end if;
  -- … cannot rewrite content (column-level UPDATE grant is status-only) …
  begin
    update comments set text = 'via rls (edited)' where user_id = 'user_rls';
    raise exception 'FAIL: owner rewrote comment text';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
  -- … and new content must enter the queue (no directly-approved inserts)
  begin
    insert into comments (user_id, text, status, falla_id)
      values ('user_rls', 'sneaky', 'approved',
              (select id from fallas where number = '1'));
    raise exception 'FAIL: inserted a directly-approved comment';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;

  -- Another user's private/pending rows are invisible to this user
  select count(*) into n from comments where user_id = 'user_other';
  if n <> 0 then raise exception 'FAIL: saw % rows of another user', n; end if;

  -- Cross-user writes must all be rejected (RLS with-check / column grants)
  begin
    insert into comments (user_id, text, status, falla_id)
      values ('user_other', 'impersonation', 'pending',
              (select id from fallas where number = '1'));
    raise exception 'FAIL: inserted a comment as another user';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
  begin
    insert into image_likes (user_id, image_id)
      values ('user_other', (select id from images where url = 'https://example.com/1.png'));
    raise exception 'FAIL: liked as another user';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
  begin
    update comments set user_id = 'user_other' where user_id = 'user_rls';
    raise exception 'FAIL: reassigned own row to another user';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
  -- Moderation is admin-only: a plain user cannot flip other users' status
  update comments set status = 'rejected' where user_id = 'user_other';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: non-admin moderated % rows', n; end if;
  delete from comments where user_id = 'user_other';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: deleted % rows of another user', n; end if;
end $$;
reset role;

-- Switching identity: user_other sees exactly their own 2 fixture rows
set role authenticated;
set request.jwt.claims = '{"sub": "user_other"}';
do $$
declare n int;
begin
  select count(*) into n from comments where user_id = 'user_other';
  if n <> 2 then raise exception 'FAIL: owner sees % own rows (expected 2)', n; end if;
end $$;
reset role;

-- Moderation (T1.2): admins are recognised by the Clerk session-token claim
-- public_metadata.role = 'admin' (public.is_admin() in scripts/schema.sql)
set role authenticated;
set request.jwt.claims = '{"sub": "user_admin", "public_metadata": {"role": "admin"}}';
do $$
declare n int;
begin
  -- The queue: admin sees everyone's pending rows and the private row
  select count(*) into n from comments where status = 'pending' and user_id <> 'user_admin';
  if n <> 5 then raise exception 'FAIL: admin sees % pending comments (expected 5)', n; end if;
  select count(*) into n from comments where is_private;
  if n <> 1 then raise exception 'FAIL: admin sees % private rows (expected 1)', n; end if;

  -- Approve/reject other users' rows (comment + image queues)
  update comments set status = 'approved' where user_id = 'user_other' and text = 'unreviewed';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: admin comment status update affected % rows', n; end if;
  update images set status = 'approved' where url = 'https://example.com/e.png';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: admin image status update affected % rows', n; end if;

  -- …but only the status column, never content …
  begin
    update comments set text = 'vandalized' where user_id = 'user_other';
    raise exception 'FAIL: admin rewrote comment text';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
  -- … and never as another user
  begin
    insert into comments (user_id, text, status, falla_id)
      values ('user_other', 'admin impersonation', 'pending',
              (select id from fallas where number = '1'));
    raise exception 'FAIL: admin inserted as another user';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
end $$;

-- A role claim outside public_metadata grants nothing (claim path is enforced)
set request.jwt.claims = '{"sub": "user_fake", "role": "admin"}';
do $$
declare n int;
begin
  update comments set status = 'rejected' where user_id = 'user_seed';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: forged role claim moderated % rows', n; end if;
  select count(*) into n from comments where is_private;
  if n <> 0 then raise exception 'FAIL: forged role claim saw % private rows', n; end if;
end $$;
reset role;

-- Anonymous: approved-public content only, no writes, no interactions
reset request.jwt.claims;
set role anon;
do $$
declare n int;
begin
  select count(*) into n from fallas;
  if n < 1 then raise exception 'FAIL: anon sees no fallas'; end if;
  select count(*) into n from comments where is_private or status <> 'approved';
  if n <> 0 then raise exception 'FAIL: anon saw % private/unapproved rows', n; end if;
  select count(*) into n from comments where not is_private and status = 'approved';
  if n < 1 then raise exception 'FAIL: anon sees no approved comments'; end if;
  select count(*) into n from images where not is_private and status = 'approved';
  if n < 1 then raise exception 'FAIL: anon sees no approved images'; end if;
  begin
    insert into comments (user_id, text, status, falla_id)
      values ('anon', 'anon write', 'approved', (select id from fallas where number = '1'));
    raise exception 'FAIL: anon insert accepted';
  exception when others then
    if sqlstate = 'P0001' then raise; end if;
  end;
  select count(*) into n from user_interactions;
  if n <> 0 then raise exception 'FAIL: anon saw % interaction rows', n; end if;
end $$;
reset role;

-- Storage bucket and its policies exist
select id, public from storage.buckets where id = 'community-content';
select policyname from pg_policies
  where schemaname = 'storage' and tablename = 'objects' order by policyname;

select 'SMOKE TESTS PASSED' as result;
