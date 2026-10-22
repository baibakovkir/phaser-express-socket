export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 2000;
export const TICKS_PER_SECOND = 30;
export const LANE_WAVE_TICKS = 30 * TICKS_PER_SECOND;
export const JUNGLE_SPAWN_TICKS = 60 * TICKS_PER_SECOND;
export const BOSS_SPAWN_TICKS = 120 * TICKS_PER_SECOND;

export const BASES = {
  1: { x: 260, y: 1710 },
  2: { x: 2940, y: 290 },
};

// Each route goes from blue to red. The shared wilderness lies between them.
export const LANES = [
  { id: 1, name: 'Temple Path', points: [
    { x: 320, y: 1640 }, { x: 430, y: 1210 }, { x: 960, y: 760 },
    { x: 1710, y: 530 }, { x: 2390, y: 420 }, { x: 2880, y: 360 },
  ] },
  { id: 2, name: 'River Path', points: [
    { x: 320, y: 1640 }, { x: 820, y: 1650 }, { x: 1490, y: 1530 },
    { x: 2150, y: 1190 }, { x: 2680, y: 750 }, { x: 2880, y: 360 },
  ] },
];

export const CAMPS = [
  { id: 1, x: 980, y: 1140 },
  { id: 2, x: 1370, y: 1150 },
  { id: 3, x: 1830, y: 850 },
  { id: 4, x: 2230, y: 850 },
];

export const SHRINES = [
  { x: 1250, y: 990 },
  { x: 1970, y: 1050 },
];

export const BOSS = { x: 1600, y: 1000 };

export function nextSpawnSecond(tick, intervalTicks) {
  return (Math.floor(tick / intervalTicks) + 1) * intervalTicks / TICKS_PER_SECOND;
}
