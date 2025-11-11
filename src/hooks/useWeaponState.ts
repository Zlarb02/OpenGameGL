import { useEffect, useState, useRef } from 'react';
import { useInput, GameAction } from '../systems/input';
import { useInventory } from '../contexts/InventoryContext';

export function useWeaponState() {
  const { inputManager, options } = useInput();
  const { hasItem } = useInventory();
  const [weaponEquipped, setWeaponEquipped] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const stowPressTime = useRef<number>(0);
  const stowCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const aimingRef = useRef(isAiming);
  const crouchingRef = useRef(isCrouching);
  const weaponEquippedRef = useRef(weaponEquipped);

  // Sync refs with state
  useEffect(() => {
    aimingRef.current = isAiming;
  }, [isAiming]);

  useEffect(() => {
    crouchingRef.current = isCrouching;
  }, [isCrouching]);

  useEffect(() => {
    weaponEquippedRef.current = weaponEquipped;
  }, [weaponEquipped]);

  // Empêcher le menu contextuel sur clic droit quand l'arme est équipée
  useEffect(() => {
    if (weaponEquipped) {
      const handleContextMenu = (e: Event) => {
        e.preventDefault();
      };
      window.addEventListener('contextmenu', handleContextMenu);
      return () => window.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [weaponEquipped]);

  // Setup event listeners for weapon actions
  useEffect(() => {
    // Toggle rifle avec slot 1 - only on justPressed
    const handleQuickSlot = (state: any) => {
      if (state.justPressed) {
        // Vérifier si on a au moins un rifle dans l'inventaire
        if (!hasItem('rifle')) {
          console.log('❌ Pas de rifle dans l\'inventaire !');
          return;
        }
        setWeaponEquipped(prev => !prev);
      }
    };

    // Stow weapon logic - check hold duration
    const handleStowPress = (state: any) => {
      if (state.justPressed) {
        stowPressTime.current = Date.now();

        // Start checking if held long enough
        stowCheckInterval.current = setInterval(() => {
          if (inputManager.isActionPressed(GameAction.STOW_WEAPON)) {
            if (Date.now() - stowPressTime.current > 300) {
              // Vérifier si on a au moins un rifle dans l'inventaire
              if (!hasItem('rifle')) {
                console.log('❌ Pas de rifle dans l\'inventaire !');
                stowPressTime.current = 0;
                if (stowCheckInterval.current) {
                  clearInterval(stowCheckInterval.current);
                  stowCheckInterval.current = null;
                }
                return;
              }
              setWeaponEquipped(prev => !prev);
              stowPressTime.current = 0;
              if (stowCheckInterval.current) {
                clearInterval(stowCheckInterval.current);
                stowCheckInterval.current = null;
              }
            }
          }
        }, 50);
      }

      if (state.justReleased) {
        stowPressTime.current = 0;
        if (stowCheckInterval.current) {
          clearInterval(stowCheckInterval.current);
          stowCheckInterval.current = null;
        }
      }
    };

    // Aim logic
    const handleAim = (state: any) => {
      if (!weaponEquippedRef.current) return;

      if (options.aimMode === 'hold') {
        setIsAiming(state.pressed);
      } else {
        // Toggle mode
        if (state.justPressed) {
          setIsAiming(prev => !prev);
        }
      }
    };

    // Fire logic
    const handleFire = (state: any) => {
      if (!weaponEquippedRef.current) return;

      if (state.justPressed) {
        setIsShooting(true);
        setTimeout(() => setIsShooting(false), 500);
      }
    };

    // Reload logic
    const handleReload = (state: any) => {
      if (!weaponEquippedRef.current) return;

      if (state.justPressed) {
        setIsReloading(true);
        setTimeout(() => setIsReloading(false), 2000);
      }
    };

    // Crouch logic
    const handleCrouch = (state: any) => {
      if (options.crouchMode === 'toggle') {
        if (state.justPressed) {
          setIsCrouching(prev => !prev);
        }
      } else {
        // Hold mode
        setIsCrouching(state.pressed);
      }
    };

    // Register all listeners
    inputManager.addEventListener(GameAction.QUICK_SLOT_1, handleQuickSlot);
    inputManager.addEventListener(GameAction.STOW_WEAPON, handleStowPress);
    inputManager.addEventListener(GameAction.AIM, handleAim);
    inputManager.addEventListener(GameAction.FIRE, handleFire);
    inputManager.addEventListener(GameAction.RELOAD, handleReload);
    inputManager.addEventListener(GameAction.CROUCH, handleCrouch);

    // Cleanup
    return () => {
      inputManager.removeEventListener(GameAction.QUICK_SLOT_1, handleQuickSlot);
      inputManager.removeEventListener(GameAction.STOW_WEAPON, handleStowPress);
      inputManager.removeEventListener(GameAction.AIM, handleAim);
      inputManager.removeEventListener(GameAction.FIRE, handleFire);
      inputManager.removeEventListener(GameAction.RELOAD, handleReload);
      inputManager.removeEventListener(GameAction.CROUCH, handleCrouch);

      // Clear any pending stow interval
      if (stowCheckInterval.current) {
        clearInterval(stowCheckInterval.current);
      }
    };
  }, [inputManager, options.aimMode, options.crouchMode, hasItem]);

  // Fonction pour équiper/déséquiper le rifle programmatiquement
  const equipWeapon = (equipped: boolean) => {
    // Si on essaie d'équiper, vérifier qu'on a un rifle
    if (equipped && !hasItem('rifle')) {
      console.log('❌ Pas de rifle dans l\'inventaire !');
      return;
    }
    setWeaponEquipped(equipped);
  };

  return {
    weaponEquipped,
    isAiming,
    isShooting,
    isCrouching,
    isReloading,
    equipWeapon,
  };
}
