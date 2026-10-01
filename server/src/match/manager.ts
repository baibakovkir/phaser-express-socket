import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';
import type { Server } from 'socket.io';
import type { GameInput, MatchFound, MatchParticipant, WorldSnapshot } from '@moba/shared';
import { encodeSnapshot } from '@moba/shared/codec';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import type { HeroStats } from './world.js';

interface Entrant {
  playerId: string;
  username: string;
  socketId: string;
}

interface RunningMatch {
  worker: Worker;
  roster: Map<string, string>;
  heroes: Set<string>;
  selected: Map<string, string>;
  finished: boolean;
  inputBudget: Map<string, { window: number; count: number }>;
  selectionTimer: NodeJS.Timeout;
  durationTimer: NodeJS.Timeout;
  disconnectedTimer?: NodeJS.Timeout;
}

class MatchManager {
  private io?: Server;
  private matches = new Map<string, RunningMatch>();
  private playerMatches = new Map<string, string>();

  init(io: Server): void {
    this.io = io;
  }

  async create(entrants: Entrant[], isValid: () => boolean = () => true): Promise<{ success: boolean; error?: string; matchId?: string }> {
    if (!this.io) return { success: false, error: 'Match service unavailable' };
    if (entrants.length < 1 || entrants.length > 6) return { success: false, error: 'Match requires 1–6 players' };
    if (this.matches.size >= 32) return { success: false, error: 'Server is at match capacity' };
    if (entrants.some(p => this.playerMatches.has(p.playerId) || !this.io?.sockets.sockets.get(p.socketId)?.connected)) {
      return { success: false, error: 'A player is offline or already in a match' };
    }
    const catalog = await prisma.hero.findMany({
      include: { abilities: true },
    });
    if (!isValid() || entrants.some(p => this.playerMatches.has(p.playerId) || !this.io?.sockets.sockets.get(p.socketId)?.connected)) {
      return { success: false, error: 'A player left before the match started' };
    }
    const heroes: HeroStats[] = catalog.map(hero => ({
      id: hero.id,
      maxHp: hero.baseHp,
      maxMana: hero.baseMana,
      manaRegen: hero.manaRegen,
      speed: hero.baseSpeed,
      attack: hero.baseAttack,
      abilities: hero.abilities.filter(ability => ['Q', '1', '2', '3'].includes(ability.key)).map(ability => ({
        key: ability.key as 'Q' | '1' | '2' | '3',
        cooldown: ability.cooldown,
        manaCost: ability.manaCost,
        damage: ability.damage,
        range: ability.range,
      })),
    }));
    if (!heroes.length) return { success: false, error: 'No heroes available' };

    const matchId = randomUUID();
    const participants: MatchParticipant[] = entrants.map((entry, index) => ({
      playerId: entry.playerId,
      username: entry.username,
      team: index % 2 === 0 ? 1 : 2,
    }));
    const source = import.meta.url.endsWith('.ts');
    const worker = new Worker(new URL(`./match.worker.${source ? 'ts' : 'js'}`, import.meta.url), {
      workerData: { matchId, participants, heroes },
      execArgv: source ? ['--import', 'tsx'] : [],
    });
    const match: RunningMatch = {
      worker,
      roster: new Map(entrants.map(entry => [entry.playerId, entry.socketId])),
      heroes: new Set(heroes.map(hero => hero.id)),
      selected: new Map(),
      finished: false,
      inputBudget: new Map(),
      selectionTimer: setTimeout(() => this.abort(matchId, 'Hero selection timed out'), 120_000),
      durationTimer: setTimeout(() => this.abort(matchId, 'Match time limit reached'), 30 * 60_000),
    };
    this.matches.set(matchId, match);
    void redis.set(`match:${matchId}:meta`, JSON.stringify({ status: 'selecting', participants }), 'EX', 3600)
      .catch(error => console.error('[match] Redis metadata failed', error));
    for (const entrant of entrants) {
      this.playerMatches.set(entrant.playerId, matchId);
      this.io.sockets.sockets.get(entrant.socketId)?.join(matchId);
    }
    worker.on('message', (message: { type: 'snapshot'; snapshot: WorldSnapshot }) => {
      if (message.type !== 'snapshot') return;
      this.io?.to(matchId).emit('game:snapshot', encodeSnapshot(message.snapshot, participants.map(item => item.playerId)));
      if (message.snapshot.tick > 0 && message.snapshot.tick % 30 === 0) {
        void redis.set(`match:${matchId}:snapshot`, JSON.stringify(message.snapshot), 'EX', 3600).catch(error => console.error('[match] Redis checkpoint failed', error));
      }
      if (message.snapshot.status === 'finished' && !match.finished) {
        match.finished = true;
        clearTimeout(match.selectionTimer);
        clearTimeout(match.durationTimer);
        void redis.set(`match:${matchId}:meta`, JSON.stringify({ status: 'finished', participants, winnerTeam: message.snapshot.winnerTeam }), 'EX', 3600)
          .catch(error => console.error('[match] Redis metadata failed', error));
        void this.persistResult(message.snapshot).finally(() => {
          setTimeout(() => this.close(matchId), 10_000);
        });
      }
    });
    worker.on('error', error => console.error(`[match] worker ${matchId} failed`, error));
    worker.on('exit', code => {
      if (!match.finished && this.matches.has(matchId)) {
        this.io?.to(matchId).emit('match:aborted', { reason: 'Match worker stopped' });
        console.error(`[match] worker ${matchId} exited with code ${code}`);
      }
      this.close(matchId);
    });
    const colors: Record<string, number> = {
      TANK: 0x4488ff, ASSASSIN: 0x00ff88, MAGE: 0xaa44ff,
      SUPPORT: 0x00ffaa, MARKSMAN: 0xff8800, FIGHTER: 0xff4444,
    };
    const notice: MatchFound = {
      matchId,
      participants,
      heroes: catalog.map(hero => ({ id: hero.id, name: hero.name, role: hero.role.toLowerCase(), color: colors[hero.role] || 0xffffff })),
    };
    this.io.to(matchId).emit('match:found', notice);
    return { success: true, matchId };
  }

  selectHero(playerId: string, socketId: string, matchId: string, heroId: string): boolean {
    const match = this.matches.get(matchId);
    if (!match || match.finished || match.roster.get(playerId) !== socketId || !match.heroes.has(heroId) || match.selected.has(playerId)) return false;
    match.selected.set(playerId, heroId);
    if (match.selected.size === match.roster.size) clearTimeout(match.selectionTimer);
    match.worker.postMessage({ type: 'select', playerId, heroId });
    return true;
  }

  input(playerId: string, socketId: string, matchId: string, input: GameInput): void {
    const match = this.matches.get(matchId);
    if (!match || match.finished || match.roster.get(playerId) !== socketId) return;
    if (!input || !Number.isSafeInteger(input.seq) || input.seq < 1 ||
        !Number.isFinite(input.dx) || !Number.isFinite(input.dy) ||
        Math.abs(input.dx) > 1 || Math.abs(input.dy) > 1 || typeof input.attack !== 'boolean' ||
        (input.cast !== undefined && !['Q', '1', '2', '3'].includes(input.cast))) return;
    const now = Date.now();
    const budget = match.inputBudget.get(playerId);
    if (!budget || now - budget.window >= 1000) match.inputBudget.set(playerId, { window: now, count: 1 });
    else if (++budget.count > 60) return;
    match.worker.postMessage({ type: 'input', playerId, input });
  }

  disconnect(playerId: string): void {
    const matchId = this.playerMatches.get(playerId);
    const match = matchId ? this.matches.get(matchId) : undefined;
    match?.worker.postMessage({ type: 'disconnect', playerId });
    if (match && !match.disconnectedTimer && [...match.roster.values()].every(socketId => !this.io?.sockets.sockets.get(socketId)?.connected)) {
      match.disconnectedTimer = setTimeout(() => this.abort(matchId!, 'All players disconnected'), 30_000);
    }
  }

  private abort(matchId: string, reason: string): void {
    const match = this.matches.get(matchId);
    if (!match || match.finished) return;
    this.io?.to(matchId).emit('match:aborted', { reason });
    void redis.set(`match:${matchId}:meta`, JSON.stringify({ status: 'aborted', reason }), 'EX', 3600)
      .catch(error => console.error('[match] Redis metadata failed', error));
    this.close(matchId);
  }

  private async persistResult(snapshot: WorldSnapshot): Promise<void> {
    try {
      await prisma.match.create({
        data: {
          id: snapshot.matchId,
          status: 'FINISHED',
          winnerTeam: snapshot.winnerTeam,
          durationSec: Math.ceil(snapshot.tick / 30),
          endedAt: new Date(),
          players: {
            create: snapshot.players.map(player => ({
              playerId: player.id,
              team: player.team,
              heroId: player.heroId,
              kills: player.kills,
              deaths: player.deaths,
            })),
          },
        },
      });
    } catch (error) {
      console.error(`[match] failed to persist ${snapshot.matchId}`, error);
    }
  }

  private close(matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match) return;
    this.matches.delete(matchId);
    clearTimeout(match.selectionTimer);
    clearTimeout(match.durationTimer);
    if (match.disconnectedTimer) clearTimeout(match.disconnectedTimer);
    for (const playerId of match.roster.keys()) this.playerMatches.delete(playerId);
    void match.worker.terminate();
  }
}

export const matchManager = new MatchManager();
