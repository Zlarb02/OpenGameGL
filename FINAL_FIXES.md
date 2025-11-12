# Correctifs finaux - Animation de tir et touche R

## ✅ Problèmes résolus

### 1. Animation de tir manquante

**Problème :** Pas d'animation visuelle lors du tir

**Solution implémentée :**
Hook `useShootingAnimation` qui joue l'animation uniquement sur le haut du corps (upper body)

#### Fonctionnement
```typescript
// src/character/animation/useShootingAnimation.ts
- Charge l'animation RIFLE_SHOOTING une seule fois
- Filtre les tracks pour ne garder que les bones du haut du corps
- Joue l'animation en overlay quand isShooting devient true
- Évite les conflits avec les animations de locomotion
```

#### Bones filtrés (upper body only)
- **Colonne vertébrale** : spine, spine1, spine2
- **Cou et tête** : neck, head
- **Épaules** : leftshoulder, rightshoulder
- **Bras** : leftarm, rightarm, leftforearm, rightforearm
- **Mains** : lefthand, righthand

#### Intégration
```typescript
// Dans Character.tsx
useShootingAnimation(model, mixerRef.current, isShooting);
```

**Résultat :**
- ✅ Animation de tir visible
- ✅ Pas de T-pose
- ✅ Continue les animations de locomotion en même temps
- ✅ Animation jouée une seule fois par tir

### 2. Touche R maintenue - Sortir/Ranger l'arme

**Problème :** L'action se répétait en boucle quand on maintenait R appuyé

**Cause :** L'intervalle continuait de tourner même après avoir exécuté l'action

**Solution :**
```typescript
// Dans useWeaponState.ts - handleStowPress
if (Date.now() - stowPressTime.current > 300) {
  // Clear interval FIRST to prevent multiple executions
  if (stowCheckInterval.current) {
    clearInterval(stowCheckInterval.current);
    stowCheckInterval.current = null;
  }

  // Then execute the action...
}
```

**Améliorations :**
1. **Arrêt immédiat de l'intervalle** après 300ms d'appui
2. **Détection du relâchement** pendant la vérification
3. **Cleanup propre** dans tous les cas

**Résultat :**
- ✅ Une seule exécution par appui maintenu
- ✅ Fonctionne pour sortir ET ranger
- ✅ Pas de répétition en boucle

## État du système

### ✅ Fonctionnel et testé
1. **Animation de tir**
   - Overlay haut du corps uniquement
   - Pas d'interférence avec la locomotion
   - Durée ~600ms

2. **Système de santé**
   - 10 dégâts par tir
   - 30 PV sur les balles
   - 3 tirs pour détruire

3. **Hit markers**
   - Couleurs différenciées par type
   - Animation en X autour du réticule
   - Feedback instantané

4. **Contrôles d'arme**
   - **Touche 1** : Quick slot (équiper/déséquiper instantané)
   - **Touche R maintenue** : Sortir/Ranger (300ms delay)
   - Transitions fluides

5. **Cooldown de tir**
   - 600ms entre chaque tir
   - Synchronisé avec l'animation

6. **Suppression des objets détruits**
   - Retrait du DOM après 500ms
   - Physique désactivée immédiatement

## Architecture technique

### Nouveaux fichiers créés
```
src/
├── character/
│   └── animation/
│       └── useShootingAnimation.ts    # Hook d'animation de tir
├── core/
│   └── health/                        # Système de santé
│       ├── Health.tsx
│       ├── HealthTypes.ts
│       └── index.ts
├── ui/
│   └── hud/
│       ├── crosshair/                 # Nouveau réticule +
│       │   ├── Crosshair.tsx
│       │   └── Crosshair.css
│       └── hitmarker/                 # Nouveaux hit markers
│           ├── HitMarker.tsx
│           ├── HitMarker.css
│           ├── HitMarkerContext.tsx
│           ├── HitMarkerOverlay.tsx
│           ├── HitMarkerTypes.ts
│           └── useHitMarkerFeedback.ts
└── examples/
    ├── HealthTestScene.tsx            # Scène de test
    └── TargetBall.tsx                 # Cibles de test
```

### Fichiers modifiés
```
src/
├── App.tsx                            # Intégration providers + HUD
├── character/
│   ├── components/
│   │   └── Character.tsx              # + useShootingAnimation
│   ├── animation/
│   │   └── layers/
│   │       └── TPSLayer.ts            # Retrait du shooting
│   └── player/
│       └── tps/
│           ├── combat/
│           │   └── HitDetectionManager.tsx  # + useShootingWithHealth
│           ├── shooting/
│           │   ├── useShootingWithHealth.ts # Nouveau
│           │   └── useShootingRaycast.ts
│           └── weapons/
│               ├── useWeaponState.ts        # Fix touche R
│               └── useShootingCooldown.ts   # Nouveau
└── environment/
    └── components/
        └── Balls.tsx                  # + Health component
```

## Tests recommandés

### Animation de tir
1. Équiper une arme (touche 1 ou R maintenue)
2. Tirer (clic gauche)
3. Vérifier que le personnage joue l'animation du haut du corps
4. Vérifier que les jambes continuent l'animation de mouvement

### Touche R maintenue
1. Arme rangée → Maintenir R (>300ms) → Arme sort
2. Relâcher R
3. Maintenir R à nouveau (>300ms) → Arme se range
4. Vérifier qu'il n'y a pas de répétition

### Système de santé
1. Tirer 3 fois sur une balle bleue
2. Vérifier les hit markers jaunes
3. Au 3e tir : hit marker marron
4. La balle disparaît après 500ms

## Prochaines étapes possibles

1. **Sons**
   - Ajouter son de tir
   - Sons d'impact différenciés

2. **Effets visuels**
   - Muzzle flash sur l'arme
   - Douilles éjectées
   - Particules d'impact

3. **Animation de rechargement**
   - Même système que le tir
   - Overlay haut du corps
   - Avec cooldown

4. **UI de santé du joueur**
   - Barre de vie
   - Bouclier
   - Feedback sur les dégâts reçus

## Notes importantes

### Pourquoi un hook séparé pour le shooting ?
- Le TPSLayer gère la **locomotion** (idle, walk, run, crouch)
- Le shooting est une **action ponctuelle** qui doit se jouer en overlay
- Séparer permet d'éviter les conflits d'animation

### Pourquoi filtrer les bones ?
- L'animation RIFLE_SHOOTING anime **tout le corps**
- Si on la joue telle quelle, elle écrase l'animation de locomotion
- En ne gardant que le haut du corps :
  - Les jambes continuent l'animation de marche/course
  - Le haut du corps joue le tir
  - Résultat naturel et fluide

### Cooldown vs Animation
- **Cooldown** : Empêche de tirer trop vite (gameplay)
- **Animation** : Feedback visuel (cosmétique)
- Les deux sont synchronisés à 600ms mais indépendants
