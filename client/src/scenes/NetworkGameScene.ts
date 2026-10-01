import Phaser from 'phaser';
import type { GameInput, WorldPlayer, WorldSnapshot } from '@moba/shared';
import { network } from '../network/socket';

const WIDTH = 1280;
const HEIGHT = 720;
const TICK_MS = 1000 / 30;

export class NetworkGameScene extends Phaser.Scene {
  private matchId = '';
  private playerId = '';
  private keys!: Record<'W' | 'A' | 'S' | 'D' | 'SPACE', Phaser.Input.Keyboard.Key>;
  private graphics!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  private labels = new Map<string, Phaser.GameObjects.Text>();
  private previous?: WorldSnapshot;
  private latest?: WorldSnapshot;
  private receivedAt = 0;
  private sequence = 0;
  private pending: GameInput[] = [];
  private predicted?: { x: number; y: number };
  private readonly onSnapshot = (data: unknown) => this.receiveSnapshot(data as WorldSnapshot);
  private readonly onAbort = () => this.statusText.setText('Match interrupted');

  constructor() {
    super({ key: 'NetworkGameScene' });
  }

  init(data: { matchId: string }): void {
    this.matchId = data.matchId;
    this.playerId = network.getPlayer()?.id || '';
    this.previous = undefined;
    this.latest = undefined;
    this.pending = [];
    this.predicted = undefined;
    this.sequence = 0;
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.statusText = this.add.text(24, 18, 'Waiting for players...', { color: '#ffffff', fontSize: '22px' });
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,SPACE') as typeof this.keys;
    network.on('game:snapshot', this.onSnapshot);
    network.on('match:aborted', this.onAbort);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      network.off('game:snapshot', this.onSnapshot);
      network.off('match:aborted', this.onAbort);
      delete this.game.canvas.dataset.gameReady;
      delete this.game.canvas.dataset.serverX;
      delete this.game.canvas.dataset.serverTick;
    });
    this.time.addEvent({ delay: TICK_MS, loop: true, callback: () => this.sendInput() });
  }

  private receiveSnapshot(snapshot: WorldSnapshot): void {
    if (snapshot.matchId !== this.matchId) return;
    this.previous = this.latest;
    this.latest = snapshot;
    this.receivedAt = this.time.now;
    const own = snapshot.players.find(player => player.id === this.playerId);
    if (own) {
      this.game.canvas.dataset.serverX = String(own.x);
      this.game.canvas.dataset.serverTick = String(snapshot.tick);
      this.pending = this.pending.filter(input => input.seq > own.lastProcessedSeq);
      this.predicted = { x: own.x, y: own.y };
      for (const input of this.pending) this.predict(input, own.speed);
    }
    if (snapshot.status === 'playing') this.game.canvas.dataset.gameReady = 'true';
    if (snapshot.status === 'finished') this.game.canvas.dataset.gameReady = 'finished';
    this.statusText.setText(snapshot.status === 'finished'
      ? `Match finished — team ${snapshot.winnerTeam} wins`
      : snapshot.status === 'selecting'
        ? 'Waiting for hero selections...'
        : `Server tick ${snapshot.tick} · WASD move · Space attack`);
  }

  private sendInput(): void {
    if (this.latest?.status !== 'playing') return;
    const dx = Number(this.keys.D.isDown) - Number(this.keys.A.isDown);
    const dy = Number(this.keys.S.isDown) - Number(this.keys.W.isDown);
    const input: GameInput = { seq: ++this.sequence, dx, dy, attack: this.keys.SPACE.isDown };
    this.pending.push(input);
    if (this.pending.length > 120) this.pending.shift();
    const own = this.latest.players.find(player => player.id === this.playerId);
    if (own) this.predict(input, own.speed);
    network.sendInput(this.matchId, input);
  }

  private predict(input: GameInput, speed: number): void {
    if (!this.predicted) return;
    const magnitude = Math.hypot(input.dx, input.dy);
    const scale = magnitude > 1 ? 1 / magnitude : 1;
    this.predicted.x = Phaser.Math.Clamp(this.predicted.x + input.dx * scale * speed / 30, 18, WIDTH - 18);
    this.predicted.y = Phaser.Math.Clamp(this.predicted.y + input.dy * scale * speed / 30, 18, HEIGHT - 18);
  }

  update(): void {
    this.graphics.clear();
    this.graphics.fillStyle(0x10213a);
    this.graphics.fillRect(0, 0, WIDTH, HEIGHT);
    this.graphics.lineStyle(3, 0x47708c);
    this.graphics.strokeRect(3, 3, WIDTH - 6, HEIGHT - 6);
    this.graphics.lineStyle(1, 0x32506b);
    this.graphics.lineBetween(WIDTH / 2, 0, WIDTH / 2, HEIGHT);
    if (!this.latest) return;
    const alpha = Phaser.Math.Clamp((this.time.now - this.receivedAt) / (2 * TICK_MS), 0, 1);
    const seen = new Set<string>();
    for (const player of this.latest.players) {
      seen.add(player.id);
      const previous = this.previous?.players.find(item => item.id === player.id);
      const position = player.id === this.playerId && this.predicted
        ? this.predicted
        : previous
          ? { x: Phaser.Math.Linear(previous.x, player.x, alpha), y: Phaser.Math.Linear(previous.y, player.y, alpha) }
          : player;
      this.drawPlayer(player, position.x, position.y);
    }
    for (const [id, label] of this.labels) {
      if (!seen.has(id)) {
        label.destroy();
        this.labels.delete(id);
      }
    }
  }

  private drawPlayer(player: WorldPlayer, x: number, y: number): void {
    this.graphics.fillStyle(player.hp > 0 ? (player.team === 1 ? 0x36a8ff : 0xff6666) : 0x555555);
    this.graphics.fillCircle(x, y, 18);
    this.graphics.fillStyle(0x151515);
    this.graphics.fillRect(x - 24, y - 32, 48, 6);
    this.graphics.fillStyle(0x38d266);
    this.graphics.fillRect(x - 24, y - 32, 48 * player.hp / player.maxHp, 6);
    let label = this.labels.get(player.id);
    if (!label) {
      label = this.add.text(x, y, player.username, { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
      this.labels.set(player.id, label);
    }
    label.setPosition(x, y + 32);
  }
}
