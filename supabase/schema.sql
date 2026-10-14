-- Progression identifiée par l'adresse e-mail, sans compte ni mot de passe.
-- La base ne stocke jamais l'adresse : seulement son empreinte SHA-256 (64 caractères hexadécimaux),
-- calculée dans le navigateur. Qui connaît l'adresse peut lire et modifier la progression associée :
-- c'est voulu, les données (avancement des révisions) ne sont pas sensibles.
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.

create table if not exists public.progress_by_key (
  key        text        not null check (key ~ '^[0-9a-f]{64}$'),
  course     text        not null check (length(course) between 1 and 64),
  data       jsonb       not null default '{}'::jsonb check (pg_column_size(data) < 500000),
  updated_at timestamptz not null default now(),
  primary key (key, course)
);

-- Aucun accès direct à la table (impossible de lister les lignes) : uniquement via les deux fonctions.
alter table public.progress_by_key enable row level security;
revoke all on public.progress_by_key from anon, authenticated;

create or replace function public.get_progress(p_key text)
returns table (course text, data jsonb)
language sql stable security definer set search_path = public as $$
  select course, data from public.progress_by_key where key = p_key;
$$;

create or replace function public.save_progress(p_key text, p_course text, p_data jsonb)
returns void
language sql security definer set search_path = public as $$
  insert into public.progress_by_key (key, course, data, updated_at)
  values (p_key, p_course, p_data, now())
  on conflict (key, course) do update set data = excluded.data, updated_at = now();
$$;

revoke all on function public.get_progress(text) from public;
revoke all on function public.save_progress(text, text, jsonb) from public;
grant execute on function public.get_progress(text) to anon, authenticated;
grant execute on function public.save_progress(text, text, jsonb) to anon, authenticated;
