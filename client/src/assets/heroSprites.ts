export const HERO_SPRITES: Record<string, string> = {
  warrior: 'warrior',
  assassin: 'assassin',
  mage: 'mage',
  support: 'support',
  marksman: 'marksman',
  fighter: 'fighter',
};

export function portraitUrl(heroId: string): string {
  return `${import.meta.env.BASE_URL}assets/sengoku/portraits/${heroId}.webp`;
}
