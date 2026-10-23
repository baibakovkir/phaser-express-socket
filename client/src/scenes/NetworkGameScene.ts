import Phaser from 'phaser';
import type { GameInput, MatchFound, WorldEffect, WorldPlayer, WorldSnapshot, WorldUnit } from '@moba/shared';
import { decodeSnapshot } from '@moba/shared/codec';
import { BASES, BOSS, BOSS_SPAWN_TICKS, CAMPS, JUNGLE_SPAWN_TICKS, LANES, LANE_WAVE_TICKS, MAP_HEIGHT, MAP_WIDTH, SHRINES, TICKS_PER_SECOND, nextSpawnSecond } from '@moba/shared/map';
import { network } from '../network/socket';
import { mobileInput, queueMobileCast, resetMobileInput, takeMobileCast } from '../input/mobileInput';
import { EFFECT_SPRITES, HERO_SPRITES, spriteUrl } from '../assets/heroSprites';
import { EventBus } from '../events/EventBus';

const TICK_MS = 1000 / 30;
type Keys = Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
type AbilityAim = { phase: 'start' | 'move' | 'cast' | 'cancel'; key: NonNullable<GameInput['cast']>; name: string; range: number; dx: number; dy: number };

export class NetworkGameScene extends Phaser.Scene {
  private matchId = '';
  private playerId = '';
  private participants: MatchFound['participants'] = [];
  private heroes: MatchFound['heroes'] = [];
  private keys!: Keys;
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private graphics!: Phaser.GameObjects.Graphics;
  private aimGraphics!: Phaser.GameObjects.Graphics;
  private aimPreview?: AbilityAim;
  private statusText!: Phaser.GameObjects.Text;
  private labels = new Map<string, Phaser.GameObjects.Text>();
  private playerSprites = new Map<string, Phaser.GameObjects.Image>();
  private unitSprites = new Map<number, Phaser.GameObjects.Image>();
  private effectImages = new Map<number, Phaser.GameObjects.Image>();
  private coinLabels = new Map<number, Phaser.GameObjects.Text>();
  private lastRenderPositions = new Map<string, { x: number; y: number }>();
  private cameraReady = false;
  private snapshots: WorldSnapshot[] = [];
  private receivedAt = 0;
  private sequence = 0;
  private pending: GameInput[] = [];
  private selectedUnitId?: number;
  private localPosition?: { x: number; y: number };
  private readonly onSnapshot = (data: unknown) => this.receiveSnapshot(data);
  private readonly onAbort = () => this.statusText.setText('Match interrupted');
  private readonly onCycleTarget = () => this.cycleTarget();
  private readonly onPointerDown = (pointer: Phaser.Input.Pointer) => this.selectUnitAt(pointer.worldX, pointer.worldY);
  private readonly onAbilityAim = (aim: AbilityAim) => {
    if (aim.phase === 'cancel') {
      this.aimPreview = undefined;
      delete this.game.canvas.dataset.aimKey;
      return;
    }
    const point = this.aimPoint(aim);
    if (aim.phase === 'cast') {
      if (point) queueMobileCast({ cast: aim.key, aimX: Math.round(point.x), aimY: Math.round(point.y) });
      this.aimPreview = undefined;
      delete this.game.canvas.dataset.aimKey;
    } else this.aimPreview = aim;
  };

  constructor() {
    super({ key: 'NetworkGameScene' });
  }

  preload(): void {
    for (const name of [...Object.values(HERO_SPRITES), ...EFFECT_SPRITES, 'creep-blue', 'creep-red', 'neutral-ghost']) {
      this.load.image(`arena-${name}`, spriteUrl(name));
    }
  }

  init(data: MatchFound): void {
    this.matchId = data.matchId;
    this.participants = data.participants || [];
    this.heroes = data.heroes || [];
    this.playerId = network.getPlayer()?.id || '';
    this.snapshots = [];
    this.pending = [];
    this.selectedUnitId = undefined;
    this.localPosition = undefined;
    this.sequence = 0;
    this.cameraReady = false;
  }

  create(): void {
    for (const name of [...Object.values(HERO_SPRITES), ...EFFECT_SPRITES, 'creep-blue', 'creep-red', 'neutral-ghost']) {
      const texture = this.textures.get(`arena-${name}`);
      if (texture.key !== '__MISSING') texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.mapGraphics = this.add.graphics().setDepth(-1);
    this.graphics = this.add.graphics();
    this.aimGraphics = this.add.graphics().setDepth(5);
    this.drawMap();
    this.statusText = this.add.text(24, 18, 'Waiting for players...', { color: '#ffffff', fontSize: '18px', backgroundColor: '#10202dcc', padding: { x: 10, y: 6 } }).setScrollFactor(0).setDepth(10);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.setZoom(navigator.maxTouchPoints > 0 ? 1.5 : 1);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D') as Keys;
    EventBus.on('ui:ability-aim', this.onAbilityAim);
    this.input.on('pointerdown', this.onPointerDown);
    EventBus.on('ui:cycle-target', this.onCycleTarget);
    network.on('game:snapshot', this.onSnapshot);
    network.on('match:aborted', this.onAbort);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      network.off('game:snapshot', this.onSnapshot);
      network.off('match:aborted', this.onAbort);
      EventBus.off('ui:ability-aim', this.onAbilityAim);
      this.aimPreview = undefined;
      this.input.off('pointerdown', this.onPointerDown);
      EventBus.off('ui:cycle-target', this.onCycleTarget);
      resetMobileInput();
      for (const label of this.labels.values()) label.destroy();
      this.labels.clear();
      for (const sprite of this.playerSprites.values()) sprite.destroy();
      this.playerSprites.clear();
      for (const sprite of this.unitSprites.values()) sprite.destroy();
      this.unitSprites.clear();
      for (const image of this.effectImages.values()) image.destroy();
      this.effectImages.clear();
      for (const label of this.coinLabels.values()) label.destroy();
      this.coinLabels.clear();
      this.lastRenderPositions.clear();
      delete this.game.canvas.dataset.gameReady;
      delete this.game.canvas.dataset.serverX;
      delete this.game.canvas.dataset.serverTick;
      delete this.game.canvas.dataset.serverMana;
      delete this.game.canvas.dataset.serverGold;
      delete this.game.canvas.dataset.attackTick;
      delete this.game.canvas.dataset.castTick;
      delete this.game.canvas.dataset.cameraX;
      delete this.game.canvas.dataset.selectedTarget;
      delete this.game.canvas.dataset.renderedHeroes;
      delete this.game.canvas.dataset.aimKey;
      delete this.game.canvas.dataset.aimX;
      delete this.game.canvas.dataset.aimY;
    });
    this.time.addEvent({ delay: TICK_MS, loop: true, callback: () => this.sendInput() });
  }

  private receiveSnapshot(data: unknown): void {
    const bytes = data instanceof Uint8Array ? data : data instanceof ArrayBuffer ? new Uint8Array(data) : undefined;
    if (!bytes) return;
    let snapshot: WorldSnapshot;
    try {
      snapshot = decodeSnapshot(bytes, this.matchId, this.participants);
    } catch (error) {
      console.error('[game] invalid snapshot', error);
      return;
    }
    const last = this.snapshots.at(-1);
    if (last && snapshot.tick < last.tick) return;
    this.snapshots.push(snapshot);
    if (this.snapshots.length > 8) this.snapshots.shift();
    this.receivedAt = this.time.now;
    const own = snapshot.players.find(player => player.id === this.playerId);
    if (this.selectedUnitId && !snapshot.units.some(unit => unit.id === this.selectedUnitId && unit.hp > 0)) {
      this.selectedUnitId = undefined;
    }
    const selected = snapshot.units.find(unit => unit.id === this.selectedUnitId);
    EventBus.emit('game:target', selected ? `${selected.kind} ${selected.hp}/${selected.maxHp}` : '');
    this.game.canvas.dataset.selectedTarget = String(this.selectedUnitId || 0);
    if (own) {
      const fountain = snapshot.units.find(unit => unit.kind === 'fountain' && unit.team === own.team);
      EventBus.emit('game:economy', own, snapshot.tick, !!fountain && own.hp > 0 && Math.hypot(own.x - fountain.x, own.y - fountain.y) <= 180);
      this.game.canvas.dataset.serverX = String(own.x);
      this.game.canvas.dataset.serverGold = String(own.gold);
      this.game.canvas.dataset.serverTick = String(snapshot.tick);
      this.game.canvas.dataset.serverMana = String(own.mana);
      this.pending = this.pending.filter(input => input.seq > own.lastProcessedSeq);
      if (!this.localPosition) this.localPosition = { x: own.x, y: own.y };
    }
    if (snapshot.status === 'playing') this.game.canvas.dataset.gameReady = 'true';
    if (snapshot.status === 'finished') this.game.canvas.dataset.gameReady = 'finished';
    if (snapshot.effects.some(effect => effect.kind === 'attack' && effect.casterId === this.playerId)) {
      this.game.canvas.dataset.attackTick = String(snapshot.tick);
    }
    if (snapshot.effects.some(effect => effect.kind !== 'attack' && effect.casterId === this.playerId)) {
      this.game.canvas.dataset.castTick = String(snapshot.tick);
    }
    const seconds = Math.floor(snapshot.tick / TICKS_PER_SECOND);
    const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const lane = nextSpawnSecond(snapshot.tick, LANE_WAVE_TICKS);
    const jungle = nextSpawnSecond(snapshot.tick, JUNGLE_SPAWN_TICKS);
    const boss = snapshot.tick < BOSS_SPAWN_TICKS ? '02:00' : snapshot.units.some(unit => unit.kind === 'boss') ? 'alive' : 'respawning';
    EventBus.emit('game:clock', snapshot.tick, snapshot.units.some(unit => unit.kind === 'boss'));
    this.statusText.setText(snapshot.status === 'finished'
      ? snapshot.winnerTeam ? `Team ${snapshot.winnerTeam} wins · refresh to play again` : 'Draw · 30:00 · refresh to play again'
      : snapshot.status === 'selecting'
        ? 'Waiting for hero selections...'
        : `${clock}  ·  Lane ${lane}s  ·  Jungle ${jungle}s  ·  Oni ${boss}\nWASD move · attacks automatic · drag a skill icon to aim`);
  }

  private sendInput(): void {
    if (this.snapshots.at(-1)?.status !== 'playing') return;
    const cast = takeMobileCast();
    const input: GameInput = {
      seq: ++this.sequence,
      dx: Phaser.Math.Clamp(Number(this.keys.D.isDown) - Number(this.keys.A.isDown) + mobileInput.dx, -1, 1),
      dy: Phaser.Math.Clamp(Number(this.keys.S.isDown) - Number(this.keys.W.isDown) + mobileInput.dy, -1, 1),
      attack: false,
      ...(cast || {}),
      ...(this.selectedUnitId ? { targetUnitId: this.selectedUnitId } : {}),
    };
    this.pending.push(input);
    if (this.pending.length > 12) this.pending.shift();
    network.sendInput(this.matchId, input);
  }

  update(_time: number, delta: number): void {
    this.graphics.clear();
    this.aimGraphics.clear();
    const latest = this.snapshots.at(-1);
    if (!latest) return;
    const renderTick = Math.max(0, latest.tick - 3 + Math.min((this.time.now - this.receivedAt) / TICK_MS, 3));
    const newer = this.snapshots.find(snapshot => snapshot.tick >= renderTick) || latest;
    const older = [...this.snapshots].reverse().find(snapshot => snapshot.tick <= renderTick) || newer;
    const alpha = newer.tick === older.tick ? 1 : Phaser.Math.Clamp((renderTick - older.tick) / (newer.tick - older.tick), 0, 1);
    const own = latest.players.find(player => player.id === this.playerId);
    if (own && this.localPosition) {
      const target = { x: own.x, y: own.y };
      for (const input of this.pending.slice(-6)) {
        const magnitude = Math.hypot(input.dx, input.dy);
        const scale = magnitude > 1 ? 1 / magnitude : 1;
        target.x += input.dx * scale * own.speed / 30;
        target.y += input.dy * scale * own.speed / 30;
      }
      target.x = Phaser.Math.Clamp(target.x, 18, MAP_WIDTH - 18);
      target.y = Phaser.Math.Clamp(target.y, 18, MAP_HEIGHT - 18);
      if (Math.hypot(this.localPosition.x - target.x, this.localPosition.y - target.y) > 180) this.localPosition = target;
      else {
        const smooth = 1 - Math.exp(-delta / 45);
        this.localPosition.x = Phaser.Math.Linear(this.localPosition.x, target.x, smooth);
        this.localPosition.y = Phaser.Math.Linear(this.localPosition.y, target.y, smooth);
      }
    }
    if (this.localPosition) {
      const camera = this.cameras.main;
      if (!this.cameraReady) {
        camera.centerOn(this.localPosition.x, this.localPosition.y);
        this.cameraReady = true;
      } else {
        const smooth = 1 - Math.exp(-delta / 140);
        camera.centerOn(Phaser.Math.Linear(camera.midPoint.x, this.localPosition.x, smooth),
          Phaser.Math.Linear(camera.midPoint.y, this.localPosition.y, smooth));
      }
      this.game.canvas.dataset.cameraX = String(Math.round(camera.scrollX));
    }
    const unitPositions = new Map(older.units.map(unit => [unit.id, unit]));
    for (const unit of newer.units) {
      const previous = unitPositions.get(unit.id) || unit;
      this.drawUnit(unit, Phaser.Math.Linear(previous.x, unit.x, alpha), Phaser.Math.Linear(previous.y, unit.y, alpha));
    }
    const unitIds = new Set(newer.units.map(unit => unit.id));
    for (const [id, sprite] of this.unitSprites) if (!unitIds.has(id)) {
      sprite.destroy();
      this.unitSprites.delete(id);
    }
    const seen = new Set<string>();
    for (const player of newer.players) {
      seen.add(player.id);
      const previous = older.players.find(item => item.id === player.id) || player;
      const x = player.id === this.playerId && this.localPosition ? this.localPosition.x : Phaser.Math.Linear(previous.x, player.x, alpha);
      const y = player.id === this.playerId && this.localPosition ? this.localPosition.y : Phaser.Math.Linear(previous.y, player.y, alpha);
      this.drawPlayer(player, x, y);
    }
    this.game.canvas.dataset.renderedHeroes = JSON.stringify([...this.playerSprites].map(([id, sprite]) => ({ id, texture: sprite.texture.key })));
    this.drawEffects(latest.effects, renderTick);
    this.drawAimPreview();
    for (const [id, label] of this.labels) {
      if (!seen.has(id)) {
        label.destroy();
        this.labels.delete(id);
        this.playerSprites.get(id)?.destroy();
        this.playerSprites.delete(id);
        this.lastRenderPositions.delete(id);
      }
    }
  }

  private aimPoint(aim: AbilityAim): { x: number; y: number; originX: number; originY: number } | undefined {
    const own = this.snapshots.at(-1)?.players.find(player => player.id === this.playerId);
    if (!own || own.hp <= 0) return;
    const originX = this.localPosition?.x ?? own.x;
    const originY = this.localPosition?.y ?? own.y;
    if (aim.range <= 0) return { x: originX, y: originY, originX, originY };
    const distance = Math.hypot(aim.dx, aim.dy);
    const dx = distance < 8 ? (own.team === 1 ? aim.range : -aim.range) : aim.dx * aim.range / 100;
    const dy = distance < 8 ? 0 : aim.dy * aim.range / 100;
    const scale = Math.min(1, aim.range / (Math.hypot(dx, dy) || 1));
    return {
      x: Phaser.Math.Clamp(originX + dx * scale, 0, MAP_WIDTH),
      y: Phaser.Math.Clamp(originY + dy * scale, 0, MAP_HEIGHT), originX, originY,
    };
  }

  private drawAimPreview(): void {
    const aim = this.aimPreview;
    if (!aim) return;
    const point = this.aimPoint(aim);
    if (!point) return;
    const g = this.aimGraphics;
    const area = (aim.key === '1' && ['Ice Nova', 'Multi Shot'].includes(aim.name)) ||
      (aim.key === '3' && ['Meteor', 'Heroic Leap', 'Rain of Arrows'].includes(aim.name));
    const radius = aim.range <= 0 ? 58 : area ? aim.key === '3' ? 105 : 85 : 52;
    g.lineStyle(2, 0x9be9ff, 0.9).strokeCircle(point.originX, point.originY, aim.range);
    g.lineStyle(5, 0xd9f8ff, 0.95).lineBetween(point.originX, point.originY, point.x, point.y);
    g.fillStyle(0x79d8ff, 0.22).fillCircle(point.x, point.y, radius);
    g.lineStyle(4, 0xffffff, 0.95).strokeCircle(point.x, point.y, radius);
    g.fillStyle(0xffe48a).fillCircle(point.x, point.y, 6);
    this.game.canvas.dataset.aimKey = aim.key;
    this.game.canvas.dataset.aimX = String(Math.round(point.x));
    this.game.canvas.dataset.aimY = String(Math.round(point.y));
  }

  private targetableUnits(): WorldUnit[] {
    const snapshot = this.snapshots.at(-1);
    const own = snapshot?.players.find(player => player.id === this.playerId);
    if (!snapshot || !own) return [];
    return snapshot.units.filter(unit => unit.hp > 0 && unit.team !== own.team &&
      unit.kind !== 'fountain' && unit.kind !== 'shrine' &&
      Math.hypot(unit.x - own.x, unit.y - own.y) < 420);
  }

  private selectUnitAt(x: number, y: number): void {
    const target = this.targetableUnits()
      .filter(unit => Math.hypot(unit.x - x, unit.y - y) < (unit.kind === 'creep' ? 42 : 55))
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    this.selectedUnitId = target?.id;
  }

  private cycleTarget(): void {
    const targets = this.targetableUnits().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.id - b.id);
    const index = targets.findIndex(unit => unit.id === this.selectedUnitId);
    this.selectedUnitId = targets.length ? targets[(index + 1) % targets.length].id : undefined;
  }

  private drawMap(): void {
    const ground = this.mapGraphics;
    ground.fillStyle(0x243c36).fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    ground.fillStyle(0x183b36).fillRect(0, 0, MAP_WIDTH, 990);
    ground.fillStyle(0x2e4739, 0.8).fillEllipse(1600, 360, 2800, 1150);
    ground.fillStyle(0x3d513e, 0.65).fillEllipse(1600, 1770, 2900, 400);
    ground.lineStyle(7, 0x83a5a0, 0.7).strokeRect(4, 4, MAP_WIDTH - 8, MAP_HEIGHT - 8);

    // The upper wilderness is one contiguous contested area, with a stream between camps.
    const stream = [{ x: 180, y: 770 }, { x: 740, y: 680 }, { x: 1390, y: 770 },
      { x: 1950, y: 620 }, { x: 2600, y: 750 }, { x: 3100, y: 690 }];
    this.strokeRoute(stream, 90, 0x183c42);
    this.strokeRoute(stream, 68, 0x387d84);
    this.strokeRoute(stream, 42, 0x57969a);

    for (const lane of LANES) {
      this.strokeRoute(lane.path, 200, 0x1a302c);
      this.strokeRoute(lane.path, 184, 0x5c6659);
      this.strokeRoute(lane.path, 166, 0x827e69);
      this.strokeRoute(lane.path, 146, 0xaaa48c);
      this.strokeRoute(lane.path, 112, 0xb8b19b);
      for (let index = 4; index < lane.path.length - 4; index += 6) {
        const point = lane.path[index];
        ground.fillStyle(0xd4c9a8, 0.42).fillCircle(point.x, point.y, 8);
      }
    }

    for (let index = 0; index < 125; index++) {
      const x = 115 + index * 241 % 2980;
      const y = 85 + index * 367 % 865;
      const clearRoad = LANES.every(lane => lane.path.every(point => Math.hypot(point.x - x, point.y - y) > 135));
      const clearCamp = CAMPS.every(camp => Math.hypot(camp.x - x, camp.y - y) > 105);
      if (!clearRoad || !clearCamp || Math.hypot(BOSS.x - x, BOSS.y - y) < 165) continue;
      const radius = 21 + index % 5 * 5;
      ground.fillStyle(0x142f2b, 0.7).fillEllipse(x + 8, y + 9, radius * 2.2, radius * 1.2);
      ground.fillStyle(index % 7 === 0 ? 0x91677c : 0x3a6652).fillCircle(x, y, radius);
      ground.fillStyle(index % 7 === 0 ? 0xc28da1 : 0x629071, 0.75).fillCircle(x - 7, y - 8, radius * 0.48);
    }
    for (const camp of CAMPS) {
      ground.fillStyle(0x504e3d, 0.85).fillCircle(camp.x, camp.y, 78);
      ground.lineStyle(6, 0xe5c884, 0.75).strokeCircle(camp.x, camp.y, 72);
      ground.fillStyle(0x735049).fillCircle(camp.x, camp.y, 13);
      ground.fillStyle(0xf2c878, 0.75).fillCircle(camp.x, camp.y, 6);
    }
    for (const shrine of SHRINES) {
      ground.fillStyle(0x2b5148, 0.85).fillCircle(shrine.x, shrine.y, 88);
      ground.lineStyle(5, 0xe6c779).strokeCircle(shrine.x, shrine.y, 79);
      this.drawTorii(shrine.x, shrine.y, 0.75);
    }
    ground.fillStyle(0x5b483e).fillCircle(BOSS.x, BOSS.y, 119);
    ground.lineStyle(7, 0xc26a5f).strokeCircle(BOSS.x, BOSS.y, 112);
    this.drawTorii(BOSS.x, BOSS.y - 130, 1.15);
    for (const team of [1, 2] as const) {
      const base = BASES[team];
      const x = base.x + (team === 1 ? -75 : 75);
      const y = base.y + (team === 1 ? 65 : -65);
      const color = team === 1 ? 0x76d8ef : 0xffa5a5;
      ground.fillStyle(color, 0.12).fillCircle(x, y, 145);
      ground.lineStyle(4, color, 0.7).strokeCircle(x, y, 145);
      ground.lineStyle(4, 0xffd27d, 0.8).strokeCircle(x, y, 180);
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        ground.fillStyle(0xffd27d).fillCircle(x + Math.cos(angle) * 180, y + Math.sin(angle) * 180, 5);
      }
      this.add.text(x, y - 115, 'HEAL', { fontSize: '18px', color: '#c7fff1', backgroundColor: '#153e39cc', padding: { x: 5, y: 2 } }).setOrigin(0.5).setDepth(-0.5);
      this.add.text(x, y + 130, 'SHOP', { fontSize: '18px', color: '#ffe2a1', backgroundColor: '#46351fcc', padding: { x: 5, y: 2 } }).setOrigin(0.5).setDepth(-0.5);
    }
    this.add.text(1570, 190, 'COMMON JUNGLE', { fontSize: '27px', color: '#e4d8ae' }).setOrigin(0.5).setDepth(-0.5);
    this.add.text(1600, 960, 'MID', { fontSize: '24px', color: '#4d514c' }).setOrigin(0.5).setDepth(-0.5);
    this.add.text(1600, 1700, 'BOTTOM', { fontSize: '24px', color: '#4d514c' }).setOrigin(0.5).setDepth(-0.5);
  }

  private strokeRoute(points: { x: number; y: number }[], width: number, color: number): void {
    const ground = this.mapGraphics;
    ground.lineStyle(width, color, 1).beginPath().moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) ground.lineTo(point.x, point.y);
    ground.strokePath();
    ground.fillStyle(color).fillCircle(points[0].x, points[0].y, width / 2);
    ground.fillCircle(points.at(-1)!.x, points.at(-1)!.y, width / 2);
  }

  private drawTorii(x: number, y: number, scale: number): void {
    const ground = this.mapGraphics;
    ground.fillStyle(0x962f2e);
    ground.fillRect(x - 38 * scale, y - 22 * scale, 9 * scale, 52 * scale);
    ground.fillRect(x + 29 * scale, y - 22 * scale, 9 * scale, 52 * scale);
    ground.fillRect(x - 49 * scale, y - 34 * scale, 98 * scale, 10 * scale);
    ground.fillRect(x - 43 * scale, y - 15 * scale, 86 * scale, 6 * scale);
    ground.fillStyle(0xe4c88e).fillCircle(x, y - 29 * scale, 5 * scale);
  }

  private drawUnit(unit: WorldUnit, x: number, y: number): void {
    if (unit.hp <= 0) return;
    const teamColor = unit.team === 1 ? 0x70bcff : unit.team === 2 ? 0xff8686 : 0xe6bc72;
    const radius = unit.kind === 'boss' ? 38 : unit.kind === 'creep' ? 13 : unit.kind === 'neutral' ? 17 : 30;
    if (unit.id === this.selectedUnitId) {
      this.graphics.lineStyle(4, 0xffe28a, 0.95).strokeCircle(x, y, radius + 19);
      this.graphics.lineStyle(2, 0xffffff, 0.75).strokeCircle(x, y, radius + 12);
    }
    if (unit.kind === 'tower') {
      this.graphics.fillStyle(0x211e26).fillRect(x - 18, y - 35, 36, 62);
      this.graphics.fillStyle(teamColor).fillTriangle(x - 28, y - 32, x + 28, y - 32, x, y - 66);
    } else if (unit.kind === 'barracks') {
      this.graphics.fillStyle(teamColor).fillRect(x - 28, y - 18, 56, 40);
      this.graphics.fillStyle(0x26222a).fillTriangle(x - 36, y - 18, x + 36, y - 18, x, y - 48);
    } else if (unit.kind === 'throne') {
      this.graphics.fillStyle(teamColor).fillCircle(x, y, radius + 14);
      this.graphics.fillStyle(0xf8e2a0).fillTriangle(x - 20, y - 22, x + 20, y - 22, x, y - 58);
    } else if (unit.kind === 'fountain') {
      this.graphics.fillStyle(0x293e42).fillCircle(x, y + 6, 43);
      this.graphics.lineStyle(6, 0xe6c989).strokeCircle(x, y + 5, 40);
      this.graphics.fillStyle(teamColor, 0.85).fillCircle(x, y + 5, 32);
      this.graphics.fillStyle(0xd5fff6, 0.85).fillTriangle(x, y - 42, x - 11, y + 5, x + 11, y + 5);
      this.graphics.lineStyle(4, 0xffce73).lineBetween(x - 48, y - 35, x - 48, y + 2);
      this.graphics.fillStyle(0xffd473).fillCircle(x - 48, y - 32, 7);
    } else if (unit.kind === 'shrine') {
      this.graphics.lineStyle(6, teamColor).strokeCircle(x, y, radius + 10);
      this.graphics.fillStyle(teamColor, 0.6).fillCircle(x, y, radius);
    } else {
      this.graphics.fillStyle(0x141b22).fillCircle(x, y + 6, radius + 3);
      this.graphics.fillStyle(teamColor).fillCircle(x, y, radius);
      this.graphics.fillStyle(0xffffff, 0.8).fillCircle(x - radius / 3, y - radius / 3, radius / 4);
      const asset = unit.kind === 'creep' ? `creep-${unit.team === 1 ? 'blue' : 'red'}`
        : unit.kind === 'neutral' || unit.kind === 'boss' ? 'neutral-ghost' : undefined;
      if (asset && this.textures.exists(`arena-${asset}`)) {
        let sprite = this.unitSprites.get(unit.id);
        if (!sprite) {
          sprite = this.add.image(x, y, `arena-${asset}`).setDepth(2);
          this.unitSprites.set(unit.id, sprite);
        }
        sprite.setPosition(x, y + Math.sin(this.time.now / 240 + unit.id) * 1.5);
        sprite.setScale(unit.kind === 'boss' ? 4.5 : unit.kind === 'neutral' ? 2.6 : 2.3);
        if (unit.kind === 'boss') sprite.setTint(0xff5555);
      }
    }
    if (unit.kind !== 'fountain' && unit.kind !== 'shrine') {
      this.graphics.fillStyle(0x152020).fillRect(x - 25, y - radius - 18, 50, 5);
      this.graphics.fillStyle(teamColor).fillRect(x - 25, y - radius - 18, 50 * unit.hp / unit.maxHp, 5);
    }
  }

  private drawPlayer(player: WorldPlayer, x: number, y: number): void {
    const hero = this.heroes.find(item => item.id === player.heroId);
    const color = player.hp > 0 ? hero?.color || 0xffffff : 0x555555;
    this.graphics.fillStyle(color, 0.18);
    this.graphics.fillCircle(x, y, 26);
    this.graphics.lineStyle(3, player.team === 1 ? 0x70bcff : 0xff8888);
    this.graphics.strokeCircle(x, y, 23);
    const texture = `arena-${HERO_SPRITES[player.heroId]}`;
    if (HERO_SPRITES[player.heroId] && this.textures.exists(texture)) {
      let sprite = this.playerSprites.get(player.id);
      if (!sprite) {
        sprite = this.add.image(x, y, texture).setDepth(2);
        this.playerSprites.set(player.id, sprite);
      }
      if (sprite.texture.key !== texture) sprite.setTexture(texture);
      const previous = this.lastRenderPositions.get(player.id);
      const moving = previous && Math.hypot(x - previous.x, y - previous.y) > 0.35;
      const bob = moving ? Math.sin(this.time.now / 85) * 2 : Math.sin(this.time.now / 350) * 0.5;
      const attacking = this.snapshots.at(-1)?.effects.some(effect => effect.casterId === player.id && effect.kind === 'attack' && this.snapshots.at(-1)!.tick - effect.tick < 4);
      sprite.setPosition(x, y + bob);
      sprite.setScale(attacking ? 3.4 : 3);
      sprite.setAlpha(player.hp > 0 ? 1 : 0.45);
      sprite.setTint(player.hp > 0 ? 0xffffff : 0x777777);
      if (previous && Math.abs(x - previous.x) > 0.3) sprite.setFlipX(x < previous.x);
      this.lastRenderPositions.set(player.id, { x, y });
    } else {
      this.graphics.fillStyle(color);
      this.graphics.fillCircle(x, y, 16);
    }
    this.graphics.fillStyle(0x151515);
    this.graphics.fillRect(x - 25, y - 37, 50, 6);
    this.graphics.fillRect(x - 25, y - 29, 50, 4);
    this.graphics.fillStyle(0x38d266);
    this.graphics.fillRect(x - 25, y - 37, 50 * player.hp / player.maxHp, 6);
    this.graphics.fillStyle(0x4c9cff);
    if (player.maxMana > 0) this.graphics.fillRect(x - 25, y - 29, 50 * player.mana / player.maxMana, 4);
    let label = this.labels.get(player.id);
    if (!label) {
      label = this.add.text(x, y, '', { fontSize: '13px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
      this.labels.set(player.id, label);
    }
    label.setText(`${player.username}\n${hero?.name || player.heroId}`);
    label.setPosition(x, y + 43);
  }

  private drawEffects(effects: WorldEffect[], renderTick: number): void {
    const active = new Set<number>();
    for (const effect of effects) {
      const progress = Math.max(0, renderTick - effect.tick) / (effect.kind === 'gold' ? 30 : 18);
      if (progress > 1) continue;
      if (effect.kind === 'gold') {
        if (effect.casterId !== this.playerId) continue;
        active.add(effect.id);
        this.graphics.fillStyle(0xeab940, 1 - progress).fillCircle(effect.x, effect.y - progress * 34, 13);
        this.graphics.lineStyle(3, 0xffed9b, 1 - progress).strokeCircle(effect.x, effect.y - progress * 34, 13);
        let label = this.coinLabels.get(effect.id);
        if (!label) {
          label = this.add.text(effect.x, effect.y - 28, `+${effect.amount ?? 0}`, { fontSize: '19px', color: '#ffe79c', stroke: '#553d18', strokeThickness: 4 }).setOrigin(0.5).setDepth(5);
          this.coinLabels.set(effect.id, label);
        }
        label.setPosition(effect.x, effect.y - 30 - progress * 40).setAlpha(1 - progress);
        continue;
      }
      active.add(effect.id);
      this.drawEffectShape(effect, progress);
      const caster = this.snapshots.at(-1)?.players.find(player => player.id === effect.casterId);
      const sourceUnit = this.snapshots.at(-1)?.units.find(unit => unit.id === effect.sourceUnitId);
      const rangedAttack = effect.kind === 'attack' && ['mage', 'support', 'marksman'].includes(caster?.heroId || '');
      const unitProjectile = effect.kind === 'attack' && (sourceUnit?.kind === 'tower' || sourceUnit?.kind === 'creep');
      const asset = effect.kind === 'attack'
        ? caster?.heroId === 'marksman' || sourceUnit?.kind === 'creep' ? 'arrow'
          : rangedAttack || sourceUnit?.kind === 'tower' ? 'spark' : 'slash'
        : effect.kind === 'meteor' || effect.kind === 'execute' ? 'flame'
          : effect.kind === 'heal' || effect.kind === 'revive' || effect.kind === 'lifesteal' || effect.kind === 'item-heal' ? 'heal'
            : effect.kind === 'strike' ? 'slash' : 'spark';
      const key = `arena-${asset}`;
      if (!this.textures.exists(key)) continue;
      let image = this.effectImages.get(effect.id);
      if (!image) {
        image = this.add.image(effect.x, effect.y, key).setDepth(3);
        this.effectImages.set(effect.id, image);
      }
      const origin = caster && rangedAttack ? caster : unitProjectile ? sourceUnit : undefined;
      const travel = origin ? Math.min(1, progress / 0.35) : 1;
      image.setPosition(origin ? Phaser.Math.Linear(origin.x, effect.x, travel) : effect.x,
        origin ? Phaser.Math.Linear(origin.y, effect.y, travel) : effect.y);
      image.setVisible(!origin || progress < 0.35);
      image.setScale((effect.kind === 'meteor' ? 3.2 : 2.3) * (1 + progress * 0.5));
      image.setAlpha(1 - progress);
      image.setTint(effect.kind === 'nova' ? 0x8dcfff : effect.kind === 'shield' ? 0x86eaff
        : effect.kind === 'heal' || effect.kind === 'revive' || effect.kind === 'lifesteal' || effect.kind === 'item-heal' ? 0x8cff9c : 0xffffff);
      image.setRotation(origin ? Math.atan2(effect.y - origin.y, effect.x - origin.x) + Math.PI / 2 : progress * 2);
    }
    for (const [id, label] of this.coinLabels) {
      if (!active.has(id)) { label.destroy(); this.coinLabels.delete(id); }
    }
    for (const [id, image] of this.effectImages) {
      if (!active.has(id)) {
        image.destroy();
        this.effectImages.delete(id);
      }
    }
  }

  private drawEffectShape(effect: WorldEffect, progress: number): void {
    const g = this.graphics;
    const { x, y } = effect;
    const fade = 1 - progress;
    switch (effect.kind) {
      case 'dash':
        g.fillStyle(0x78dcff, fade * 0.35).fillEllipse(x, y, 100 + progress * 80, 34);
        g.lineStyle(5, 0xffffff, fade).lineBetween(x - 75, y - 12, x + 35, y - 12);
        break;
      case 'nova':
        g.lineStyle(9 * fade + 1, 0x75c8ff, fade).strokeCircle(x, y, 20 + progress * 115);
        g.lineStyle(3, 0xe7f7ff, fade).strokeCircle(x, y, 10 + progress * 78);
        break;
      case 'meteor':
        g.fillStyle(0xffa354, fade).fillCircle(x, y - 110 * fade, 22 + 8 * progress);
        g.lineStyle(12 * fade + 1, 0xff5335, fade).strokeCircle(x, y, progress * 130);
        break;
      case 'shield':
        g.lineStyle(7 * fade + 1, 0x78e6ff, fade).strokeCircle(x, y, 35 + progress * 45);
        g.fillStyle(0x7adfff, fade * 0.18).fillCircle(x, y, 33 + progress * 38);
        break;
      case 'heal':
      case 'lifesteal':
      case 'item-heal':
      case 'revive': {
        const size = effect.kind === 'revive' ? 115 : 75;
        g.fillStyle(0x72f59b, fade * 0.75).fillRect(x - 7, y - size / 2, 14, size);
        g.fillRect(x - size / 2, y - 7, size, 14);
        g.lineStyle(4, 0xc3ffd2, fade).strokeCircle(x, y, 22 + progress * size);
        break;
      }
      case 'buff':
        for (let ray = 0; ray < 8; ray++) {
          const angle = ray * Math.PI / 4;
          g.lineStyle(5, 0xffd06b, fade).lineBetween(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20,
            x + Math.cos(angle) * (42 + progress * 42), y + Math.sin(angle) * (42 + progress * 42));
        }
        break;
      case 'execute':
        g.lineStyle(13 * fade + 1, 0xff574b, fade).lineBetween(x - 58, y - 42, x + 55, y + 38);
        g.lineStyle(5, 0xffc39a, fade).lineBetween(x + 40, y - 46, x - 46, y + 34);
        break;
      case 'strike':
        g.lineStyle(8 * fade + 1, 0xffdc7f, fade).lineBetween(x - 38, y + 34, x + 42, y - 39);
        break;
      case 'shrine':
        g.lineStyle(6, 0xffd77e, fade).strokeCircle(x, y, 35 + progress * 75);
        break;
      default:
        g.lineStyle(4 * fade + 1, 0xffe8a2, fade).strokeCircle(x, y, 10 + progress * 38);
    }
  }
}
