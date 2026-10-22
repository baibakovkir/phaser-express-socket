import { useEffect, useMemo, useRef, useState } from 'react';
import type { ItemDefinition, WorldPlayer } from '@moba/shared';
import { EventBus } from '../events/EventBus';
import { network } from '../network/socket';

interface Props { matchId: string; items: ItemDefinition[] }

function describeStats(stats: ItemDefinition['stats']): string {
  const labels: Record<string, string> = {
    attack: 'attack', maxHp: 'HP', maxMana: 'mana', speed: 'speed',
    hpRegen: 'HP/s', manaRegen: 'mana/s',
  };
  return Object.entries(stats).map(([key, value]) => `+${value} ${labels[key] || key}`).join(' · ');
}

export function EconomyOverlay({ matchId, items }: Props) {
  const [player, setPlayer] = useState<WorldPlayer | null>(null);
  const [tick, setTick] = useState(0);
  const [atShop, setAtShop] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const byIndex = useMemo(() => new Map(items.map(item => [item.index, item])), [items]);
  const byId = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);
  const owned = player?.inventory.map(slot => byIndex.get(slot.itemIndex)).filter((item): item is ItemDefinition => !!item) ?? [];
  const actives = player?.inventory.map(slot => ({ slot, item: byIndex.get(slot.itemIndex) }))
    .filter((entry): entry is { slot: typeof entry.slot; item: ItemDefinition } => !!entry.item?.activeKind) ?? [];
  const activeIdsRef = useRef<string[]>([]);
  activeIdsRef.current = actives.map(entry => entry.item.id);

  useEffect(() => {
    const update = (next: WorldPlayer, nextTick: number, available: boolean) => {
      setPlayer(next);
      setTick(nextTick);
      setAtShop(available);
    };
    EventBus.on('game:economy', update);
    return () => EventBus.off('game:economy', update);
  }, []);

  const act = async (action: 'buy' | 'use', itemId: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const result = await network.itemAction(matchId, action, itemId);
    busyRef.current = false;
    setBusy(false);
    setError(result.success ? '' : result.error || 'Item action failed');
  };

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.target instanceof HTMLInputElement) return;
      if (event.key.toLowerCase() === 'b') { setOpen(value => !value); event.preventDefault(); }
      if (event.key === 'Escape') setOpen(false);
      const index = event.key.toLowerCase() === 'z' ? 0 : event.key.toLowerCase() === 'x' ? 1 : -1;
      if (index >= 0 && activeIdsRef.current[index]) {
        void act('use', activeIdsRef.current[index]);
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [matchId]);

  return (
    <>
      <div className="pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-2 text-xs text-white">
        <span className="rounded bg-slate-950/90 px-2 py-1" data-testid="match-gold">Gold {player?.gold ?? 0} · LH {player?.lastHits ?? 0}</span>
        <button type="button" aria-label="Open shop" onClick={() => setOpen(value => !value)}
          className="pointer-events-auto min-h-11 rounded border border-amber-400 bg-slate-950/90 px-3 font-bold">
          Shop <span className="hidden md:inline">B</span>
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {actives.map(({ item, slot }, index) => (
          <button key={item.id} type="button" aria-label={`Use ${item.name}`}
            disabled={busy || tick < slot.readyTick}
            onClick={() => void act('use', item.id)}
            className="pointer-events-auto min-h-11 min-w-14 rounded border border-cyan-300 bg-slate-950/90 px-2 text-xs font-bold text-white disabled:opacity-50">
            {item.name}<span className="block">{tick < slot.readyTick ? `${Math.ceil((slot.readyTick - tick) / 30)}s` : index === 0 ? 'Z' : 'X'}</span>
          </button>
        ))}
      </div>
      {error && !open && <div role="alert" className="absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded bg-red-950 p-2 text-sm text-white" onClick={() => setError('')}>{error}</div>}
      {open && <div role="dialog" aria-label="Fountain shop" className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 p-3 text-white">
        <div className="flex max-h-full w-full max-w-xl flex-col rounded-xl border border-amber-400 bg-slate-900 shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-amber-700 px-4 py-2">
            <div><h2 className="text-lg font-bold">Fountain shop</h2><p className="text-xs text-amber-200">Gold {player?.gold ?? 0} · {atShop ? 'At your fountain' : 'Return to your fountain to buy'}</p></div>
            <button type="button" aria-label="Close shop" className="min-h-11 min-w-11 rounded bg-slate-700" onClick={() => { setOpen(false); setError(''); }}>✕</button>
          </div>
          {error && <p role="alert" className="mx-3 mt-2 rounded bg-red-900 p-2 text-sm">{error}</p>}
          <div className="overflow-y-auto overscroll-contain p-3">
            <p className="mb-2 text-xs text-slate-300">Inventory {owned.length}/6: {owned.map(item => item.name).join(', ') || 'empty'}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map(item => {
                const has = owned.some(entry => entry.id === item.id);
                const components = item.components.map(id => byId.get(id)).filter((entry): entry is ItemDefinition => !!entry);
                const price = item.price - components.filter(entry => owned.some(existing => existing.id === entry.id)).reduce((sum, entry) => sum + entry.price, 0);
                return <div key={item.id} className="rounded border border-slate-600 bg-slate-800 p-2 text-xs">
                  <div className="flex items-start justify-between gap-2"><strong className="text-sm text-amber-100">{item.name}</strong><span>{item.price} gold</span></div>
                  <p>{describeStats(item.stats)}</p>
                  {components.length > 0 && <p className="text-slate-300">Recipe: {components.map(entry => entry.name).join(' + ')}</p>}
                  {item.activeKind && <p className="text-cyan-200">Active: {item.description} {item.cooldown}s cooldown</p>}
                  <button type="button" aria-label={`Buy ${item.name}`} disabled={busy || !atShop || has || (player?.gold ?? 0) < price}
                    onClick={() => void act('buy', item.id)}
                    className="mt-2 min-h-11 rounded bg-amber-600 px-3 font-semibold text-black disabled:bg-slate-600 disabled:text-slate-300">
                    {has ? 'Owned' : `Buy · ${price}`}
                  </button>
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>}
    </>
  );
}
