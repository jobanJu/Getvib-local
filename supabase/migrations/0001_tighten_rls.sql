-- Migration 0001 — Verrouillage RLS
-- Corrige trois fuites de données exposées via la clé anon publique :
--   1. Adresse des soirées lisible par tous
--   2. Profils (email, âge, bio) lisibles par tous
--   3. Liste des participants lisible par tous
-- À exécuter dans le SQL Editor de Supabase. Le code serveur utilise le
-- service role et n'est pas affecté par ces changements.

-- 1. Profils : seul le propriétaire peut lire sa ligne (protège email, âge, bio…)
drop policy if exists "Profils visibles par tous" on public.profiles;
drop policy if exists "Profil visible par son propriétaire" on public.profiles;
create policy "Profil visible par son propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

-- 2. Événements : on retire la colonne `address` de l'accès public.
--    On révoque le SELECT global puis on ré-accorde toutes les colonnes
--    SAUF `address`. La policy RLS (événements publiés visibles) reste valable
--    pour les colonnes autorisées ; l'adresse n'est jamais servie qu'au travers
--    de l'API serveur (service role) après acceptation et révélation.
revoke select on public.events from anon, authenticated;
grant select (
  id, host_id, type, title, description, image, vibe, date, city,
  address_visible, reveal_at, max_participants, contribution_amount,
  contribution_reason, min_age, max_age, interests_required, status, created_at
) on public.events to anon, authenticated;

-- 3. Participants : visibles uniquement par le participant lui-même ou l'hôte.
drop policy if exists "Participants visibles par tous" on public.event_participants;
drop policy if exists "Participants visibles par hôte et participant" on public.event_participants;
create policy "Participants visibles par hôte et participant"
  on public.event_participants for select
  using (
    auth.uid() = user_id
    or auth.uid() in (select host_id from public.events where id = event_id)
  );
