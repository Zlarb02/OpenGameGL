import './Crosshair.css';
import { useWeaponState } from '../../../character/player/tps/weapons/useWeaponState';

interface CrosshairProps {
  size?: number;
  gap?: number;
  thickness?: number;
  color?: string;
  opacity?: number;
}

/**
 * Classic FPS crosshair - Simple + shape
 * Designed to work with hit markers that appear around it
 * Becomes 2x more precise when aiming
 */
export function Crosshair({
  size = 8,
  gap = 4,
  thickness = 2,
  color = '#FFFFFF',
  opacity = 0.8
}: CrosshairProps) {
  const { isAiming, weaponEquipped } = useWeaponState();

  // Réduire la taille et le gap de moitié quand on vise
  const isAimingActive = weaponEquipped && isAiming;
  const actualSize = isAimingActive ? size * 0.5 : size;
  const actualGap = isAimingActive ? gap * 0.5 : gap;

  const lineStyle: React.CSSProperties = {
    backgroundColor: color,
    opacity,
    transition: 'all 0.15s ease-out' // Smooth transition
  };

  return (
    <div className="crosshair">
      {/* Top line */}
      <div
        className="crosshair-line crosshair-top"
        style={{
          ...lineStyle,
          width: `${thickness}px`,
          height: `${actualSize}px`,
          top: `-${actualSize + actualGap}px`,
          left: `-${thickness / 2}px`
        }}
      />

      {/* Bottom line */}
      <div
        className="crosshair-line crosshair-bottom"
        style={{
          ...lineStyle,
          width: `${thickness}px`,
          height: `${actualSize}px`,
          top: `${actualGap}px`,
          left: `-${thickness / 2}px`
        }}
      />

      {/* Left line */}
      <div
        className="crosshair-line crosshair-left"
        style={{
          ...lineStyle,
          width: `${actualSize}px`,
          height: `${thickness}px`,
          left: `-${actualSize + actualGap}px`,
          top: `-${thickness / 2}px`
        }}
      />

      {/* Right line */}
      <div
        className="crosshair-line crosshair-right"
        style={{
          ...lineStyle,
          width: `${actualSize}px`,
          height: `${thickness}px`,
          left: `${actualGap}px`,
          top: `-${thickness / 2}px`
        }}
      />

      {/* Optional center dot */}
      <div
        className="crosshair-center"
        style={{
          ...lineStyle,
          width: `${thickness}px`,
          height: `${thickness}px`,
          top: `-${thickness / 2}px`,
          left: `-${thickness / 2}px`,
          opacity: opacity * 0.5
        }}
      />
    </div>
  );
}
