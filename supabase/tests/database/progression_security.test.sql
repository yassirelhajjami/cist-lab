begin;

create extension if not exists pgtap with schema extensions;
select plan(18);

-- Stable identities make failures reproducible while the surrounding
-- transaction guarantees the fixtures are rolled back.
insert into public.profiles (id, user_id, full_name, email, role, grade, xp, coins)
values
  ('10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Student A', 'security-a@example.test', 'student', 'Grade 10', 0, 0),
  ('10000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Student B', 'security-b@example.test', 'student', 'Grade 10', 0, 0),
  ('10000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'Security Admin', 'security-admin@example.test', 'admin', null, 0, 0);

insert into public.students (id, profile_id, student_code, grade, classroom)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'SEC-A', 'Grade 10', 'Test'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'SEC-B', 'Grade 10', 'Test');

insert into public.missions (id, title, description, category, difficulty, xp_reward, coin_reward, is_published)
values ('30000000-0000-4000-8000-000000000001', 'Security Mission', 'Test fixture', 'Logic', 'beginner', 100, 50, true);

insert into public.lessons (id, mission_id, title, content)
values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Security Lesson', 'Test');

insert into public.student_progress (student_id, mission_id, lesson_id, status, completed_at)
values (
  '20000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  'completed',
  now()
);

insert into public.projects (id, student_id, title, description, category, image_url, status)
values
  ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'A pending project', 'Test', 'Logic', 'https://example.test/a.png', 'pending'),
  ('50000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'B pending project', 'Test', 'Logic', 'https://example.test/b.png', 'pending');

insert into public.badges (id, name, description, icon_url, requirement_type, requirement_value)
values ('60000000-0000-4000-8000-000000000001', 'Security Fixture Badge', 'Test', '/test.svg', 'manual', 1);

insert into public.student_badges (student_id, badge_id)
values ('20000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"a0000000-0000-4000-8000-000000000001","role":"authenticated"}';

select results_eq(
  $$select count(*) from public.profiles where user_id = 'a0000000-0000-4000-8000-000000000001'::uuid$$,
  array[1::bigint],
  'student A can read their own profile'
);
select results_eq(
  $$select count(*) from public.profiles where user_id = 'a0000000-0000-4000-8000-000000000002'::uuid$$,
  array[0::bigint],
  'student A cannot read student B profile'
);
select results_eq(
  $$select count(*) from public.students where id = '20000000-0000-4000-8000-000000000002'::uuid$$,
  array[0::bigint],
  'student A cannot read student B student record'
);
select results_eq(
  $$select count(*) from public.student_progress where student_id = '20000000-0000-4000-8000-000000000002'::uuid$$,
  array[0::bigint],
  'student A cannot read student B progress'
);
select results_eq(
  $$select count(*) from public.projects where id = '50000000-0000-4000-8000-000000000002'::uuid$$,
  array[0::bigint],
  'student A cannot read student B pending project'
);
select results_eq(
  $$select count(*) from public.student_badges where student_id = '20000000-0000-4000-8000-000000000002'::uuid$$,
  array[0::bigint],
  'student A cannot read student B badge awards'
);
select results_eq(
  $$with changed as (
      update public.projects set title = 'Tampered'
      where id = '50000000-0000-4000-8000-000000000002'::uuid
      returning 1
    )
    select count(*) from changed$$,
  array[0::bigint],
  'student A cannot mutate student B pending project'
);

select throws_ok(
  $$update public.profiles set xp = xp + 100, coins = coins + 100 where user_id = 'a0000000-0000-4000-8000-000000000001'::uuid$$,
  '42501',
  'XP, coin increases, level, rank, role, status, and identity are server-managed.',
  'students cannot award themselves XP or coins'
);
select throws_ok(
  $$insert into public.student_badges (student_id, badge_id) values ('20000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'students cannot award themselves badges'
);
select throws_ok(
  $$insert into public.projects (student_id, title, description, category, image_url, status) values ('20000000-0000-4000-8000-000000000001', 'Self approved', 'No', 'Logic', 'https://example.test/no.png', 'approved')$$,
  '42501',
  null,
  'students cannot submit an approved project'
);
select results_eq(
  $$with attempted as (
      update public.projects set status = 'approved'
      where id = '50000000-0000-4000-8000-000000000001'::uuid
    )
    select status from public.projects
    where id = '50000000-0000-4000-8000-000000000001'::uuid$$,
  $$values ('pending'::text)$$,
  'students cannot approve an existing project'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"a0000000-0000-4000-8000-000000000003","role":"authenticated"}';

select results_eq(
  $$select count(*) from public.profiles where user_id in ('a0000000-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000002'::uuid)$$,
  array[2::bigint],
  'admins can read student profiles for moderation'
);
select lives_ok(
  $$update public.projects set status = 'approved' where id = '50000000-0000-4000-8000-000000000002'::uuid$$,
  'admins can approve submitted projects'
);

reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"a0000000-0000-4000-8000-000000000001","role":"authenticated"}';

select lives_ok(
  $$select public.complete_learning_activity('lesson', '40000000-0000-4000-8000-000000000001'::uuid)$$,
  'first completion succeeds'
);

create temporary table first_completion_balance as
select xp, coins from public.profiles
where user_id = 'a0000000-0000-4000-8000-000000000001'::uuid;

select lives_ok(
  $$select public.complete_learning_activity('lesson', '40000000-0000-4000-8000-000000000001'::uuid)$$,
  'retry completion succeeds'
);
select results_eq(
  $$select p.xp, p.coins from public.profiles p where p.user_id = 'a0000000-0000-4000-8000-000000000001'::uuid$$,
  $$select xp, coins from first_completion_balance$$,
  'retry does not award XP or coins twice'
);
select results_eq(
  $$select count(*) from public.reward_events where student_id = '20000000-0000-4000-8000-000000000001'::uuid and event_type = 'lesson'$$,
  array[1::bigint],
  'completion creates exactly one lesson reward event'
);
select results_eq(
  $$select count(*) from public.student_progress where student_id = '20000000-0000-4000-8000-000000000001'::uuid and lesson_id = '40000000-0000-4000-8000-000000000001'::uuid$$,
  array[1::bigint],
  'completion creates exactly one progress row'
);

select * from finish();
rollback;
