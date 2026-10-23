import Phaser from 'phaser';

type Painter = (ctx: CanvasRenderingContext2D, size: number) => void;

function makeTexture(scene: Phaser.Scene, key: string, size: number, paint: Painter): void {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  paint(ctx, size);
  scene.textures.addCanvas(key, canvas);
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function shape(ctx: CanvasRenderingContext2D, points: number[], fill: string, stroke = '#283238'): void {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let index = 2; index < points.length; index += 2) ctx.lineTo(points[index], points[index + 1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function line(ctx: CanvasRenderingContext2D, points: number[], color: string, width: number): void {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let index = 2; index < points.length; index += 2) ctx.lineTo(points[index], points[index + 1]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function soldier(ctx: CanvasRenderingContext2D, _size: number, red: boolean): void {
  const armor = red ? '#a14e44' : '#527790';
  const cloth = red ? '#714040' : '#354f63';
  ellipse(ctx, 32, 57, 21, 4, '#192c2d66');
  shape(ctx, [23, 39, 42, 39, 44, 54, 20, 54], cloth);
  line(ctx, [25, 48, 21, 59], '#373b3b', 5);
  line(ctx, [39, 48, 43, 59], '#373b3b', 5);
  shape(ctx, [22, 36, 32, 31, 43, 36, 40, 48, 24, 48], armor);
  ellipse(ctx, 32, 30, 8, 9, '#d6b28a');
  shape(ctx, [17, 26, 32, 13, 48, 26, 46, 29, 18, 29], '#baa471');
  line(ctx, [47, 51, 52, 10], '#88643d', 3);
  shape(ctx, [52, 10, 49, 16, 56, 16], '#dce0d7');
  line(ctx, [24, 44, 18, 50], '#d5ae87', 5);
  line(ctx, [41, 44, 47, 49], '#d5ae87', 5);
  line(ctx, [27, 39, 38, 39], '#d6c088', 2);
}

function kodama(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 32, 56, 23, 5, '#17292266');
  shape(ctx, [15, 48, 13, 35, 23, 24, 42, 25, 52, 37, 48, 52, 32, 58], '#536c56');
  shape(ctx, [22, 27, 30, 12, 38, 27], '#708f62');
  shape(ctx, [38, 28, 48, 16, 49, 35], '#627d55');
  ellipse(ctx, 25, 38, 4, 5, '#e6c373');
  ellipse(ctx, 40, 38, 4, 5, '#e6c373');
  ellipse(ctx, 25, 38, 2, 3, '#2b3028');
  ellipse(ctx, 40, 38, 2, 3, '#2b3028');
  line(ctx, [25, 49, 37, 49], '#39473c', 3);
  line(ctx, [15, 45, 9, 53], '#748657', 7);
  line(ctx, [49, 45, 55, 53], '#748657', 7);
}

function oni(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 48, 87, 31, 7, '#271c1c77');
  shape(ctx, [25, 61, 36, 43, 63, 43, 73, 65, 62, 84, 30, 84], '#823a37');
  shape(ctx, [26, 43, 16, 52, 20, 66, 34, 58], '#4c4c50');
  shape(ctx, [65, 43, 79, 50, 75, 67, 61, 59], '#4c4c50');
  ellipse(ctx, 48, 37, 20, 19, '#b45145');
  shape(ctx, [31, 29, 26, 7, 42, 21], '#e6d2aa');
  shape(ctx, [65, 29, 70, 7, 54, 21], '#e6d2aa');
  ellipse(ctx, 40, 38, 3, 3, '#f7da83');
  ellipse(ctx, 56, 38, 3, 3, '#f7da83');
  shape(ctx, [39, 49, 48, 57, 58, 49], '#51292b');
  shape(ctx, [41, 49, 44, 56, 48, 52], '#f6e4c3');
  shape(ctx, [55, 49, 52, 56, 49, 52], '#f6e4c3');
  line(ctx, [72, 65, 84, 21], '#614938', 8);
  line(ctx, [77, 29, 91, 33], '#353b42', 16);
  for (const x of [80, 88]) shape(ctx, [x, 21, x - 2, 15, x + 2, 21], '#d6c7a7');
  line(ctx, [33, 61, 61, 61], '#ddbb7c', 3);
}

function effect(ctx: CanvasRenderingContext2D, kind: string): void {
  const center = 32;
  if (kind === 'arrow') {
    line(ctx, [32, 55, 32, 14], '#dfc49a', 5);
    shape(ctx, [32, 7, 23, 24, 32, 20, 41, 24], '#eff1e9');
    shape(ctx, [32, 54, 23, 48, 32, 59, 41, 48], '#9a6b54');
  } else if (kind === 'slash') {
    ctx.strokeStyle = '#f8ead0';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(center, center, 23, -2.4, 0.8);
    ctx.stroke();
    ctx.strokeStyle = '#d9a667';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (kind === 'spark') {
    shape(ctx, [32, 3, 38, 24, 61, 32, 39, 38, 32, 61, 25, 38, 3, 32, 25, 24], '#d7f2e9', '#6ea9b4');
    ellipse(ctx, center, center, 8, 8, '#fff4bc');
  } else if (kind === 'flame') {
    shape(ctx, [32, 6, 43, 25, 50, 16, 53, 41, 44, 54, 25, 56, 13, 38, 24, 23], '#df6747', '#9a3c38');
    shape(ctx, [30, 25, 39, 37, 42, 51, 28, 54, 24, 42], '#f9cd77', '#e6a461');
  } else {
    ellipse(ctx, center, center, 24, 24, '#9de4bc99');
    shape(ctx, [27, 14, 37, 14, 37, 27, 50, 27, 50, 37, 37, 37, 37, 50, 27, 50, 27, 37, 14, 37, 14, 27, 27, 27], '#eaf5dd', '#8bcda6');
  }
}

export function registerArenaSprites(scene: Phaser.Scene): void {
  makeTexture(scene, 'arena-creep-blue', 64, (ctx, size) => soldier(ctx, size, false));
  makeTexture(scene, 'arena-creep-red', 64, (ctx, size) => soldier(ctx, size, true));
  makeTexture(scene, 'arena-neutral-ghost', 64, kodama);
  makeTexture(scene, 'arena-oni', 96, oni);
  for (const kind of ['arrow', 'slash', 'spark', 'flame', 'heal']) {
    makeTexture(scene, `arena-${kind}`, 64, ctx => effect(ctx, kind));
  }
}
