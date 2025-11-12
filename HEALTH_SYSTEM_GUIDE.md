# Health & Hit Marker System Guide

## Vue d'ensemble

Un système modulaire de santé et de feedback visuel (hit markers) a été implémenté, permettant de gérer les dégâts et la mort de différents types d'entités.

## Architecture

### 1. Système de Santé (`src/core/health/`)

#### Composant `Health`
Composant React léger et modulaire qui peut être attaché à n'importe quelle entité :
- Ennemis
- Alliés
- Joueur
- Environnement destructible
- Objets ramassables

**Utilisation :**
```tsx
<Health
  ref={healthRef}
  maxHealth={30}
  targetType={HealthTargetType.DESTRUCTIBLE}
  destructible={true}
  onDeath={handleDeath}
  onDamage={handleDamage}
>
  <RigidBody userData={{ healthRef, targetType }}>
    {/* Votre mesh */}
  </RigidBody>
</Health>
```

#### Types d'entités
```typescript
enum HealthTargetType {
  ENEMY = 'enemy',           // Ennemis
  ALLY = 'ally',             // Alliés
  NEUTRAL = 'neutral',       // Neutres
  ENVIRONMENT = 'environment', // Environnement
  DESTRUCTIBLE = 'destructible', // Objets destructibles
  PICKUP = 'pickup'          // Objets ramassables
}
```

### 2. Système de Hit Markers (`src/ui/hud/hitmarker/`)

#### Design
- **Réticule** : Croix simple en + au centre de l'écran
- **Hit Markers** : X animé qui apparaît autour du réticule à chaque tir réussi

#### Couleurs par type de cible

| Type de cible | Couleur normale | Couleur mort/destruction |
|--------------|----------------|------------------------|
| Ennemi | Blanc (#FFFFFF) | Grisé (#888888) |
| Environnement/Destructible | Jaune (#FFFF00) | Marron (#8B4513) |
| Objet ramassable | Vert (#00FF00) | Bleu (#0000FF) |
| Allié/Neutre | Orange (#FFA500) | Rouge (#FF0000) |

#### Utilisation
```tsx
// Dans App.tsx
<HitMarkerProvider>
  <HitMarkerOverlay />
  <Crosshair />
  {/* ... */}
</HitMarkerProvider>

// Pour afficher un hit marker manuellement
const { showHitMarker } = useHitMarkerFeedback();
showHitMarker(hitResult);
```

### 3. Système de Tir

#### Intégration avec Health
Le hook `useShootingWithHealth` combine :
- Raycast de tir
- Application des dégâts via le système Health
- Affichage automatique des hit markers appropriés

**Configuration actuelle :**
- Dégâts du rifle : **10 points** par tir
- Vie des balles : **30 points** (3 tirs pour détruire)

#### Cooldown de tir
Un système de cooldown basé sur la durée de l'animation a été implémenté :
- Durée : **600ms** (durée de l'animation de tir)
- Empêche le spam de tirs
- S'assure que l'animation se termine avant le tir suivant

**Fichier** : `src/character/player/tps/weapons/useShootingCooldown.ts`

## Exemple d'utilisation : Balles destructibles

Les balles du jeu (300 entités) ont été mises à jour pour utiliser le système Health :

```tsx
// src/environment/components/Balls.tsx
function Ball({ position, scale, toonMaterial, bounciness, friction }) {
  const healthRef = useRef<HealthHandle>(null);

  return (
    <Health
      ref={healthRef}
      maxHealth={30}
      targetType={HealthTargetType.DESTRUCTIBLE}
      destructible={true}
      onDeath={handleDeath}
      onDamage={handleDamage}
    >
      <RigidBody userData={{ healthRef, targetType: HealthTargetType.DESTRUCTIBLE }}>
        <mesh>{/* ... */}</mesh>
      </RigidBody>
    </Health>
  );
}
```

## Scène de test

Une scène de test a été créée : `src/examples/HealthTestScene.tsx`

Elle contient des cibles de chaque type pour tester tous les hit markers :
- Ennemis (blanc → gris)
- Alliés (orange → rouge)
- Neutres (orange → rouge)
- Destructibles (jaune → marron)
- Objets ramassables (vert → bleu)
- Environnement (jaune → marron)

## Feedback visuel

### Sur les dégâts
- **Hit marker** animé avec la couleur appropriée
- **Scale pulse** de l'objet touché (effet de rebond)

### Sur la mort
- **Hit marker** avec couleur de mort/destruction
- Désactivation immédiate de la physique
- Suppression de l'objet du DOM après 500ms

## Animations de tir

L'animation de tir a été intégrée directement dans le `TPSLayer` :
- Détection automatique du début du tir (`isShooting` devient true)
- Lecture de l'animation `RIFLE_SHOOTING` pendant sa durée complète
- Retour automatique à l'animation de base après la fin
- Durée : 600ms (basée sur la durée réelle de l'animation)

**Implémentation :**
```typescript
// Dans TPSLayer.ts
if (context.isShooting && !this.wasShootingLastFrame) {
  this.isPlayingShootingAction = true;
  this.shootingStartTime = performance.now();
  return 'RIFLE_SHOOTING';
}
```

## Prochaines étapes

1. ✅ **Animations de tir** : Implémenté dans TPSLayer
2. ✅ **Suppression des objets détruits** : Implémenté avec gestion d'état
3. **Sons** : Ajouter des effets sonores différenciés par type de hit
3. **Particules** : Ajouter des effets de particules sur impact
4. **Santé du joueur** : Implémenter le système de santé pour le personnage joueur
5. **UI de santé** : Ajouter une barre de vie/bouclier
6. **Systèmes de dégâts** : Zones de dégâts, dégâts explosifs, etc.

## Fichiers principaux

```
src/
├── core/
│   └── health/
│       ├── Health.tsx              # Composant Health
│       ├── HealthTypes.ts          # Types et enums
│       └── index.ts
├── ui/
│   └── hud/
│       ├── crosshair/
│       │   ├── Crosshair.tsx       # Réticule en +
│       │   ├── Crosshair.css
│       │   └── index.ts
│       └── hitmarker/
│           ├── HitMarker.tsx        # Composant hit marker
│           ├── HitMarker.css        # Animations
│           ├── HitMarkerContext.tsx # State management
│           ├── HitMarkerOverlay.tsx # Container
│           ├── HitMarkerTypes.ts    # Couleurs et config
│           ├── useHitMarkerFeedback.ts
│           └── index.ts
├── character/
│   ├── animation/
│   │   └── layers/
│   │       └── ActionLayer.ts       # Layer pour animations d'action
│   └── player/
│       └── tps/
│           ├── shooting/
│           │   ├── useShootingWithHealth.ts  # Intégration tir + santé
│           │   └── useShootingRaycast.ts
│           └── weapons/
│               └── useShootingCooldown.ts    # Gestion cooldown
└── examples/
    ├── HealthTestScene.tsx          # Scène de test
    └── TargetBall.tsx               # Cible de test
```
