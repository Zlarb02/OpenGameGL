import { useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Raycaster, Vector3, Object3D } from 'three';

export type HitResult = {
  hit: boolean;
  object?: Object3D;
  point?: Vector3;
  distance?: number;
  timestamp: number;
};

type UseShootingRaycastProps = {
  isShooting: boolean;
  onHit?: (result: HitResult) => void;
  maxDistance?: number;
  spread?: number; // Dispersion en degrés (0 = parfait, plus grand = moins précis)
  fireRate?: number; // Temps minimum entre chaque tir en ms (défaut: 100ms = 600 RPM)
};

export function useShootingRaycast({
  isShooting,
  onHit,
  maxDistance = 100,
  spread = 0,
  fireRate = 100
}: UseShootingRaycastProps) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const lastShotTime = useRef(0);
  const lastHitResult = useRef<HitResult | null>(null);
  const wasShootingRef = useRef(false);

  // Configure raycaster once
  raycaster.current.far = maxDistance;
  raycaster.current.camera = camera; // Set camera for LineSegments2 compatibility

  const performRaycast = useCallback(() => {
    // ÉTAPE 1: Raycast depuis la caméra pour trouver le point de visée
    const cameraDirection = new Vector3(0, 0, -1);
    cameraDirection.unproject(camera);
    cameraDirection.sub(camera.position).normalize();

    // Ajouter une déviation aléatoire basée sur spread
    if (spread > 0) {
      // Convertir spread en radians
      const spreadRad = (spread * Math.PI) / 180;

      // Générer une déviation aléatoire uniforme dans un carré (comme le crosshair)
      const randomX = (Math.random() - 0.5) * spreadRad;
      const randomY = (Math.random() - 0.5) * spreadRad;

      // Appliquer la déviation à la direction
      // Créer des vecteurs perpendiculaires pour X et Y
      const up = new Vector3(0, 1, 0);
      const right = new Vector3().crossVectors(cameraDirection, up).normalize();
      const actualUp = new Vector3().crossVectors(right, cameraDirection).normalize();

      // Appliquer les offsets
      cameraDirection.addScaledVector(right, randomX);
      cameraDirection.addScaledVector(actualUp, randomY);
      cameraDirection.normalize();
    }

    // Raycast depuis la caméra pour trouver le point cible
    raycaster.current.set(camera.position, cameraDirection);
    const cameraIntersects = raycaster.current.intersectObjects(scene.children, true);

    // Trouver le point cible (soit un hit, soit maxDistance)
    let targetPoint = camera.position.clone().addScaledVector(cameraDirection, maxDistance);

    const validCameraHits = cameraIntersects.filter(hit => {
      // Skip non-mesh objects
      if (!hit.object.isMesh) return false;
      // Skip invisible objects
      if (!hit.object.visible) return false;
      // Skip player character
      if (hit.object.userData?.isPlayerCharacter) return false;
      return true;
    });

    if (validCameraHits.length > 0) {
      targetPoint = validCameraHits[0].point;
    }

    // ÉTAPE 2: Raycast depuis la caméra vers le point cible (pour détecter les vrais hits)
    // On utilise la caméra comme origine car c'est là que le joueur regarde
    const shootDirection = targetPoint.clone().sub(camera.position).normalize();
    raycaster.current.set(camera.position, shootDirection);

    // Get all objects in the scene that can be hit
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    // Filter out certain objects (camera, lights, helpers, character itself)
    const validHits = intersects.filter(hit => {
      // Skip non-mesh objects
      if (!hit.object.isMesh) return false;

      // Skip objects that are too close (character itself and nearby objects)
      if (hit.distance < 2) return false;

      // Skip invisible objects
      if (!hit.object.visible) return false;

      // Skip player character
      if (hit.object.userData?.isPlayerCharacter) return false;

      return true;
    });

    if (validHits.length > 0) {
      const hit = validHits[0];
      const result: HitResult = {
        hit: true,
        object: hit.object,
        point: hit.point,
        distance: hit.distance,
        timestamp: Date.now()
      };

      // Debug: Enregistrer le raycast avec hit
      if (typeof window !== 'undefined' && (window as any).__debugRaycast) {
        (window as any).__debugRaycast(camera.position, shootDirection, hit.point, hit.distance);
      }

      lastHitResult.current = result;

      if (onHit) {
        onHit(result);
      }

      return result;
    } else {
      const result: HitResult = {
        hit: false,
        timestamp: Date.now()
      };

      // Debug: Enregistrer le raycast sans hit (miss)
      if (typeof window !== 'undefined' && (window as any).__debugRaycast) {
        (window as any).__debugRaycast(camera.position, shootDirection, undefined, maxDistance);
      }

      lastHitResult.current = result;

      if (onHit) {
        onHit(result);
      }

      return result;
    }
  }, [camera, scene, onHit, maxDistance, spread]);

  useFrame(() => {
    const now = Date.now();

    // Détecter la transition false -> true (nouveau tir)
    const justStartedShooting = isShooting && !wasShootingRef.current;

    if (justStartedShooting && now - lastShotTime.current > fireRate) {
      // Perform raycast when shooting starts
      performRaycast();
      lastShotTime.current = now;
    }

    // Mettre à jour l'état précédent
    wasShootingRef.current = isShooting;
  });

  return {
    lastHit: lastHitResult.current,
    performRaycast
  };
}
