export const HERO_SPRITES: Record<string, string> = {
  warrior: 'warrior',
  assassin: 'assassin',
  mage: 'mage',
  support: 'support',
  marksman: 'marksman',
  fighter: 'fighter',
};

export const EFFECT_SPRITES = ['arrow', 'slash', 'spark', 'flame', 'heal'] as const;

export function spriteUrl(name: string): string {
  return `${import.meta.env.BASE_URL}assets/kenney/tiny-dungeon/${name}.png`;
}
