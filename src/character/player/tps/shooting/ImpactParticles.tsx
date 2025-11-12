import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, BufferGeometry, BufferAttribute, Points, PointsMaterial, AdditiveBlending } from 'three';

interface ImpactParticle {
  position: Vector3;
  velocity: Vector3;
  life: number; // 0 à 1
  maxLife: number;
  active: boolean;
}

const MAX_PARTICLES = 100;
const PARTICLE_LIFETIME = 0.5; // secondes
const PARTICLE_COUNT_PER_IMPACT = 8;

/**
 * Système de particules pour les impacts de balles
 * Optimisé avec un pool de particules réutilisables
 */
export function ImpactParticles() {
  const particlesRef = useRef<ImpactParticle[]>([]);
  const pointsRef = useRef<Points>(null);
  const geometryRef = useRef<BufferGeometry>(null);

  // Initialiser le pool de particules
  useMemo(() => {
    particlesRef.current = Array.from({ length: MAX_PARTICLES }, () => ({
      position: new Vector3(),
      velocity: new Vector3(),
      life: 0,
      maxLife: PARTICLE_LIFETIME,
      active: false
    }));
  }, []);

  // Créer la géométrie des particules
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);

    // Initialiser toutes les particules à (0,0,0)
    for (let i = 0; i < MAX_PARTICLES; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Couleur orange/jaune pour les impacts
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.7;
      colors[i * 3 + 2] = 0.3;
    }

    return { positions, colors };
  }, []);

  // Fonction pour spawner des particules à un point d'impact
  const spawnImpact = (point: Vector3, normal?: Vector3) => {
    console.log('[ImpactParticles] Spawning particles at:', point);
    const particles = particlesRef.current;

    // Trouver des particules inactives
    let spawned = 0;
    for (let i = 0; i < MAX_PARTICLES && spawned < PARTICLE_COUNT_PER_IMPACT; i++) {
      const particle = particles[i];
      if (!particle.active) {
        // Réactiver la particule
        particle.active = true;
        particle.life = 1;
        particle.maxLife = PARTICLE_LIFETIME;
        particle.position.copy(point);

        // Velocité aléatoire (explosion dans toutes les directions)
        const speed = 2 + Math.random() * 3;
        particle.velocity.set(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        );

        // Si on a une normale, orienter les particules dans cette direction
        if (normal) {
          particle.velocity.add(normal.clone().multiplyScalar(speed * 0.5));
        }

        spawned++;
      }
    }
    console.log(`[ImpactParticles] Spawned ${spawned}/${PARTICLE_COUNT_PER_IMPACT} particles`);
  };

  // Exposer la fonction spawn globalement pour que d'autres composants puissent l'utiliser
  if (typeof window !== 'undefined') {
    (window as any).__spawnImpactParticles = spawnImpact;
  }

  useFrame((_, delta) => {
    if (!geometryRef.current) return;

    const particles = particlesRef.current;
    const positionAttribute = geometryRef.current.attributes.position as BufferAttribute;
    const positions = positionAttribute.array as Float32Array;

    // Mettre à jour toutes les particules
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const particle = particles[i];

      if (particle.active) {
        // Décrémenter la vie
        particle.life -= delta / particle.maxLife;

        if (particle.life <= 0) {
          particle.active = false;
          // Cacher la particule
          positions[i * 3] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
        } else {
          // Appliquer la vélocité
          particle.position.addScaledVector(particle.velocity, delta);

          // Appliquer la gravité
          particle.velocity.y -= 9.8 * delta;

          // Friction
          particle.velocity.multiplyScalar(0.95);

          // Mettre à jour la position dans le buffer
          positions[i * 3] = particle.position.x;
          positions[i * 3 + 1] = particle.position.y;
          positions[i * 3 + 2] = particle.position.z;
        }
      }
    }

    // Marquer l'attribut comme nécessitant une mise à jour
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_PARTICLES}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={MAX_PARTICLES}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
