-- Migration 0003 — Ajoute la colonne `city` à la table profiles.
-- Permet de stocker la ville de l'utilisateur pour personnaliser son expérience.

alter table public.profiles
  add column if not exists city text;
