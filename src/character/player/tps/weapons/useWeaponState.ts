import { useEffect, useState, useRef, useCallback } from 'react';
import { useInput, GameAction } from '../../../../core/input';
import { useInventory } from '../../inventory/InventoryContext';
import { useEquipment } from '../../equipment/EquipmentContext';
import { EquipmentSlotType } from '../../equipment/types/EquipmentTypes';
import { useShootingCooldown } from './useShootingCooldown';

export function useWeaponState() {
  const { inputManager, options } = useInput();
  const { hasItem } = useInventory();
  const { getWieldedSlot, wield, stow, getEquipped, equippedItemsVersion } = useEquipment();
  const [weaponEquipped, setWeaponEquipped] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Shooting cooldown (600ms = typical shooting animation duration)
  const shootingCooldown = useShootingCooldown({ cooldownDuration: 600 });

  const aimingRef = useRef(isAiming);
  const crouchingRef = useRef(isCrouching);
  const weaponEquippedRef = useRef(weaponEquipped);

  // Sync weaponEquipped state with equipment system
  useEffect(() => {
    const wielded = getWieldedSlot();
    setWeaponEquipped(wielded !== null);
  }, [getWieldedSlot, equippedItemsVersion]);

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
    // NOTE: This is handled by useQuickSlotControls now, but kept for legacy compatibility
    const handleQuickSlot = async (state: any) => {
      if (state.justPressed) {
        const currentWieldedSlot = getWieldedSlot();

        if (currentWieldedSlot) {
          // Weapon wielded, stow it
          const success = await stow();
          if (success) {
            setWeaponEquipped(false);
          }
        } else {
          // No weapon wielded, try to wield from back slots
          const backLeft = getEquipped(EquipmentSlotType.BACK_LEFT);
          const backRight = getEquipped(EquipmentSlotType.BACK_RIGHT);

          if (backLeft) {
            const success = await wield(EquipmentSlotType.BACK_LEFT);
            if (success) {
              setWeaponEquipped(true);
            }
          } else if (backRight) {
            const success = await wield(EquipmentSlotType.BACK_RIGHT);
            if (success) {
              setWeaponEquipped(true);
            }
          } else {
            console.log('❌ Pas d\'arme équipée sur le dos !');
          }
        }
      }
    };

    // Stow weapon with hold detection - simple copy of handleQuickSlot logic
    const handleStowPress = async (state: any) => {
      if (state.pressed && !state.justReleased) {
        // Hold detected - toggle wield/stow
        const currentWieldedSlot = getWieldedSlot();

        if (currentWieldedSlot) {
          // Weapon wielded, stow it
          const success = await stow();
          if (success) {
            setWeaponEquipped(false);
          }
        } else {
          // No weapon wielded, try to wield from back slots
          const backLeft = getEquipped(EquipmentSlotType.BACK_LEFT);
          const backRight = getEquipped(EquipmentSlotType.BACK_RIGHT);

          if (backLeft) {
            const success = await wield(EquipmentSlotType.BACK_LEFT);
            if (success) {
              setWeaponEquipped(true);
            }
          } else if (backRight) {
            const success = await wield(EquipmentSlotType.BACK_RIGHT);
            if (success) {
              setWeaponEquipped(true);
            }
          } else {
            console.log('❌ Pas d\'arme équipée sur le dos !');
          }
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

    // Fire logic with cooldown
    const handleFire = (state: any) => {
      if (!weaponEquippedRef.current) return;

      if (state.justPressed && shootingCooldown.canShoot()) {
        setIsShooting(true);

        // Start cooldown based on animation duration (600ms)
        shootingCooldown.startCooldown(600);

        // Reset shooting state after a brief moment (just for trigger)
        setTimeout(() => setIsShooting(false), 100);
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
    // NOTE: STOW_WEAPON is now handled by useReloadStowControls (R key with tap/hold/long-hold)
    // inputManager.addEventListener(GameAction.STOW_WEAPON, handleStowPress);
    inputManager.addEventListener(GameAction.AIM, handleAim);
    inputManager.addEventListener(GameAction.FIRE, handleFire);
    // NOTE: RELOAD is now handled by useReloadStowControls (R tap when wielded)
    // inputManager.addEventListener(GameAction.RELOAD, handleReload);
    inputManager.addEventListener(GameAction.CROUCH, handleCrouch);

    // Cleanup
    return () => {
      inputManager.removeEventListener(GameAction.QUICK_SLOT_1, handleQuickSlot);
      // inputManager.removeEventListener(GameAction.STOW_WEAPON, handleStowPress);
      inputManager.removeEventListener(GameAction.AIM, handleAim);
      inputManager.removeEventListener(GameAction.FIRE, handleFire);
      // inputManager.removeEventListener(GameAction.RELOAD, handleReload);
      inputManager.removeEventListener(GameAction.CROUCH, handleCrouch);
    };
  }, [inputManager, options.aimMode, options.crouchMode, hasItem, getWieldedSlot, wield, stow, getEquipped]);

  // Fonction pour équiper/déséquiper le rifle programmatiquement
  const equipWeapon = async (equipped: boolean) => {
    if (equipped) {
      // Try to wield from back slots
      const backLeft = getEquipped(EquipmentSlotType.BACK_LEFT);
      const backRight = getEquipped(EquipmentSlotType.BACK_RIGHT);

      if (backLeft) {
        const success = await wield(EquipmentSlotType.BACK_LEFT);
        if (success) {
          setWeaponEquipped(true);
        }
      } else if (backRight) {
        const success = await wield(EquipmentSlotType.BACK_RIGHT);
        if (success) {
          setWeaponEquipped(true);
        }
      } else {
        console.log('❌ Pas d\'arme équipée sur le dos !');
      }
    } else {
      // Stow the weapon
      const success = await stow();
      if (success) {
        setWeaponEquipped(false);
      }
    }
  };

  // Fonction pour toggle la visée programmatiquement (pour debug)
  const toggleAiming = useCallback(() => {
    if (!weaponEquippedRef.current) return;
    setIsAiming(prev => !prev);
  }, []);

  return {
    weaponEquipped,
    isAiming,
    isShooting,
    isCrouching,
    isReloading,
    equipWeapon,
    toggleAiming,
  };
}
