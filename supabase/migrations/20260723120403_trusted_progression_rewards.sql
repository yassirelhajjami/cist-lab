-- Trusted, authenticated progression and reward pipeline.
--
-- The public function is a SECURITY INVOKER gateway exposed through PostgREST.
-- It accepts only an activity identifier; student/profile identity is always
-- derived from auth.uid(). The private implementation is SECURITY DEFINER so
-- it can atomically update protected economy rows, but it remains outside the
-- exposed API schema, fixes search_path, checks auth.uid(), and is executable
-- only by authenticated callers through the public gateway.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.student_progress
  add column if not exists time_spent integer not null default 0,
  add column if not exists attempts_count integer not null default 0;

-- Audit/idempotency ledger. Students can read their own events, but only the
-- trusted private transaction can write them.
create table if not exists public.reward_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('lesson', 'challenge', 'mission', 'daily_login')),
  event_key text not null,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  coins_awarded integer not null default 0 check (coins_awarded >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint reward_events_student_type_key_unique unique (student_id, event_type, event_key)
);

create index if not exists reward_events_profile_created_idx
  on public.reward_events (profile_id, created_at desc);

alter table public.reward_events enable row level security;
revoke all on table public.reward_events from anon, authenticated;
grant select on table public.reward_events to authenticated;
grant select, insert, update, delete on table public.reward_events to service_role;

-- Preserve read access through existing RLS policies, but make badge awards
-- impossible through ordinary authenticated table mutations.
revoke insert, update, delete on table public.student_badges from anon, authenticated;

-- Student records contain email, birth date, parent contact, and notes. They
-- must not be directory-readable by other students.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Students list viewable by authenticated users" on public.students;
drop policy if exists "Student badges viewable by everyone" on public.student_badges;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy "Students can view their own student record"
on public.students
for select
to authenticated
using (
  profile_id in (
    select p.id from public.profiles as p
    where p.user_id = (select auth.uid())
  )
  or public.is_admin()
);

create policy "Students can view their own badge awards"
on public.student_badges
for select
to authenticated
using (
  student_id in (
    select s.id
    from public.students as s
    join public.profiles as p on p.id = s.profile_id
    where p.user_id = (select auth.uid())
  )
  or public.is_admin()
);

drop policy if exists "Students can view their own reward events" on public.reward_events;
create policy "Students can view their own reward events"
on public.reward_events
for select
to authenticated
using (
  profile_id in (
    select p.id
    from public.profiles as p
    where p.user_id = (select auth.uid())
  )
);

-- Repair legacy duplicates before adding NULL-safe activity uniqueness.
with ranked as (
  select id,
         row_number() over (
           partition by student_id, lesson_id
           order by (status = 'completed') desc, completed_at desc nulls last, created_at asc
         ) as row_number
  from public.student_progress
  where lesson_id is not null
)
delete from public.student_progress as progress
using ranked
where progress.id = ranked.id and ranked.row_number > 1;

with ranked as (
  select id,
         row_number() over (
           partition by student_id, challenge_id
           order by (status = 'completed') desc, completed_at desc nulls last, created_at asc
         ) as row_number
  from public.student_progress
  where challenge_id is not null
)
delete from public.student_progress as progress
using ranked
where progress.id = ranked.id and ranked.row_number > 1;

with ranked as (
  select id,
         row_number() over (
           partition by student_id, mission_id
           order by (status = 'completed') desc, completed_at desc nulls last, created_at asc
         ) as row_number
  from public.student_progress
  where lesson_id is null and challenge_id is null
)
delete from public.student_progress as progress
using ranked
where progress.id = ranked.id and ranked.row_number > 1;

create unique index if not exists student_progress_one_lesson_idx
  on public.student_progress (student_id, lesson_id)
  where lesson_id is not null;

create unique index if not exists student_progress_one_challenge_idx
  on public.student_progress (student_id, challenge_id)
  where challenge_id is not null;

create unique index if not exists student_progress_one_mission_idx
  on public.student_progress (student_id, mission_id)
  where lesson_id is null and challenge_id is null;

-- Students may read progress but can no longer manufacture completion rows.
drop policy if exists "Students can insert their own progress" on public.student_progress;
drop policy if exists "Students can update their own progress" on public.student_progress;

-- Lock economy and authorization fields against ordinary profile updates.
-- The private reward transaction sets a transaction-local flag immediately
-- before its protected profile update.
create or replace function public.check_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if current_setting('app.trusted_reward_write', true) = 'on' then
    if old.user_id is distinct from new.user_id
       or old.role is distinct from new.role
       or old.status is distinct from new.status
       or old.email is distinct from new.email then
      raise exception using errcode = '42501', message = 'Trusted reward writes cannot modify identity or authorization fields.';
    end if;
    return new;
  end if;

  if old.user_id is distinct from new.user_id
     or old.role is distinct from new.role
     or old.status is distinct from new.status
     or old.email is distinct from new.email
     or old.xp is distinct from new.xp
     or new.coins > old.coins
     or old.level is distinct from new.level
     or old.rank_title is distinct from new.rank_title then
    raise exception using errcode = '42501', message = 'XP, coin increases, level, rank, role, status, and identity are server-managed.';
  end if;

  return new;
end;
$$;

-- Badge eligibility is calculated exclusively from database-owned state. The
-- caller cannot provide a student id, counters, XP, coins, level, or badge id.
-- Keeping the privileged implementation private prevents arbitrary inserts
-- while the public SECURITY INVOKER wrapper remains callable through PostgREST.
create or replace function private.award_current_student_badges()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_student_id uuid;
  v_profile_id uuid;
  v_xp integer;
  v_coins integer;
  v_level integer;
  v_lesson_count integer := 0;
  v_challenge_count integer := 0;
  v_mission_count integer := 0;
  v_project_count integer := 0;
  v_new_badges jsonb := '[]'::jsonb;
  v_total_earned integer := 0;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;

  select s.id, p.id, p.xp, p.coins, p.level
    into v_student_id, v_profile_id, v_xp, v_coins, v_level
  from public.profiles as p
  join public.students as s on s.profile_id = p.id
  where p.user_id = v_user_id
    and p.role = 'student'
    and p.status = 'active'
    and s.status = 'active';

  if v_student_id is null then
    raise exception using errcode = '42501', message = 'An active student profile is required.';
  end if;

  select
    count(distinct lesson_id) filter (where lesson_id is not null),
    count(distinct challenge_id) filter (where challenge_id is not null),
    count(distinct mission_id) filter (where lesson_id is null and challenge_id is null)
  into v_lesson_count, v_challenge_count, v_mission_count
  from public.student_progress
  where student_id = v_student_id and status = 'completed';

  select count(*) into v_project_count
  from public.projects
  where student_id = v_student_id and status = 'approved';

  with inserted as (
    insert into public.student_badges (student_id, badge_id)
    select v_student_id, b.id
    from public.badges as b
    where
      (b.name = 'Iron Coder' and v_level >= 10)
      or (b.name = 'Bronze Operator' and v_level >= 10 and v_lesson_count >= 20 and v_challenge_count >= 15 and v_coins >= 2000)
      or (b.name = 'Silver Specialist' and v_level >= 10 and v_lesson_count >= 30 and v_challenge_count >= 25 and v_mission_count >= 3 and v_coins >= 3500)
      or (b.name = 'Gold Sentinel' and v_level >= 10 and v_lesson_count >= 45 and v_challenge_count >= 40 and v_mission_count >= 5 and v_coins >= 5000)
      or (b.name = 'Platinum Duelist' and v_level >= 10 and v_lesson_count >= 60 and v_challenge_count >= 55 and v_project_count >= 2 and v_coins >= 7500)
      or (b.name = 'Diamond Initiator' and v_level >= 10 and v_lesson_count >= 80 and v_challenge_count >= 70 and v_mission_count >= 10 and v_xp >= 25000)
      or (b.name = 'Ascendant Controller' and v_level >= 10 and v_lesson_count >= 100 and v_challenge_count >= 90 and v_mission_count >= 15 and v_xp >= 35000)
      or (b.name = 'Immortal Sentinel' and v_level >= 10 and v_lesson_count >= 125 and v_challenge_count >= 110 and v_project_count >= 5 and v_xp >= 50000)
      or (b.name = 'Radiant Legend' and v_level >= 10 and v_lesson_count >= 150 and v_challenge_count >= 140 and v_mission_count >= 25 and v_project_count >= 10 and v_coins >= 30000 and v_xp >= 75000)
    on conflict (student_id, badge_id) do nothing
    returning badge_id
  )
  select coalesce(jsonb_agg(b.name order by b.name), '[]'::jsonb)
    into v_new_badges
  from inserted as i
  join public.badges as b on b.id = i.badge_id;

  if jsonb_array_length(v_new_badges) > 0 then
    insert into public.notifications (user_id, title, message, type, is_read)
    values (
      v_profile_id,
      'Badge unlocked!',
      'New achievement: ' || array_to_string(array(select jsonb_array_elements_text(v_new_badges)), ', '),
      'badge',
      false
    );
  end if;

  select count(*) into v_total_earned
  from public.student_badges
  where student_id = v_student_id;

  return jsonb_build_object(
    'awarded', v_new_badges,
    'total_earned', v_total_earned
  );
end;
$$;

revoke all on function private.award_current_student_badges()
  from public, anon, service_role;
grant execute on function private.award_current_student_badges()
  to authenticated;

create or replace function public.evaluate_current_student_badges()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.award_current_student_badges();
$$;

revoke all on function public.evaluate_current_student_badges()
  from public, anon, service_role;
grant execute on function public.evaluate_current_student_badges()
  to authenticated;

create or replace function private.complete_learning_activity(
  p_activity_type text,
  p_activity_id uuid default null,
  p_submitted_output text default null,
  p_score integer default 100,
  p_time_spent integer default 0,
  p_attempts_count integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_student_id uuid;
  v_profile_id uuid;
  v_mission_id uuid;
  v_progress_id uuid;
  v_existing_status text;
  v_expected_output text;
  v_activity_xp integer := 0;
  v_activity_coins integer := 0;
  v_mission_xp integer := 0;
  v_mission_coins integer := 0;
  v_total_xp integer := 0;
  v_total_coins integer := 0;
  v_current_xp integer;
  v_current_coins integer;
  v_new_xp integer;
  v_new_coins integer;
  v_new_level integer;
  v_new_rank text;
  v_mission_completed boolean := false;
  v_event_inserted boolean := false;
  v_new_badges jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;

  if p_activity_type not in ('lesson', 'challenge', 'daily_login') then
    raise exception using errcode = '22023', message = 'Unsupported activity type.';
  end if;

  if p_score < 0 or p_score > 100
     or p_time_spent < 0 or p_time_spent > 86400
     or p_attempts_count < 1 or p_attempts_count > 1000 then
    raise exception using errcode = '22023', message = 'Invalid completion metrics.';
  end if;

  select s.id, p.id, p.xp, p.coins
    into v_student_id, v_profile_id, v_current_xp, v_current_coins
  from public.profiles as p
  join public.students as s on s.profile_id = p.id
  where p.user_id = v_user_id
    and p.role = 'student'
    and p.status = 'active'
    and s.status = 'active'
  for update of p;

  if v_student_id is null then
    raise exception using errcode = '42501', message = 'An active student profile is required.';
  end if;

  perform set_config('app.trusted_reward_write', 'on', true);

  if p_activity_type = 'daily_login' then
    insert into public.reward_events (
      student_id, profile_id, event_type, event_key, xp_awarded, coins_awarded
    )
    values (
      v_student_id, v_profile_id, 'daily_login',
      (current_timestamp at time zone 'utc')::date::text, 10, 2
    )
    on conflict (student_id, event_type, event_key) do nothing
    returning true into v_event_inserted;

    if coalesce(v_event_inserted, false) then
      v_activity_xp := 10;
      v_activity_coins := 2;
    end if;
  elsif p_activity_type = 'lesson' then
    if p_activity_id is null then
      raise exception using errcode = '22023', message = 'Lesson ID is required.';
    end if;

    select l.mission_id
      into v_mission_id
    from public.lessons as l
    join public.missions as m on m.id = l.mission_id
    where l.id = p_activity_id and m.is_published = true;

    if v_mission_id is null then
      raise exception using errcode = '22023', message = 'Published lesson not found.';
    end if;

    select sp.id, sp.status
      into v_progress_id, v_existing_status
    from public.student_progress as sp
    where sp.student_id = v_student_id and sp.lesson_id = p_activity_id
    for update;

    if v_progress_id is null then
      insert into public.student_progress (
        student_id, mission_id, lesson_id, status, score, completed_at
      )
      values (
        v_student_id, v_mission_id, p_activity_id, 'completed', 100, timezone('utc'::text, now())
      )
      returning id into v_progress_id;
      v_activity_xp := 25;
      v_activity_coins := 5;
    elsif v_existing_status <> 'completed' then
      update public.student_progress
      set status = 'completed', score = 100, completed_at = timezone('utc'::text, now())
      where id = v_progress_id;
      v_activity_xp := 25;
      v_activity_coins := 5;
    end if;
  else
    if p_activity_id is null then
      raise exception using errcode = '22023', message = 'Challenge ID is required.';
    end if;

    select c.mission_id, c.expected_output, c.xp_reward, c.coin_reward
      into v_mission_id, v_expected_output, v_activity_xp, v_activity_coins
    from public.challenges as c
    join public.missions as m on m.id = c.mission_id
    where c.id = p_activity_id and m.is_published = true;

    if v_mission_id is null then
      raise exception using errcode = '22023', message = 'Published challenge not found.';
    end if;

    if regexp_replace(trim(coalesce(p_submitted_output, '')), E'\\r\\n?', E'\\n', 'g')
       <> regexp_replace(trim(v_expected_output), E'\\r\\n?', E'\\n', 'g') then
      raise exception using errcode = '22023', message = 'Challenge output does not match the expected result.';
    end if;

    select sp.id, sp.status
      into v_progress_id, v_existing_status
    from public.student_progress as sp
    where sp.student_id = v_student_id and sp.challenge_id = p_activity_id
    for update;

    if v_progress_id is null then
      insert into public.student_progress (
        student_id, mission_id, challenge_id, status, score,
        time_spent, attempts_count, completed_at
      )
      values (
        v_student_id, v_mission_id, p_activity_id, 'completed', p_score,
        p_time_spent, p_attempts_count, timezone('utc'::text, now())
      )
      returning id into v_progress_id;
    elsif v_existing_status <> 'completed' then
      update public.student_progress
      set status = 'completed',
          score = p_score,
          time_spent = p_time_spent,
          attempts_count = p_attempts_count,
          completed_at = timezone('utc'::text, now())
      where id = v_progress_id;
    else
      v_activity_xp := 0;
      v_activity_coins := 0;
    end if;
  end if;

  if p_activity_type in ('lesson', 'challenge') and (v_activity_xp > 0 or v_activity_coins > 0) then
    insert into public.reward_events (
      student_id, profile_id, event_type, event_key, xp_awarded, coins_awarded
    )
    values (
      v_student_id, v_profile_id, p_activity_type, p_activity_id::text,
      v_activity_xp, v_activity_coins
    )
    on conflict (student_id, event_type, event_key) do nothing
    returning true into v_event_inserted;

    if not coalesce(v_event_inserted, false) then
      v_activity_xp := 0;
      v_activity_coins := 0;
    end if;
  end if;

  -- Completing the final required activity atomically completes the mission.
  if v_mission_id is not null
     and exists (
       select 1 from public.lessons where mission_id = v_mission_id
       union all
       select 1 from public.challenges where mission_id = v_mission_id
     )
     and not exists (
       select 1
       from public.lessons as l
       where l.mission_id = v_mission_id
         and not exists (
           select 1 from public.student_progress as sp
           where sp.student_id = v_student_id
             and sp.lesson_id = l.id
             and sp.status = 'completed'
         )
     )
     and not exists (
       select 1
       from public.challenges as c
       where c.mission_id = v_mission_id
         and not exists (
           select 1 from public.student_progress as sp
           where sp.student_id = v_student_id
             and sp.challenge_id = c.id
             and sp.status = 'completed'
         )
     ) then
    insert into public.student_progress (
      student_id, mission_id, status, score, completed_at
    )
    values (
      v_student_id, v_mission_id, 'completed', 100, timezone('utc'::text, now())
    )
    on conflict (student_id, mission_id)
      where lesson_id is null and challenge_id is null
    do nothing
    returning true into v_mission_completed;

    if coalesce(v_mission_completed, false) then
      select m.xp_reward, m.coin_reward
        into v_mission_xp, v_mission_coins
      from public.missions as m
      where m.id = v_mission_id;

      insert into public.reward_events (
        student_id, profile_id, event_type, event_key, xp_awarded, coins_awarded
      )
      values (
        v_student_id, v_profile_id, 'mission', v_mission_id::text,
        v_mission_xp, v_mission_coins
      )
      on conflict (student_id, event_type, event_key) do nothing;
    end if;
  end if;

  v_total_xp := v_activity_xp + v_mission_xp;
  v_total_coins := v_activity_coins + v_mission_coins;
  v_new_xp := v_current_xp + v_total_xp;
  v_new_coins := v_current_coins + v_total_coins;

  v_new_level := case
    when v_new_xp >= 15000 then 10
    when v_new_xp >= 10000 then 9
    when v_new_xp >= 7500 then 8
    when v_new_xp >= 5000 then 7
    when v_new_xp >= 3500 then 6
    when v_new_xp >= 2000 then 5
    when v_new_xp >= 1000 then 4
    when v_new_xp >= 500 then 3
    when v_new_xp >= 250 then 2
    else 1
  end;

  v_new_rank := case
    when v_new_level >= 8 then 'CIST Tech Hero'
    when v_new_level = 7 then 'Project Creator'
    when v_new_level = 6 then 'Robotics Engineer'
    when v_new_level = 5 then 'Algorithm Master'
    when v_new_level = 4 then 'Bug Hunter'
    when v_new_level = 3 then 'Logic Builder'
    when v_new_level = 2 then 'Code Explorer'
    else 'Rookie Coder'
  end;

  if v_total_xp > 0 or v_total_coins > 0 then
    update public.profiles
    set xp = v_new_xp,
        coins = v_new_coins,
        level = v_new_level,
        rank_title = v_new_rank,
        updated_at = timezone('utc'::text, now())
    where id = v_profile_id;

    insert into public.notifications (user_id, title, message, type, is_read)
    values (
      v_profile_id,
      case when v_mission_completed then 'Mission completed!' else 'Quest reward earned!' end,
      'You earned ' || v_total_xp || ' XP and ' || v_total_coins || ' treasure coins.',
      'xp',
      false
    );
  end if;

  v_new_badges := private.award_current_student_badges()->'awarded';

  return jsonb_build_object(
    'already_completed', v_total_xp = 0 and v_total_coins = 0,
    'mission_completed', v_mission_completed,
    'xp_awarded', v_total_xp,
    'coins_awarded', v_total_coins,
    'new_badges', v_new_badges,
    'profile', jsonb_build_object(
      'id', v_profile_id,
      'xp', v_new_xp,
      'coins', v_new_coins,
      'level', v_new_level,
      'rank_title', v_new_rank
    )
  );
end;
$$;

revoke all on function private.complete_learning_activity(text, uuid, text, integer, integer, integer)
  from public, anon, service_role;
grant execute on function private.complete_learning_activity(text, uuid, text, integer, integer, integer)
  to authenticated;

create or replace function public.complete_learning_activity(
  p_activity_type text,
  p_activity_id uuid default null,
  p_submitted_output text default null,
  p_score integer default 100,
  p_time_spent integer default 0,
  p_attempts_count integer default 1
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.complete_learning_activity(
    p_activity_type,
    p_activity_id,
    p_submitted_output,
    p_score,
    p_time_spent,
    p_attempts_count
  );
$$;

revoke all on function public.complete_learning_activity(text, uuid, text, integer, integer, integer)
  from public, anon, service_role;
grant execute on function public.complete_learning_activity(text, uuid, text, integer, integer, integer)
  to authenticated;
