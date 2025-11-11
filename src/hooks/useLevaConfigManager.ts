/**
 * Hook Leva pour gérer la sauvegarde et le chargement de toutes les configurations
 *
 * Ce système permet de:
 * - Sauvegarder toutes les options du menu Leva en un clic
 * - Charger des configurations sauvegardées
 * - Sauvegarder/charger des sections individuelles (pour éviter de tout perdre lors des mises à jour)
 */

import { button, useControls } from 'leva';
import { useCallback, useRef } from 'react';

// Version du schéma de configuration (à incrémenter lors de changements majeurs)
const CONFIG_VERSION = '1.0.0';

export interface LevaConfig {
  version: string;
  timestamp: string;
  sections: {
    inputSettings?: Record<string, any>;
    keyBindings?: Record<string, any>;
    debugAim?: Record<string, any>;
    debugRifle?: Record<string, any>;
    character?: Record<string, any>;
    characterPhysics?: Record<string, any>;
    cameraSettings?: Record<string, any>;
    lighting?: Record<string, any>;
    postProcessing?: Record<string, any>;
    balls?: Record<string, any>;
  };
}

export function useLevaConfigManager() {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Récupère toutes les configurations Leva actuelles depuis le localStorage de Leva
   */
  const getAllLevaConfigs = useCallback((): Record<string, any> => {
    const levaStore: Record<string, any> = {};

    // Leva stocke ses valeurs dans le localStorage avec le préfixe "leva__"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('leva__')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            levaStore[key] = JSON.parse(value);
          }
        } catch (e) {
          console.warn(`[LevaConfigManager] Failed to parse ${key}:`, e);
        }
      }
    }

    return levaStore;
  }, []);

  /**
   * Crée un fichier de configuration complet
   */
  const createConfigFile = useCallback((): LevaConfig => {
    const allConfigs = getAllLevaConfigs();

    return {
      version: CONFIG_VERSION,
      timestamp: new Date().toISOString(),
      sections: {
        inputSettings: allConfigs['leva__Input Settings'],
        keyBindings: allConfigs['leva__🎮 Key Bindings'],
        debugAim: allConfigs['leva__🔧 Debug - Aim'],
        debugRifle: allConfigs['leva__🔧 Debug - Rifle Position'],
        character: allConfigs['leva__🎯 Character'],
        characterPhysics: allConfigs['leva__🎯 Character Physics'],
        cameraSettings: allConfigs['leva__📷 Camera Settings'],
        lighting: allConfigs['leva__🎨 Lighting'],
        postProcessing: allConfigs['leva__🎨 Post Processing'],
        balls: allConfigs['leva__🎨 Balls'],
      },
    };
  }, [getAllLevaConfigs]);

  /**
   * Télécharge la configuration complète
   */
  const downloadFullConfig = useCallback(() => {
    const config = createConfigFile();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leva-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[LevaConfigManager] Configuration downloaded successfully');
  }, [createConfigFile]);

  /**
   * Télécharge une section spécifique
   */
  const downloadSection = useCallback((sectionName: string, sectionKey: string) => {
    const allConfigs = getAllLevaConfigs();
    const sectionData = allConfigs[sectionKey];

    if (!sectionData) {
      console.warn(`[LevaConfigManager] Section ${sectionName} not found`);
      return;
    }

    const config = {
      version: CONFIG_VERSION,
      timestamp: new Date().toISOString(),
      section: sectionName,
      data: sectionData,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leva-${sectionName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[LevaConfigManager] Section "${sectionName}" downloaded successfully`);
  }, [getAllLevaConfigs]);

  /**
   * Charge une configuration depuis un fichier
   */
  const loadConfig = useCallback((configData: LevaConfig | any) => {
    try {
      // Vérifier si c'est une configuration complète ou une section
      if (configData.sections) {
        // Configuration complète
        const sections = configData.sections;

        // Charger chaque section si elle existe
        if (sections.inputSettings) localStorage.setItem('leva__Input Settings', JSON.stringify(sections.inputSettings));
        if (sections.keyBindings) localStorage.setItem('leva__🎮 Key Bindings', JSON.stringify(sections.keyBindings));
        if (sections.debugAim) localStorage.setItem('leva__🔧 Debug - Aim', JSON.stringify(sections.debugAim));
        if (sections.debugRifle) localStorage.setItem('leva__🔧 Debug - Rifle Position', JSON.stringify(sections.debugRifle));
        if (sections.character) localStorage.setItem('leva__🎯 Character', JSON.stringify(sections.character));
        if (sections.characterPhysics) localStorage.setItem('leva__🎯 Character Physics', JSON.stringify(sections.characterPhysics));
        if (sections.cameraSettings) localStorage.setItem('leva__📷 Camera Settings', JSON.stringify(sections.cameraSettings));
        if (sections.lighting) localStorage.setItem('leva__🎨 Lighting', JSON.stringify(sections.lighting));
        if (sections.postProcessing) localStorage.setItem('leva__🎨 Post Processing', JSON.stringify(sections.postProcessing));
        if (sections.balls) localStorage.setItem('leva__🎨 Balls', JSON.stringify(sections.balls));

        console.log('[LevaConfigManager] Full configuration loaded successfully');
        alert('✓ Configuration complète chargée!\n\nActualisez la page (F5) pour appliquer les changements.');
      } else if (configData.section && configData.data) {
        // Configuration d'une section spécifique
        const sectionKey = getSectionKey(configData.section);
        if (sectionKey) {
          localStorage.setItem(sectionKey, JSON.stringify(configData.data));
          console.log(`[LevaConfigManager] Section "${configData.section}" loaded successfully`);
          alert(`✓ Section "${configData.section}" chargée!\n\nActualisez la page (F5) pour appliquer les changements.`);
        }
      }
    } catch (e) {
      console.error('[LevaConfigManager] Failed to load configuration:', e);
      alert('❌ Erreur lors du chargement de la configuration');
    }
  }, []);

  /**
   * Obtenir la clé localStorage pour une section
   */
  const getSectionKey = (sectionName: string): string | null => {
    const mapping: Record<string, string> = {
      'inputSettings': 'leva__Input Settings',
      'keyBindings': 'leva__🎮 Key Bindings',
      'debugAim': 'leva__🔧 Debug - Aim',
      'debugRifle': 'leva__🔧 Debug - Rifle Position',
      'character': 'leva__🎯 Character',
      'characterPhysics': 'leva__🎯 Character Physics',
      'cameraSettings': 'leva__📷 Camera Settings',
      'lighting': 'leva__🎨 Lighting',
      'postProcessing': 'leva__🎨 Post Processing',
      'balls': 'leva__🎨 Balls',
    };
    return mapping[sectionName] || null;
  };

  /**
   * Gère le chargement depuis un fichier
   */
  const handleFileUpload = useCallback((event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);
        loadConfig(configData);
      } catch (error) {
        console.error('[LevaConfigManager] Failed to parse config file:', error);
        alert('❌ Fichier de configuration invalide');
      }
    };
    reader.readAsText(file);

    // Reset input pour permettre de recharger le même fichier
    input.value = '';
  }, [loadConfig]);

  /**
   * Crée l'input file caché pour le chargement
   */
  const createUploadInput = useCallback(() => {
    if (!uploadInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      input.addEventListener('change', handleFileUpload);
      document.body.appendChild(input);
      uploadInputRef.current = input;
    }
    return uploadInputRef.current;
  }, [handleFileUpload]);

  /**
   * Déclenche le sélecteur de fichier
   */
  const uploadConfig = useCallback(() => {
    const input = createUploadInput();
    input.click();
  }, [createUploadInput]);

  /**
   * Réinitialise toutes les configurations
   */
  const resetAllConfigs = useCallback(() => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser TOUTES les configurations Leva?\n\nCette action est irréversible.')) {
      return;
    }

    // Supprimer toutes les clés Leva du localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('leva__')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('[LevaConfigManager] All configurations reset');
    alert('✓ Toutes les configurations ont été réinitialisées!\n\nActualisez la page (F5) pour appliquer les changements.');
  }, []);

  // Contrôles Leva pour la gestion des configurations
  useControls('💾 Config Manager', {
    '─── 🌍 Configuration Complète ───': { value: '', disabled: true },

    '💾 Save All': button(() => downloadFullConfig(), {
      label: '💾 Save All Configs',
    }),

    '📂 Load All': button(() => uploadConfig(), {
      label: '📂 Load All Configs',
    }),

    '─── ⚠️ Danger Zone ───': { value: '', disabled: true },

    '↻ Reset ALL': button(() => resetAllConfigs(), {
      label: '↻ Reset All Configs',
    }),

    '─── ℹ️ Info ───': { value: '', disabled: true },

    'Help': {
      value: 'Each section has its own Save/Load/Drop buttons below',
      disabled: true,
    },
  }, { collapsed: false });

  return {
    downloadFullConfig,
    uploadConfig,
    downloadSection,
    resetAllConfigs,
  };
}
