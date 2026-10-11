export const DEFAULTS = Object.freeze({ speed: 5.8, acceleration: 55, deceleration: 65,
  attackSpeed: 1, attackRange: 1.85, hitstop: 0.045, dodgeDistance: 2.6,
  invincibility: 0.19, laneTime: 0.22, laneDistance: 2.4,
  pitch: 24, zoom: 1, follow: 9, screenPosition: 0.38 });
export const config = { ...DEFAULTS };
export const STAGE_END = 66;
export const FIXED_DT = 1 / 120;
export const FRONT = 0, BACK = 1;
export const laneZ = lane => (lane === FRONT ? 1 : -1) * config.laneDistance / 2;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const approach = (a, b, d) => a < b ? Math.min(a + d, b) : Math.max(a - d, b);
export const smooth = t => t * t * (3 - 2 * t);
export const COMBO = [
  { windup: .07, active: .13, recovery: .16, damage: 24, knockback: .5 },
  { windup: .08, active: .13, recovery: .17, damage: 28, knockback: .55 },
  { windup: .13, active: .16, recovery: .22, damage: 42, knockback: 1.1 }
];
