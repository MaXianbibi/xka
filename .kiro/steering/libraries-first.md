# Libraries First Approach

## Principe fondamental

**Toujours privilégier l'utilisation de librairies éprouvées plutôt que de réinventer la roue.**

## Librairies recommandées

### 📅 **Gestion des dates**
- **date-fns** : Manipulation et formatage des dates
- Éviter les calculs manuels de dates
- Utiliser `formatDistanceToNow`, `parseISO`, etc.

### 🎨 **Gestion des classes CSS**
- **clsx** : Composition conditionnelle de classes CSS
- Remplace les concaténations manuelles de strings
- Meilleure lisibilité et maintenabilité

### 🔧 **Utilitaires généraux**
- **lodash** : Fonctions utilitaires (si nécessaire)
- **zod** : Validation de schémas
- **react-hook-form** : Gestion des formulaires

### 🎯 **Règles d'implémentation**

1. **Rechercher d'abord** : Avant d'écrire du code custom, vérifier s'il existe une lib
2. **Évaluer la popularité** : Privilégier les libs avec une large adoption
3. **Vérifier la maintenance** : S'assurer que la lib est activement maintenue
4. **Optimiser le bundle** : Utiliser le tree-shaking quand possible

### ✅ **Exemples de bonnes pratiques**

```typescript
// ❌ Éviter
const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  // ... calculs manuels complexes
}

// ✅ Préférer
import { formatDistanceToNow, parseISO } from 'date-fns'
const formatDate = (date: string) => formatDistanceToNow(parseISO(date), { addSuffix: true })
```

```typescript
// ❌ Éviter
const className = `px-2 py-1 ${isActive ? 'bg-green-500' : 'bg-gray-500'} ${isLarge ? 'text-lg' : 'text-sm'}`

// ✅ Préférer
import { clsx } from 'clsx'
const className = clsx('px-2 py-1', {
  'bg-green-500': isActive,
  'bg-gray-500': !isActive,
  'text-lg': isLarge,
  'text-sm': !isLarge
})
```

### 🚀 **Avantages**

- **Performance** : Librairies optimisées
- **Fiabilité** : Code testé par la communauté
- **Maintenabilité** : Moins de code custom à maintenir
- **Productivité** : Développement plus rapide
- **Standards** : Respect des bonnes pratiques

### 📦 **Installation**

Toujours utiliser `pnpm` pour l'installation :
```bash
pnpm add date-fns clsx
```

Cette approche garantit un code plus robuste, maintenable et performant.