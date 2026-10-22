import { useEffect, useState } from 'react';
import type { MatchFound, WorldPlayer } from '@moba/shared';
import { EventBus } from '../events/EventBus';
import { queueMobileCast } from '../input/mobileInput';

type Ability = MatchFound['heroes'][number]['abilities'][number];

function AbilityIcon({ ability }: { ability: Ability }) {
  const name = ability.name.toLowerCase();
  const colors = name.includes('heal') || name.includes('revive') ? ['#a7f3a5', '#168a62']
    : name.includes('shield') || name.includes('guard') ? ['#a9edff', '#1677a1']
      : name.includes('dash') || name.includes('step') ? ['#f7e8a1', '#b86b35']
        : name.includes('meteor') || name.includes('flame') ? ['#ffd183', '#c63b2e']
          : ['#dab5ff', '#6332ac'];
  const shape = name.includes('heal') || name.includes('revive') ? <path d="M32 14v36M14 32h36" />
    : name.includes('shield') || name.includes('guard') ? <path d="M32 9 49 17v13c0 12-8 20-17 25-9-5-17-13-17-25V17Z" />
      : name.includes('dash') || name.includes('step') ? <path d="m9 42 23-27-5 18 28-10-24 27 4-18Z" />
        : name.includes('meteor') || name.includes('flame') ? <path d="M20 46c-7-14 5-20 5-31 8 4 9 12 7 18 5-3 8-9 7-15 17 15 12 36-7 36-6 0-10-3-12-8Z" />
          : <path d="m10 45 24-31-5 18 25-9-24 30 4-19Z" />;
  return <svg viewBox="0 0 64 64" aria-hidden="true" className="h-8 w-8" fill="none" stroke={colors[0]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="60" height="60" rx="10" fill={colors[1]} stroke="none" />
    {shape}
  </svg>;
}

export function AbilityBar({ hero }: { hero: MatchFound['heroes'][number] }) {
  const [state, setState] = useState<{ player: WorldPlayer; tick: number } | null>(null);
  useEffect(() => {
    const update = (player: WorldPlayer, tick: number) => setState({ player, tick });
    EventBus.on('game:economy', update);
    return () => EventBus.off('game:economy', update);
  }, []);
  const abilities = (['Q', '1', '2', '3'] as const).map(key => hero.abilities.find(ability => ability.key === key));
  return <div aria-label="Abilities" className="pointer-events-none absolute bottom-32 right-2 z-20 flex gap-1.5 text-white md:bottom-4 md:right-4">
    {abilities.map((ability, index) => {
      if (!ability) return null;
      const ready = state?.player.abilityReadyTicks[index] ?? 0;
      const remaining = Math.max(0, ready - (state?.tick ?? 0));
      const unavailable = !state || state.player.hp <= 0 || state.player.mana < ability.manaCost || remaining > 0;
      return <button type="button" key={ability.key} aria-label={`Cast ${ability.key}`} title={`${ability.name} · ${ability.manaCost} mana · ${ability.cooldown / 1000}s cooldown`}
        disabled={unavailable} onPointerDown={() => queueMobileCast(ability.key)}
        className="pointer-events-auto relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-slate-950/90 shadow-lg touch-none select-none disabled:opacity-60">
        <AbilityIcon ability={ability} />
        <span className="absolute bottom-0 right-0 rounded-tl bg-slate-950 px-1 text-[10px] font-bold">{ability.key}</span>
        {remaining > 0 && <span className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm font-bold">{Math.ceil(remaining / 30)}s</span>}
      </button>;
    })}
  </div>;
}
