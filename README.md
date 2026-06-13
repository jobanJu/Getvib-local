# GetVib

GetVib est une plateforme de rencontres IRL basée sur des soirées privées chez des particuliers. La V1 cible Lille et vise les 10 premiers utilisateurs réels.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui style components
- Lucide Icons
- Supabase (Auth, Postgres, Realtime, Storage) avec RLS
- Route Handlers API et services serveur (service role)
- PWA installable iPhone, Android et desktop
- Vercel + cron GitHub Actions de révélation d’adresse

## Arborescence

```txt
app/                      Pages, API routes, manifest PWA
components/               UI, layout, cartes événement
features/                 Auth, events, messages, notifications, reports
hooks/                    Hooks client
lib/                      Types, client Supabase, validation, helpers
public/                   Service worker et icônes PWA
supabase/schema.sql       Schéma Postgres + policies RLS
supabase/migrations/      Migrations SQL incrémentales
.github/workflows/        Cron GitHub Actions (révélation d'adresses)
```

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Renseigner les variables Supabase (client et service role) dans `.env.local` — voir `.env.example`.

Appliquer le schéma sur la base : exécuter `supabase/schema.sql` puis les fichiers de `supabase/migrations/` dans le SQL Editor de Supabase.

## Routes API

- `GET /api/events`
- `GET /api/events/[id]`
- `POST /api/events`
- `POST /api/events/[id]/apply`
- `POST /api/events/[id]/accept`
- `POST /api/events/[id]/reject`
- `POST /api/events/[id]/reveal`
- `GET /api/messages`
- `POST /api/messages`
- `GET /api/notifications`
- `POST /api/reports`
- `GET /api/cron/reveal-addresses`

Les mutations protégées attendent un cookie de session Supabase (ou `Authorization: Bearer <supabase_access_token>`).

## Modèle de données

Tables Postgres (Supabase): `profiles`, `events`, `event_participants`, `applications`, `chats`, `chat_participants`, `messages`, `notifications`, `reports`, `support_tickets`.

L’adresse complète d’une soirée n’est jamais exposée publiquement. La colonne `events.address` est retirée de l’accès `anon`/`authenticated` au niveau RLS : elle n’est servie qu’au travers de l’API serveur (service role), après acceptation et révélation. Le cron GitHub Actions appelle `/api/cron/reveal-addresses` toutes les 15 minutes et révèle les adresses dont `reveal_at <= now`.

## PWA

La PWA expose `app/manifest.ts`, `public/sw.js`, des icônes maskable et l’enregistrement du service worker en production. Les notifications temps réel des messages s’appuient sur Supabase Realtime.

## Déploiement

Le site est déployé sur Vercel. Les tâches automatiques (révélation d'adresses) sont gérées par GitHub Actions.
