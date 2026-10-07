-- Trenches League · pre-registration schema
-- Paste into Supabase: SQL Editor > New query > Run.
-- The browser only ever calls the three functions below; the table itself is closed to the public.

create extension if not exists pgcrypto;

create table if not exists public.signups (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  country    text not null check (country ~ '^[A-Z]{2}$'),
  handle     text not null check (char_length(handle) between 2 and 24),
  wallet     text check (wallet is null or wallet ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'),
  code       text not null unique default substr(encode(gen_random_bytes(6), 'hex'), 1, 10),
  ref        text,
  lang       text
);

-- one registration per wallet
create unique index if not exists signups_wallet_uniq on public.signups (wallet) where wallet is not null;
create index if not exists signups_ref_idx on public.signups (ref);
create index if not exists signups_country_idx on public.signups (country);

alter table public.signups enable row level security;
-- no policies: anon and authenticated users cannot read or write the table directly

-- register a soldier, returns their recruit code
create or replace function public.register(p_country text, p_handle text, p_wallet text, p_ref text, p_lang text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_code text;
begin
  insert into signups (country, handle, wallet, ref, lang)
  values (upper(p_country), trim(p_handle), nullif(trim(p_wallet), ''), nullif(left(p_ref, 12), ''), left(p_lang, 5))
  returning code into v_code;
  return v_code;
end $$;

-- public leaderboard: soldiers per country
create or replace function public.country_counts()
returns table (country text, n bigint)
language sql
security definer
set search_path = public
as $$ select country, count(*) from signups group by country order by 2 desc $$;

-- how many soldiers a recruit code brought
create or replace function public.ref_count(p_code text)
returns bigint
language sql
security definer
set search_path = public
as $$ select count(*) from signups where ref = p_code $$;

revoke all on function public.register(text, text, text, text, text) from public;
revoke all on function public.country_counts() from public;
revoke all on function public.ref_count(text) from public;
grant execute on function public.register(text, text, text, text, text) to anon, authenticated;
grant execute on function public.country_counts() to anon, authenticated;
grant execute on function public.ref_count(text) to anon, authenticated;
