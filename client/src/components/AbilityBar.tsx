import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { MatchFound, WorldPlayer } from '@moba/shared';
import { EventBus } from '../events/EventBus';
import { AbilityIcon } from '../assets/SengokuIcon';

type Ability = MatchFound['heroes'][number]['abilities'][number];

export function AbilityBar({ hero }: { hero: MatchFound['heroes'][number] }) {
  const activePointer = useRef<{ id: number; key: Ability['key']; startX: number; startY: number } | null>(null);
  const [aimingKey, setAimingKey] = useState<Ability['key'] | null>(null);
  const [state, setState] = useState<{ player: WorldPlayer; tick: number } | null>(null);
  useEffect(() => {
    const update = (player: WorldPlayer, tick: number) => setState({ player, tick });
    EventBus.on('game:economy', update);
    return () => EventBus.off('game:economy', update);
  }, []);
  const aim = (event: PointerEvent<HTMLButtonElement>, ability: Ability, phase: 'start' | 'move' | 'cast' | 'cancel') => {
    const active = activePointer.current;
    if (phase === 'start') {
      if (active) return;
      activePointer.current = { id: event.pointerId, key: ability.key, startX: event.clientX, startY: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
      setAimingKey(ability.key);
    } else if (!active || active.id !== event.pointerId || active.key !== ability.key) return;
    const origin = activePointer.current!;
    const screenX = event.clientX - origin.startX;
    const screenY = event.clientY - origin.startY;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    EventBus.emit('ui:ability-aim', { phase, key: ability.key, name: ability.name,
      range: ability.range,
      dx: portrait ? screenY : screenX, dy: portrait ? -screenX : screenY });
    if (phase === 'cast' || phase === 'cancel') {
      activePointer.current = null;
      setAimingKey(null);
    }
  };
  const abilities = (['Q', '1', '2', '3'] as const).map(key => hero.abilities.find(ability => ability.key === key));
  return <div aria-label="Abilities" className="pointer-events-none absolute bottom-32 right-2 z-20 flex gap-1.5 text-white md:bottom-4 md:right-4">
    {aimingKey && <span className="absolute -top-7 right-0 whitespace-nowrap rounded bg-slate-950/90 px-2 text-xs">Drag to aim · release to cast</span>}
    {abilities.map((ability, index) => {
      if (!ability) return null;
      const ready = state?.player.abilityReadyTicks[index] ?? 0;
      const remaining = Math.max(0, ready - (state?.tick ?? 0));
      const unavailable = !state || state.player.hp <= 0 || state.player.mana < ability.manaCost || remaining > 0;
      return <button type="button" key={ability.key} aria-label={`Cast ${ability.key}`} title={`${ability.name} · ${ability.manaCost} mana · ${ability.cooldown / 1000}s cooldown`}
        disabled={unavailable} onPointerDown={event => aim(event, ability, 'start')}
        onPointerMove={event => aim(event, ability, 'move')}
        onPointerUp={event => aim(event, ability, 'cast')}
        onPointerCancel={event => aim(event, ability, 'cancel')}
        onLostPointerCapture={event => aim(event, ability, 'cancel')}
        onContextMenu={event => event.preventDefault()}
        className="pointer-events-auto relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-lg border border-amber-300 bg-slate-950/90 shadow-lg touch-none select-none disabled:opacity-60">
        <AbilityIcon heroId={hero.id} abilityKey={ability.key} />
        <span className="absolute bottom-0 right-0 rounded-tl bg-slate-950 px-1 text-[10px] font-bold">{ability.key}</span>
        {remaining > 0 && <span className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm font-bold">{Math.ceil(remaining / 30)}s</span>}
      </button>;
    })}
  </div>;
}
