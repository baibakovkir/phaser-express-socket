import type { GameInput, ItemDefinition, MatchParticipant, WorldEffect, WorldPlayer, WorldSnapshot, WorldUnit } from '@moba/shared';
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
  hpRegen?: number;
  abilities?: AbilityStats[];
}

interface PlayerState extends WorldPlayer {
  speed: number;
  attack: number;
  lifesteal: number;
  selected: boolean;
  input: GameInput;
  nextAttackTick: number;
  respawnTick: number;
  queuedCast?: Pick<GameInput, 'cast' | 'aimX' | 'aimY'>;
  cooldowns: Map<string, number>;
  shield: number;
  itemShield: number;
  attackBoostUntil: number;
  attackSpeedUntil: number;
  facing: { x: number; y: number };
  damageContributors: Map<string, number>;
  shieldUntil: number;
}

const RADIUS = 18;
const ATTACK_RANGE = 145;
const ATTACK_INTERVAL = 24;
const RESPAWN_TICKS = 150;
const LAST_STAND_TICK = 15 * 60 * TICKS_PER_SECOND;
const MATCH_END_TICK = 30 * 60 * TICKS_PER_SECOND;

export class MatchWorld {
  readonly players = new Map<string, PlayerState>();
  readonly units = new UnitSystem();
  readonly matchId: string;
  readonly heroes: HeroStats[];
  readonly items: ItemDefinition[];
  tick = 0;
  status: WorldSnapshot['status'] = 'selecting';
  winnerTeam?: 1 | 2;
  private effects: WorldEffect[] = [];
  private nextEffectId = 1;

  constructor(
    matchId: string,
    participants: MatchParticipant[],
    heroes: HeroStats[],
    items: ItemDefinition[] = [],
  ) {
    this.matchId = matchId;
    this.heroes = heroes;
    this.items = items;
    this.units.onKilled = (unit, playerId, team) => this.rewardUnit(unit, playerId, team);
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
        lifesteal: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        gold: 500,
        goldEarned: 0,
        lastHits: 0,
        inventory: [],
        abilityReadyTicks: [0, 0, 0, 0],
        lastProcessedSeq: 0,
        selected: false,
        input: { seq: 0, dx: 0, dy: 0, attack: false },
        nextAttackTick: 0,
        respawnTick: 0,
        cooldowns: new Map(),
        shield: 0,
        itemShield: 0,
        attackBoostUntil: 0,
        attackSpeedUntil: 0,
        facing: { x: participant.team === 1 ? 1 : -1, y: 0 },
        damageContributors: new Map(),
        shieldUntil: 0,
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

  buyItem(playerId: string, itemId: string): { success: boolean; error?: string } {
    const player = this.players.get(playerId);
    const item = this.items.find(candidate => candidate.id === itemId);
    if (this.status !== 'playing' || !player || player.hp <= 0 || !item) return { success: false, error: 'Item unavailable' };
    const fountain = [...this.units.units.values()].find(unit => unit.kind === 'fountain' && unit.team === player.team);
    if (!fountain || Math.hypot(player.x - fountain.x, player.y - fountain.y) > 180) {
      return { success: false, error: 'Return to your fountain to shop' };
    }
    const used: WorldPlayer['inventory'] = [];
    for (const id of item.components) {
      const component = player.inventory.find(slot => !used.includes(slot) && this.items.find(entry => entry.index === slot.itemIndex)?.id === id);
      if (component) used.push(component);
    }
    const price = item.price - used.reduce((sum, slot) => sum + (this.items.find(entry => entry.index === slot.itemIndex)?.price ?? 0), 0);
    if (player.gold < price) return { success: false, error: 'Not enough gold' };
    player.gold -= price;
    player.inventory = player.inventory.filter(slot => !used.includes(slot));
    player.inventory.push({ itemIndex: item.index, readyTick: 0 });
    this.recalculateStats(player);
    return { success: true };
  }

  useItem(playerId: string, slotIndex: number): { success: boolean; error?: string } {
    const player = this.players.get(playerId);
    const slot = Number.isSafeInteger(slotIndex) && slotIndex >= 0 ? player?.inventory[slotIndex] : undefined;
    const item = this.items.find(candidate => candidate.index === slot?.itemIndex);
    if (this.status !== 'playing' || !player || player.hp <= 0 || !item?.activeKind || !slot) {
      return { success: false, error: 'Active item unavailable' };
    }
    if (slot.readyTick > this.tick) return { success: false, error: 'Item is cooling down' };
    if (item.activeKind === 'heal') {
      const ally = [...this.players.values()].filter(other => other.team === player.team && other.hp > 0 &&
        Math.hypot(other.x - player.x, other.y - player.y) <= 280)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.id.localeCompare(b.id))[0];
      if (!ally) return { success: false, error: 'No target in range' };
      ally.hp = Math.min(ally.maxHp, ally.hp + 140);
      this.effect(player, 'item-heal', ally.x, ally.y, ally.id);
    } else if (item.activeKind === 'shield') {
      player.itemShield += 130;
      player.shieldUntil = this.tick + 5 * TICKS_PER_SECOND;
      this.effect(player, 'item-shield', player.x, player.y);
    } else return { success: false, error: 'Unknown item effect' };
    slot.readyTick = this.tick + item.cooldown * TICKS_PER_SECOND;
    return { success: true };
  }

  private recalculateStats(player: PlayerState): void {
    const hero = this.heroes.find(entry => entry.id === player.heroId)!;
    const bonuses = player.inventory.map(slot => this.items.find(item => item.index === slot.itemIndex)?.stats ?? {});
    const total = (key: keyof ItemDefinition['stats']) => bonuses.reduce((sum, stats) => sum + (stats[key] ?? 0), 0);
    const maxHp = hero.maxHp + total('maxHp');
    const maxMana = (hero.maxMana ?? 0) + total('maxMana');
    player.hp = Math.min(maxHp, player.hp + maxHp - player.maxHp);
    player.mana = Math.min(maxMana, player.mana + maxMana - player.maxMana);
    player.maxHp = maxHp;
    player.maxMana = maxMana;
    player.attack = hero.attack + total('attack');
    player.speed = hero.speed + total('speed');
    player.lifesteal = total('lifesteal');
  }

  private award(player: PlayerState, amount: number): void {
    player.gold += amount;
    player.goldEarned += amount;
  }

  private rewardUnit(unit: WorldUnit, playerId?: string, team?: 0 | 1 | 2): void {
    if (unit.kind === 'creep' || unit.kind === 'neutral') {
      const player = playerId && this.players.get(playerId);
      if (player) {
        const bounty = unit.kind === 'creep' ? 35 : 55;
        this.award(player, bounty);
        this.effects.push({ id: this.nextEffectId++, casterId: player.id, kind: 'gold', x: unit.x, y: unit.y, tick: this.tick, amount: bounty });
        if (unit.kind === 'creep') player.lastHits++;
      }
    } else {
      const amount = unit.kind === 'tower' ? 80 : unit.kind === 'barracks' ? 120 : unit.kind === 'boss' ? 150 : 0;
      if (amount && team) for (const player of this.players.values()) if (player.team === team) this.award(player, amount);
    }
  }

  setInput(playerId: string, input: GameInput): void {
    if (this.status !== 'playing') return;
    const player = this.players.get(playerId);
    if (!player || input.seq <= player.lastProcessedSeq || input.seq <= player.input.seq) return;
    if (!Number.isSafeInteger(input.seq) || input.seq < 1 || !Number.isFinite(input.dx) || !Number.isFinite(input.dy)) return;
    if (Math.abs(input.dx) > 1 || Math.abs(input.dy) > 1 || typeof input.attack !== 'boolean') return;
    if (input.cast !== undefined && !['Q', '1', '2', '3'].includes(input.cast)) return;
    if (input.cast && (!Number.isSafeInteger(input.aimX) || !Number.isSafeInteger(input.aimY) ||
      input.aimX! < 0 || input.aimX! > MAP_WIDTH || input.aimY! < 0 || input.aimY! > MAP_HEIGHT)) return;
    if (input.targetUnitId !== undefined && (!Number.isSafeInteger(input.targetUnitId) || input.targetUnitId < 1)) return;
    if (input.cast && player.hp > 0 && !player.queuedCast) player.queuedCast = { cast: input.cast, aimX: input.aimX, aimY: input.aimY };
    player.input = player.hp > 0 ? { ...input, attack: false } : { seq: input.seq, dx: 0, dy: 0, attack: false };
    if (player.hp <= 0) player.lastProcessedSeq = input.seq;
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
      if (this.tick % TICKS_PER_SECOND === 0) this.award(player, 2);
      if (player.hp <= 0) {
        if (this.tick < LAST_STAND_TICK && this.tick >= player.respawnTick) {
          player.hp = player.maxHp;
          player.x = BASES[player.team].x + (player.team === 1 ? 60 : -60);
          player.y = BASES[player.team].y + (player.team === 1 ? 40 : -40);
          player.mana = player.maxMana;
          player.shield = 0;
          player.itemShield = 0;
        }
        continue;
      }
      if (player.shieldUntil && this.tick >= player.shieldUntil) {
        player.itemShield = 0;
        player.shieldUntil = 0;
      }
      const { dx, dy } = player.input;
      const hero = this.heroes.find(item => item.id === player.heroId);
      const bonus = player.inventory.map(slot => this.items.find(item => item.index === slot.itemIndex)?.stats ?? {});
      player.mana = Math.min(player.maxMana, player.mana + ((hero?.manaRegen ?? 0) + bonus.reduce((sum, stats) => sum + (stats.manaRegen ?? 0), 0)) / TICKS_PER_SECOND);
      player.hp = Math.min(player.maxHp, player.hp + ((hero?.hpRegen ?? 0) + bonus.reduce((sum, stats) => sum + (stats.hpRegen ?? 0), 0)) / TICKS_PER_SECOND);
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
      if (player.queuedCast && player.hp > 0) {
        this.cast(player, player.queuedCast, players);
        player.queuedCast = undefined;
      }
      if (this.units.winnerTeam) break;
    }
    for (const player of this.units.winnerTeam ? [] : players) {
      if (player.hp <= 0 || this.tick < player.nextAttackTick) continue;
      const heroTarget = players
        .filter(other => other.team !== player.team && other.hp > 0 && Math.hypot(other.x - player.x, other.y - player.y) <= ATTACK_RANGE)
        .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y) || a.id.localeCompare(b.id))[0];
      const selectedUnit = player.input.targetUnitId && this.units.units.get(player.input.targetUnitId);
      const selectedInRange = selectedUnit && this.units.canDamage(player.team, selectedUnit) &&
        Math.hypot(selectedUnit.x - player.x, selectedUnit.y - player.y) <= ATTACK_RANGE;
      const unitTarget = selectedInRange ? selectedUnit : this.units.nearestAttackable(player.team, player.x, player.y, ATTACK_RANGE);
      if (!heroTarget && !unitTarget) continue;
      const amount = player.attack * (this.tick < player.attackBoostUntil ? 1.5 : 1) * this.units.damageMultiplier(player.team, this.tick);
      const hitUnit = unitTarget && (selectedInRange || !heroTarget ||
        Math.hypot(unitTarget.x - player.x, unitTarget.y - player.y) < Math.hypot(heroTarget.x - player.x, heroTarget.y - player.y));
      let actualDamage = 0;
      if (hitUnit) {
        const before = unitTarget.hp;
        this.units.damageUnit(player.team, unitTarget.id, amount, this.tick, player.id);
        if (['creep', 'neutral', 'boss'].includes(unitTarget.kind)) actualDamage = before - unitTarget.hp;
      } else if (heroTarget) actualDamage = this.applyDamage(player, heroTarget, amount);
      if (actualDamage > 0 && player.lifesteal > 0) {
        player.hp = Math.min(player.maxHp, player.hp + Math.round(actualDamage * player.lifesteal));
        this.effect(player, 'lifesteal', player.x, player.y);
      }
      player.nextAttackTick = this.tick + (this.tick < player.attackSpeedUntil ? 14 : ATTACK_INTERVAL);
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
    } else if (this.tick >= LAST_STAND_TICK) {
      const aliveTeams = new Set(players.filter(player => player.hp > 0).map(player => player.team));
      const participatingTeams = new Set(players.map(player => player.team));
      if ((participatingTeams.size === 2 && aliveTeams.size < 2) || this.tick >= MATCH_END_TICK) {
        this.winnerTeam = aliveTeams.size === 1 && participatingTeams.size === 2 ? [...aliveTeams][0] : undefined;
        this.status = 'finished';
      }
    }
    this.effects = this.effects.filter(effect => this.tick - effect.tick < (effect.kind === 'gold' ? 30 : 18));
  }

  private cast(player: PlayerState, intent: Pick<GameInput, 'cast' | 'aimX' | 'aimY'>, players: PlayerState[]): void {
    const key = intent.cast;
    if (!key || intent.aimX === undefined || intent.aimY === undefined) return;
    const hero = this.heroes.find(item => item.id === player.heroId);
    const ability = hero?.abilities?.find(item => item.key === key);
    if (!ability || this.tick < (player.cooldowns.get(key) ?? 0) || player.mana < ability.manaCost) return;
    const maxRange = Math.max(0, ability.range);
    const rawX = intent.aimX - player.x;
    const rawY = intent.aimY - player.y;
    const length = Math.hypot(rawX, rawY);
    const scale = length > maxRange && length > 0 ? maxRange / length : 1;
    const aim = { x: player.x + rawX * scale, y: player.y + rawY * scale };
    const inRange = (other: { x: number; y: number }) => Math.hypot(other.x - player.x, other.y - player.y) <= maxRange;
    const aimedEnemy = [
      ...players.filter(other => other.team !== player.team && other.hp > 0 && inRange(other)),
      ...[...this.units.units.values()].filter(unit => this.units.canDamage(player.team, unit) && inRange(unit)),
    ].filter(other => Math.hypot(other.x - aim.x, other.y - aim.y) <= 52)
      .sort((a, b) => Math.hypot(a.x - aim.x, a.y - aim.y) - Math.hypot(b.x - aim.x, b.y - aim.y) || String(a.id).localeCompare(String(b.id)))[0];
    let used = true;
    if (key === 'Q' || (key === '2' && player.heroId === 'marksman')) {
      if (length < 1) return;
      player.facing = { x: rawX / length, y: rawY / length };
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
    } else if (key === '1' && player.heroId === 'fighter' && ability.damage === 0) {
      player.attackSpeedUntil = this.tick + 120;
      this.effect(player, 'buff', player.x, player.y);
    } else if (key === '2') {
      if (player.heroId === 'support') {
        const target = players.filter(other => other.team === player.team && other.hp > 0 && inRange(other) &&
          Math.hypot(other.x - aim.x, other.y - aim.y) <= 52).sort((a, b) =>
          Math.hypot(a.x - aim.x, a.y - aim.y) - Math.hypot(b.x - aim.x, b.y - aim.y))[0];
        if (!target) used = false;
        else {
          target.hp = Math.min(target.maxHp, target.hp + 100);
          this.effect(player, 'heal', target.x, target.y, target.id);
        }
      } else if (player.heroId === 'mage' || player.heroId === 'assassin') {
        player.shield += player.heroId === 'mage' ? 140 : 80;
        this.effect(player, 'shield', player.x, player.y);
      } else {
        player.attackBoostUntil = this.tick + 120;
        this.effect(player, 'buff', player.x, player.y);
      }
    } else if (key === '3' && player.heroId === 'support') {
      const target = this.tick < LAST_STAND_TICK ? players.find(other => other.team === player.team && other.hp === 0 &&
        inRange(other) && Math.hypot(other.x - aim.x, other.y - aim.y) <= 70) : undefined;
      if (!target) used = false;
      else {
        target.hp = Math.ceil(target.maxHp * 0.4);
        target.x = player.x + 35;
        target.y = player.y;
        this.effect(player, 'revive', target.x, target.y, target.id);
      }
    } else if ((key === '1' && ['mage', 'marksman'].includes(player.heroId)) ||
               (key === '3' && ['warrior', 'mage', 'marksman'].includes(player.heroId))) {
      const radius = key === '3' ? 105 : 85;
      for (const target of players.filter(other => other.team !== player.team && other.hp > 0 && inRange(other) &&
        Math.hypot(other.x - aim.x, other.y - aim.y) <= radius)) this.applyDamage(player, target, ability.damage);
      for (const target of [...this.units.units.values()].filter(unit => this.units.canDamage(player.team, unit) && inRange(unit) &&
        Math.hypot(unit.x - aim.x, unit.y - aim.y) <= radius)) {
        this.units.damageUnit(player.team, target.id, ability.damage, this.tick, player.id);
      }
      this.effect(player, key === '3' ? 'meteor' : 'nova', aim.x, aim.y);
    } else if (aimedEnemy) {
      const damage = player.heroId === 'fighter' && key === '3' && aimedEnemy.hp < aimedEnemy.maxHp * 0.35
        ? ability.damage * 1.5 : ability.damage;
      if ('kind' in aimedEnemy) this.units.damageUnit(player.team, aimedEnemy.id, damage, this.tick, player.id);
      else this.applyDamage(player, aimedEnemy, damage);
      this.effect(player, key === '3' ? 'execute' : 'strike', aimedEnemy.x, aimedEnemy.y,
        'kind' in aimedEnemy ? undefined : aimedEnemy.id);
    } else {
      this.effect(player, key === '3' ? 'execute' : 'strike', aim.x, aim.y);
    }
    if (!used) return;
    player.mana -= ability.manaCost;
    player.cooldowns.set(key, this.tick + Math.max(1, Math.ceil(ability.cooldown * TICKS_PER_SECOND / 1000)));
  }

  private applyDamage(attacker: PlayerState, target: PlayerState, amount: number): number {
    if (target.hp <= 0) return 0;
    target.damageContributors.set(attacker.id, this.tick);
    const before = target.hp;
    const itemAbsorbed = Math.min(target.itemShield, amount);
    target.itemShield -= itemAbsorbed;
    const spellAbsorbed = Math.min(target.shield, amount - itemAbsorbed);
    target.shield -= spellAbsorbed;
    target.hp = Math.max(0, target.hp - Math.round(amount - itemAbsorbed - spellAbsorbed));
    if (target.hp > 0) return before - target.hp;
    target.deaths++;
    target.respawnTick = this.tick + RESPAWN_TICKS;
    attacker.kills++;
    this.award(attacker, 180);
    this.effects.push({ id: this.nextEffectId++, casterId: attacker.id, kind: 'gold', x: target.x, y: target.y, tick: this.tick, amount: 180 });
    for (const [id, tick] of target.damageContributors) {
      const ally = this.players.get(id);
      if (ally && ally.id !== attacker.id && ally.team === attacker.team && this.tick - tick <= 10 * TICKS_PER_SECOND) {
        ally.assists++;
        this.award(ally, 60);
      }
    }
    target.damageContributors.clear();
    return before;
  }

  private applyUnitDamage(target: PlayerState, amount: number): void {
    if (target.hp <= 0) return;
    const itemAbsorbed = Math.min(target.itemShield, amount);
    target.itemShield -= itemAbsorbed;
    const spellAbsorbed = Math.min(target.shield, amount - itemAbsorbed);
    target.shield -= spellAbsorbed;
    target.hp = Math.max(0, target.hp - Math.round(amount - itemAbsorbed - spellAbsorbed));
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
      players: [...this.players.values()].map(({ id, username, team, heroId, x, y, hp, maxHp, mana, maxMana, speed, kills, deaths, assists, gold, goldEarned, lastHits, inventory, cooldowns, lastProcessedSeq }) => ({
        id, username, team, heroId, x, y, hp, maxHp, mana, maxMana, speed, kills, deaths, assists, gold, goldEarned, lastHits, inventory,
        abilityReadyTicks: (['Q', '1', '2', '3'] as const).map(key => cooldowns.get(key) ?? 0), lastProcessedSeq,
      })),
      units: this.units.snapshot(),
      effects: this.effects,
      ...(this.winnerTeam ? { winnerTeam: this.winnerTeam } : {}),
    };
  }
}
