import type { ReactNode } from 'react';
import { ABILITY_PATHS, HERO_COLORS } from './sengokuArt';

const ITEM_PATHS: Record<string, string> = {
  kunai: 'M17 47 46 15l4-3-2 12-23 27-8 2ZM26 38l-8-8',
  bamboo: 'M21 54 23 9m18 45L43 9M18 21h10m-10 13h10m10-14h10m-10 14h10',
  sandals: 'M13 40c8-2 11-11 14-25l10 3c0 15 6 19 16 22v10H13ZM22 33l17 10',
  bead: 'M32 10a22 22 0 1 0 0 44 22 22 0 1 0 0-44Zm0 13a9 9 0 1 0 0 18 9 9 0 1 0 0-18Z',
  lotus: 'M32 51C18 43 15 31 17 19c8 2 13 7 15 15 2-8 7-13 15-15 2 12-1 24-15 32ZM11 41c9-3 16-2 21 10 5-12 12-13 21-10',
  blood_charm: 'M32 10c8 13 16 23 16 32a16 16 0 1 1-32 0c0-9 8-19 16-32ZM25 44c3 4 11 5 15 0',
  healing_leaf: 'M12 52C17 24 33 11 53 11c-2 24-14 39-41 41ZM17 48 47 19M28 39l-7-13m17 1 12 5',
  moon_blade: 'M51 13C30 10 13 22 13 39c0 7 5 12 13 13-4-6-5-12-2-18 5-10 14-15 27-21ZM18 49l-8 8',
  guardian_mask: 'M32 9 51 18v18c0 12-8 18-19 22-11-4-19-10-19-22V18ZM20 31l12 5 12-5M25 45h14',
  spirit_fan: 'M11 48 21 14l10 27 11-27 11 34-21-6ZM11 48h42M32 42v14',
  healing_charm: 'M32 8 48 24 40 49H24L16 24ZM32 18v24M20 31h24M26 52h12',
  smoke_bell: 'M19 47c-3-17 2-28 13-33 11 5 16 16 13 33ZM15 47h34M28 53a4 4 0 0 0 8 0M32 8v7',
  oni_claw: 'M12 52 23 12l8 25 1-28 10 29 9-23 1 37ZM17 43l29 7',
  crimson_crest: 'M32 8 47 17l8 17-10 20H19L9 34l8-17ZM20 31l12 12 12-12M32 43V19',
};

function IconFrame({ children, glow, base, className }: { children: ReactNode; glow: string; base: string; className?: string }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" className={className ?? 'h-8 w-8'} fill="none">
    <rect x="2" y="2" width="60" height="60" rx="9" fill={base} stroke="#d1b279" strokeWidth="3" />
    <path d="M7 15V8h8M49 8h7v7M7 49v7h8M49 56h7v-7" stroke="#eddaa9" strokeWidth="2" />
    <g stroke={glow} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">{children}</g>
  </svg>;
}

export function AbilityIcon({ heroId, abilityKey }: { heroId: string; abilityKey: string }) {
  const path = ABILITY_PATHS[heroId]?.[abilityKey] ?? ABILITY_PATHS.warrior.Q;
  const [glow, base] = HERO_COLORS[heroId] ?? HERO_COLORS.warrior;
  return <IconFrame glow={glow} base={base}><path d={path} /></IconFrame>;
}

export function ItemIcon({ itemId, className }: { itemId: string; className?: string }) {
  return <IconFrame glow="#f4d993" base="#3f4f49" className={className}><path d={ITEM_PATHS[itemId] ?? ITEM_PATHS.bead} /></IconFrame>;
}
