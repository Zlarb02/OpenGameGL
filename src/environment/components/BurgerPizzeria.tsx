import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useEffect } from 'react';

/**
 * BurgerPizzeria environment model
 * Loads a GLB containing store, parking, road, and houses
 * Positioned 10 meters below the ground plane (Y = -11)
 */
export function BurgerPizzeria() {
  const { scene } = useGLTF('/models/environment/burger-pizzeria.glb');

  // Enable shadows ONCE when component mounts
  useEffect(() => {
    scene.traverse((child) => {
      if ('material' in child) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <>
      {/* Simple ground collision plane at BurgerPizzeria level */}
      <RigidBody type="fixed" position={[0, -11, 0]} friction={2.0} restitution={0}>
        <mesh receiveShadow>
          <boxGeometry args={[200, 0.1, 200]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Visual model with trimesh collision for buildings/obstacles */}
      <RigidBody type="fixed" colliders="trimesh" friction={2.0} restitution={0}>
        <primitive
          object={scene}
          position={[0, -11, 0]}
          scale={1}
          rotation={[0, 0, 0]}
        />
      </RigidBody>
    </>
  );
}

// Preload the model for better performance
useGLTF.preload('/models/environment/burger-pizzeria.glb');
