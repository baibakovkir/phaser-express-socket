export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 2000;
export const TICKS_PER_SECOND = 30;
export const LANE_WAVE_TICKS = 30 * TICKS_PER_SECOND;
export const JUNGLE_SPAWN_TICKS = 60 * TICKS_PER_SECOND;
export const BOSS_SPAWN_TICKS = 120 * TICKS_PER_SECOND;

export const BASES = {
  1: { x: 260, y: 1710 },
  2: { x: 2940, y: 1710 },
};

function smoothPath(points, steps = 12) {
  const path = [];
  for (let index = 0; index < points.length - 1; index++) {
    const before = points[Math.max(0, index - 1)];
    const start = points[index];
    const end = points[index + 1];
    const after = points[Math.min(points.length - 1, index + 2)];
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      const curve = (a, b, c, d) => 0.5 * (
        2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t +
        (-a + 3 * b - 3 * c + d) * t * t * t
      );
      path.push({ x: curve(before.x, start.x, end.x, after.x), y: curve(before.y, start.y, end.y, after.y) });
    }
  }
  path.push(points.at(-1));
  return path;
}

const laneRoutes = [
  { id: 1, name: 'Mid', points: [
    { x: 320, y: 1640 }, { x: 560, y: 1320 }, { x: 1030, y: 1120 },
    { x: 1600, y: 1070 }, { x: 2170, y: 1120 }, { x: 2640, y: 1320 },
    { x: 2880, y: 1640 },
  ] },
  { id: 2, name: 'Bottom', points: [
    { x: 320, y: 1640 }, { x: 790, y: 1730 }, { x: 1340, y: 1770 },
    { x: 1860, y: 1770 }, { x: 2410, y: 1730 }, { x: 2880, y: 1640 },
  ] },
];

export const LANES = laneRoutes.map(lane => ({ ...lane, path: smoothPath(lane.points) }));

export const CAMPS = [
  { id: 1, x: 760, y: 610 },
  { id: 2, x: 1170, y: 390 },
  { id: 3, x: 1610, y: 700 },
  { id: 4, x: 2040, y: 380 },
  { id: 5, x: 2470, y: 610 },
];

export const SHRINES = [
  { x: 1080, y: 840 },
  { x: 2120, y: 840 },
];

export const BOSS = { x: 1600, y: 350 };

export function nextSpawnSecond(tick, intervalTicks) {
  return (Math.floor(tick / intervalTicks) + 1) * intervalTicks / TICKS_PER_SECOND;
}
