import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Spherical, MathUtils, Raycaster, Object3D } from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import { useCameraControls } from './useCameraControls';
import { useWeaponState } from '../../character/player/tps/weapons/useWeaponState';
import { useInput } from '../input';
import { useFreelook } from './useFreelook';
import { useAdsDebugControls } from './useAdsDebugControls';

type FollowCameraProps = {
  target: { current: { position: Vector3; cameraAngle?: { current: number }; cameraPhi?: { current: number } } | null };
};

export function FollowCamera({ target }: FollowCameraProps) {
  const { gl, camera, scene } = useThree();
  const controls = useCameraControls();
  const { weaponEquipped, isAiming } = useWeaponState();
  const { options } = useInput(); // Utiliser les options du système d'input
  const { isFreelooking } = useFreelook();

  // Panneau de debug ADS dans Leva
  useAdsDebugControls();
  
  // Sélectionner les paramètres selon si le rifle est équipé
  const currentDistance = weaponEquipped ? controls.distanceRifle : controls.distance;
  const currentMinDistance = weaponEquipped ? controls.minDistanceRifle : controls.minDistance;
  const currentHeight = weaponEquipped ? controls.heightRifle : controls.height;
  const currentShoulderOffset = weaponEquipped ? controls.shoulderOffsetRifle : controls.shoulderOffset;
  
  // Camera state
  const spherical = useRef(new Spherical(
    currentDistance,
    MathUtils.degToRad(85), // Initial polar angle - regarder légèrement vers le haut
    0 // Initial azimuth angle
  ));
  const currentSpherical = useRef(new Spherical(
    currentDistance,
    MathUtils.degToRad(85),
    0
  ));
  
  // Positions
  const currentCameraPos = useRef(new Vector3());
  const desiredCameraPos = useRef(new Vector3());
  const lookAtPosition = useRef(new Vector3());

  // ADS (Aim Down Sights) offset - smoothed
  const currentAdsOffset = useRef(new Vector3());
  const targetAdsOffset = useRef(new Vector3());

  // FOV zoom for ADS
  const currentFov = useRef(controls.normalFov);
  
  // Raycaster for collision (using Three.js instead of Rapier)
  const raycaster = useRef(new Raycaster());
  
  // Initialize raycaster settings once for better performance
  useEffect(() => {
    // Optimize raycaster - only check first intersection
    raycaster.current.firstHitOnly = true;
    // Set camera for LineSegments2 compatibility (used by debug visualizer)
    raycaster.current.camera = camera;
  }, [camera]);
  
  // Performance optimization: Cache collision objects
  const collisionObjects = useRef<Object3D[]>([]);
  const lastCollisionUpdate = useRef(0);
  const COLLISION_UPDATE_INTERVAL = 1000; // Update collision objects list every 1 second
  
  // Performance: Skip frames for collision detection
  const frameCount = useRef(0);
  
  // Mouse state
  const isPointerLocked = useRef(false);
  
  // Store refs for current values to avoid recreating listeners
  const optionsRef = useRef(options);
  const controlsRef = useRef(controls);
  const currentMinDistanceRef = useRef(currentMinDistance);

  useEffect(() => {
    optionsRef.current = options;
    controlsRef.current = controls;
    currentMinDistanceRef.current = currentMinDistance;
  });

  // Handle mouse/touch controls
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = () => {
      // Any click locks the pointer for camera control
      if (!isPointerLocked.current) {
        canvas.requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const onPointerMove = (e: PointerEvent) => {
      // Only rotate when pointer is locked
      if (!isPointerLocked.current) return;

      // Use movementX/Y for smooth FPS-style rotation
      const deltaX = e.movementX;
      const deltaY = e.movementY;

      // Update spherical coordinates
      // La souris contrôle toujours l'orientation (caméra + personnage en mode rifle)
      spherical.current.theta -= deltaX * optionsRef.current.mouseSensitivity;

      // Apply Y-axis inversion based on settings
      const yMultiplier = optionsRef.current.invertY ? 1 : -1;
      spherical.current.phi += deltaY * optionsRef.current.mouseSensitivity * yMultiplier;

      // Clamp vertical rotation
      // Note: phi=0 is looking UP, phi=180 is looking DOWN in spherical coords
      const minPhi = MathUtils.degToRad(controlsRef.current.minPolarAngle);
      const maxPhi = MathUtils.degToRad(controlsRef.current.maxPolarAngle);
      spherical.current.phi = MathUtils.clamp(spherical.current.phi, minPhi, maxPhi);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // ESC to unlock pointer
      if (e.key === 'Escape') {
        document.exitPointerLock();
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Zoom in/out
      spherical.current.radius += e.deltaY * 0.01 * controlsRef.current.zoomSpeed;
      spherical.current.radius = MathUtils.clamp(
        spherical.current.radius,
        currentMinDistanceRef.current,
        controlsRef.current.maxDistance
      );
    };

    const onContextMenu = (e: Event) => {
      e.preventDefault(); // Prevent right-click menu
    };

    canvas.addEventListener('click', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      canvas.removeEventListener('click', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      document.exitPointerLock();
    };
  }, [gl]);
  
  // Mettre à jour la distance de la caméra quand on change de mode (rifle équipé/déséquipé)
  useEffect(() => {
    spherical.current.radius = currentDistance;
  }, [currentDistance]);
  
  useFrame(() => {
    if (!target.current) return;

    const targetPos = target.current.position.clone();

    // Share camera angles with character controller for movement and aim
    // En mode freelook avec rifle équipé, on ne transmet PAS l'angle de la caméra au personnage
    const shouldTransmitCameraAngle = !(weaponEquipped && isFreelooking);

    // Debug freelook
    if (weaponEquipped && isFreelooking !== undefined) {
      // Log seulement lors des changements d'état
      const key = `${weaponEquipped}_${isFreelooking}`;
      if (!window.__freelookLogCache || window.__freelookLogCache !== key) {
        console.log('[FollowCamera] Freelook state:', { weaponEquipped, isFreelooking, shouldTransmitCameraAngle });
        window.__freelookLogCache = key;
      }
    }

    if (target.current.cameraAngle && shouldTransmitCameraAngle) {
      target.current.cameraAngle.current = currentSpherical.current.theta;
    }
    if (target.current.cameraPhi && shouldTransmitCameraAngle) {
      target.current.cameraPhi.current = currentSpherical.current.phi;
    }
    
    // Performance: Update collision objects list periodically, not every frame
    const now = Date.now();
    if (controls.collisionEnabled && now - lastCollisionUpdate.current > COLLISION_UPDATE_INTERVAL) {
      // Filter scene objects that can collide (exclude character, lights, cameras, etc.)
      collisionObjects.current = scene.children.filter(obj => {
        // Only include meshes with geometry (exclude helpers, lights, cameras)
        return obj.type === 'Mesh' || obj.type === 'Group';
      });
      lastCollisionUpdate.current = now;
    }
    
    // Smooth spherical interpolation
    // En mode rifle : rotation quasi-instantanée pour caméra rigide (pas de lerp)
    if (weaponEquipped) {
      // Mode rifle : pas de smoothing, copie directe pour éliminer tout lag
      currentSpherical.current.radius = spherical.current.radius;
      currentSpherical.current.theta = spherical.current.theta;
      currentSpherical.current.phi = spherical.current.phi;
    } else {
      // Mode normal : smoothing léger
      const rotationSmoothingFactor = controls.rotationSmoothing;
      currentSpherical.current.radius = MathUtils.lerp(
        currentSpherical.current.radius,
        spherical.current.radius,
        rotationSmoothingFactor
      );
      currentSpherical.current.theta = MathUtils.lerp(
        currentSpherical.current.theta,
        spherical.current.theta,
        rotationSmoothingFactor
      );
      currentSpherical.current.phi = MathUtils.lerp(
        currentSpherical.current.phi,
        spherical.current.phi,
        rotationSmoothingFactor
      );
    }
    
    // Calculate desired camera position from spherical coordinates
    const offset = new Vector3();
    offset.setFromSpherical(currentSpherical.current);
    
    // Calculate look-at position (where camera focuses)
    lookAtPosition.current.copy(targetPos).add(new Vector3(0, currentHeight, 0));
    
    // Calculate shoulder offset - perpendicular to camera direction
    // This creates a stable over-the-shoulder view
    const cameraForward = new Vector3(
      Math.sin(currentSpherical.current.phi) * Math.sin(currentSpherical.current.theta),
      Math.cos(currentSpherical.current.phi),
      Math.sin(currentSpherical.current.phi) * Math.cos(currentSpherical.current.theta)
    );
    const up = new Vector3(0, 1, 0);
    const right = new Vector3().crossVectors(up, cameraForward).normalize();
    
    // Apply shoulder offset to look-at position (not camera position)
    const shoulderPos = lookAtPosition.current.clone().add(right.multiplyScalar(currentShoulderOffset));
    
    // Camera position = shoulder position + offset
    desiredCameraPos.current.copy(shoulderPos).add(offset);
    
    // Performance: Increment frame counter
    frameCount.current++;
    
    // Collision detection using Three.js Raycaster (OPTIMIZED)
    // Only check collision every N frames to reduce CPU usage
    const collisionInterval = controls.performanceMode ? 2 : 1;
    if (controls.collisionEnabled && 
        collisionObjects.current.length > 0 && 
        frameCount.current % collisionInterval === 0) {
      const direction = desiredCameraPos.current.clone().sub(lookAtPosition.current);
      const distance = direction.length();
      
      if (distance > 0) {
        direction.normalize();
        
        // Cast ray from target to desired camera position using Three.js
        raycaster.current.set(shoulderPos, direction);
        raycaster.current.far = distance;
        
        // OPTIMIZATION: Only test cached collision objects, not all scene children
        const intersects = raycaster.current.intersectObjects(collisionObjects.current, true);
        
        // Filter out the character itself and find the closest obstacle
        const validIntersects = intersects.filter(hit => {
          // Skip very close hits (character itself)
          return hit.distance > 0.2;
        });
        
        if (validIntersects.length > 0) {
          const closestHit = validIntersects[0];
          // Pull camera closer to avoid collision
          const safeDistance = Math.max(closestHit.distance - controls.collisionRadius, currentMinDistance);
          desiredCameraPos.current.copy(shoulderPos).add(direction.multiplyScalar(safeDistance));
        }
      }
    }
    
    // === ADS (Aim Down Sights) OFFSET ===
    // Calculer l'offset ADS target basé sur l'état de visée
    if (controls.adsEnabled && weaponEquipped && isAiming) {
      // Mode visée : appliquer l'offset ADS
      targetAdsOffset.current.set(
        controls.adsOffsetX,
        controls.adsOffsetY,
        controls.adsOffsetZ
      );
    } else {
      // Pas en mode visée : offset à zéro
      targetAdsOffset.current.set(0, 0, 0);
    }

    // Smooth transition de l'offset ADS
    currentAdsOffset.current.lerp(targetAdsOffset.current, controls.adsTransitionSpeed);

    // === FOV ZOOM ===
    // Calculer le FOV target basé sur l'état de visée
    const targetFov = (controls.adsEnabled && weaponEquipped && isAiming) ? controls.adsFov : controls.normalFov;
    currentFov.current = MathUtils.lerp(currentFov.current, targetFov, controls.fovTransitionSpeed);

    // Appliquer le FOV à la caméra (cast en PerspectiveCamera)
    if ('fov' in camera) {
      (camera as any).fov = currentFov.current;
      camera.updateProjectionMatrix();
    }

    // Appliquer l'offset ADS dans le repère local de la caméra
    // Calculer les vecteurs right, up, forward de la caméra
    const cameraForwardDir = new Vector3(
      Math.sin(currentSpherical.current.phi) * Math.sin(currentSpherical.current.theta),
      Math.cos(currentSpherical.current.phi),
      Math.sin(currentSpherical.current.phi) * Math.cos(currentSpherical.current.theta)
    ).normalize();
    const upDir = new Vector3(0, 1, 0);
    const rightDir = new Vector3().crossVectors(upDir, cameraForwardDir).normalize();
    const actualUpDir = new Vector3().crossVectors(cameraForwardDir, rightDir).normalize();

    // Appliquer l'offset dans le repère local
    const adsWorldOffset = new Vector3()
      .addScaledVector(rightDir, currentAdsOffset.current.x)
      .addScaledVector(actualUpDir, currentAdsOffset.current.y)
      .addScaledVector(cameraForwardDir, -currentAdsOffset.current.z); // Z négatif = vers l'avant

    // Ajouter l'offset ADS à la position désirée
    const finalDesiredPos = desiredCameraPos.current.clone().add(adsWorldOffset);

    // Smooth position interpolation
    // Smoothing plus fort pour réduire les saccades
    const positionSmoothingFactor = weaponEquipped ? 0.3 : controls.positionSmoothing * 1.5;

    currentCameraPos.current.lerp(finalDesiredPos, positionSmoothingFactor);

    // Apply to camera
    camera.position.copy(currentCameraPos.current);
    camera.lookAt(shoulderPos);

    // Force camera matrix update to prevent lag
    camera.updateMatrixWorld(true);
  });

  return (
    <PerspectiveCamera 
      makeDefault 
      position={[0, currentHeight, currentDistance]} 
      fov={75}
    />
  );
}