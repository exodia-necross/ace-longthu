create extension if not exists "uuid-ossp";

create type public.user_role as enum ('admin', 'organizer');
create type public.player_status as enum ('pending', 'approved', 'rejected');
create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type public.match_status as enum ('scheduled', 'live', 'completed', 'cancelled');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'organizer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slogan text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  address text,
  registration_open boolean not null default true,
  format text not null default 'round_robin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  gender text not null,
  phone text not null,
  email text not null,
  address text,
  level public.skill_level not null,
  dominant_hand text not null,
  event_type text not null default 'free',
  has_partner boolean not null default false,
  partner_name text,
  note text,
  avatar_url text,
  status public.player_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  event_type text not null default 'Tự do',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  primary key (team_id, player_id)
);

create table public.venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

create table public.courts (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  code text not null unique,
  event_type text not null default 'Tự do',
  court_id uuid references public.courts(id),
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid not null references public.teams(id),
  starts_at timestamptz not null,
  status public.match_status not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table public.match_results (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  winner_team_id uuid references public.teams(id),
  set1 text not null,
  set2 text,
  set3 text,
  entered_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.rankings (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  matches int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  point_difference int not null default 0,
  points int not null default 0,
  updated_at timestamptz not null default now(),
  unique (tournament_id, team_id)
);

create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  title text not null,
  body text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index players_tournament_status_idx on public.players(tournament_id, status);
create index players_public_idx on public.players(tournament_id, event_type, level);
create index teams_tournament_event_idx on public.teams(tournament_id, event_type);
create index matches_schedule_idx on public.matches(tournament_id, starts_at, court_id);
create index rankings_points_idx on public.rankings(tournament_id, points desc, point_difference desc);

alter table public.users enable row level security;
alter table public.tournaments enable row level security;
alter table public.players enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.venues enable row level security;
alter table public.courts enable row level security;
alter table public.matches enable row level security;
alter table public.match_results enable row level security;
alter table public.rankings enable row level security;
alter table public.announcements enable row level security;
alter table public.settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin', 'organizer')
  );
$$;

create policy "Public can read tournaments" on public.tournaments for select using (true);
create policy "Public can read approved players" on public.players for select using (status = 'approved');
create policy "Public can submit registrations" on public.players for insert with check (status = 'pending');
create policy "Public can read teams" on public.teams for select using (true);
create policy "Public can read team members" on public.team_members for select using (true);
create policy "Public can read venues" on public.venues for select using (true);
create policy "Public can read courts" on public.courts for select using (true);
create policy "Public can read matches" on public.matches for select using (true);
create policy "Public can read results" on public.match_results for select using (true);
create policy "Public can read rankings" on public.rankings for select using (true);
create policy "Public can read announcements" on public.announcements for select using (is_public = true);

create policy "Admins manage users" on public.users for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage tournaments" on public.tournaments for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage players" on public.players for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage teams" on public.teams for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage team members" on public.team_members for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage venues" on public.venues for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage courts" on public.courts for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage matches" on public.matches for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage match results" on public.match_results for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage rankings" on public.rankings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
