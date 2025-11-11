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
};

export function useShootingRaycast({
  isShooting,
  onHit,
  maxDistance = 100
}: UseShootingRaycastProps) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const lastShotTime = useRef(0);
  const lastHitResult = useRef<HitResult | null>(null);

  // Configure raycaster once
  raycaster.current.far = maxDistance;

  const performRaycast = useCallback(() => {
    // Set ray from camera center (screen center)
    const direction = new Vector3(0, 0, -1);
    direction.unproject(camera);
    direction.sub(camera.position).normalize();

    raycaster.current.set(camera.position, direction);

    // Get all objects in the scene that can be hit
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    // Filter out certain objects (camera, lights, helpers, character itself)
    const validHits = intersects.filter(hit => {
      // Skip non-mesh objects
      if (!hit.object.isMesh) return false;

      // Skip objects that are too close (character itself)
      if (hit.distance < 1) return false;

      // Skip invisible objects
      if (!hit.object.visible) return false;

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

      lastHitResult.current = result;

      if (onHit) {
        onHit(result);
      }

      return result;
    }
  }, [camera, scene, onHit, maxDistance]);

  useFrame(() => {
    // Detect shooting event (transition from false to true)
    const now = Date.now();

    if (isShooting && now - lastShotTime.current > 100) {
      // Perform raycast when shooting
      performRaycast();
      lastShotTime.current = now;
    }
  });

  return {
    lastHit: lastHitResult.current,
    performRaycast
  };
}
