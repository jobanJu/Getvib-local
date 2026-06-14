-- Migration 0008 — Statut premium « Vib+++ ».
-- Un membre Vib+++ débloque des avantages, dont le chat de support PRIORITAIRE
-- (ligne directe humaine) au lieu du bot FAQ + mail (réponse sous 12h).
--
-- Flag piloté à la main / par le futur système d'abonnement. Lecture libre
-- (le client a besoin de connaître son propre statut) ; écriture réservée au
-- service role côté serveur (aucune policy d'update pour anon/authenticated).

alter table public.profiles
  add column if not exists is_premium boolean not null default false;
