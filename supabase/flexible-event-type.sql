-- Run this once in Supabase SQL Editor before using free-form team/match labels.
-- It converts event_type from a fixed enum into text, so admins can create any matchup.

alter table public.players alter column event_type drop default;
alter table public.teams alter column event_type drop default;
alter table public.matches alter column event_type drop default;

alter table public.players
  alter column event_type type text using event_type::text;

alter table public.teams
  alter column event_type type text using event_type::text;

alter table public.matches
  alter column event_type type text using event_type::text;

update public.players set event_type = 'free' where event_type is null;
update public.teams set event_type = 'Tự do' where event_type in ('mens_single', 'womens_single', 'mens_double', 'womens_double', 'mixed_double');
update public.matches set event_type = 'Tự do' where event_type in ('mens_single', 'womens_single', 'mens_double', 'womens_double', 'mixed_double');

alter table public.players alter column event_type set default 'free';
alter table public.teams alter column event_type set default 'Tự do';
alter table public.matches alter column event_type set default 'Tự do';
