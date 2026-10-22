import { parentPort, workerData } from 'node:worker_threads';
import type { GameInput, ItemDefinition, MatchParticipant } from '@moba/shared';
import type { HeroStats } from './world.js';

type WorkerCommand =
  | { type: 'select'; playerId: string; heroId: string }
  | { type: 'input'; playerId: string; input: GameInput }
  | { type: 'disconnect'; playerId: string }
  | { type: 'command'; id: number; playerId: string; action: 'buy' | 'use'; itemId?: string; slot?: number };

const data = workerData as { matchId: string; participants: MatchParticipant[]; heroes: HeroStats[]; items: ItemDefinition[] };
const worldModule = new URL(`./world.${import.meta.url.endsWith('.ts') ? 'ts' : 'js'}`, import.meta.url);
const { MatchWorld } = await import(worldModule.href) as typeof import('./world.js');
const world = new MatchWorld(data.matchId, data.participants, data.heroes, data.items);

parentPort?.on('message', (message: WorkerCommand) => {
  if (message.type === 'select') world.selectHero(message.playerId, message.heroId);
  if (message.type === 'input') world.setInput(message.playerId, message.input);
  if (message.type === 'disconnect') world.pausePlayer(message.playerId);
  if (message.type === 'command') {
    const result = message.action === 'buy' ? world.buyItem(message.playerId, message.itemId!) : world.useItem(message.playerId, message.slot!);
    parentPort?.postMessage({ type: 'command:result', id: message.id, result });
    if (result.success) parentPort?.postMessage({ type: 'snapshot', snapshot: world.snapshot() });
  }
});

parentPort?.postMessage({ type: 'snapshot', snapshot: world.snapshot() });
let frame = 0;
const timer = setInterval(() => {
  frame++;
  world.step();
  if (frame % 2 === 0 || world.status === 'finished') {
    parentPort?.postMessage({ type: 'snapshot', snapshot: world.snapshot() });
  }
  if (world.status === 'finished') clearInterval(timer);
}, 1000 / 30);
