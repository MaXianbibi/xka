# Résumé du Projet XKA

## 1. Vue d'ensemble du produit

- **Nom :** XKA (Xecution Kit for Application flow)
- **Objectif :** Moteur d'exécution distribué et modulaire pour créer des applications logiques et des workflows d'automatisation.
- **Caractéristiques principales :**
    - Constructeur de workflow visuel en glisser-déposer.
    - Système de workers distribués pour une exécution scalable.
    - Alternative performante à des outils comme n8n ou Make.

## 2. Architecture et Stack Technologique

### Frontend
- **Framework :** Next.js avec React.
- **Style :** Tailwind CSS.
- **Construction de workflow :** React Flow.
- **Gestionnaire de paquets :** pnpm.

### Backend
- **Langage :** Go.
- **File d'attente (Queue) :** Redis.
- **Base de données :** PostgreSQL.
- **Routage HTTP :** Chi.

### Infrastructure
- **Conteneurisation :** Docker (via `docker-compose.yml`).

## 3. Structure du Projet

- **`app/` :** Application frontend Next.js (App Router).
    - `components/` : Composants React, organisés par fonctionnalité (flow, MainView, ui, workflow).
    - `lib/` : Logique partagée (actions, hooks, utils, types).
- **`Go/` :** Services backend en Go.
    - `cmd/` : Points d'entrée des applications (WorkerManager, worker).
    - `internal/` : Code privé de l'application.
    - `pkg/` : Bibliothèques publiques.
- **`.kiro/` :** Configuration et documentation pour l'assistant IA.
- **Fichiers de configuration :** `next.config.ts`, `tsconfig.json`, `docker-compose.yml`, `pnpm-workspace.yaml`.

## 4. Principes de Développement Clés

### Optimisations Next.js
- **SSR par défaut :** Utiliser les Server Components au maximum pour la performance et le SEO.
- **`'use client'` minimal :** Isoler les composants interactifs et éviter le rendu côté client pour la logique principale.
- **Cache agressif :** Utiliser `fetch` avec cache, `unstable_cache` et l'invalidation par tags (`revalidateTag`).
- **Suspense & Skeletons :** Utiliser `<Suspense>` avec des composants "skeletons" pour améliorer l'expérience de chargement.
- **Server Actions :** Privilégier les Server Actions pour les mutations de données.

### Approche "Libraries First"
- **Privilégier les librairies éprouvées** plutôt que de réinventer la roue.
- **Exemples :**
    - `date-fns` pour la manipulation des dates.
    - `clsx` pour la composition conditionnelle des classes CSS.
    - `zod` pour la validation de schémas.

## 5. Commandes Courantes

- **Démarrer l'environnement de développement complet :**
  ```bash
  docker-compose up
  ```
- **Démarrer le frontend en mode développement :**
  ```bash
  pnpm dev
  ```
- **Lancer les services Go :**
  ```bash
  cd Go
  go run ./cmd/WorkerManager
  go run ./cmd/worker
  ```
