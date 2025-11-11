/**
 * Détecteur de layout clavier (AZERTY/QWERTY) et OS
 */

import { KeyboardLayout, OperatingSystem } from '../core/InputTypes';

/**
 * Détecte le système d'exploitation
 */
export function detectOS(): OperatingSystem {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return OperatingSystem.MAC;
  }
  if (platform.includes('win') || userAgent.includes('windows')) {
    return OperatingSystem.WINDOWS;
  }
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return OperatingSystem.LINUX;
  }

  return OperatingSystem.OTHER;
}

/**
 * Détecte le layout du clavier en utilisant l'API Keyboard
 * Fallback sur la détection par langue du navigateur
 */
export async function detectKeyboardLayout(): Promise<KeyboardLayout> {
  // Méthode 1: Utiliser l'API Keyboard (moderne mais limitée)
  if ('keyboard' in navigator && 'getLayoutMap' in (navigator as any).keyboard) {
    try {
      const layoutMap = await (navigator as any).keyboard.getLayoutMap();

      // Tester des touches spécifiques pour déterminer le layout
      // En AZERTY: KeyQ = 'a', KeyA = 'q', KeyW = 'z', KeyZ = 'w'
      // En QWERTY: KeyQ = 'q', KeyA = 'a', KeyW = 'w', KeyZ = 'z'
      const keyQ = layoutMap.get('KeyQ');
      const keyW = layoutMap.get('KeyW');
      const keyA = layoutMap.get('KeyA');
      const keyZ = layoutMap.get('KeyZ');

      console.log('[KeyboardDetector] Layout map:', { keyQ, keyW, keyA, keyZ });

      if (keyQ === 'a' && keyW === 'z') {
        console.log('[KeyboardDetector] AZERTY detected via Keyboard API');
        return KeyboardLayout.AZERTY;
      }
      if (keyQ === 'q' && keyW === 'w') {
        console.log('[KeyboardDetector] QWERTY detected via Keyboard API');
        return KeyboardLayout.QWERTY;
      }
      // QWERTZ: KeyZ = 'y', KeyY = 'z'
      const keyY = layoutMap.get('KeyY');
      if (keyZ === 'y' && keyY === 'z') {
        console.log('[KeyboardDetector] QWERTZ detected via Keyboard API');
        return KeyboardLayout.QWERTZ;
      }
    } catch (error) {
      console.warn('[KeyboardDetector] Failed to detect via Keyboard API:', error);
    }
  } else {
    console.log('[KeyboardDetector] Keyboard API not available, using language fallback');
  }

  // Méthode 2: Détection par la langue du navigateur (fallback)
  const language = navigator.language.toLowerCase();
  console.log('[KeyboardDetector] Browser language:', language);

  // Langues utilisant AZERTY
  if (language.startsWith('fr')) {
    console.log('[KeyboardDetector] AZERTY detected via language (French)');
    return KeyboardLayout.AZERTY;
  }

  // Langues utilisant QWERTZ
  if (language.startsWith('de') || language.startsWith('ch')) {
    console.log('[KeyboardDetector] QWERTZ detected via language');
    return KeyboardLayout.QWERTZ;
  }

  // Par défaut QWERTY (US, UK, etc.)
  console.log('[KeyboardDetector] QWERTY detected (default)');
  return KeyboardLayout.QWERTY;
}

/**
 * Mapper une touche physique vers le caractère selon le layout
 * Utile pour afficher la bonne touche dans l'UI
 */
export function getKeyLabel(code: string, layout: KeyboardLayout): string {
  // Mapping AZERTY
  const azertyMap: Record<string, string> = {
    'KeyQ': 'A',
    'KeyW': 'Z',
    'KeyA': 'Q',
    'KeyZ': 'W',
    'KeyM': ',',
    'Semicolon': 'M',
    'Comma': ';',
    'Digit1': '&',
    'Digit2': 'é',
    'Digit3': '"',
    'Digit4': '\'',
    'Digit5': '(',
    'Digit6': '-',
    'Digit7': 'è',
    'Digit8': '_',
    'Digit9': 'ç',
    'Digit0': 'à',
    'Minus': ')',
    'Equal': '=',
  };

  // Mapping QWERTZ
  const qwertzMap: Record<string, string> = {
    'KeyY': 'Z',
    'KeyZ': 'Y',
  };

  // Mapping QWERTY standard (ou caractères communs)
  const standardMap: Record<string, string> = {
    'Space': 'Space',
    'ShiftLeft': 'Shift',
    'ShiftRight': 'Shift',
    'ControlLeft': 'Ctrl',
    'ControlRight': 'Ctrl',
    'AltLeft': 'Alt',
    'AltRight': 'Alt',
    'MetaLeft': detectOS() === OperatingSystem.MAC ? 'Cmd' : 'Win',
    'MetaRight': detectOS() === OperatingSystem.MAC ? 'Cmd' : 'Win',
    'Escape': 'Esc',
    'Enter': 'Enter',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  };

  // Priorité: standard > layout spécifique
  if (standardMap[code]) {
    return standardMap[code];
  }

  if (layout === KeyboardLayout.AZERTY && azertyMap[code]) {
    return azertyMap[code];
  }

  if (layout === KeyboardLayout.QWERTZ && qwertzMap[code]) {
    return qwertzMap[code];
  }

  // Extraire la lettre du code (ex: 'KeyW' -> 'W')
  if (code.startsWith('Key')) {
    return code.substring(3);
  }

  // Extraire le chiffre du code (ex: 'Digit1' -> '1')
  if (code.startsWith('Digit')) {
    return code.substring(5);
  }

  return code;
}

/**
 * Obtenir la touche physique correspondant à un caractère dans un layout
 * Ex: 'W' en QWERTY -> 'KeyW', 'W' en AZERTY -> 'KeyZ'
 */
export function getPhysicalKey(character: string, layout: KeyboardLayout): string {
  const char = character.toUpperCase();

  if (layout === KeyboardLayout.AZERTY) {
    const reverseMap: Record<string, string> = {
      'A': 'KeyQ',
      'Z': 'KeyW',
      'Q': 'KeyA',
      'W': 'KeyZ',
      ',': 'KeyM',
      'M': 'Semicolon',
    };
    if (reverseMap[char]) {
      return reverseMap[char];
    }
  }

  if (layout === KeyboardLayout.QWERTZ) {
    const reverseMap: Record<string, string> = {
      'Z': 'KeyY',
      'Y': 'KeyZ',
    };
    if (reverseMap[char]) {
      return reverseMap[char];
    }
  }

  // Par défaut, retourner Key + character
  if (char.length === 1 && /[A-Z]/.test(char)) {
    return `Key${char}`;
  }

  return character;
}
