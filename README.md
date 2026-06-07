# GetVib

GetVib est une plateforme de rencontres IRL basée sur des soirées privées chez des particuliers. La V1 cible Lille et vise les 10 premiers utilisateurs réels.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui style components
- Lucide Icons
- Firebase Auth, Firestore, Realtime Database, Storage, Cloud Messaging
- Route Handlers API et services serveur
- PWA installable iPhone, Android et desktop
- Vercel + cron de révélation d’adresse

## Arborescence

```txt
app/                      Pages, API routes, manifest PWA
components/               UI, layout, cartes événement
features/                 Auth, events, messages, notifications, reports
hooks/                    Hooks client
lib/                      Types, Firebase, validation, helpers
public/                   Service worker et icônes PWA
firestore.rules           Règles Firestore
storage.rules             Règles Storage
database.rules.json       Règles Realtime Database
vercel.json               Cron révélation adresses
```

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Renseigner les variables Firebase client et Admin dans `.env.local`.

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

Les mutations protégées attendent `Authorization: Bearer <firebase_id_token>`.

## Modèle de données

Collections Firestore: `users`, `events`, `applications`, `chats`, `messages`, `notifications`, `reports`.

L’adresse complète d’une soirée n’est jamais exposée publiquement. Avant validation, seule la zone est affichée. Après acceptation, l’utilisateur voit le statut de révélation. Le cron Vercel appelle `/api/cron/reveal-addresses` toutes les 15 minutes et révèle les adresses dont `revealAt <= now`.

## PWA

La PWA expose `app/manifest.ts`, `public/sw.js`, des icônes maskable et l’enregistrement du service worker en production. FCM est initialisé via `useFcm` lorsque `NEXT_PUBLIC_FIREBASE_VAPID_KEY` est disponible.

## Déploiement

Le site est déployé sur Vercel. Les tâches automatiques (révélation d'adresses) sont gérées par GitHub Actions.
