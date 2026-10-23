import Phaser from 'phaser';

function random(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

export function registerArenaTerrain(scene: Phaser.Scene): void {
  if (scene.textures.exists('arena-ground')) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const next = random(1734);
  ctx.fillStyle = '#344c3d';
  ctx.fillRect(0, 0, 256, 256);

  // Several translucent passes read as watercolor at both desktop and mobile zoom.
  for (let index = 0; index < 420; index++) {
    const x = next() * 256;
    const y = next() * 256;
    const radius = 4 + next() * 22;
    ctx.fillStyle = index % 3 === 0 ? '#172e2940' : index % 3 === 1 ? '#7d8d6840' : '#a09d7040';
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * (0.25 + next() * 0.5), next() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let index = 0; index < 260; index++) {
    const x = next() * 256;
    const y = next() * 256;
    ctx.strokeStyle = index % 2 ? '#a7b98533' : '#142c283d';
    ctx.lineWidth = 1 + next() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (next() - 0.5) * 12, y - next() * 8);
    ctx.stroke();
  }
  scene.textures.addCanvas('arena-ground', canvas);
}
