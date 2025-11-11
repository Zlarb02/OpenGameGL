# 📁 Components Architecture

## 🎮 Character System

### **CharacterController.tsx**
- Contrôleur principal avec physique Rapier
- Gère le mouvement, saut, détection au sol
- Switch entre `AnimatedModel` et `AnimatedModelRifle` selon `weaponEquipped`

### **AnimatedModel.tsx**
- Personnage de base **sans arme**
- Animations: `IDLE`, `RUN`, `WALK`, `FALLING_IDLE`, `LANDING`
- Loader automatique du modèle sélectionné (FBX/GLB)

### **AnimatedModelRifle.tsx**
- Personnage **avec rifle** et **8-way locomotion**
- Animations: 
  - Idle: `RIFLE_IDLE`, `RIFLE_IDLE_AIM`
  - Walk: 8 directions (forward, backward, left, right, + diagonales)
  - Run: 8 directions
  - Sprint: forward, backward
  - Action: `RIFLE_SHOOTING`
- **Contrôles**:
  - Clic droit: Viser (passe en mode WALK)
  - Clic gauche: Tirer
  - C: S'accroupir (toggle)

---

## 🎨 Environment

### **Ground.tsx** - Sol avec physique
### **Building.tsx** - Bâtiments
### **Bridge.tsx** - Pont avec contrôles GUI
### **Balls.tsx** - Balles physiques
### **Platforms.tsx** - Plateformes

---

## 🎥 Camera

### **FollowCamera.tsx**
- Caméra third-person avec:
  - Collision detection
  - Smoothing (spring physics)
  - Zoom
  - Rotation souris

---

## 🔫 Weapons

### **Rifle.tsx**
- Modèle de rifle qui s'attache au bone de la main
- Visible uniquement si `weaponEquipped = true`

---

## 📱 Mobile

### **MobileControls.tsx**
- Contrôles tactiles pour mobile
- Joystick virtuel + boutons
