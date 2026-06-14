-- Migration 0004 — Ajoute le numéro de téléphone aux profils.
-- L'âge et la ville existent déjà dans le schéma mais on s'assure de leur présence.

alter table public.profiles
  add column if not exists phone text;
