/**
 * Types of power-ups
 * - boost: Temporary speed boost
 * - shield: Protection from one attack
 * - oil: Drops an oil slick on the track
 * - missile: Slows down the racer ahead
 */
export type PowerUpType = 'boost' | 'shield' | 'oil' | 'missile';

/**
 * PowerUp interface
 */
export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: {
    x: number;
    y: number;
  };
  active: boolean;
  duration: number; // ms
}

/**
 * Create a power-up
 */
export const createPowerUp = (
  type: PowerUpType,
  position: { x: number, y: number }
): PowerUp => {
  return {
    id: `power-up-${Date.now()}`,
    type,
    position,
    active: true,
    duration: getPowerUpDuration(type)
  };
};

/**
 * Get the default duration for a power-up type
 */
export const getPowerUpDuration = (type: PowerUpType): number => {
  switch(type) {
    case 'boost':
      return 3000;  // 3 seconds
    case 'shield':
      return 5000;  // 5 seconds
    case 'oil':
      return 7000;  // 7 seconds (how long oil slick lasts)
    case 'missile':
      return 0;     // Instant effect
    default:
      return 5000;  // Default duration
  }
}; 