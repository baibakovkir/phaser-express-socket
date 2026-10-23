import Phaser from 'phaser';

export type HeroDirection = 'front' | 'back' | 'left' | 'right';
export type HeroMotion = 'idle' | 'run' | 'attack' | 'cast' | 'hit' | 'death';

const DIRECTIONS: HeroDirection[] = ['front', 'back', 'left', 'right'];
const MOTIONS: HeroMotion[] = ['idle', 'run', 'attack', 'cast', 'hit', 'death'];
const FRAME_SIZE = 96;
const COLUMNS = 8;

type HeroPaint = {
  cloth: string;
  trim: string;
  armor: string;
  skin: string;
  hair: string;
  weapon: 'katana' | 'daggers' | 'staff' | 'wand' | 'bow' | 'naginata';
  crest: 'helmet' | 'mask' | 'talisman' | 'flower' | 'hood' | 'horns';
};

const HERO_PAINT: Record<string, HeroPaint> = {
  warrior: { cloth: '#224878', trim: '#d8bc76', armor: '#3763a4', skin: '#d8ab83', hair: '#25242e', weapon: 'katana', crest: 'helmet' },
  assassin: { cloth: '#543d72', trim: '#b98dc3', armor: '#303047', skin: '#d8b2a2', hair: '#272232', weapon: 'daggers', crest: 'mask' },
  mage: { cloth: '#304677', trim: '#ddbb77', armor: '#ede2c8', skin: '#dab18d', hair: '#2b2730', weapon: 'staff', crest: 'talisman' },
  support: { cloth: '#e9e4d7', trim: '#c55f50', armor: '#4b756b', skin: '#e6bca2', hair: '#342a2e', weapon: 'wand', crest: 'flower' },
  marksman: { cloth: '#566c4e', trim: '#d2aa66', armor: '#83704b', skin: '#cfa784', hair: '#2a2927', weapon: 'bow', crest: 'hood' },
  fighter: { cloth: '#8e3a37', trim: '#deac72', armor: '#a54d42', skin: '#c99a7d', hair: '#282329', weapon: 'naginata', crest: 'horns' },
};

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function polygon(ctx: CanvasRenderingContext2D, color: string, points: number[]): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let index = 2; index < points.length; index += 2) ctx.lineTo(points[index], points[index + 1]);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#253039';
  ctx.lineWidth = 1.7;
  ctx.stroke();
}

function line(ctx: CanvasRenderingContext2D, color: string, width: number, points: number[]): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let index = 2; index < points.length; index += 2) ctx.lineTo(points[index], points[index + 1]);
  ctx.stroke();
}

function drawWeapon(ctx: CanvasRenderingContext2D, paint: HeroPaint, motion: HeroMotion, frame: number): void {
  const swing = motion === 'attack' ? (frame ? -16 : 14) : 0;
  const cast = motion === 'cast';
  switch (paint.weapon) {
    case 'katana':
      line(ctx, '#56483a', 5, [68, 49, 72 + swing, 58]);
      line(ctx, '#e8e5db', 4, [72 + swing, 58, 79 + swing, 79]);
      line(ctx, '#8cabb4', 1, [74 + swing, 60, 81 + swing, 78]);
      break;
    case 'daggers':
      line(ctx, '#d7dce1', 4, [24, 54, 16 + swing, 69]);
      line(ctx, '#d7dce1', 4, [70, 51, 83 - swing, 65]);
      break;
    case 'staff':
    case 'wand': {
      const length = paint.weapon === 'staff' ? 34 : 24;
      line(ctx, '#795a3b', 5, [71, 73, 72 + swing, 73 - length]);
      ellipse(ctx, 72 + swing, 72 - length, cast ? 8 : 5, cast ? 8 : 5,
        paint.weapon === 'wand' ? '#9ef0bf' : '#7bc5ee');
      break;
    }
    case 'bow':
      line(ctx, '#8d613d', 4, [73, 35, 84 + swing, 54, 72, 78]);
      line(ctx, '#e6d8b1', 1.5, [73, 35, 68, 56, 72, 78]);
      if (motion === 'attack') line(ctx, '#e6e5cd', 2, [63, 56, 87, 56]);
      break;
    case 'naginata':
      line(ctx, '#79583e', 5, [67, 80, 74 + swing, 21]);
      polygon(ctx, '#d8e0dc', [74 + swing, 21, 77 + swing, 6, 84 + swing, 20]);
      break;
  }
}

function drawHeroFrame(ctx: CanvasRenderingContext2D, paint: HeroPaint, direction: HeroDirection, motion: HeroMotion, frame: number): void {
  ctx.save();
  ctx.translate(48, 52);
  if (direction === 'left') ctx.scale(-1, 1);
  if (motion === 'death') ctx.rotate(-1.15);
  if (motion === 'hit') ctx.rotate(frame ? -0.14 : 0.12);
  const step = motion === 'run' ? (frame ? 5 : -5) : 0;
  const leap = motion === 'run' ? (frame ? -2 : 0) : motion === 'cast' ? -3 : 0;
  ctx.translate(-48, -52 + leap);

  ellipse(ctx, 48, 83, 22, 5, '#1b263044');
  polygon(ctx, '#2e303a', [37, 67, 46, 69, 44 + step, 85, 34 + step, 85]);
  polygon(ctx, '#2e303a', [52, 69, 61, 67, 62 - step, 85, 51 - step, 85]);
  polygon(ctx, paint.cloth, [33, 46, 62, 46, 67, 73, 28, 73]);
  polygon(ctx, paint.armor, [35, 43, 48, 48, 61, 43, 63, 63, 33, 63]);
  line(ctx, paint.trim, 3, [37, 55, 59, 55]);
  polygon(ctx, paint.armor, [36, 43, 28, 47, 23, 57, 31, 60, 40, 51]);
  polygon(ctx, paint.armor, [61, 43, 68, 47, 73, 58, 66, 60, 56, 51]);
  if (motion === 'attack') {
    line(ctx, paint.skin, 7, [66, 51, 77, frame ? 43 : 60]);
  } else if (motion === 'cast') {
    line(ctx, paint.skin, 7, [29, 52, 16, 39]);
    ellipse(ctx, 15, 36, 7 + frame * 2, 7 + frame * 2, '#a6e9da');
  } else {
    line(ctx, paint.skin, 6, [29, 52, 25, 68]);
    line(ctx, paint.skin, 6, [68, 52, 72, 67]);
  }

  const face = direction !== 'back';
  ellipse(ctx, 48, 34, 12, 14, face ? paint.skin : paint.hair);
  ellipse(ctx, 48, 23, 13, 8, paint.hair);
  if (face) {
    const eyesY = direction === 'front' ? 35 : 36;
    ellipse(ctx, direction === 'right' ? 51 : 44, eyesY, 1.5, 1, '#263038');
    if (direction === 'front') ellipse(ctx, 53, eyesY, 1.5, 1, '#263038');
  }
  switch (paint.crest) {
    case 'helmet':
      polygon(ctx, paint.armor, [35, 26, 40, 15, 56, 15, 61, 26]);
      line(ctx, paint.trim, 3, [38, 23, 58, 23]);
      break;
    case 'mask':
      polygon(ctx, '#eee1d5', [57, 26, 66, 20, 62, 37, 57, 34]);
      break;
    case 'talisman':
      polygon(ctx, '#f2e4ba', [42, 15, 54, 15, 52, 30, 44, 30]);
      line(ctx, '#b0634e', 2, [47, 19, 49, 25]);
      break;
    case 'flower':
      for (let petal = 0; petal < 5; petal++) {
        const angle = petal * Math.PI * 2 / 5;
        ellipse(ctx, 59 + Math.cos(angle) * 5, 22 + Math.sin(angle) * 5, 4, 3, '#f7f1df');
      }
      ellipse(ctx, 59, 22, 3, 3, '#e6b76d');
      break;
    case 'hood':
      polygon(ctx, paint.cloth, [34, 28, 38, 15, 56, 13, 63, 29, 56, 25, 40, 26]);
      break;
    case 'horns':
      polygon(ctx, '#e9d5ae', [37, 22, 29, 8, 42, 18]);
      polygon(ctx, '#e9d5ae', [58, 22, 67, 8, 54, 18]);
      break;
  }
  drawWeapon(ctx, paint, motion, frame);
  if (motion === 'cast') {
    ctx.strokeStyle = paint.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(17, 36, 11 + frame * 3, -1.2, 1.6);
    ctx.stroke();
  }
  ctx.restore();
}

export function registerSengokuHeroes(scene: Phaser.Scene): void {
  for (const [heroId, paint] of Object.entries(HERO_PAINT)) {
    const textureKey = `arena-${heroId}`;
    if (!scene.textures.exists(textureKey)) {
      const canvas = document.createElement('canvas');
      canvas.width = FRAME_SIZE * COLUMNS;
      canvas.height = FRAME_SIZE * 6;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      DIRECTIONS.forEach((direction, directionIndex) => MOTIONS.forEach((motion, motionIndex) => {
        for (let frame = 0; frame < 2; frame++) {
          const index = directionIndex * 12 + motionIndex * 2 + frame;
          const col = index % COLUMNS;
          const row = Math.floor(index / COLUMNS);
          ctx.save();
          ctx.translate(col * FRAME_SIZE, row * FRAME_SIZE);
          drawHeroFrame(ctx, paint, direction, motion, frame);
          ctx.restore();
        }
      }));
      const texture = scene.textures.addCanvas(textureKey, canvas);
      if (!texture) continue;
      for (let index = 0; index < 48; index++) {
        texture.add(String(index), 0, (index % COLUMNS) * FRAME_SIZE,
          Math.floor(index / COLUMNS) * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE);
      }
    }
    DIRECTIONS.forEach((direction, directionIndex) => MOTIONS.forEach((motion, motionIndex) => {
      const key = `${textureKey}:${direction}:${motion}`;
      if (scene.anims.exists(key)) return;
      const start = directionIndex * 12 + motionIndex * 2;
      scene.anims.create({
        key,
        frames: [{ key: textureKey, frame: String(start) }, { key: textureKey, frame: String(start + 1) }],
        frameRate: motion === 'run' ? 8 : motion === 'idle' ? 2 : 12,
        repeat: motion === 'idle' || motion === 'run' ? -1 : 0,
      });
    }));
  }
}
