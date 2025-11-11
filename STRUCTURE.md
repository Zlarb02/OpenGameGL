# 📂 Project Structure - Character Controller

## ✅ **ACTIVE FILES** (à utiliser)

### 📁 **src/components/**
```
CharacterController.tsx    → Contrôleur principal avec physique
AnimatedModel.tsx          → Personnage de base (sans arme)
AnimatedModelRifle.tsx     → Personnage avec rifle + 8-way locomotion
Rifle.tsx                  → Modèle de rifle
FollowCamera.tsx           → Caméra third-person
Ground.tsx                 → Sol
Building.tsx               → Bâtiments
Bridge.tsx                 → Pont
Balls.tsx                  → Balles physiques
Platforms.tsx              → Plateformes
MobileControls.tsx         → Contrôles mobile
```

### 📁 **src/hooks/**
```
useCharacterControls.ts    → Paramètres physiques
useCharacterSelector.ts    → Sélection modèle + offsets
useWeaponState.ts          → État arme (equipped, aiming, shooting, crouching)
useRifleAnimations.ts      → Loader 50+ animations rifle (Pro Rifle Pack)
useCameraControls.ts       → Paramètres caméra
useLightingControls.ts     → Contrôles éclairage
useBridgeControls.ts       → Contrôles pont
usePostProcessingControls.ts → Post-processing
```

### 📁 **src/contexts/**
```
MobileControlsContext.tsx  → Context pour contrôles mobile
```

### 📁 **src/utils/**
```
physics.ts                 → Helpers physique (mouvement, saut, etc.)
```

### 📁 **src/schemas/**
```
character.ts               → Types/schemas personnage
```

---

## 🗑️ **TRASH** (anciens fichiers obsolètes)

### trash/components/
- CharacterModel.tsx (ancien, remplacé par AnimatedModel)
- CharacterModelFBX.tsx (ancien)
- XBotModel8Way.tsx (ancien)

### trash/hooks/
- useRifleAnimations.ts (ancienne version)
- useRifleAnimations8Way.ts (ancien)

---

## 📦 **ASSETS**

### public/models/
```
character.glb              → Modèle par défaut
swat-rifle.fbx            → Modèle SWAT
vanguard.fbx, boss.fbx...  → Autres modèles

📁 xbot/                   → Animations de base
  - X Bot.fbx
  - idle-new.fbx
  - walking.fbx
  - standard run.fbx
  - falling-idle.fbx
  - falling-to-landing.fbx

📁 rifle-pack/             → Pro Rifle Pack (50+ animations)
  - idle.fbx, idle aiming.fbx
  - walk/run/sprint (8 directions chacun)
  - crouch animations
  - shooting, death, etc.
```

---

## 🎮 **CONTRÔLES**

### Clavier
- **ZQSD / WASD** : Mouvement
- **Espace** : Saut
- **Shift** : Sprint (désactivé si aiming)
- **C** : S'accroupir (toggle, rifle uniquement)

### Souris
- **Clic droit** : Viser (passe en mode walk)
- **Clic gauche** : Tirer
- **Molette** : Zoom caméra
- **Mouvement** : Rotation caméra

### Mobile
- Joystick virtuel
- Boutons tactiles

---

## 🏗️ **ARCHITECTURE**

**Sans arme** : CharacterController → AnimatedModel → animations xbot/

**Avec rifle** : CharacterController → AnimatedModelRifle → animations rifle-pack/

**Switch** : Basé sur `weaponEquipped` (checkbox Leva)
