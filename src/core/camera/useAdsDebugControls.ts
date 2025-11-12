import { useControls, button } from 'leva';
import { useWeaponState } from '../../character/player/tps/weapons/useWeaponState';

/**
 * Panneau de debug Leva pour contrôler l'ADS (Aim Down Sights)
 * Permet de toggle la visée pour tester les offsets de caméra
 */
export function useAdsDebugControls() {
  const { isAiming, weaponEquipped, equipWeapon, toggleAiming } = useWeaponState();

  useControls('🎯 ADS Debug', {
    'Weapon Status': {
      value: weaponEquipped ? '✅ Equipped' : '❌ Not Equipped',
      disabled: true,
    },
    'Aiming Status': {
      value: isAiming ? '🎯 AIMING' : '⭕ Not Aiming',
      disabled: true,
    },
    'Toggle Weapon': button(() => {
      equipWeapon(!weaponEquipped);
    }),
    'Toggle Aim': button(() => {
      toggleAiming();
    }),
    'Info': {
      value: 'Right Click to aim normally',
      disabled: true,
    }
  }, { collapsed: false });
}
