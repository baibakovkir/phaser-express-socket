import type { WorldUnit } from '@moba/shared';
import {
  BASES, BOSS, BOSS_SPAWN_TICKS, CAMPS, JUNGLE_SPAWN_TICKS,
  LANES, LANE_WAVE_TICKS, MAP_HEIGHT, MAP_WIDTH, SHRINES, TICKS_PER_SECOND,
} from '@moba/shared/map';

export interface CombatPlayer {
  id: string;
  team: 1 | 2;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

interface UnitState extends WorldUnit {
  speed: number;
  attack: number;
  range: number;
  nextAttackTick: number;
  pathIndex: number;
  campId?: number;
  homeX: number;
  homeY: number;
  aggroPlayerId?: string;
  aggroUntil: number;
}

type EmitEffect = (sourceUnitId: number, kind: string, x: number, y: number, targetId?: string) => void;
type DamagePlayer = (player: CombatPlayer, amount: number) => void;

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
export class UnitSystem {
  readonly units = new Map<number, UnitState>();
  winnerTeam?: 1 | 2;
  bossBuffTeam?: 1 | 2;
  bossBuffUntil = 0;
  nextBossTick = BOSS_SPAWN_TICKS;
  private nextId = 1;

  constructor() {
    for (const team of [1, 2] as const) {
      const base = BASES[team];
      this.add('throne', team, 0, base.x, base.y, 1800);
      this.add('fountain', team, 0, base.x + (team === 1 ? -75 : 75), base.y + (team === 1 ? 65 : -65), 1000);
      for (const lane of LANES) {
        const points = lane.points;
        for (const index of team === 1 ? [1, 2] : [points.length - 2, points.length - 3]) {
          this.add('tower', team, lane.id, points[index].x, points[index].y, 650);
        }
        const start = team === 1 ? points[0] : points.at(-1)!;
        const next = team === 1 ? points[1] : points.at(-2)!;
        this.add('barracks', team, lane.id, start.x * 0.7 + next.x * 0.3, start.y * 0.7 + next.y * 0.3, 1000);
      }
    }
    for (const shrine of SHRINES) this.add('shrine', 0, 0, shrine.x, shrine.y, 500);
  }

  private add(kind: WorldUnit['kind'], team: 0 | 1 | 2, lane: number, x: number, y: number, maxHp: number, campId?: number): UnitState {
    const unit: UnitState = {
      id: this.nextId++, kind, team, lane, x, y, hp: maxHp, maxHp,
      speed: kind === 'creep' ? 130 : kind === 'neutral' ? 135 : kind === 'boss' ? 110 : 0,
      attack: kind === 'creep' ? 18 : kind === 'neutral' ? 30 : kind === 'boss' ? 75 : kind === 'tower' ? 55 : 0,
      range: kind === 'tower' ? 235 : kind === 'boss' ? 80 : 72,
      nextAttackTick: 0, pathIndex: team === 2 && lane ? (LANES.find(item => item.id === lane)?.points.length ?? 2) - 2 : 1,
      campId, homeX: x, homeY: y, aggroUntil: 0,
    };
    this.units.set(unit.id, unit);
    return unit;
  }

  snapshot(): WorldUnit[] {
    return [...this.units.values()].map(({ id, kind, team, lane, x, y, hp, maxHp }) => ({ id, kind, team, lane, x, y, hp, maxHp }));
  }

  nearestAttackable(team: 1 | 2, x: number, y: number, range: number): WorldUnit | undefined {
    return [...this.units.values()]
      .filter(unit => unit.hp > 0 && this.canDamage(team, unit) && distance(unit, { x, y }) <= range)
      .sort((a, b) => distance(a, { x, y }) - distance(b, { x, y }) || a.id - b.id)[0];
  }

  canDamage(team: 0 | 1 | 2, unit: WorldUnit): boolean {
    if (unit.hp <= 0 || unit.kind === 'fountain' || unit.kind === 'shrine') return false;
    if (unit.team === team) return false;
    if (unit.kind === 'barracks') {
      return ![...this.units.values()].some(other => other.team === unit.team && other.lane === unit.lane && other.kind === 'tower' && other.hp > 0);
    }
    if (unit.kind === 'throne') {
      return ![...this.units.values()].some(other => other.team === unit.team && other.kind === 'barracks' && other.hp > 0);
    }
    return true;
  }

  damageUnit(team: 0 | 1 | 2, id: number, amount: number, tick: number, playerId?: string): boolean {
    const unit = this.units.get(id);
    if (!unit || !this.canDamage(team, unit)) return false;
    unit.hp = Math.max(0, unit.hp - Math.round(amount));
    if (playerId && (unit.kind === 'neutral' || unit.kind === 'boss')) {
      unit.aggroPlayerId = playerId;
      unit.aggroUntil = tick + 6 * TICKS_PER_SECOND;
    }
    if (unit.hp > 0) return true;
    if (unit.kind === 'throne' && team) this.winnerTeam = team;
    if (unit.kind === 'boss' && team) {
      this.bossBuffTeam = team;
      this.bossBuffUntil = tick + 120 * TICKS_PER_SECOND;
      this.nextBossTick = tick + 300 * TICKS_PER_SECOND;
    }
    if (unit.kind === 'creep' || unit.kind === 'neutral' || unit.kind === 'boss') this.units.delete(id);
    return true;
  }

  damageMultiplier(team: 1 | 2, tick: number): number {
    return this.bossBuffTeam === team && tick < this.bossBuffUntil ? 1.25 : 1;
  }

  blocksPlayer(x: number, y: number): boolean {
    return [...this.units.values()].some(unit => unit.hp > 0 &&
      ['tower', 'barracks', 'throne'].includes(unit.kind) && distance(unit, { x, y }) < 48);
  }

  step(tick: number, players: CombatPlayer[], emit: EmitEffect, damagePlayer: DamagePlayer): void {
    if (tick % LANE_WAVE_TICKS === 0) this.spawnLaneWave();
    if (tick % JUNGLE_SPAWN_TICKS === 0) this.spawnCamps();
    if (tick >= this.nextBossTick && ![...this.units.values()].some(unit => unit.kind === 'boss')) {
      this.add('boss', 0, 0, BOSS.x, BOSS.y, 2200);
      this.nextBossTick = Number.POSITIVE_INFINITY;
    }

    for (const unit of [...this.units.values()].sort((a, b) => a.id - b.id)) {
      if (unit.hp <= 0) continue;
      if (unit.kind === 'fountain') {
        for (const player of players) {
          if (player.team === unit.team && player.hp > 0 && distance(player, unit) < 145) {
            player.hp = Math.min(player.maxHp, player.hp + 8 / TICKS_PER_SECOND);
          }
        }
        continue;
      }
      if (unit.kind === 'shrine') {
        const near = players.filter(player => player.hp > 0 && distance(player, unit) < 115);
        const teams = new Set(near.map(player => player.team));
        if (teams.size === 1) {
          const team = near[0].team;
          unit.aggroUntil = unit.team === team ? 0 : unit.aggroUntil + 1;
          if (unit.aggroUntil >= 5 * TICKS_PER_SECOND) {
            unit.team = team;
            unit.aggroUntil = 0;
            emit(unit.id, 'shrine', unit.x, unit.y);
          }
        } else unit.aggroUntil = 0;
        if (unit.team) for (const player of near) {
          if (player.team === unit.team) player.hp = Math.min(player.maxHp, player.hp + 2 / TICKS_PER_SECOND);
        }
        continue;
      }
      if (!unit.attack) continue;
      const target = this.findTarget(unit, players, tick);
      if (target) {
        if (distance(unit, target) > unit.range && unit.speed) this.moveToward(unit, target.x, target.y);
        else if (tick >= unit.nextAttackTick) {
          if ('kind' in target) this.damageUnit(unit.team, target.id, unit.attack, tick);
          else damagePlayer(target, unit.attack);
          emit(unit.id, 'attack', target.x, target.y, typeof target.id === 'string' ? target.id : undefined);
          unit.nextAttackTick = tick + (unit.kind === 'tower' ? 25 : unit.kind === 'boss' ? 30 : 35);
        }
      } else if (unit.kind === 'creep') this.advanceCreep(unit);
      else if ((unit.kind === 'neutral' || unit.kind === 'boss') && distance(unit, { x: unit.homeX, y: unit.homeY }) > 2) {
        this.moveToward(unit, unit.homeX, unit.homeY);
      }
    }
  }

  private spawnLaneWave(): void {
    for (const lane of LANES) for (const team of [1, 2] as const) {
      const active = [...this.units.values()].filter(unit => unit.kind === 'creep' && unit.team === team && unit.lane === lane.id).length;
      if (active >= 24) continue;
      const point = team === 1 ? lane.points[0] : lane.points.at(-1)!;
      for (let index = 0; index < 3; index++) {
        this.add('creep', team, lane.id, point.x + (team === 1 ? -index * 23 : index * 23), point.y + (index - 1) * 22, 155);
      }
    }
  }

  private spawnCamps(): void {
    for (const camp of CAMPS) {
      const campUnits = [...this.units.values()].filter(unit => unit.kind === 'neutral' && unit.campId === camp.id);
      if (campUnits.length >= 6 || campUnits.some(unit => distance(unit, camp) < 175)) continue;
      this.add('neutral', 0, 0, camp.x - 20, camp.y, 220, camp.id);
      this.add('neutral', 0, 0, camp.x + 20, camp.y, 220, camp.id);
    }
  }

  private findTarget(unit: UnitState, players: CombatPlayer[], tick: number): CombatPlayer | UnitState | undefined {
    const searchRange = unit.kind === 'tower' ? unit.range : unit.kind === 'creep' ? 150 : 180;
    const candidates: (CombatPlayer | UnitState)[] = [];
    if (unit.kind === 'neutral' || unit.kind === 'boss') {
      for (const player of players) {
        if (player.hp <= 0) continue;
        if (distance(player, unit) < searchRange || player.id === unit.aggroPlayerId && tick < unit.aggroUntil && distance(player, unit) < 700) {
          candidates.push(player);
        }
      }
      for (const other of this.units.values()) {
        if (other.kind === 'creep' && other.hp > 0 && distance(other, unit) < 130) candidates.push(other);
      }
      if (distance(unit, { x: unit.homeX, y: unit.homeY }) > 750) return undefined;
    } else {
      for (const player of players) {
        if (player.hp > 0 && player.team !== unit.team && distance(player, unit) < searchRange) candidates.push(player);
      }
      for (const other of this.units.values()) {
        if (other.id !== unit.id && distance(other, unit) < searchRange && this.canDamage(unit.team, other)) candidates.push(other);
      }
    }
    const target = candidates.sort((a, b) => {
      if (unit.kind === 'tower') {
        const aCreep = 'kind' in a && a.kind === 'creep' ? 0 : 1;
        const bCreep = 'kind' in b && b.kind === 'creep' ? 0 : 1;
        if (aCreep !== bCreep) return aCreep - bCreep;
      }
      return distance(a, unit) - distance(b, unit);
    })[0];
    if (target && (unit.kind === 'neutral' || unit.kind === 'boss') && typeof target.id === 'string') {
      unit.aggroPlayerId = target.id;
      unit.aggroUntil = tick + 6 * TICKS_PER_SECOND;
    }
    return target;
  }

  private advanceCreep(unit: UnitState): void {
    const lane = LANES.find(item => item.id === unit.lane);
    if (!lane) return;
    const point = lane.points[unit.pathIndex];
    if (!point) return;
    if (distance(unit, point) < 12) unit.pathIndex += unit.team === 1 ? 1 : -1;
    else this.moveToward(unit, point.x, point.y);
  }

  private moveToward(unit: UnitState, x: number, y: number): void {
    const length = Math.hypot(x - unit.x, y - unit.y);
    if (length < 0.001) return;
    const step = Math.min(unit.speed / TICKS_PER_SECOND, length);
    unit.x = Math.max(18, Math.min(MAP_WIDTH - 18, unit.x + (x - unit.x) / length * step));
    unit.y = Math.max(18, Math.min(MAP_HEIGHT - 18, unit.y + (y - unit.y) / length * step));
  }
}
