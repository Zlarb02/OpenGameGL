import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import { Vector3 } from 'three';
import { useControls } from 'leva';

interface RaycastDebugData {
  origin: Vector3;
  direction: Vector3;
  hitPoint?: Vector3;
  hitDistance?: number;
  timestamp: number;
}

const MAX_DEBUG_RAYS = 10;
const RAY_LIFETIME = 2000; // 2 secondes

/**
 * Visualiseur de debug pour les raycasts de tir
 * Affiche les lignes de tir, les points d'impact, et les misses
 */
export function ShootingDebugVisualizer() {
  const debugRays = useRef<RaycastDebugData[]>([]);

  const { enabled, showMisses, rayColor, hitColor, missColor, rayLifetime } = useControls(
    '🎯 Shooting Debug',
    {
      enabled: { value: false, label: 'Show Raycast Debug' },
      showMisses: { value: true, label: 'Show Missed Shots' },
      rayColor: { value: '#00ff00', label: 'Ray Color' },
      hitColor: { value: '#ff0000', label: 'Hit Point Color' },
      missColor: { value: '#ffff00', label: 'Miss Color' },
      rayLifetime: { value: 2, min: 0.5, max: 5, step: 0.5, label: 'Ray Lifetime (s)' },
    },
    { collapsed: true }
  );

  // Exposer la fonction pour enregistrer les raycasts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__debugRaycast = (
        origin: Vector3,
        direction: Vector3,
        hitPoint?: Vector3,
        hitDistance?: number
      ) => {
        // Ajouter le nouveau raycast
        debugRays.current.push({
          origin: origin.clone(),
          direction: direction.clone(),
          hitPoint: hitPoint?.clone(),
          hitDistance,
          timestamp: Date.now(),
        });

        // Limiter le nombre de raycasts affichés
        if (debugRays.current.length > MAX_DEBUG_RAYS) {
          debugRays.current.shift();
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__debugRaycast;
      }
    };
  }, []);

  // Nettoyer les vieux raycasts
  useFrame(() => {
    const now = Date.now();
    const lifetimeMs = rayLifetime * 1000;
    debugRays.current = debugRays.current.filter(
      (ray) => now - ray.timestamp < lifetimeMs
    );
  });

  if (!enabled) return null;

  return (
    <group>
      {debugRays.current.map((ray, index) => {
        const now = Date.now();
        const age = now - ray.timestamp;
        const lifetimeMs = rayLifetime * 1000;
        const alpha = 1 - age / lifetimeMs; // Fade out over time

        // Calculer le point final du rayon
        const endPoint = ray.hitPoint
          ? ray.hitPoint
          : ray.origin.clone().addScaledVector(ray.direction, ray.hitDistance || 100);

        const isHit = !!ray.hitPoint;
        const color = isHit ? rayColor : missColor;

        return (
          <group key={`${ray.timestamp}-${index}`}>
            {/* Ligne du raycast */}
            <Line
              points={[ray.origin, endPoint]}
              color={color}
              lineWidth={2}
              transparent
              opacity={alpha}
            />

            {/* Point d'origine (caméra) */}
            <Sphere args={[0.05]} position={ray.origin}>
              <meshBasicMaterial color="#00ffff" transparent opacity={alpha} />
            </Sphere>

            {/* Point d'impact (si hit) */}
            {isHit && ray.hitPoint && (
              <>
                <Sphere args={[0.1]} position={ray.hitPoint}>
                  <meshBasicMaterial color={hitColor} transparent opacity={alpha} />
                </Sphere>
                {/* Petite croix au point d'impact */}
                <Line
                  points={[
                    ray.hitPoint.clone().add(new Vector3(-0.1, 0, 0)),
                    ray.hitPoint.clone().add(new Vector3(0.1, 0, 0)),
                  ]}
                  color={hitColor}
                  lineWidth={3}
                  transparent
                  opacity={alpha}
                />
                <Line
                  points={[
                    ray.hitPoint.clone().add(new Vector3(0, -0.1, 0)),
                    ray.hitPoint.clone().add(new Vector3(0, 0.1, 0)),
                  ]}
                  color={hitColor}
                  lineWidth={3}
                  transparent
                  opacity={alpha}
                />
                <Line
                  points={[
                    ray.hitPoint.clone().add(new Vector3(0, 0, -0.1)),
                    ray.hitPoint.clone().add(new Vector3(0, 0, 0.1)),
                  ]}
                  color={hitColor}
                  lineWidth={3}
                  transparent
                  opacity={alpha}
                />
              </>
            )}

            {/* Point final (si miss et showMisses activé) */}
            {!isHit && showMisses && (
              <Sphere args={[0.08]} position={endPoint}>
                <meshBasicMaterial color={missColor} transparent opacity={alpha * 0.5} />
              </Sphere>
            )}
          </group>
        );
      })}
    </group>
  );
}
