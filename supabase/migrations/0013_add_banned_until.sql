-- Ajoute la date de fin de bannissement
alter table public.profiles add column banned_until timestamp with time zone;

-- Index pour les vérifications de temps
create index idx_profiles_banned_until on public.profiles(banned_until);

-- Commentaire
comment on column public.profiles.banned_until is 'Date et heure jusqu''à laquelle l''utilisateur est banni. Si NULL et is_banned est TRUE, le ban est permanent.';
