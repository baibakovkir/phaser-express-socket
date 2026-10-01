import Phaser from 'phaser';
import type { GameInput, MatchFound, WorldEffect, WorldPlayer, WorldSnapshot } from '@moba/shared';
import { decodeSnapshot } from '@moba/shared/codec';
import { network } from '../network/socket';

const WIDTH = 1280;
const HEIGHT = 720;
const TICK_MS = 1000 / 30;
type Keys = Record<'W' | 'A' | 'S' | 'D' | 'SPACE', Phaser.Input.Keyboard.Key>;

export class NetworkGameScene extends Phaser.Scene {
  private matchId = '';
  private playerId = '';
  private participants: MatchFound['participants'] = [];
  private heroes: MatchFound['heroes'] = [];
  private keys!: Keys;
  private graphics!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  private labels = new Map<string, Phaser.GameObjects.Text>();
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
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.statusText = this.add.text(24, 18, 'Waiting for players...', { color: '#ffffff', fontSize: '20px' });
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,SPACE') as Keys;
    this.input.keyboard!.on('keydown', this.onKeyDown);
    network.on('game:snapshot', this.onSnapshot);
    network.on('match:aborted', this.onAbort);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      network.off('game:snapshot', this.onSnapshot);
      network.off('match:aborted', this.onAbort);
      this.input.keyboard?.off('keydown', this.onKeyDown);
      for (const label of this.labels.values()) label.destroy();
      this.labels.clear();
      delete this.game.canvas.dataset.gameReady;
      delete this.game.canvas.dataset.serverX;
      delete this.game.canvas.dataset.serverTick;
      delete this.game.canvas.dataset.serverMana;
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
    this.statusText.setText(snapshot.status === 'finished'
      ? `Team ${snapshot.winnerTeam} wins · refresh to play again`
      : snapshot.status === 'selecting'
        ? 'Waiting for hero selections...'
        : `WASD move · Space attack · Q / 1 / 2 / 3 abilities · tick ${snapshot.tick}`);
  }

  private sendInput(): void {
    if (this.snapshots.at(-1)?.status !== 'playing') return;
    const cast = this.pendingCast;
    this.pendingCast = undefined;
    const input: GameInput = {
      seq: ++this.sequence,
      dx: Number(this.keys.D.isDown) - Number(this.keys.A.isDown),
      dy: Number(this.keys.S.isDown) - Number(this.keys.W.isDown),
      attack: this.keys.SPACE.isDown,
      ...(cast ? { cast } : {}),
    };
    this.pending.push(input);
    if (this.pending.length > 12) this.pending.shift();
    network.sendInput(this.matchId, input);
  }

  update(_time: number, delta: number): void {
    this.graphics.clear();
    this.drawMap();
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
      target.x = Phaser.Math.Clamp(target.x, 18, WIDTH - 18);
      target.y = Phaser.Math.Clamp(target.y, 18, HEIGHT - 18);
      if (Math.hypot(this.localPosition.x - target.x, this.localPosition.y - target.y) > 180) this.localPosition = target;
      else {
        const smooth = 1 - Math.exp(-delta / 45);
        this.localPosition.x = Phaser.Math.Linear(this.localPosition.x, target.x, smooth);
        this.localPosition.y = Phaser.Math.Linear(this.localPosition.y, target.y, smooth);
      }
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
      }
    }
  }

  private drawMap(): void {
    this.graphics.fillStyle(0x10213a);
    this.graphics.fillRect(0, 0, WIDTH, HEIGHT);
    this.graphics.lineStyle(3, 0x47708c);
    this.graphics.strokeRect(3, 3, WIDTH - 6, HEIGHT - 6);
    this.graphics.lineStyle(1, 0x32506b);
    this.graphics.lineBetween(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
    this.graphics.fillStyle(0x234667, 0.35);
    this.graphics.fillCircle(120, 360, 65);
    this.graphics.fillStyle(0x663333, 0.35);
    this.graphics.fillCircle(WIDTH - 120, 360, 65);
  }

  private drawPlayer(player: WorldPlayer, x: number, y: number): void {
    const hero = this.heroes.find(item => item.id === player.heroId);
    const color = player.hp > 0 ? hero?.color || 0xffffff : 0x555555;
    this.graphics.fillStyle(color, 0.18);
    this.graphics.fillCircle(x, y, 26);
    this.graphics.lineStyle(3, player.team === 1 ? 0x70bcff : 0xff8888);
    this.graphics.strokeCircle(x, y, 23);
    this.graphics.fillStyle(color);
    if (hero?.role === 'mage' || hero?.role === 'support') this.graphics.fillCircle(x, y, 15);
    else if (hero?.role === 'assassin') this.graphics.fillTriangle(x, y - 18, x - 18, y + 15, x + 18, y + 15);
    else this.graphics.fillRoundedRect(x - 16, y - 16, 32, 32, 8);
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
    for (const effect of effects) {
      const progress = Math.max(0, renderTick - effect.tick) / 18;
      if (progress > 1) continue;
      const color = effect.kind === 'heal' || effect.kind === 'revive' ? 0x5eff9b
        : effect.kind === 'shield' ? 0x6acfff
          : effect.kind === 'meteor' || effect.kind === 'execute' ? 0xff6644 : 0xffe27a;
      this.graphics.lineStyle(Math.max(1, 4 * (1 - progress)), color, 1 - progress);
      this.graphics.strokeCircle(effect.x, effect.y, 12 + progress * (effect.kind === 'meteor' ? 100 : 60));
      if (effect.kind === 'dash') {
        this.graphics.fillStyle(color, 0.5 * (1 - progress));
        this.graphics.fillCircle(effect.x, effect.y, 24 + progress * 20);
      }
    }
  }
}
