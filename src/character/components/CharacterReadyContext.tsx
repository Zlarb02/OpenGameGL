/**
 * CharacterReadyContext
 * Tracks when character is fully loaded and ready to display
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CharacterReadyContextValue {
  isCharacterReady: boolean;
  setCharacterReady: (ready: boolean) => void;
}

const CharacterReadyContext = createContext<CharacterReadyContextValue | null>(null);

export function CharacterReadyProvider({ children }: { children: React.ReactNode }) {
  const [isCharacterReady, setIsCharacterReady] = useState(false);

  const setCharacterReady = useCallback((ready: boolean) => {
    setIsCharacterReady(ready);
    if (ready) {
      console.log('[CharacterReady] Character is now ready to display');
    }
  }, []);

  return (
    <CharacterReadyContext.Provider value={{ isCharacterReady, setCharacterReady }}>
      {children}
    </CharacterReadyContext.Provider>
  );
}

export function useCharacterReady() {
  const context = useContext(CharacterReadyContext);
  if (!context) {
    throw new Error('useCharacterReady must be used within CharacterReadyProvider');
  }
  return context;
}
