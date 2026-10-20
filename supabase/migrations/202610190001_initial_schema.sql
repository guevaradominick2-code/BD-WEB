-- Our Little Universe · initial schema
-- Run with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'girlfriend');
create type public.reveal_status as enum ('locked', 'revealed', 'completed');
create type public.letter_status as enum ('draft', 'published');
create type public.mission_kind as enum ('choice', 'guess', 'action');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'My Love' check (char_length(display_name) between 1 and 100),
  role public.app_role not null default 'girlfriend',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.celebrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  guest_id uuid unique references public.profiles(id) on delete set null,
  title text not null default 'Our Little Universe' check (char_length(title) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  celebration_id uuid primary key references public.celebrations(id) on delete cascade,
  girlfriend_name text not null default 'My Love' check (char_length(girlfriend_name) between 1 and 100),
  birthday timestamptz not null,
  timezone text not null default 'America/Costa_Rica',
  hero_message text not null default 'Happy Birthday, My Love',
  welcome_message text not null,
  palette jsonb not null default '{"burgundy":"#5A2636","blush":"#F5DDE3","ivory":"#FFF9F5","champagne":"#D9B98F","charcoal":"#282126"}'::jsonb,
  love_reasons jsonb not null default '[]'::jsonb,
  music_storage_path text,
  hero_storage_path text,
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  teaser text not null check (char_length(teaser) between 1 and 240),
  category text not null check (char_length(category) between 1 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz,
  reveal_at timestamptz not null,
  status public.reveal_status not null default 'locked',
  clue text,
  location text,
  meeting_time text,
  dress_code text,
  bring text,
  details text,
  gratitude text,
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_date_order check (ends_at is null or ends_at >= starts_at)
);

create table public.surprises (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  label text not null check (char_length(label) between 1 and 80),
  reveal_at timestamptz not null,
  event_date timestamptz,
  status public.reveal_status not null default 'locked',
  hint text,
  message text,
  image_url text,
  storage_path text,
  order_index integer not null default 0 check (order_index >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.surprise_reveals (
  id uuid primary key default gen_random_uuid(),
  surprise_id uuid not null references public.surprises(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  opened_at timestamptz not null default now(),
  unique (surprise_id, user_id)
);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  title text not null check (char_length(title) between 1 and 140),
  memory_date date,
  place text,
  description text,
  romantic_note text,
  category text not null default 'Us',
  storage_path text,
  image_url text,
  featured boolean not null default false,
  published boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_image_source check (storage_path is not null or image_url is not null)
);

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  excerpt text not null check (char_length(excerpt) between 1 and 300),
  body text,
  reveal_at timestamptz not null,
  status public.letter_status not null default 'draft',
  image_storage_path text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.letter_reads (
  letter_id uuid not null references public.letters(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (letter_id, user_id)
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  title text not null,
  prompt text not null,
  kind public.mission_kind not null default 'action',
  options jsonb,
  accepted_answers jsonb,
  success_message text not null default 'You did it.',
  active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mission_responses (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, user_id)
);

create table public.birthday_wishes (
  id uuid primary key default gen_random_uuid(),
  celebration_id uuid not null references public.celebrations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  wish text not null check (char_length(wish) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (celebration_id, author_id)
);

create index events_celebration_order_idx on public.events (celebration_id, order_index);
create index events_reveal_at_idx on public.events (celebration_id, reveal_at);
create index surprises_reveal_at_idx on public.surprises (celebration_id, reveal_at) where active;
create index memories_celebration_order_idx on public.memories (celebration_id, order_index) where published;
create index letters_reveal_at_idx on public.letters (celebration_id, reveal_at) where status = 'published';
create index missions_celebration_order_idx on public.missions (celebration_id, order_index) where active;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger celebrations_set_updated_at before update on public.celebrations for each row execute function public.set_updated_at();
create trigger app_settings_set_updated_at before update on public.app_settings for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger surprises_set_updated_at before update on public.surprises for each row execute function public.set_updated_at();
create trigger memories_set_updated_at before update on public.memories for each row execute function public.set_updated_at();
create trigger letters_set_updated_at before update on public.letters for each row execute function public.set_updated_at();
create trigger missions_set_updated_at before update on public.missions for each row execute function public.set_updated_at();
create trigger mission_responses_set_updated_at before update on public.mission_responses for each row execute function public.set_updated_at();
create trigger birthday_wishes_set_updated_at before update on public.birthday_wishes for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'My Love'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_celebration_admin(target uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.celebrations c
    join public.profiles p on p.id = c.owner_id
    where c.id = target and c.owner_id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.can_view_celebration(target uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.celebrations c
    where c.id = target and (c.owner_id = auth.uid() or c.guest_id = auth.uid())
  );
$$;

revoke all on function public.is_celebration_admin(uuid) from public;
revoke all on function public.can_view_celebration(uuid) from public;
grant execute on function public.is_celebration_admin(uuid) to authenticated;
grant execute on function public.can_view_celebration(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.celebrations enable row level security;
alter table public.app_settings enable row level security;
alter table public.events enable row level security;
alter table public.surprises enable row level security;
alter table public.surprise_reveals enable row level security;
alter table public.albums enable row level security;
alter table public.memories enable row level security;
alter table public.letters enable row level security;
alter table public.letter_reads enable row level security;
alter table public.missions enable row level security;
alter table public.mission_responses enable row level security;
alter table public.birthday_wishes enable row level security;

create policy profiles_read_self on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- A signed-in user may edit their display name, but cannot promote their own role.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy celebrations_read_member on public.celebrations for select to authenticated using (owner_id = auth.uid() or guest_id = auth.uid());
create policy celebrations_insert_admin on public.celebrations for insert to authenticated with check (owner_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy celebrations_update_admin on public.celebrations for update to authenticated using (public.is_celebration_admin(id)) with check (public.is_celebration_admin(id));

create policy settings_read_member on public.app_settings for select to authenticated using (public.can_view_celebration(celebration_id));
create policy settings_write_admin on public.app_settings for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));

-- Guests cannot select raw event/surprise/letter records. They use the RPCs below,
-- whose CASE expressions remove secret fields before rows leave PostgreSQL.
create policy events_admin_all on public.events for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));
create policy surprises_admin_all on public.surprises for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));
create policy letters_admin_all on public.letters for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));

create policy surprise_reveals_read_member on public.surprise_reveals for select to authenticated using (user_id = auth.uid() or public.is_celebration_admin((select celebration_id from public.surprises where id = surprise_id)));
create policy surprise_reveals_insert_self on public.surprise_reveals for insert to authenticated with check (user_id = auth.uid() and public.can_view_celebration((select celebration_id from public.surprises where id = surprise_id)));

create policy albums_read_member on public.albums for select to authenticated using (public.can_view_celebration(celebration_id));
create policy albums_admin_all on public.albums for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));
create policy memories_read_published on public.memories for select to authenticated using (published and public.can_view_celebration(celebration_id));
create policy memories_admin_all on public.memories for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));

create policy letter_reads_read_self on public.letter_reads for select to authenticated using (user_id = auth.uid());
create policy letter_reads_write_self on public.letter_reads for insert to authenticated with check (user_id = auth.uid());

create policy missions_read_active on public.missions for select to authenticated using (active and public.can_view_celebration(celebration_id));
create policy missions_admin_all on public.missions for all to authenticated using (public.is_celebration_admin(celebration_id)) with check (public.is_celebration_admin(celebration_id));
create policy mission_responses_read on public.mission_responses for select to authenticated using (user_id = auth.uid() or public.is_celebration_admin((select celebration_id from public.missions where id = mission_id)));
create policy mission_responses_write_self on public.mission_responses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy wishes_read_owner on public.birthday_wishes for select to authenticated using (author_id = auth.uid() or public.is_celebration_admin(celebration_id));
create policy wishes_insert_self on public.birthday_wishes for insert to authenticated with check (author_id = auth.uid() and public.can_view_celebration(celebration_id));
create policy wishes_update_self on public.birthday_wishes for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

create or replace function public.get_revealed_events(p_celebration_id uuid)
returns table (
  id uuid, title text, teaser text, category text, starts_at timestamptz, ends_at timestamptz,
  reveal_at timestamptz, status public.reveal_status, effective_status public.reveal_status,
  clue text, location text, meeting_time text, dress_code text, bring text, details text,
  gratitude text, order_index integer
)
language sql stable security definer set search_path = ''
as $$
  select
    e.id,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.title else 'Something special is waiting for you...' end,
    e.teaser,
    e.category,
    e.starts_at,
    e.ends_at,
    e.reveal_at,
    e.status,
    case when e.status = 'completed' then 'completed'::public.reveal_status
         when e.status = 'revealed' or e.reveal_at <= now() then 'revealed'::public.reveal_status
         else 'locked'::public.reveal_status end,
    e.clue,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.location end,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.meeting_time end,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.dress_code end,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.bring end,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.details end,
    case when e.status <> 'locked' or e.reveal_at <= now() then e.gratitude end,
    e.order_index
  from public.events e
  where e.celebration_id = p_celebration_id
    and public.can_view_celebration(e.celebration_id)
  order by e.order_index;
$$;

create or replace function public.get_revealed_surprises(p_celebration_id uuid)
returns table (
  id uuid, name text, label text, reveal_at timestamptz, event_date timestamptz,
  status public.reveal_status, effective_status public.reveal_status, hint text,
  message text, image_url text, order_index integer
)
language sql stable security definer set search_path = ''
as $$
  select
    s.id,
    case when s.status <> 'locked' or s.reveal_at <= now() then s.name else s.label end,
    s.label,
    s.reveal_at,
    s.event_date,
    s.status,
    case when s.status = 'completed' then 'completed'::public.reveal_status
         when s.status = 'revealed' or s.reveal_at <= now() then 'revealed'::public.reveal_status
         else 'locked'::public.reveal_status end,
    s.hint,
    case when s.status <> 'locked' or s.reveal_at <= now() then s.message end,
    case when s.status <> 'locked' or s.reveal_at <= now() then s.image_url end,
    s.order_index
  from public.surprises s
  where s.celebration_id = p_celebration_id
    and s.active
    and public.can_view_celebration(s.celebration_id)
  order by s.order_index;
$$;

create or replace function public.get_available_letters(p_celebration_id uuid)
returns table (
  id uuid, title text, excerpt text, body text, reveal_at timestamptz,
  status public.letter_status, unlocked boolean, read boolean, order_index integer
)
language sql stable security definer set search_path = ''
as $$
  select
    l.id,
    l.title,
    l.excerpt,
    case when l.reveal_at <= now() then l.body end,
    l.reveal_at,
    l.status,
    l.reveal_at <= now(),
    exists (select 1 from public.letter_reads lr where lr.letter_id = l.id and lr.user_id = auth.uid()),
    l.order_index
  from public.letters l
  where l.celebration_id = p_celebration_id
    and l.status = 'published'
    and public.can_view_celebration(l.celebration_id)
  order by l.order_index;
$$;

revoke all on function public.get_revealed_events(uuid) from public;
revoke all on function public.get_revealed_surprises(uuid) from public;
revoke all on function public.get_available_letters(uuid) from public;
grant execute on function public.get_revealed_events(uuid) to authenticated;
grant execute on function public.get_revealed_surprises(uuid) to authenticated;
grant execute on function public.get_available_letters(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memories', 'memories', false, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy memory_objects_read_member on storage.objects for select to authenticated
using (bucket_id = 'memories' and public.can_view_celebration(((storage.foldername(name))[1])::uuid));
create policy memory_objects_insert_admin on storage.objects for insert to authenticated
with check (bucket_id = 'memories' and public.is_celebration_admin(((storage.foldername(name))[1])::uuid));
create policy memory_objects_update_admin on storage.objects for update to authenticated
using (bucket_id = 'memories' and public.is_celebration_admin(((storage.foldername(name))[1])::uuid));
create policy memory_objects_delete_admin on storage.objects for delete to authenticated
using (bucket_id = 'memories' and public.is_celebration_admin(((storage.foldername(name))[1])::uuid));

comment on function public.get_revealed_events(uuid) is 'Guest-safe event projection. Secret logistics are NULL until reveal is authorized by server time.';
comment on function public.get_revealed_surprises(uuid) is 'Guest-safe surprise projection. Message and image are never returned early.';
comment on function public.get_available_letters(uuid) is 'Guest-safe letters projection. Drafts are omitted and bodies remain NULL until reveal time.';
