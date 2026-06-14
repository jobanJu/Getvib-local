-- Migration 0009 — Pseudo unique (@handle) sur les profils.
-- Objectif : lever l'ambiguïté de la recherche d'amis (plusieurs « Léa » à
-- Tourcoing) en donnant à chacun un identifiant unique type @lele59.
--
-- Format applicatif : 3–20 caractères, minuscules / chiffres / underscore.
-- Unicité insensible à la casse (index sur lower(pseudo)). Colonne nullable en
-- base (comptes existants sans pseudo) ; l'inscription le rend obligatoire côté
-- app, et les anciens membres le définissent dans les Réglages.

alter table public.profiles
  add column if not exists pseudo text;

create unique index if not exists profiles_pseudo_lower_unique
  on public.profiles (lower(pseudo))
  where pseudo is not null;
