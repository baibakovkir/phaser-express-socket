import Phaser from "phaser";
import { network } from "../network/socket.js";

export class GameScene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private matchId!: string;
  private moveSpeed = 200;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { matchId?: string }) {
    this.matchId = data.matchId || "local";
  }

  create() {
    this.add
      .text(10, 10, `Match: ${this.matchId}`, {
        fontSize: "12px",
        color: "#555",
        fontFamily: "monospace",
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.createMap();
    this.createHero();
    this.setupInput();
    this.setupCamera();
    this.setupNetworkListeners();
  }

  update() {
    this.handleMovement();
  }

  private createMap() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x111122);
    graphics.fillRect(0, 0, 2400, 2400);

    graphics.lineStyle(1, 0x222244);
    for (let x = 0; x <= 2400; x += 64) {
      graphics.lineBetween(x, 0, x, 2400);
    }
    for (let y = 0; y <= 2400; y += 64) {
      graphics.lineBetween(0, y, 2400, y);
    }

    this.physics.world.setBounds(0, 0, 2400, 2400);
  }

  private createHero() {
    this.hero = this.physics.add.sprite(1200, 1200, "hero");
    this.hero.setCollideWorldBounds(true);
    this.hero.setDepth(10);
  }

  private setupInput() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2400, 2400);
  }

  private setupNetworkListeners() {
    network.on("game:input", (data: unknown) => {
      const inputData = data as {
        playerId: string;
        input: { x: number; y: number };
      };
      console.log("[game] remote input:", inputData);
    });
  }

  private handleMovement() {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.a.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.d.isDown) vx = 1;

    if (this.cursors.up.isDown || this.wasd.w.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.s.isDown) vy = 1;

    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx = (vx / len) * this.moveSpeed;
      vy = (vy / len) * this.moveSpeed;
    }

    this.hero.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      network.sendInput(this.matchId, {
        x: this.hero.x,
        y: this.hero.y,
      });
    }
  }
}
