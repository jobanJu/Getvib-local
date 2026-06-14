-- Migration 0011 — Accès aux messages SUR CONSENTEMENT (modération RGPD-friendly).
-- En cas de signalement, l'admin demande au SIGNALEUR l'autorisation de consulter
-- sa conversation avec la personne visée, pour enquêter. L'admin ne voit la
-- conversation QUE si le signaleur a explicitement accordé l'accès.
--
-- `reporter_id` = celui qui consent (le signaleur). `reported_name` est dénormalisé
-- car la RLS de profiles empêche le signaleur de lire le profil de l'autre.

create table if not exists public.message_access_grants (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reported_id uuid references public.profiles(id) on delete cascade not null,
  reported_name text,
  chat_id uuid references public.chats(id) on delete set null,
  reason text,
  status text not null default 'pending', -- pending | granted | denied
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  decided_at timestamp with time zone
);

alter table public.message_access_grants enable row level security;

-- Le signaleur voit et décide UNIQUEMENT ses propres demandes de consentement.
drop policy if exists "voir mes demandes d acces" on public.message_access_grants;
create policy "voir mes demandes d acces"
  on public.message_access_grants for select to authenticated
  using (auth.uid() = reporter_id);

drop policy if exists "decider mes demandes d acces" on public.message_access_grants;
create policy "decider mes demandes d acces"
  on public.message_access_grants for update to authenticated
  using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);

-- L'admin (service role) crée et lit tout côté serveur, hors RLS.
