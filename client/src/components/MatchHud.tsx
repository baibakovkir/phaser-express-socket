import { useEffect, useState } from 'react';
import { BOSS_SPAWN_TICKS, JUNGLE_SPAWN_TICKS, LANE_WAVE_TICKS, TICKS_PER_SECOND, nextSpawnSecond } from '@moba/shared/map';
import { EventBus } from '../events/EventBus';

function clock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function MatchHud() {
  const [state, setState] = useState({ tick: 0, bossAlive: false });
  const [target, setTarget] = useState('');
  useEffect(() => {
    const update = (tick: number, bossAlive: boolean) => setState({ tick, bossAlive });
    const updateTarget = (label: string) => setTarget(label);
    EventBus.on('game:clock', update);
    EventBus.on('game:target', updateTarget);
    return () => {
      EventBus.off('game:clock', update);
      EventBus.off('game:target', updateTarget);
    };
  }, []);

  const seconds = Math.floor(state.tick / TICKS_PER_SECOND);
  const lane = nextSpawnSecond(state.tick, LANE_WAVE_TICKS);
  const jungle = nextSpawnSecond(state.tick, JUNGLE_SPAWN_TICKS);
  const boss = state.tick < BOSS_SPAWN_TICKS ? clock(BOSS_SPAWN_TICKS / TICKS_PER_SECOND)
    : state.bossAlive ? 'alive' : 'respawning';

  return (
    <div aria-label="Match timer" className="pointer-events-none absolute left-1/2 top-2 z-10 flex max-w-[65%] -translate-x-1/2 flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border border-amber-400/70 bg-[#172b30]/95 px-3 py-1 text-center text-xs font-semibold text-amber-100 shadow-lg">
      <strong className="text-base text-white">{clock(seconds)}</strong>
      <span>Lane {clock(lane)}</span>
      <span>Jungle {clock(jungle)}</span>
      <span>Oni {boss}</span>
      <span className={seconds >= 900 ? 'text-red-300' : 'text-cyan-200'}>{seconds >= 900 ? 'Last stand · no respawns' : `Respawns until ${clock(900)}`}</span>
      <span>Draw at 30:00</span>
      {target && <span className="text-amber-300">Target: {target}</span>}
    </div>
  );
}
