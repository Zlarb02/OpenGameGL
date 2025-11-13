/**
 * Character Transform Context
 * Provides character position and rotation to hooks that need it
 */

import { createContext, useContext, useRef, useCallback, ReactNode } from 'react';
import * as THREE from 'three';

interface CharacterTransform {
  position: THREE.Vector3;
  rotation: number; // Y-axis rotation
  forward: THREE.Vector3; // Forward direction
}

interface CharacterTransformContextValue {
  getTransform: () => CharacterTransform;
  updateTransform: (position: THREE.Vector3, rotation: number) => void;
}

const CharacterTransformContext = createContext<CharacterTransformContextValue | null>(null);

export function CharacterTransformProvider({ children }: { children: ReactNode }) {
  const transformRef = useRef<CharacterTransform>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    forward: new THREE.Vector3(0, 0, 1),
  });

  const getTransform = useCallback(() => transformRef.current, []);

  const updateTransform = useCallback((position: THREE.Vector3, rotation: number) => {
    // Calculate forward direction from rotation
    const forward = new THREE.Vector3(
      Math.sin(rotation),
      0,
      Math.cos(rotation)
    ).normalize();

    // Update ref directly without triggering re-render
    transformRef.current = {
      position: position.clone(),
      rotation,
      forward,
    };
  }, []);

  return (
    <CharacterTransformContext.Provider value={{ getTransform, updateTransform }}>
      {children}
    </CharacterTransformContext.Provider>
  );
}

export function useCharacterTransform() {
  const context = useContext(CharacterTransformContext);
  if (!context) {
    throw new Error('useCharacterTransform must be used within CharacterTransformProvider');
  }
  return context;
}
