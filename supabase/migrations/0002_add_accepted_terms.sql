-- Migration 0002 — Ajoute la colonne manquante `accepted_terms` à profiles.
-- La table avait été créée avant l'ajout de la charte de confiance ; sans cette
-- colonne, l'acceptation de la charte échouait (erreur 42703) et bloquait l'accès.
-- Idempotent : relançable sans risque.

alter table public.profiles
  add column if not exists accepted_terms boolean default false;
