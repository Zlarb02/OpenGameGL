/**
 * Utilitaire pour gérer la sauvegarde/chargement/drop de sections Leva individuelles
 */

import { button } from 'leva';

const CONFIG_VERSION = '1.0.0';

/**
 * Crée une zone de drop pour une section Leva
 */
function createDropZone(sectionName: string, sectionKey: string, onLoadComplete: () => void): HTMLDivElement {
  const dropZone = document.createElement('div');
  dropZone.style.cssText = `
    position: relative;
    padding: 1.5rem;
    margin: 0.5rem 0;
    border: 2px dashed #4a5568;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.85rem;
    color: #a0aec0;
  `;

  dropZone.innerHTML = `
    <div style="pointer-events: none;">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📂</div>
      <div>Drop config file here</div>
      <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 0.25rem;">or click to browse</div>
    </div>
  `;

  // État pour l'hover
  let isDragging = false;

  // Drag over
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      isDragging = true;
      dropZone.style.borderColor = '#3b82f6';
      dropZone.style.background = 'rgba(59, 130, 246, 0.1)';
    }
  });

  // Drag leave
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    dropZone.style.borderColor = '#4a5568';
    dropZone.style.background = 'rgba(255, 255, 255, 0.02)';
  });

  // Drop
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    dropZone.style.borderColor = '#4a5568';
    dropZone.style.background = 'rgba(255, 255, 255, 0.02)';

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        loadConfigFromFile(file, sectionKey, sectionName, onLoadComplete);
      } else {
        showNotification('❌ Please drop a JSON file', 'error');
      }
    }
  });

  // Click to browse
  dropZone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        loadConfigFromFile(file, sectionKey, sectionName, onLoadComplete);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });

  return dropZone;
}

/**
 * Charge une configuration depuis un fichier
 */
function loadConfigFromFile(
  file: File,
  sectionKey: string,
  sectionName: string,
  onComplete: () => void
) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const configData = JSON.parse(e.target?.result as string);

      // Vérifier si c'est une configuration de section ou complète
      if (configData.section && configData.data) {
        // Configuration de section
        localStorage.setItem(sectionKey, JSON.stringify(configData.data));
        showNotification(`✓ "${sectionName}" loaded!`, 'success');
        setTimeout(() => {
          showReloadPrompt();
        }, 500);
        onComplete();
      } else if (configData.sections && configData.sections[getSectionKeyFromStorageKey(sectionKey)]) {
        // Configuration complète, extraire la section
        const sectionData = configData.sections[getSectionKeyFromStorageKey(sectionKey)];
        localStorage.setItem(sectionKey, JSON.stringify(sectionData));
        showNotification(`✓ "${sectionName}" loaded from full config!`, 'success');
        setTimeout(() => {
          showReloadPrompt();
        }, 500);
        onComplete();
      } else {
        showNotification(`❌ No data found for "${sectionName}"`, 'error');
      }
    } catch (error) {
      console.error('[LevaSectionManager] Failed to load config:', error);
      showNotification('❌ Invalid config file', 'error');
    }
  };

  reader.readAsText(file);
}

/**
 * Convertit une clé de localStorage en clé de section
 */
function getSectionKeyFromStorageKey(storageKey: string): string {
  const mapping: Record<string, string> = {
    'leva__Input Settings': 'inputSettings',
    'leva__🎮 Key Bindings': 'keyBindings',
    'leva__🔧 Debug - Aim': 'debugAim',
    'leva__🔧 Debug - Rifle Position': 'debugRifle',
    'leva__🎯 Character': 'character',
    'leva__🎯 Character Physics': 'characterPhysics',
    'leva__📷 Camera Settings': 'cameraSettings',
    'leva__🎨 Lighting': 'lighting',
    'leva__🎨 Post Processing': 'postProcessing',
    'leva__🎨 Balls': 'balls',
  };
  return mapping[storageKey] || '';
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message: string, type: 'success' | 'error') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  // Ajouter l'animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
}

/**
 * Affiche un prompt pour recharger la page
 */
function showReloadPrompt() {
  const prompt = document.createElement('div');
  prompt.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    text-align: center;
    z-index: 10002;
    border: 2px solid #3b82f6;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;

  prompt.innerHTML = `
    <div style="font-size: 1.3rem; margin-bottom: 1rem;">🔄 Reload Required</div>
    <p style="margin: 0 0 1.5rem 0; opacity: 0.9;">Refresh the page to apply changes</p>
    <button id="reloadBtn" style="
      padding: 0.75rem 2rem;
      background: #3b82f6;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    ">
      Reload Now (F5)
    </button>
  `;

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10001;
    backdrop-filter: blur(4px);
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(prompt);

  document.getElementById('reloadBtn')!.addEventListener('click', () => {
    window.location.reload();
  });

  // Fermer avec ESC
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.body.removeChild(backdrop);
      document.body.removeChild(prompt);
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);
}

/**
 * Télécharge la configuration d'une section
 */
function downloadSection(sectionName: string, sectionKey: string) {
  const data = localStorage.getItem(sectionKey);

  if (!data) {
    showNotification(`❌ No data for "${sectionName}"`, 'error');
    return;
  }

  const config = {
    version: CONFIG_VERSION,
    timestamp: new Date().toISOString(),
    section: getSectionKeyFromStorageKey(sectionKey),
    sectionName: sectionName,
    data: JSON.parse(data),
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leva-${sectionName.toLowerCase().replace(/[^\w]+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(`✓ "${sectionName}" saved!`, 'success');
}

/**
 * Crée les contrôles de sauvegarde/chargement pour une section
 * À utiliser dans chaque hook useControls
 */
export function createSectionControls(sectionName: string, sectionKey: string, forceUpdate?: () => void) {
  let dropZoneElement: HTMLDivElement | null = null;

  const handleLoad = () => {
    if (forceUpdate) forceUpdate();
  };

  return {
    '─── 💾 Section Config ───': { value: '', disabled: true },

    '💾 Save': button(() => {
      downloadSection(sectionName, sectionKey);
    }, {
      label: '💾 Save Section',
    }),

    '📂 Load': button(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';

      input.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          loadConfigFromFile(file, sectionKey, sectionName, handleLoad);
        }
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    }, {
      label: '📂 Load Section',
    }),

    '📥 Drop Zone': button(() => {
      // Créer ou toggle la drop zone
      if (dropZoneElement && document.body.contains(dropZoneElement)) {
        document.body.removeChild(dropZoneElement);
        dropZoneElement = null;
        return;
      }

      // Trouver le panneau Leva de cette section
      const levaRoot = document.querySelector('.leva-c-kWgxhW-kkEqvp-depth-0');
      if (!levaRoot) {
        console.warn('[LevaSectionManager] Leva root not found');
        return;
      }

      // Créer la drop zone et l'insérer après le panneau
      dropZoneElement = createDropZone(sectionName, sectionKey, handleLoad);

      // Style pour positionner la drop zone
      dropZoneElement.style.position = 'fixed';
      dropZoneElement.style.bottom = '20px';
      dropZoneElement.style.right = '20px';
      dropZoneElement.style.width = '300px';
      dropZoneElement.style.zIndex = '10000';

      document.body.appendChild(dropZoneElement);

      // Fermer automatiquement après 30 secondes
      setTimeout(() => {
        if (dropZoneElement && document.body.contains(dropZoneElement)) {
          document.body.removeChild(dropZoneElement);
          dropZoneElement = null;
        }
      }, 30000);
    }, {
      label: '📥 Toggle Drop Zone',
    }),
  };
}
