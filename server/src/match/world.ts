import type { GameInput, MatchParticipant, WorldEffect, WorldPlayer, WorldSnapshot } from '@moba/shared';
import { BASES, MAP_HEIGHT, MAP_WIDTH, TICKS_PER_SECOND } from '@moba/shared/map';
import type { CombatPlayer } from './units.js';

const unitModule = new URL(`./units.${import.meta.url.endsWith('.ts') ? 'ts' : 'js'}`, import.meta.url);
const { UnitSystem } = await import(unitModule.href) as typeof import('./units.js');

export interface AbilityStats {
  key: 'Q' | '1' | '2' | '3';
  cooldown: number;
  manaCost: number;
  damage: number;
  range: number;
}

export interface HeroStats {
  id: string;
  maxHp: number;
  speed: number;
  attack: number;
  maxMana?: number;
  manaRegen?: number;
  abilities?: AbilityStats[];
}

interface PlayerState extends WorldPlayer {
  speed: number;
  attack: number;
  selected: boolean;
  input: GameInput;
  nextAttackTick: number;
  respawnTick: number;
  queuedCast?: GameInput['cast'];
  cooldowns: Map<string, number>;
  shield: number;
  attackBoostUntil: number;
  facing: { x: number; y: number };
}

const RADIUS = 18;
const ATTACK_RANGE = 145;
const ATTACK_INTERVAL = 24;
const RESPAWN_TICKS = 150;

export class MatchWorld {
  readonly players = new Map<string, PlayerState>();
  readonly units = new UnitSystem();
  readonly matchId: string;
  readonly heroes: HeroStats[];
  tick = 0;
  status: WorldSnapshot['status'] = 'selecting';
  winnerTeam?: 1 | 2;
  private effects: WorldEffect[] = [];
  private nextEffectId = 1;

  constructor(
    matchId: string,
    participants: MatchParticipant[],
    heroes: HeroStats[],
  ) {
    this.matchId = matchId;
    this.heroes = heroes;
    const firstHero = heroes[0];
    if (!firstHero) throw new Error('Match requires at least one hero');
    participants.forEach((participant, index) => {
      const sideIndex = participants.slice(0, index).filter(p => p.team === participant.team).length;
      this.players.set(participant.playerId, {
        id: participant.playerId,
        username: participant.username,
        team: participant.team,
        heroId: firstHero.id,
        x: BASES[participant.team].x + (participant.team === 1 ? 60 : -60),
        y: BASES[participant.team].y + (participant.team === 1 ? 40 : -40) + sideIndex * 45,
        hp: firstHero.maxHp,
        maxHp: firstHero.maxHp,
        mana: firstHero.maxMana ?? 0,
        maxMana: firstHero.maxMana ?? 0,
        speed: firstHero.speed,
        attack: firstHero.attack,
        kills: 0,
        deaths: 0,
        lastProcessedSeq: 0,
        selected: false,
        input: { seq: 0, dx: 0, dy: 0, attack: false },
        nextAttackTick: 0,
        respawnTick: 0,
        cooldowns: new Map(),
        shield: 0,
        attackBoostUntil: 0,
        facing: { x: participant.team === 1 ? 1 : -1, y: 0 },
      });
    });
  }

  selectHero(playerId: string, heroId: string): boolean {
    if (this.status !== 'selecting') return false;
    const player = this.players.get(playerId);
    const hero = this.heroes.find(item => item.id === heroId);
    if (!player || !hero || player.selected) return false;
    player.heroId = hero.id;
    player.maxHp = hero.maxHp;
    player.hp = hero.maxHp;
    player.speed = hero.speed;
    player.attack = hero.attack;
    player.maxMana = hero.maxMana ?? 0;
    player.mana = player.maxMana;
    player.selected = true;
    if ([...this.players.values()].every(item => item.selected)) this.status = 'playing';
    return true;
  }

  setInput(playerId: string, input: GameInput): void {
    if (this.status !== 'playing') return;
    const player = this.players.get(playerId);
    if (!player || player.hp <= 0 || input.seq <= player.lastProcessedSeq || input.seq <= player.input.seq) return;
    if (!Number.isSafeInteger(input.seq) || input.seq < 1 || !Number.isFinite(input.dx) || !Number.isFinite(input.dy)) return;
    if (Math.abs(input.dx) > 1 || Math.abs(input.dy) > 1 || typeof input.attack !== 'boolean') return;
    if (input.cast !== undefined && !['Q', '1', '2', '3'].includes(input.cast)) return;
    if (input.cast && !player.queuedCast) player.queuedCast = input.cast;
    player.input = input;
  }

  pausePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.input = { seq: player.input.seq, dx: 0, dy: 0, attack: false };
      player.queuedCast = undefined;
    }
  }

  step(): void {
    if (this.status !== 'playing') return;
    this.tick++;
    const players = [...this.players.values()].sort((a, b) => a.id.localeCompare(b.id));
    for (const player of players) {
      if (player.hp <= 0) {
        if (this.tick >= player.respawnTick) {
          player.hp = player.maxHp;
          player.x = BASES[player.team].x + (player.team === 1 ? 60 : -60);
          player.y = BASES[player.team].y + (player.team === 1 ? 40 : -40);
          player.mana = player.maxMana;
          player.shield = 0;
        }
        continue;
      }
      const { dx, dy } = player.input;
      const hero = this.heroes.find(item => item.id === player.heroId);
      player.mana = Math.min(player.maxMana, player.mana + (hero?.manaRegen ?? 0) / TICKS_PER_SECOND);
      const magnitude = Math.hypot(dx, dy);
      const scale = magnitude > 1 ? 1 / magnitude : 1;
      if (magnitude > 0) player.facing = { x: dx * scale, y: dy * scale };
      const nextX = Math.max(RADIUS, Math.min(MAP_WIDTH - RADIUS, player.x + dx * scale * player.speed / TICKS_PER_SECOND));
      const nextY = Math.max(RADIUS, Math.min(MAP_HEIGHT - RADIUS, player.y + dy * scale * player.speed / TICKS_PER_SECOND));
      const blocked = this.units.blocksPlayer(nextX, nextY) ||
        players.some(other => other !== player && other.hp > 0 && Math.hypot(nextX - other.x, nextY - other.y) < RADIUS * 2);
      if (!blocked) {
        player.x = nextX;
        player.y = nextY;
      }
      player.lastProcessedSeq = player.input.seq;
    }
    for (const player of players) {
      if (player.queuedCast && player.hp > 0) this.cast(player, player.queuedCast, players);
      player.queuedCast = undefined;
      if (this.units.winnerTeam) break;
    }
    for (const player of this.units.winnerTeam ? [] : players) {
      if (player.hp <= 0 || !player.input.attack || this.tick < player.nextAttackTick) continue;
      const heroTarget = players
        .filter(other => other.team !== player.team && other.hp > 0 && Math.hypot(other.x - player.x, other.y - player.y) <= ATTACK_RANGE)
        .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y) || a.id.localeCompare(b.id))[0];
      const unitTarget = this.units.nearestAttackable(player.team, player.x, player.y, ATTACK_RANGE);
      const amount = player.attack * (this.tick < player.attackBoostUntil ? 1.5 : 1) * this.units.damageMultiplier(player.team, this.tick);
      const hitUnit = unitTarget && (!heroTarget || Math.hypot(unitTarget.x - player.x, unitTarget.y - player.y) < Math.hypot(heroTarget.x - player.x, heroTarget.y - player.y));
      if (hitUnit) this.units.damageUnit(player.team, unitTarget.id, amount, this.tick, player.id);
      else if (heroTarget) this.applyDamage(player, heroTarget, amount);
      player.nextAttackTick = this.tick + ATTACK_INTERVAL;
      this.effect(player, 'attack', hitUnit ? unitTarget.x : heroTarget?.x ?? player.x + player.facing.x * 75,
        hitUnit ? unitTarget.y : heroTarget?.y ?? player.y + player.facing.y * 75, hitUnit ? undefined : heroTarget?.id);
      if (this.units.winnerTeam) break;
    }
    if (!this.units.winnerTeam) this.units.step(this.tick, players,
      (sourceUnitId, kind, x, y, targetId) => this.unitEffect(sourceUnitId, kind, x, y, targetId),
      (target, amount) => this.applyUnitDamage(target as PlayerState, amount));
    if (this.units.winnerTeam) {
      this.winnerTeam = this.units.winnerTeam;
      this.status = 'finished';
    }
    this.effects = this.effects.filter(effect => this.tick - effect.tick < 18);
  }

  private cast(player: PlayerState, key: NonNullable<GameInput['cast']>, players: PlayerState[]): void {
    const hero = this.heroes.find(item => item.id === player.heroId);
    const ability = hero?.abilities?.find(item => item.key === key);
    if (!ability || this.tick < (player.cooldowns.get(key) ?? 0) || player.mana < ability.manaCost) return;
    const enemy = players
      .filter(other => other.team !== player.team && other.hp > 0 && Math.hypot(other.x - player.x, other.y - player.y) <= ability.range)
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
    const unitEnemy = this.units.nearestAttackable(player.team, player.x, player.y, ability.range);
    const ally = players
      .filter(other => other.team === player.team && other.hp > 0)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    let used = true;
    if (key === 'Q' || (key === '2' && player.heroId === 'marksman')) {
      const direction = key === 'Q' ? 1 : -1;
      const distance = Math.min(ability.range || 160, 250);
      for (let traveled = 0; traveled < distance; traveled += RADIUS) {
        const step = Math.min(RADIUS, distance - traveled);
        const x = Math.max(RADIUS, Math.min(MAP_WIDTH - RADIUS, player.x + player.facing.x * step * direction));
        const y = Math.max(RADIUS, Math.min(MAP_HEIGHT - RADIUS, player.y + player.facing.y * step * direction));
        if (this.units.blocksPlayer(x, y) || players.some(other => other !== player && other.hp > 0 &&
          Math.hypot(x - other.x, y - other.y) < RADIUS * 2)) break;
        player.x = x;
        player.y = y;
      }
      this.effect(player, 'dash', player.x, player.y);
    } else if (key === '2') {
      if (player.heroId === 'support') {
        const target = ally ?? player;
        target.hp = Math.min(target.maxHp, target.hp + 100);
        this.effect(player, 'heal', target.x, target.y, target.id);
      } else if (player.heroId === 'mage' || player.heroId === 'assassin') {
        player.shield += player.heroId === 'mage' ? 140 : 80;
        this.effect(player, 'shield', player.x, player.y);
      } else {
        player.attackBoostUntil = this.tick + 120;
        this.effect(player, 'buff', player.x, player.y);
      }
    } else if (key === '3' && player.heroId === 'support') {
      const target = players.find(other => other.team === player.team && other.hp === 0);
      if (!target) used = false;
      else {
        target.hp = Math.ceil(target.maxHp * 0.4);
        target.x = player.x + 35;
        target.y = player.y;
        this.effect(player, 'revive', target.x, target.y, target.id);
      }
    } else if (key === '1' && ['mage', 'marksman'].includes(player.heroId) ||
               key === '3' && ['warrior', 'mage', 'marksman'].includes(player.heroId)) {
      const targets = players.filter(other => other.team !== player.team && other.hp > 0 &&
        Math.hypot(other.x - player.x, other.y - player.y) <= ability.range);
      const unitTargets = [...this.units.units.values()].filter(unit => this.units.canDamage(player.team, unit) &&
        Math.hypot(unit.x - player.x, unit.y - player.y) <= ability.range);
      if (!targets.length && !unitTargets.length) {
        this.effect(player, key === '3' ? 'meteor' : 'nova',
          player.x + player.facing.x * Math.min(ability.range, 150),
          player.y + player.facing.y * Math.min(ability.range, 150));
      } else {
        for (const target of targets) this.applyDamage(player, target, ability.damage);
        for (const target of unitTargets) this.units.damageUnit(player.team, target.id, ability.damage, this.tick, player.id);
        const first = targets[0] ?? unitTargets[0];
        this.effect(player, key === '3' ? 'meteor' : 'nova', first.x, first.y);
      }
    } else if (enemy || unitEnemy) {
      const target = enemy ?? unitEnemy!;
      const damage = player.heroId === 'fighter' && key === '3' && target.hp < target.maxHp * 0.35
        ? ability.damage * 1.5 : ability.damage;
      if (enemy) this.applyDamage(player, enemy, damage);
      else this.units.damageUnit(player.team, unitEnemy!.id, damage, this.tick, player.id);
      this.effect(player, key === '3' ? 'execute' : 'strike', target.x, target.y, enemy?.id);
    } else {
      // A missed cast still has a visible effect and consumes its cooldown.
      this.effect(player, key === '3' ? 'execute' : 'strike',
        player.x + player.facing.x * Math.min(ability.range, 120),
        player.y + player.facing.y * Math.min(ability.range, 120));
    }
    if (!used) return;
    player.mana -= ability.manaCost;
    player.cooldowns.set(key, this.tick + Math.max(1, Math.ceil(ability.cooldown * TICKS_PER_SECOND / 1000)));
  }

  private applyDamage(attacker: PlayerState, target: PlayerState, amount: number): void {
    if (target.hp <= 0) return;
    const absorbed = Math.min(target.shield, amount);
    target.shield -= absorbed;
    target.hp = Math.max(0, target.hp - Math.round(amount - absorbed));
    if (target.hp > 0) return;
    target.deaths++;
    target.respawnTick = this.tick + RESPAWN_TICKS;
    attacker.kills++;
  }

  private applyUnitDamage(target: PlayerState, amount: number): void {
    if (target.hp <= 0) return;
    target.hp = Math.max(0, target.hp - Math.round(amount));
    if (target.hp === 0) {
      target.deaths++;
      target.respawnTick = this.tick + RESPAWN_TICKS;
    }
  }

  private effect(caster: PlayerState, kind: string, x: number, y: number, targetId?: string): void {
    this.effects.push({ id: this.nextEffectId++, casterId: caster.id, kind, x, y, targetId, tick: this.tick });
  }

  private unitEffect(sourceUnitId: number, kind: string, x: number, y: number, targetId?: string): void {
    this.effects.push({ id: this.nextEffectId++, sourceUnitId, kind, x, y, targetId, tick: this.tick });
  }

  snapshot(): WorldSnapshot {
    return {
      matchId: this.matchId,
      tick: this.tick,
      status: this.status,
      players: [...this.players.values()].map(({ id, username, team, heroId, x, y, hp, maxHp, mana, maxMana, speed, kills, deaths, lastProcessedSeq }) => ({
        id, username, team, heroId, x, y, hp, maxHp, mana, maxMana, speed, kills, deaths, lastProcessedSeq,
      })),
      units: this.units.snapshot(),
      effects: this.effects,
      ...(this.winnerTeam ? { winnerTeam: this.winnerTeam } : {}),
    };
  }
}
