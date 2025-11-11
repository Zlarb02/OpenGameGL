import { useWeaponState } from '../../character/player/tps/weapons/useWeaponState';

export function Crosshair() {
  const { weaponEquipped } = useWeaponState();

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
      <div className="relative w-8 h-8">
        {/* Center dot - toujours visible */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/90 rounded-full" />

        {/* Crosshair complet seulement avec arme équipée */}
        {weaponEquipped && (
          <>
            {/* Top line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/70" />

            {/* Bottom line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/70" />

            {/* Left line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/70" />

            {/* Right line */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/70" />
          </>
        )}
      </div>
    </div>
  );
}
