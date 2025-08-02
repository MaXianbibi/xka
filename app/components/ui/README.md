# Système UI Optimisé

## Vue d'ensemble

Le système UI a été simplifié et optimisé pour utiliser les meilleures pratiques avec des librairies éprouvées :

- **clsx** pour la gestion des classes CSS conditionnelles
- **react-hot-toast** pour les notifications
- **date-fns** pour la gestion des dates (déjà installé)

## Structure

```
app/components/ui/
├── index.tsx           # Composants UI consolidés
├── DatabaseAlert.tsx   # Alerte spécifique à la DB
├── RefreshButton.tsx   # Bouton de rafraîchissement
└── README.md          # Cette documentation
```

## Composants disponibles

### Button
```tsx
import { Button } from '@/app/components/ui'

<Button variant="primary" size="md" isLoading={loading}>
  Cliquer ici
</Button>
```

**Variants :** `primary`, `secondary`, `danger`, `ghost`
**Sizes :** `sm`, `md`, `lg`

### Switch
```tsx
import { Switch } from '@/app/components/ui'

<Switch checked={isEnabled} onChange={setIsEnabled} size="md" />
```

### Alert
```tsx
import { Alert } from '@/app/components/ui'

<Alert
  isVisible={showAlert}
  variant="warning"
  title="Attention"
  description="Message d'alerte"
  onRetry={handleRetry}
/>
```

**Variants :** `warning`, `error`, `success`

### Skeleton
```tsx
import { Skeleton, StatsSkeleton, WorkflowsSkeleton } from '@/app/components/ui'

<Skeleton className="h-4 w-32" />
<StatsSkeleton />
<WorkflowsSkeleton />
```

### ScrollArea
```tsx
import { ScrollArea } from '@/app/components/ui'

<ScrollArea variant="thin" maxHeight="400px">
  {content}
</ScrollArea>
```

### ErrorBoundary
```tsx
import { ErrorBoundary } from '@/app/components/ui'

<ErrorBoundary>
  <ComponentQuiPeutPlanter />
</ErrorBoundary>
```

## Notifications (Toast)

Utiliser le helper toast optimisé :

```tsx
import { showToast } from '@/app/lib/utils/toast'

// Notifications simples
showToast.success('Opération réussie !')
showToast.error('Erreur survenue')
showToast.loading('Chargement...')

// Notification avec promesse
showToast.promise(
  apiCall(),
  {
    loading: 'Sauvegarde...',
    success: 'Sauvegardé !',
    error: 'Erreur de sauvegarde'
  }
)
```

## Avantages de cette approche

1. **Moins de fichiers** : Un seul fichier principal au lieu de 8+
2. **Meilleure performance** : Utilisation optimale de clsx et react-hot-toast
3. **Maintenance simplifiée** : Code consolidé et cohérent
4. **Bundle plus petit** : Suppression du code custom redondant
5. **Standards de l'industrie** : Utilisation de librairies éprouvées

## Migration

Les anciens imports sont automatiquement mis à jour :

```tsx
// Avant
import { Button } from '@/app/components/ui/Button'
import { Switch } from '@/app/components/ui/Switch'

// Après
import { Button, Switch } from '@/app/components/ui'
```