import Phaser from 'phaser';
import { ABILITY_PATHS, HERO_COLORS } from './sengokuArt';

const SIZE = 96;

export function abilityEffectKey(heroId: string, abilityKey: string): string {
  return `sengoku-ability-${heroId}-${abilityKey}`;
}

export function registerAbilityEffects(scene: Phaser.Scene): void {
  for (const [heroId, abilities] of Object.entries(ABILITY_PATHS)) {
    const color = HERO_COLORS[heroId][0];
    for (const [abilityKey, shape] of Object.entries(abilities)) {
      const key = abilityEffectKey(heroId, abilityKey);
      if (scene.textures.exists(key)) continue;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.translate(8, 8);
      ctx.scale(1.25, 1.25);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const path = new Path2D(shape);
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = 7;
      ctx.stroke(path);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff4dc';
      ctx.lineWidth = 2.5;
      ctx.stroke(path);
      scene.textures.addCanvas(key, canvas);
    }
  }
}
