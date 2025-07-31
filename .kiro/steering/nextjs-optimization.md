# Next.js Optimization Guidelines

## Principe fondamental

**Toujours privilégier les optimisations natives de Next.js pour des performances maximales.**

## Optimisations obligatoires

### 🚀 **Server-Side Rendering (SSR) par défaut**
- **Toujours utiliser SSR** sauf cas exceptionnels
- Les composants sont Server Components par défaut
- Meilleure performance et SEO
- Hydratation optimisée côté client

### ⚡ **Utilisation minimale de 'use client'**
- **Éviter 'use client'** autant que possible
- Réserver uniquement pour :
  - Interactions utilisateur (onClick, onChange)
  - Hooks React (useState, useEffect)
  - APIs du navigateur (localStorage, window)
- Isoler les parties interactives dans des composants dédiés

### 💾 **Cache agressif**
- **Utiliser le cache Next.js** pour toutes les données
- `fetch()` avec cache par défaut
- `unstable_cache` pour les fonctions
- `revalidateTag` et `revalidatePath` pour l'invalidation
- Cache statique pour les données peu changeantes

### ⏳ **Suspense et Loading States**
- **Toujours utiliser Suspense** pour les composants asynchrones
- **Créer des skeletons** pour améliorer l'UX pendant le chargement
- Utiliser `loading.tsx` pour les pages
- Suspense boundaries pour isoler les erreurs de chargement

## Patterns recommandés

### ✅ **Structure optimale**

```typescript
// ❌ Éviter - Tout en client
'use client'
export default function Dashboard() {
  const [data, setData] = useState(null)
  // ... logique complexe côté client
}

// ✅ Préférer - Server Component avec Client isolé
export default async function Dashboard() {
  const data = await fetchData() // SSR + cache
  return (
    <div>
      <StaticContent data={data} />
      <Suspense fallback={<DashboardSkeleton />}>
        <AsyncDataComponent />
      </Suspense>
      <InteractiveButton /> {/* Seul ce composant est 'use client' */}
    </div>
  )
}
```

### 🔄 **Cache patterns**

```typescript
// ✅ Cache avec revalidation
export async function getWorkflows() {
  return await fetch('/api/workflows', {
    next: { 
      revalidate: 60, // Cache 60 secondes
      tags: ['workflows'] 
    }
  })
}

// ✅ Cache fonction avec unstable_cache
import { unstable_cache } from 'next/cache'

export const getCachedStats = unstable_cache(
  async () => {
    return await calculateStats()
  },
  ['stats'],
  { revalidate: 300 } // 5 minutes
)
```

### 🎯 **Invalidation du cache**

```typescript
// ✅ Invalidation ciblée
import { revalidateTag } from 'next/cache'

export async function createWorkflow(data: WorkflowData) {
  const result = await saveWorkflow(data)
  revalidateTag('workflows') // Invalide seulement les workflows
  return result
}
```

### ⏳ **Suspense et Skeletons**

```typescript
// ✅ Page avec loading.tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// ✅ Suspense pour composants async
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<WorkflowsSkeleton />}>
        <WorkflowsList />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsOverview />
      </Suspense>
    </div>
  )
}

// ✅ Skeleton component
export function WorkflowsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
```

## Architecture recommandée

### 📁 **Séparation des responsabilités**

```
app/
├── page.tsx                 # Server Component (SSR)
├── loading.tsx              # Loading UI pour la page
├── components/
│   ├── server/             # Server Components uniquement
│   │   ├── DataDisplay.tsx
│   │   └── StaticContent.tsx
│   ├── client/             # Client Components ('use client')
│   │   ├── InteractiveForm.tsx
│   │   └── RealTimeUpdates.tsx
│   └── skeletons/          # Composants skeleton
│       ├── DashboardSkeleton.tsx
│       └── WorkflowsSkeleton.tsx
└── lib/
    ├── cache/              # Fonctions de cache
    └── server-actions/     # Server Actions
```

### 🔧 **Server Actions**

```typescript
// ✅ Server Actions pour les mutations
'use server'

export async function updateWorkflow(id: string, data: WorkflowData) {
  const result = await db.workflow.update({ where: { id }, data })
  revalidatePath('/dashboard')
  return result
}
```

## Règles d'implémentation

1. **SSR First** : Commencer par un Server Component
2. **Client Minimal** : Ajouter 'use client' seulement si nécessaire
3. **Cache Everything** : Mettre en cache toutes les données possibles
4. **Invalidation Précise** : Utiliser des tags spécifiques pour l'invalidation
5. **Server Actions** : Privilégier pour les mutations de données
6. **Suspense Obligatoire** : Toujours wrapper les composants async avec Suspense
7. **Skeletons Partout** : Créer des skeletons pour tous les états de chargement

## Avantages

- **Performance** : Rendu côté serveur ultra-rapide
- **SEO** : Contenu indexable immédiatement
- **UX** : Chargement initial plus rapide
- **Scalabilité** : Moins de charge côté client
- **Cache** : Réduction drastique des appels API

## Outils de monitoring

- Next.js Bundle Analyzer
- Lighthouse pour les Core Web Vitals
- Next.js Speed Insights

Cette approche garantit des performances optimales et une expérience utilisateur exceptionnelle.