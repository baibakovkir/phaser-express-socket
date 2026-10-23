import Phaser from 'phaser';
import { BASES, BOSS, CAMPS, LANES, MAP_HEIGHT, MAP_WIDTH } from '@moba/shared/map';

export const TERRAIN_NAMES = ['grass', 'stone', 'dirt', 'water'] as const;

export function terrainUrl(name: typeof TERRAIN_NAMES[number]): string {
  return `${import.meta.env.BASE_URL}assets/sengoku/terrain/${name}.webp`;
}

function route(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], width: number,
  style: string | CanvasPattern): void {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = style;
  ctx.stroke();
}

function patternedCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number,
  pattern: CanvasPattern): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = pattern;
  ctx.fill();
}

export function registerArenaTerrain(scene: Phaser.Scene): void {
  if (scene.textures.exists('arena-map')) return;
  const canvas = document.createElement('canvas');
  canvas.width = MAP_WIDTH / 2;
  canvas.height = MAP_HEIGHT / 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(0.5, 0.5);

  const pattern = (name: typeof TERRAIN_NAMES[number]): CanvasPattern => {
    const source = scene.textures.get(`terrain-${name}`).getSourceImage();
    if (!(source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)) {
      throw new Error(`Missing ${name} terrain image`);
    }
    const result = ctx.createPattern(source, 'repeat');
    if (!result) throw new Error(`Could not create ${name} terrain pattern`);
    return result;
  };
  const grass = pattern('grass');
  const stone = pattern('stone');
  const dirt = pattern('dirt');
  const water = pattern('water');

  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.fillStyle = '#15302b55';
  ctx.fillRect(0, 0, MAP_WIDTH, 990);

  const stream = [{ x: 180, y: 770 }, { x: 740, y: 680 }, { x: 1390, y: 770 },
    { x: 1950, y: 620 }, { x: 2600, y: 750 }, { x: 3100, y: 690 }];
  route(ctx, stream, 96, '#183940');
  route(ctx, stream, 72, water);

  for (const lane of LANES) {
    route(ctx, lane.path, 206, '#1c302d');
    route(ctx, lane.path, 184, dirt);
    route(ctx, lane.path, 149, stone);
    route(ctx, lane.path, 4, '#d4c5a4');
  }
  for (const camp of CAMPS) patternedCircle(ctx, camp.x, camp.y, 79, dirt);
  patternedCircle(ctx, BOSS.x, BOSS.y, 119, dirt);
  for (const team of [1, 2] as const) {
    const base = BASES[team];
    patternedCircle(ctx, base.x + (team === 1 ? -75 : 75), base.y + (team === 1 ? 65 : -65), 180, stone);
  }
  scene.textures.addCanvas('arena-map', canvas);
}
