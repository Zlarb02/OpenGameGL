# 📁 Hooks Architecture

## 🎮 Character

### **useCharacterControls.ts**
Paramètres physiques du personnage (vitesse, saut, damping, etc.)

### **useCharacterSelector.ts**
Sélection de modèle 3D + offset Y + scale (contrôles Leva)

---

## 🔫 Weapons

### **useWeaponState.ts**
État de l'arme:
- `weaponEquipped`: Checkbox Leva
- `isAiming`: Clic droit maintenu
- `isShooting`: Clic gauche (500ms)
- `isCrouching`: Toggle avec touche C

### **useRifleAnimations.ts**
Charge toutes les animations du Pro Rifle Pack (50+ animations):
- 8-way locomotion (walk/run/sprint)
- Crouch animations
- Idle, aiming, shooting

---

## 🎥 Camera

### **useCameraControls.ts**
Paramètres de caméra (distance, hauteur, sensibilité, smoothing, collision)

---

## 🌍 Environment

### **useLightingControls.ts**
Contrôles d'éclairage (directional, ambient, shadows)

### **useBridgeControls.ts**
Contrôles du pont (position, rotation, échelle)

### **usePostProcessingControls.ts**
Effets post-processing (bloom, vignette, etc.)
