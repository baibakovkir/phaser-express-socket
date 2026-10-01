import type { GameInput, MatchParticipant, WorldEffect, WorldPlayer, WorldSnapshot } from '@moba/shared';

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

const TICKS_PER_SECOND = 30;
const WIDTH = 1280;
const HEIGHT = 720;
const RADIUS = 18;
const ATTACK_RANGE = 145;
const ATTACK_INTERVAL = 24;
const RESPAWN_TICKS = 150;

export class MatchWorld {
  readonly players = new Map<string, PlayerState>();
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
        x: participant.team === 1 ? 120 : WIDTH - 120,
        y: 250 + sideIndex * 110,
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
          player.x = player.team === 1 ? 120 : WIDTH - 120;
          player.y = 360;
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
      const nextX = Math.max(RADIUS, Math.min(WIDTH - RADIUS, player.x + dx * scale * player.speed / TICKS_PER_SECOND));
      const nextY = Math.max(RADIUS, Math.min(HEIGHT - RADIUS, player.y + dy * scale * player.speed / TICKS_PER_SECOND));
      const blocked = players.some(other => other !== player && other.hp > 0 && Math.hypot(nextX - other.x, nextY - other.y) < RADIUS * 2);
      if (!blocked) {
        player.x = nextX;
        player.y = nextY;
      }
      player.lastProcessedSeq = player.input.seq;
    }
    for (const player of players) {
      if (player.queuedCast && player.hp > 0) this.cast(player, player.queuedCast, players);
      player.queuedCast = undefined;
      if (this.winnerTeam) break;
    }
    for (const player of this.winnerTeam ? [] : players) {
      if (player.hp <= 0 || !player.input.attack || this.tick < player.nextAttackTick) continue;
      const target = players
        .filter(other => other.team !== player.team && other.hp > 0 && Math.hypot(other.x - player.x, other.y - player.y) <= ATTACK_RANGE)
        .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y) || a.id.localeCompare(b.id))[0];
      if (!target) continue;
      this.applyDamage(player, target, player.attack * (this.tick < player.attackBoostUntil ? 1.5 : 1), players);
      player.nextAttackTick = this.tick + ATTACK_INTERVAL;
      this.effect(player, 'attack', target.x, target.y, target.id);
      if (this.winnerTeam) break;
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
    const ally = players
      .filter(other => other.team === player.team && other.hp > 0)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    let used = true;
    if (key === 'Q' || (key === '2' && player.heroId === 'marksman')) {
      const direction = key === 'Q' ? 1 : -1;
      const distance = Math.min(ability.range || 160, 250);
      player.x = Math.max(RADIUS, Math.min(WIDTH - RADIUS, player.x + player.facing.x * distance * direction));
      player.y = Math.max(RADIUS, Math.min(HEIGHT - RADIUS, player.y + player.facing.y * distance * direction));
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
      if (!targets.length) used = false;
      else {
        for (const target of targets) this.applyDamage(player, target, ability.damage, players);
        this.effect(player, key === '3' ? 'meteor' : 'nova', targets[0].x, targets[0].y);
      }
    } else if (enemy) {
      const damage = player.heroId === 'fighter' && key === '3' && enemy.hp < enemy.maxHp * 0.35
        ? ability.damage * 1.5 : ability.damage;
      this.applyDamage(player, enemy, damage, players);
      this.effect(player, key === '3' ? 'execute' : 'strike', enemy.x, enemy.y, enemy.id);
    } else used = false;
    if (!used) return;
    player.mana -= ability.manaCost;
    player.cooldowns.set(key, this.tick + Math.max(1, Math.ceil(ability.cooldown * TICKS_PER_SECOND / 1000)));
  }

  private applyDamage(attacker: PlayerState, target: PlayerState, amount: number, players: PlayerState[]): void {
    if (target.hp <= 0) return;
    const absorbed = Math.min(target.shield, amount);
    target.shield -= absorbed;
    target.hp = Math.max(0, target.hp - Math.round(amount - absorbed));
    if (target.hp > 0) return;
    target.deaths++;
    target.respawnTick = this.tick + RESPAWN_TICKS;
    attacker.kills++;
    if (players.filter(item => item.team === attacker.team).reduce((sum, item) => sum + item.kills, 0) >= 5) {
      this.status = 'finished';
      this.winnerTeam = attacker.team;
    }
  }

  private effect(caster: PlayerState, kind: string, x: number, y: number, targetId?: string): void {
    this.effects.push({ id: this.nextEffectId++, casterId: caster.id, kind, x, y, targetId, tick: this.tick });
  }

  snapshot(): WorldSnapshot {
    return {
      matchId: this.matchId,
      tick: this.tick,
      status: this.status,
      players: [...this.players.values()].map(({ id, username, team, heroId, x, y, hp, maxHp, mana, maxMana, speed, kills, deaths, lastProcessedSeq }) => ({
        id, username, team, heroId, x, y, hp, maxHp, mana, maxMana, speed, kills, deaths, lastProcessedSeq,
      })),
      effects: this.effects,
      ...(this.winnerTeam ? { winnerTeam: this.winnerTeam } : {}),
    };
  }
}
