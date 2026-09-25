-- scripts/schema_smoke_test.sql
-- Mirrors every query/write shape the app issues (see AUDIT §2/§4) against the
-- schema created by scripts/schema.sql and the rows seeded by seed_supabase.js.
-- Any statement failing (ON_ERROR_STOP) fails the run. Run AFTER seeding.

-- MapComponent: supabase.from("fallas").select("*").order("number")
select * from fallas order by number;

-- useFallaDetails: .select("id").eq("number", n).single()
select id from fallas where number = '1';

-- useFallaDetails addComment/addImage (falla-targeted)
insert into comments (user_id, text, status, is_private, falla_id)
  values ('user_test', 'hello', 'approved', false, (select id from fallas where number = '1'));
insert into images (user_id, url, status, is_private, falla_id)
  values ('user_test', 'https://example.com/1.png', 'approved', false,
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
  values ('user_test', 'hub comment', 'approved', 'hub-ajuntament');
insert into user_interactions (user_id, type, falla_id)
  values ('user_test', 'visited', (select id from fallas where number = '1'));
insert into user_interactions (user_id, type, hub_id)
  values ('user_test', 'like', 'hub-ajuntament');

-- MapComponent refreshInteractions: select("type, fallas(number)")
select ui.type, f.number
  from user_interactions ui left join fallas f on f.id = ui.falla_id
  where ui.user_id = 'user_test';

-- PassportView nested embed: user_interactions → fallas → images(url, status)
select f.id, f.number, f.name, i.url, i.status
  from user_interactions ui
  join fallas f on f.id = ui.falla_id
  left join images i on i.falla_id = f.id
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

-- App runtime role path: writes as `authenticated` must pass the RLS baseline
set role authenticated;
insert into comments (user_id, text, status, falla_id)
  values ('user_rls', 'via rls', 'pending', (select id from fallas where number = '1'));
insert into user_interactions (user_id, type, hub_id) values ('user_rls', 'visited', 'hub-ajuntament');
delete from user_interactions where user_id = 'user_rls' and hub_id = 'hub-ajuntament';
reset role;

-- Anonymous read must work through the read policies
set role anon;
select count(*) from fallas;
select count(*) from comments;
select count(*) from images;
reset role;

-- Storage bucket and its policies exist
select id, public from storage.buckets where id = 'community-content';
select policyname from pg_policies
  where schemaname = 'storage' and tablename = 'objects' order by policyname;

select 'SMOKE TESTS PASSED' as result;
