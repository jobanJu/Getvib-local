-- Ajoute le champ de bannissement aux profils
alter table public.profiles add column is_banned boolean default false;

-- Index pour accélérer les vérifications d'auth
create index idx_profiles_is_banned on public.profiles(is_banned);

-- Commentaire pour documentation
comment on column public.profiles.is_banned is 'Indique si l''utilisateur est banni du service.';
