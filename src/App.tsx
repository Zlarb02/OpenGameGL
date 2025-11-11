import React from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Bolt } from 'lucide-react';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  SMAA,
  BrightnessContrast,
  HueSaturation,
  DepthOfField
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { CharacterController } from './character/components/CharacterController';
import { Ground } from './environment/components/Ground';
import { Balls } from './environment/components/Balls';
import { FollowCamera } from './core/camera/FollowCamera';
import { useCharacterControls } from './character/hooks/useCharacterControls';
import { useCameraControls } from './core/camera/useCameraControls';
import { useLightingControls } from './rendering/lighting/useLightingControls';
import { usePostProcessingControls } from './rendering/postprocessing/usePostProcessingControls';
import { useWeaponState } from './character/player/tps/weapons/useWeaponState';
import { useCharacterSelector } from './character/hooks/useCharacterSelector';
import { useAimDebug } from './character/player/tps/shooting/useAimDebug';
import { useRifleDebug } from './character/player/tps/weapons/useRifleDebug';
import { useInputControls } from './ui/leva/useInputControls';
import { useInputRebind } from './ui/leva/useInputRebind';
import { useLevaConfigManager } from './ui/leva/useLevaConfigManager';
import { Leva } from 'leva';
import { MobileControlsProvider } from './ui/mobile/MobileControlsContext';
import { MobileControls } from './ui/mobile/MobileControls';
import { HitDetectionProvider } from './character/player/tps/combat/HitDetectionContext';
import { HitDetectionManager } from './character/player/tps/combat/HitDetectionManager';
import { Crosshair } from './ui/hud/Crosshair';
import { HitMarkers } from './ui/hud/HitMarkers';
import { InputProvider } from './core/input';
import { RiflePickup } from './character/player/tps/weapons/RiflePickup';
import { InteractIcon3D } from './character/player/interactions/InteractIcon3D';
import { useObjectSelection } from './character/player/tps/combat/useObjectSelection';
import { InventoryProvider, useInventory } from './character/player/inventory/InventoryContext';
import { Inventory } from './ui/inventory/Inventory';
import { useInventoryControls } from './character/player/inventory/useInventoryControls';

const characterRef = { current: null };

function DynamicDepthOfField({ enabled, target, focalLength, bokehScale }) {
  const { camera } = useThree();
  const [focusDistance, setFocusDistance] = React.useState(0);
  
  useFrame(() => {
    if (!enabled || !target.current) return;
    // Calculate distance from camera to character
    const distance = camera.position.distanceTo(target.current.position.clone());
    // Convert world distance to normalized focus distance (0-1 range)
    setFocusDistance(Math.min(distance / 20, 1));
  });

  return enabled ? (
    <DepthOfField
      focusDistance={focusDistance}
      focalLength={focalLength}
      bokehScale={bokehScale}
      height={1080}
    />
  ) : null;
}

// Composant pour gérer la sélection d'objets
function ObjectSelectionManager({ characterRef }: { characterRef: React.MutableRefObject<any> }) {
  useObjectSelection(characterRef);
  return null;
}

// Composant interne qui utilise les hooks Leva
function AppContent() {
  // État pour les rifles ramassés
  const [pickedUpRifles, setPickedUpRifles] = React.useState<Set<number>>(new Set());

  // L'ordre d'appel détermine l'ordre dans Leva
  // ─── 🎮 Contrôles ───
  useInputControls(); // Options d'input en premier
  useInputRebind(); // Système de rebind complet
  useInventoryControls(); // Gestion de l'inventaire avec la touche I

  // ─── 🔧 Debug ───
  useAimDebug(); // Debug (utilisé dans AnimatedModelRifle)
  useRifleDebug(); // Debug position/rotation du rifle

  // ─── 🎯 Character & Gameplay ───
  const weaponState = useWeaponState();
  const characterSelector = useCharacterSelector();
  const characterControls = useCharacterControls();

  // ─── 📷 Camera ───
  const cameraControls = useCameraControls();

  // ─── 🎨 Visual & Effects ───
  const lighting = useLightingControls();
  const postProcessing = usePostProcessingControls();

  // ─── 💾 Config Manager ───
  useLevaConfigManager(); // Système de sauvegarde/chargement

  // ─── 🎒 Inventaire ───
  const { addItem } = useInventory();

  const handleRiflePickup = (index: number) => {
    return () => {
      setPickedUpRifles(prev => new Set([...prev, index]));
      // Ajouter le rifle à l'inventaire
      addItem('rifle', 'Fusil d\'assaut', 1);
      // Équiper automatiquement le rifle
      weaponState.equipWeapon(true);
      console.log(`Rifle ${index} ramassé et ajouté à l'inventaire !`);
    };
  };

  // Positions des rifles (disposition en grille)
  const riflePositions: [number, number, number][] = [
    [5, 1, 0],
    [5, 1, 5],
    [5, 1, -5],
    [-5, 1, 0],
    [-5, 1, 5],
    [-5, 1, -5],
    [0, 1, 8],
    [0, 1, -8],
    [8, 1, 0],
    [-8, 1, 0],
  ];

  return (
    <>
      <Crosshair />
      <HitMarkers />
      <Inventory />
      <Bolt className="fixed top-4 right-4 w-6 h-6 text-white opacity-50" />
      <Leva collapsed />
      <MobileControlsProvider>
        <MobileControls />
        <Canvas shadows>
          <Environment
            preset="sunset"
            intensity={1}
            background
            blur={0.8}
            resolution={256}
          />
          <ambientLight intensity={lighting.ambientIntensity} />
          <directionalLight
            castShadow
            position={[lighting.directionalDistance, lighting.directionalHeight, lighting.directionalDistance / 2]}
            intensity={lighting.directionalIntensity}
            shadow-mapSize={[4096, 4096]}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-camera-far={50}
            shadow-bias={-0.0001}
            shadow-normalBias={0.02}
          />
          <Physics
            interpolate={false}
            positionIterations={5}
            velocityIterations={4}
          >
            <CharacterController ref={characterRef} />
            <Ground />
            <Balls />

            {/* Spawner 10 rifles */}
            {riflePositions.map((position, index) => (
              !pickedUpRifles.has(index) && (
                <RiflePickup
                  key={index}
                  position={position}
                  onPickup={handleRiflePickup(index)}
                />
              )
            ))}
          </Physics>
          <FollowCamera target={characterRef} />
          <HitDetectionManager />
          <ObjectSelectionManager characterRef={characterRef} />
          <InteractIcon3D />
          <EffectComposer>
            <DynamicDepthOfField
              enabled={postProcessing.depthOfFieldEnabled}
              target={characterRef}
              focalLength={postProcessing.focalLength}
              bokehScale={postProcessing.bokehScale}
            />
            {postProcessing.bloomEnabled && (
              <Bloom 
                intensity={postProcessing.bloomIntensity}
              />
            )}
            {postProcessing.chromaticAberrationEnabled && (
              <ChromaticAberration
                offset={[postProcessing.chromaticAberrationOffset, postProcessing.chromaticAberrationOffset]}
                blendFunction={BlendFunction.NORMAL}
              />
            )}
            {postProcessing.vignetteEnabled && (
              <Vignette
                darkness={postProcessing.vignetteDarkness}
                offset={postProcessing.vignetteOffset}
                blendFunction={BlendFunction.NORMAL}
              />
            )}
            {postProcessing.brightnessContrastEnabled && (
              <BrightnessContrast
                brightness={postProcessing.brightness}
                contrast={postProcessing.contrast}
                blendFunction={BlendFunction.NORMAL}
              />
            )}
            {postProcessing.hueSaturationEnabled && (
              <HueSaturation
                hue={postProcessing.hue}
                saturation={postProcessing.saturation}
                blendFunction={BlendFunction.NORMAL}
              />
            )}
            <SMAA />
          </EffectComposer>
        </Canvas>
      </MobileControlsProvider>
    </>
  );
}

function App() {
  return (
    <InputProvider>
      <HitDetectionProvider>
        <InventoryProvider>
          <div className="w-full h-screen">
            <AppContent />
          </div>
        </InventoryProvider>
      </HitDetectionProvider>
    </InputProvider>
  );
}

export default App;
