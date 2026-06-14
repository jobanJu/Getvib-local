-- Migration 0010 — Avis de soirées passées (ressentis).
-- Un participant (ou l'hôte) d'une vibe PASSÉE peut, s'il le souhaite, laisser
-- une note (1–5) + un commentaire. Un seul avis par personne et par vibe.
--
-- Écriture verrouillée : aucune policy insert/update pour anon/authenticated →
-- tout passe par le service role côté serveur, qui vérifie « a bien participé à
-- une soirée passée » (comme pour les signalements / vérifications). Lecture
-- ouverte aux connectés (les avis sont une preuve sociale).

create table if not exists public.event_reviews (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (event_id, author_id)
);

alter table public.event_reviews enable row level security;

create policy "Avis lisibles par les utilisateurs connectés"
  on public.event_reviews for select to authenticated using (true);
