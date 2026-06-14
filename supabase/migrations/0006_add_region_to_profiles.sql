-- Migration 0006 — Ajoute la région/pays aux profils.
-- Permet de filtrer les villes et de personnaliser l'expérience par pays.

alter table public.profiles
  add column if not exists region text;
