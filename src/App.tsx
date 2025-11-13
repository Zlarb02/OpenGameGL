import React, { useState, useEffect } from 'react';
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
import { useSwordTransformDebug } from './character/player/equipment/debug/useSwordTransformDebug';
import { useShieldTransformDebug } from './character/player/equipment/debug/useShieldTransformDebug';
import { useInputControls } from './ui/leva/useInputControls';
import { useInputRebind } from './ui/leva/useInputRebind';
import { useLevaConfigManager } from './ui/leva/useLevaConfigManager';
import { Leva } from 'leva';
import { MobileControlsProvider } from './ui/mobile/MobileControlsContext';
import { MobileControls } from './ui/mobile/MobileControls';
import { HitDetectionProvider } from './character/player/tps/combat/HitDetectionContext';
import { HitDetectionManager } from './character/player/tps/combat/HitDetectionManager';
import { Crosshair as OldCrosshair } from './ui/hud/Crosshair';
import { HitMarkers as OldHitMarkers } from './ui/hud/HitMarkers';
import { Crosshair } from './ui/hud/crosshair';
import { HitMarkerProvider, HitMarkerOverlay } from './ui/hud/hitmarker';
import { InputProvider } from './core/input';
import { RiflePickup } from './character/player/tps/weapons/RiflePickup';
import { SwordPickup } from './character/player/tps/weapons/SwordPickup';
import { ShieldPickup } from './character/player/tps/weapons/ShieldPickup';
import { InteractIcon3D } from './character/player/interactions/InteractIcon3D';
import { useObjectSelection } from './character/player/tps/combat/useObjectSelection';
import { InventoryProvider, useInventory } from './character/player/inventory/InventoryContext';
import { Inventory } from './ui/inventory/Inventory';
import { useInventoryControls } from './character/player/inventory/useInventoryControls';
import { EquipmentProvider } from './character/player/equipment/EquipmentContext';
import { useQuickSlotControls } from './character/player/equipment/useQuickSlotControls';
import { useReloadStowControls } from './character/player/equipment/useReloadStowControls';
import { Quickbar } from './ui/quickbar/Quickbar';
import './character/player/equipment/config/items/weapons'; // Auto-register weapons
import { LoadingScreen } from './ui/loading/LoadingScreen';
import { DragDropProvider } from './ui/shared/DragDropContext';
import { QuickbarProvider } from './ui/quickbar/QuickbarContext';
import { WorldItemManagerProvider } from './character/player/inventory/WorldItemManager';
import { WorldItems } from './character/player/inventory/WorldItems';
import { DropZone } from './ui/shared/DropZone';
import { DragDropManager } from './ui/shared/DragDropManager';
import { useAssetPreloader } from './core/loading/useAssetPreloader';
import { CharacterReadyProvider, useCharacterReady } from './character/components/CharacterReadyContext';
import { CharacterTransformProvider } from './character/components/CharacterTransformContext';
import { HealthTestScene } from './examples/HealthTestScene';
import { PerformanceStats, PerformanceStatsCollector } from './ui/debug/PerformanceStats';
import { ImpactParticles } from './character/player/tps/shooting/ImpactParticles';
import { ShootingDebugVisualizer } from './character/player/tps/shooting/ShootingDebugVisualizer';
import { EquipmentTransformSync } from './character/player/equipment/debug/EquipmentTransformSync';

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
  // Preload assets
  const characterSelector = useCharacterSelector();
  const preloadState = useAssetPreloader(characterSelector.modelPath);

  // Wait for character to be fully ready
  const { isCharacterReady } = useCharacterReady();

  // État pour les rifles ramassés
  const [pickedUpRifles, setPickedUpRifles] = React.useState<Set<number>>(new Set());

  // État pour les swords ramassées
  const [pickedUpSwords, setPickedUpSwords] = React.useState<Set<number>>(new Set());

  // État pour les shields ramassés
  const [pickedUpShields, setPickedUpShields] = React.useState<Set<number>>(new Set());

  // L'ordre d'appel détermine l'ordre dans Leva
  // ─── 🎮 Contrôles ───
  useInputControls(); // Options d'input en premier
  useInputRebind(); // Système de rebind complet
  useInventoryControls(); // Gestion de l'inventaire avec la touche I
  useQuickSlotControls(); // Gestion des quick slots (1-8)
  useReloadStowControls(); // Gestion de la touche R (reload/stow/drop)

  // ─── 🔧 Debug ───
  useAimDebug(); // Debug (utilisé dans AnimatedModelRifle)
  useRifleDebug(); // Debug position/rotation du rifle
  useSwordTransformDebug(); // Debug position/rotation sword (back slots)
  useShieldTransformDebug(); // Debug position/rotation shield (back slots)

  // ─── 🎯 Character & Gameplay ───
  const weaponState = useWeaponState();
  const characterControls = useCharacterControls();

  // ─── 📷 Camera ───
  const cameraControls = useCameraControls();

  // ─── 🎨 Visual & Effects ───
  const lighting = useLightingControls();
  const postProcessing = usePostProcessingControls();

  // ─── 💾 Config Manager ───
  useLevaConfigManager(); // Système de sauvegarde/chargement

  const handleRiflePickup = (index: number) => {
    return () => {
      setPickedUpRifles(prev => new Set([...prev, index]));
      // Note: Inventory add and equip is now handled by RiflePickup component
      console.log(`Rifle ${index} ramassé !`);
    };
  };

  const handleSwordPickup = (index: number) => {
    return () => {
      setPickedUpSwords(prev => new Set([...prev, index]));
      console.log(`Sword ${index} ramassée !`);
    };
  };

  const handleShieldPickup = (index: number) => {
    return () => {
      setPickedUpShields(prev => new Set([...prev, index]));
      console.log(`Shield ${index} ramassé !`);
    };
  };

  // Positions des rifles (3 rifles exactement)
  const riflePositions: [number, number, number][] = [
    [5, 1, 0],
    [5, 1, 5],
    [5, 1, -5],
  ];

  // Combined loading state: wait for both asset preload AND character initialization
  const isFullyReady = preloadState.ready && isCharacterReady;
  const isLoading = preloadState.loading || (preloadState.ready && !isCharacterReady);

  // Calculate loading progress
  const loadingProgress = preloadState.loading
    ? preloadState.progress
    : isCharacterReady
    ? 100
    : 95; // Stuck at 95% while character initializes

  const loadingMessage = preloadState.loading
    ? preloadState.message
    : isCharacterReady
    ? 'Ready!'
    : 'Initializing character...';

  return (
    <>
      {/* Show loading screen until EVERYTHING is ready */}
      {isLoading && (
        <LoadingScreen
          progress={loadingProgress}
          message={loadingMessage}
        />
      )}

      {/* Only show game UI when fully ready */}
      {isFullyReady && (
        <>
          <DragDropManager />
          <PerformanceStats />
          <Crosshair />
          <HitMarkerOverlay />
          <Inventory />
          <Quickbar />
          <DropZone />
          <Bolt className="fixed top-4 right-4 w-6 h-6 text-white opacity-50" />
        </>
      )}

      <Leva collapsed />
      <MobileControlsProvider>
        <MobileControls />
        {/* Always render Canvas for character to initialize, but hide it until ready */}
        {preloadState.ready && (
          <div style={{
            visibility: isFullyReady ? 'visible' : 'hidden',
            width: '100%',
            height: '100%'
          }}>
          <Canvas
            shadows
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: false,
              stencil: false,
              depth: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false
            }}
            frameloop="always"
            dpr={window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio}
            performance={{ min: 0.5 }}
          >
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
            timeStep="vary"
            positionIterations={8}
            velocityIterations={8}
          >
            <CharacterController ref={characterRef} />
            <Ground />
            <Balls />

            {/* Health System Test Scene */}
            <HealthTestScene />

            {/* Impact Particles System */}
            <ImpactParticles />

            {/* Shooting Debug Visualizer */}
            <ShootingDebugVisualizer />

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

            {/* Spawn swords for testing (3 swords) */}
            {!pickedUpSwords.has(0) && (
              <SwordPickup
                position={[3, 1, 3]}
                onPickup={handleSwordPickup(0)}
              />
            )}
            {!pickedUpSwords.has(1) && (
              <SwordPickup
                position={[-3, 1, 3]}
                onPickup={handleSwordPickup(1)}
              />
            )}
            {!pickedUpSwords.has(2) && (
              <SwordPickup
                position={[0, 1, 3]}
                onPickup={handleSwordPickup(2)}
              />
            )}

            {/* Spawn shields for testing (3 shields) */}
            {!pickedUpShields.has(0) && (
              <ShieldPickup
                position={[3, 1, -3]}
                onPickup={handleShieldPickup(0)}
              />
            )}
            {!pickedUpShields.has(1) && (
              <ShieldPickup
                position={[-3, 1, -3]}
                onPickup={handleShieldPickup(1)}
              />
            )}
            {!pickedUpShields.has(2) && (
              <ShieldPickup
                position={[0, 1, -3]}
                onPickup={handleShieldPickup(2)}
              />
            )}

            {/* Dropped items in world */}
            <WorldItems />
          </Physics>
          <FollowCamera target={characterRef} />
          <HitDetectionManager />
          <ObjectSelectionManager characterRef={characterRef} />
          <InteractIcon3D />
          <PerformanceStatsCollector />
          <EquipmentTransformSync />
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
          </div>
        )}
      </MobileControlsProvider>
    </>
  );
}

function App() {
  return (
    <InputProvider>
      <HitDetectionProvider>
        <HitMarkerProvider>
          <InventoryProvider>
            <EquipmentProvider>
              <CharacterTransformProvider>
                <WorldItemManagerProvider>
                  <DragDropProvider>
                    <QuickbarProvider>
                      <CharacterReadyProvider>
                        <div className="w-full h-screen">
                          <AppContent />
                        </div>
                      </CharacterReadyProvider>
                    </QuickbarProvider>
                  </DragDropProvider>
                </WorldItemManagerProvider>
              </CharacterTransformProvider>
            </EquipmentProvider>
          </InventoryProvider>
        </HitMarkerProvider>
      </HitDetectionProvider>
    </InputProvider>
  );
}

export default App;
