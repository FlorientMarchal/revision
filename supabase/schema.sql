-- Table de progression : une ligne par utilisateur et par cours.
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.
create table if not exists public.progress (
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  course     text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, course)
);

-- Chaque utilisateur ne voit et ne modifie que ses propres lignes.
alter table public.progress enable row level security;

drop policy if exists "lire sa progression" on public.progress;
drop policy if exists "créer sa progression" on public.progress;
drop policy if exists "modifier sa progression" on public.progress;
drop policy if exists "supprimer sa progression" on public.progress;

create policy "lire sa progression" on public.progress
  for select using (auth.uid() = user_id);
create policy "créer sa progression" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "modifier sa progression" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "supprimer sa progression" on public.progress
  for delete using (auth.uid() = user_id);
