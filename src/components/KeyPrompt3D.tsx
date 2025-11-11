/**
 * Composant 3D qui affiche une touche de clavier style Kenney
 * Utilise les vraies textures PNG Kenney Input Prompts
 */

import React, { useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import { useInput } from '../systems/input';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface KeyPrompt3DProps {
  action?: string; // L'action à afficher (par défaut "E")
  canInteract?: boolean; // Si false, affiche en grisé
}

export function KeyPrompt3D({ action = 'E', canInteract = true }: KeyPrompt3DProps) {
  const { activeDevice } = useInput();

  // Pour l'instant on affiche toujours "E" pour le clavier
  // TODO: adapter selon le device (gamepad button)
  const displayKey = action.toLowerCase();

  // Charger la texture Kenney
  const texturePath = `/assets/Keyboard & Mouse/Double/keyboard_${displayKey}.png`;
  const texture = useTexture(texturePath);

  // Configurer la texture
  useMemo(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture]);

  // Couleur de teinte selon l'état (blanc normal, gris si trop loin)
  const tintColor = canInteract ? new THREE.Color(1, 1, 1) : new THREE.Color(0.5, 0.5, 0.5);
  const opacity = canInteract ? 1 : 0.7;

  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          depthTest={false}
          depthWrite={false}
          color={tintColor}
          opacity={opacity}
        />
      </mesh>
    </Billboard>
  );
}
