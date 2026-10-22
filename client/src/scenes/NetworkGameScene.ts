import Phaser from 'phaser';
import type { GameInput, MatchFound, WorldEffect, WorldPlayer, WorldSnapshot, WorldUnit } from '@moba/shared';
import { decodeSnapshot } from '@moba/shared/codec';
import { BOSS, BOSS_SPAWN_TICKS, CAMPS, JUNGLE_SPAWN_TICKS, LANES, LANE_WAVE_TICKS, MAP_HEIGHT, MAP_WIDTH, SHRINES, TICKS_PER_SECOND, nextSpawnSecond } from '@moba/shared/map';
import { network } from '../network/socket';
import { mobileInput, resetMobileInput, takeMobileCast } from '../input/mobileInput';
import { EFFECT_SPRITES, HERO_SPRITES, spriteUrl } from '../assets/heroSprites';
import { EventBus } from '../events/EventBus';

const TICK_MS = 1000 / 30;
type Keys = Record<'W' | 'A' | 'S' | 'D' | 'SPACE', Phaser.Input.Keyboard.Key>;

export class NetworkGameScene extends Phaser.Scene {
  private matchId = '';
  private playerId = '';
  private participants: MatchFound['participants'] = [];
  private heroes: MatchFound['heroes'] = [];
  private keys!: Keys;
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private graphics!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  private labels = new Map<string, Phaser.GameObjects.Text>();
  private playerSprites = new Map<string, Phaser.GameObjects.Image>();
  private unitSprites = new Map<number, Phaser.GameObjects.Image>();
  private effectImages = new Map<number, Phaser.GameObjects.Image>();
  private lastRenderPositions = new Map<string, { x: number; y: number }>();
  private cameraReady = false;
  private snapshots: WorldSnapshot[] = [];
  private receivedAt = 0;
  private sequence = 0;
  private pending: GameInput[] = [];
  private pendingCast?: GameInput['cast'];
  private localPosition?: { x: number; y: number };
  private readonly onSnapshot = (data: unknown) => this.receiveSnapshot(data);
  private readonly onAbort = () => this.statusText.setText('Match interrupted');
  private readonly onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toUpperCase();
    if (!event.repeat && ['Q', '1', '2', '3'].includes(key) && !this.pendingCast) {
      this.pendingCast = key as GameInput['cast'];
    }
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
    this.pendingCast = undefined;
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
    this.drawMap();
    this.statusText = this.add.text(24, 18, 'Waiting for players...', { color: '#ffffff', fontSize: '18px', backgroundColor: '#10202dcc', padding: { x: 10, y: 6 } }).setScrollFactor(0).setDepth(10);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,SPACE') as Keys;
    this.input.keyboard!.on('keydown', this.onKeyDown);
    network.on('game:snapshot', this.onSnapshot);
    network.on('match:aborted', this.onAbort);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      network.off('game:snapshot', this.onSnapshot);
      network.off('match:aborted', this.onAbort);
      this.input.keyboard?.off('keydown', this.onKeyDown);
      resetMobileInput();
      for (const label of this.labels.values()) label.destroy();
      this.labels.clear();
      for (const sprite of this.playerSprites.values()) sprite.destroy();
      this.playerSprites.clear();
      for (const sprite of this.unitSprites.values()) sprite.destroy();
      this.unitSprites.clear();
      for (const image of this.effectImages.values()) image.destroy();
      this.effectImages.clear();
      this.lastRenderPositions.clear();
      delete this.game.canvas.dataset.gameReady;
      delete this.game.canvas.dataset.serverX;
      delete this.game.canvas.dataset.serverTick;
      delete this.game.canvas.dataset.serverMana;
      delete this.game.canvas.dataset.attackTick;
      delete this.game.canvas.dataset.castTick;
      delete this.game.canvas.dataset.cameraX;
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
    if (own) {
      this.game.canvas.dataset.serverX = String(own.x);
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
      ? `Team ${snapshot.winnerTeam} wins · refresh to play again`
      : snapshot.status === 'selecting'
        ? 'Waiting for hero selections...'
        : `${clock}  ·  Lane ${lane}s  ·  Jungle ${jungle}s  ·  Oni ${boss}\nWASD move · Space attack · Q / 1 / 2 / 3 abilities`);
  }

  private sendInput(): void {
    if (this.snapshots.at(-1)?.status !== 'playing') return;
    const cast = this.pendingCast || takeMobileCast();
    this.pendingCast = undefined;
    const input: GameInput = {
      seq: ++this.sequence,
      dx: Phaser.Math.Clamp(Number(this.keys.D.isDown) - Number(this.keys.A.isDown) + mobileInput.dx, -1, 1),
      dy: Phaser.Math.Clamp(Number(this.keys.S.isDown) - Number(this.keys.W.isDown) + mobileInput.dy, -1, 1),
      attack: this.keys.SPACE.isDown || mobileInput.attack,
      ...(cast ? { cast } : {}),
    };
    this.pending.push(input);
    if (this.pending.length > 12) this.pending.shift();
    network.sendInput(this.matchId, input);
  }

  update(_time: number, delta: number): void {
    this.graphics.clear();
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
    this.drawEffects(latest.effects, renderTick);
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

  private drawMap(): void {
    this.mapGraphics.fillStyle(0x122b28);
    this.mapGraphics.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.mapGraphics.lineStyle(8, 0x35635c, 0.8);
    this.mapGraphics.strokeRect(4, 4, MAP_WIDTH - 8, MAP_HEIGHT - 8);
    // Stone paths form two diagonal lanes around one contested garden.
    for (const lane of LANES) {
      for (let index = 1; index < lane.points.length; index++) {
        const from = lane.points[index - 1];
        const to = lane.points[index];
        this.mapGraphics.lineStyle(110, 0x283f3b).lineBetween(from.x, from.y, to.x, to.y);
        this.mapGraphics.lineStyle(90, 0xa6a292).lineBetween(from.x, from.y, to.x, to.y);
        this.mapGraphics.lineStyle(2, 0xcac4a6, 0.6).lineBetween(from.x, from.y, to.x, to.y);
      }
    }
    this.mapGraphics.fillStyle(0x224744).fillEllipse(1600, 1000, 1700, 900);
    this.mapGraphics.lineStyle(30, 0x4a858a, 0.65).lineBetween(1120, 350, 2130, 1640);
    for (let i = 0; i < 48; i++) {
      const x = 230 + i * 61 % 2740;
      const y = 130 + i * 277 % 1700;
      if (LANES.some(lane => lane.points.some(point => Math.hypot(point.x - x, point.y - y) < 145))) continue;
      this.mapGraphics.fillStyle(i % 3 === 0 ? 0x8c6478 : 0x33594a, 0.8).fillCircle(x, y, 16 + i % 5 * 4);
      this.mapGraphics.fillStyle(0xb59a69, 0.8).fillCircle(x - 5, y - 7, 4);
    }
    for (const camp of CAMPS) {
      this.mapGraphics.lineStyle(3, 0xc7a86b, 0.75).strokeCircle(camp.x, camp.y, 70);
      this.mapGraphics.fillStyle(0x7c463e).fillCircle(camp.x, camp.y, 10);
    }
    for (const shrine of SHRINES) {
      this.mapGraphics.lineStyle(3, 0xffd68a).strokeCircle(shrine.x, shrine.y, 90);
    }
    this.mapGraphics.lineStyle(5, 0xb05258).strokeCircle(BOSS.x, BOSS.y, 110);
  }

  private drawUnit(unit: WorldUnit, x: number, y: number): void {
    if (unit.hp <= 0) return;
    const teamColor = unit.team === 1 ? 0x70bcff : unit.team === 2 ? 0xff8686 : 0xe6bc72;
    const radius = unit.kind === 'boss' ? 38 : unit.kind === 'creep' ? 13 : unit.kind === 'neutral' ? 17 : 30;
    if (unit.kind === 'tower') {
      this.graphics.fillStyle(0x211e26).fillRect(x - 18, y - 35, 36, 62);
      this.graphics.fillStyle(teamColor).fillTriangle(x - 28, y - 32, x + 28, y - 32, x, y - 66);
    } else if (unit.kind === 'barracks') {
      this.graphics.fillStyle(teamColor).fillRect(x - 28, y - 18, 56, 40);
      this.graphics.fillStyle(0x26222a).fillTriangle(x - 36, y - 18, x + 36, y - 18, x, y - 48);
    } else if (unit.kind === 'throne') {
      this.graphics.fillStyle(teamColor).fillCircle(x, y, radius + 14);
      this.graphics.fillStyle(0xf8e2a0).fillTriangle(x - 20, y - 22, x + 20, y - 22, x, y - 58);
    } else if (unit.kind === 'fountain' || unit.kind === 'shrine') {
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
      const progress = Math.max(0, renderTick - effect.tick) / 18;
      if (progress > 1) continue;
      active.add(effect.id);
      const color = effect.kind === 'heal' || effect.kind === 'revive' ? 0x5eff9b
        : effect.kind === 'shield' ? 0x6acfff
          : effect.kind === 'meteor' || effect.kind === 'execute' ? 0xff6644 : 0xffe27a;
      this.graphics.lineStyle(Math.max(1, 4 * (1 - progress)), color, 1 - progress);
      this.graphics.strokeCircle(effect.x, effect.y, 12 + progress * (effect.kind === 'meteor' ? 100 : 60));
      if (effect.kind === 'dash') {
        this.graphics.fillStyle(color, 0.5 * (1 - progress));
        this.graphics.fillCircle(effect.x, effect.y, 24 + progress * 20);
      }
      const caster = this.snapshots.at(-1)?.players.find(player => player.id === effect.casterId);
      const sourceUnit = this.snapshots.at(-1)?.units.find(unit => unit.id === effect.sourceUnitId);
      const rangedAttack = effect.kind === 'attack' && ['mage', 'support', 'marksman'].includes(caster?.heroId || '');
      const unitProjectile = effect.kind === 'attack' && (sourceUnit?.kind === 'tower' || sourceUnit?.kind === 'creep');
      const asset = effect.kind === 'attack'
        ? caster?.heroId === 'marksman' || sourceUnit?.kind === 'creep' ? 'arrow'
          : rangedAttack || sourceUnit?.kind === 'tower' ? 'spark' : 'slash'
        : effect.kind === 'meteor' || effect.kind === 'execute' ? 'flame'
          : effect.kind === 'heal' || effect.kind === 'revive' ? 'heal'
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
      image.setRotation(origin ? Math.atan2(effect.y - origin.y, effect.x - origin.x) + Math.PI / 2 : progress * 2);
    }
    for (const [id, image] of this.effectImages) {
      if (!active.has(id)) {
        image.destroy();
        this.effectImages.delete(id);
      }
    }
  }
}
