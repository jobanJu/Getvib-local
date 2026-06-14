-- Migration 0007 — Demandes de vérification de profil (manuelle).
-- L'utilisateur envoie une photo de lui tenant une feuille « GetVib » + une
-- coupe de champagne dessinée. L'admin valide manuellement (par mail puis via
-- le futur dashboard admin) en passant profiles.verification_level à 1.
--
-- Table verrouillée : aucune policy anon/authenticated → seul le service role
-- (code serveur) y accède. La photo contient des données sensibles (visage).

create table if not exists public.verification_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_url text not null,
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Une seule demande en attente par utilisateur (évite le spam de demandes).
create unique index if not exists verification_requests_one_pending
  on public.verification_requests (user_id)
  where status = 'pending';

alter table public.verification_requests enable row level security;
-- Pas de policy : tout accès passe par le service role côté serveur.
