import type { GameInput, MatchParticipant, WorldPlayer, WorldSnapshot } from '@moba/shared';

export interface HeroStats {
  id: string;
  maxHp: number;
  speed: number;
  attack: number;
}

interface PlayerState extends WorldPlayer {
  speed: number;
  attack: number;
  selected: boolean;
  input: GameInput;
  nextAttackTick: number;
  respawnTick: number;
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
        speed: firstHero.speed,
        attack: firstHero.attack,
        kills: 0,
        deaths: 0,
        lastProcessedSeq: 0,
        selected: false,
        input: { seq: 0, dx: 0, dy: 0, attack: false },
        nextAttackTick: 0,
        respawnTick: 0,
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
    player.input = input;
  }

  pausePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) player.input = { seq: player.input.seq, dx: 0, dy: 0, attack: false };
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
        }
        continue;
      }
      const { dx, dy } = player.input;
      const magnitude = Math.hypot(dx, dy);
      const scale = magnitude > 1 ? 1 / magnitude : 1;
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
      if (player.hp <= 0 || !player.input.attack || this.tick < player.nextAttackTick) continue;
      const target = players
        .filter(other => other.team !== player.team && other.hp > 0 && Math.hypot(other.x - player.x, other.y - player.y) <= ATTACK_RANGE)
        .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y) || a.id.localeCompare(b.id))[0];
      if (!target) continue;
      target.hp = Math.max(0, target.hp - player.attack);
      player.nextAttackTick = this.tick + ATTACK_INTERVAL;
      if (target.hp === 0) {
        target.deaths++;
        target.respawnTick = this.tick + RESPAWN_TICKS;
        player.kills++;
        if (players.filter(p => p.team === player.team).reduce((sum, p) => sum + p.kills, 0) >= 5) {
          this.status = 'finished';
          this.winnerTeam = player.team;
          break;
        }
      }
    }
  }

  snapshot(): WorldSnapshot {
    return {
      matchId: this.matchId,
      tick: this.tick,
      status: this.status,
      players: [...this.players.values()].map(({ id, username, team, heroId, x, y, hp, maxHp, speed, kills, deaths, lastProcessedSeq }) => ({
        id, username, team, heroId, x, y, hp, maxHp, speed, kills, deaths, lastProcessedSeq,
      })),
      ...(this.winnerTeam ? { winnerTeam: this.winnerTeam } : {}),
    };
  }
}
