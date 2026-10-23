import type { ReactNode } from 'react';

const ABILITY_PATHS: Record<string, Record<string, string>> = {
  warrior: {
    Q: 'M11 43 31 17 25 31 52 20 35 47 40 36Z',
    '1': 'M32 9 49 17v15c0 12-8 19-17 24-9-5-17-12-17-24V17ZM20 38l24-16',
    '2': 'M12 29c11 0 15-8 20-18 5 10 9 18 20 18M12 38c11 0 15 8 20 16 5-8 9-16 20-16',
    '3': 'M32 9 20 32h8l-7 23 23-29h-9l7-17ZM10 49l10 4m34-4-10 4',
  },
  assassin: {
    Q: 'M14 41 34 12 30 33 52 23 30 53 34 38Z',
    '1': 'M15 50 48 15M19 17l28 31M37 14l10 9-10 9M14 37l9 10 9-10',
    '2': 'M13 42c0-10 10-15 20-14-5-9 4-18 13-13-3 7 7 10 7 19 0 12-12 20-25 18',
    '3': 'M32 11 51 28 44 51 20 51 13 28ZM23 31h18M32 22v19',
  },
  mage: {
    Q: 'M10 43 28 18 27 31 51 15 37 39 38 48Z',
    '1': 'M32 8v48M8 32h48M15 15l34 34M49 15 15 49M32 22a10 10 0 1 0 0 20 10 10 0 1 0 0-20',
    '2': 'M32 8c16 10 22 16 22 27 0 11-10 18-22 22C20 53 10 46 10 35c0-11 6-17 22-27ZM18 37c9-8 19-8 28 0',
    '3': 'M48 11 28 33l-7 19 20-8 12-18ZM16 42l-7 11m13-4-4 8',
  },
  support: {
    Q: 'M13 42 32 15 29 31 49 22 33 49 35 37Z',
    '1': 'M32 9 38 26 55 32 38 38 32 55 26 38 9 32 26 26ZM32 25v14M25 32h14',
    '2': 'M32 8v48M8 32h48M19 19l26 26M45 19 19 45',
    '3': 'M32 11c12 8 19 18 19 29-11 0-16 6-19 13-3-7-8-13-19-13 0-11 7-21 19-29ZM32 24v23m-9-13h18',
  },
  marksman: {
    Q: 'M13 41 32 17 27 34 51 24 34 49 38 37Z',
    '1': 'M14 50 47 14M14 15 48 49M28 53V11M43 15l5 1-1 5M15 44l-1 5 5 1',
    '2': 'M13 37c11-18 24-19 38-16M44 14l8 7-8 7M15 45c11 5 22 4 30-1',
    '3': 'M15 11v31m17-31v39m17-39v31M9 36l6 10 6-10m5 10 6 10 6-10m5-10 6 10 6-10',
  },
  fighter: {
    Q: 'M12 40 34 13 27 32 52 20 31 52 36 38Z',
    '1': 'M32 11c10 14 21 19 21 30 0 8-9 14-21 14S11 49 11 41c0-11 11-16 21-30ZM32 26c-6 9-8 13-8 18 0 4 4 7 8 7s8-3 8-7c0-5-2-9-8-18Z',
    '2': 'M14 47 20 19 29 31 32 9 38 31 48 19 52 47ZM14 47h38',
    '3': 'M13 49 50 13M16 17l31 30M28 12l-9 13m27 14-12 13',
  },
};

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

const HERO_COLORS: Record<string, [string, string]> = {
  warrior: ['#81b6dc', '#2d567c'], assassin: ['#c9a0e5', '#694b80'], mage: ['#94d8f2', '#345984'],
  support: ['#a9e3b9', '#4a7668'], marksman: ['#e7c780', '#6b7549'], fighter: ['#ed9a7b', '#8d3f40'],
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
