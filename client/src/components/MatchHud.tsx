import { useEffect, useState } from 'react';
import { BOSS_SPAWN_TICKS, JUNGLE_SPAWN_TICKS, LANE_WAVE_TICKS, TICKS_PER_SECOND, nextSpawnSecond } from '@moba/shared/map';
import { EventBus } from '../events/EventBus';

function clock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function MatchHud() {
  const [state, setState] = useState({ tick: 0, bossAlive: false });
  useEffect(() => {
    const update = (tick: number, bossAlive: boolean) => setState({ tick, bossAlive });
    EventBus.on('game:clock', update);
    return () => EventBus.off('game:clock', update);
  }, []);

  const seconds = Math.floor(state.tick / TICKS_PER_SECOND);
  const lane = nextSpawnSecond(state.tick, LANE_WAVE_TICKS);
  const jungle = nextSpawnSecond(state.tick, JUNGLE_SPAWN_TICKS);
  const boss = state.tick < BOSS_SPAWN_TICKS ? clock(BOSS_SPAWN_TICKS / TICKS_PER_SECOND)
    : state.bossAlive ? 'alive' : 'respawning';

  return (
    <div aria-label="Match timer" className="z-10 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-amber-600/50 bg-slate-950/95 px-3 py-2 text-center text-xs font-semibold text-amber-100 md:absolute md:left-1/2 md:top-3 md:-translate-x-1/2 md:rounded-lg md:border">
      <strong className="text-base text-white">{clock(seconds)}</strong>
      <span>Lane {clock(lane)}</span>
      <span>Jungle {clock(jungle)}</span>
      <span>Oni {boss}</span>
    </div>
  );
}
