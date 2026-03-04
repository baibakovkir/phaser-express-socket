import Phaser from "phaser";
import { network } from "../network/socket.js";
import { stateSync, InputCommand } from "../network/state-sync.js";

export class GameScene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private matchId!: string;
  private moveSpeed = 200;
  private lastInputTick = 0;
  private readonly INPUT_TICK_RATE = 1000 / 60; // 60 inputs per second
  private lastInputTime = 0;
  private uiContainer!: Phaser.GameObjects.Container;
  private tickText!: Phaser.GameObjects.Text;
  private pingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { matchId?: string }) {
    this.matchId = data.matchId || "local";
    stateSync.reset();
  }

  create() {
    // Create UI first (on top of everything)
    this.createUI();

    this.createMap();
    this.createHero();
    this.setupInput();
    this.setupCamera();
    this.setupNetworkListeners();

    // Initialize state sync with local player
    const player = network.getPlayer();
    if (player) {
      stateSync.initLocalPlayer(player.id, 1, "hero1");
    }

    // Start game loop
    this.time.addEvent({
      delay: this.INPUT_TICK_RATE,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true,
    });
  }

  update(time: number) {
    // Send inputs at fixed rate
    if (time - this.lastInputTime >= this.INPUT_TICK_RATE) {
      this.sendInput();
      this.lastInputTime = time;
    }

    this.handleMovement();
  }

  private createUI() {
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setDepth(1000);
    this.uiContainer.setScrollFactor(0);

    // Match ID
    this.add
      .text(10, 10, `Match: ${this.matchId}`, {
        fontSize: "12px",
        color: "#555",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.add.text(10, 10, `Match: ${this.matchId}`, {
      fontSize: "12px",
      color: "#888",
      fontFamily: "monospace",
    }).setOrigin(0, 0));

    // Tick counter
    this.tickText = this.add
      .text(10, 30, "Tick: 0", {
        fontSize: "12px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.tickText);

    // Ping
    this.pingText = this.add
      .text(10, 50, "Ping: -- ms", {
        fontSize: "12px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.pingText);

    // Controls hint
    this.add
      .text(1270, 10, "WASD / Arrows to move", {
        fontSize: "12px",
        color: "#666",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0);
  }

  private createMap() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x111122);
    graphics.fillRect(0, 0, 2400, 2400);

    // Grid lines
    graphics.lineStyle(1, 0x222244);
    for (let x = 0; x <= 2400; x += 64) {
      graphics.lineBetween(x, 0, x, 2400);
    }
    for (let y = 0; y <= 2400; y += 64) {
      graphics.lineBetween(0, y, 2400, y);
    }

    // Lane markings (simplified 3-lane layout)
    graphics.lineStyle(3, 0x333355);
    // Top lane
    graphics.lineBetween(200, 200, 1000, 200);
    graphics.lineBetween(1000, 200, 1000, 1000);
    graphics.lineBetween(1000, 1000, 2200, 1000);
    // Mid lane
    graphics.lineBetween(200, 1200, 2200, 1200);
    // Bot lane
    graphics.lineBetween(200, 1400, 1400, 1400);
    graphics.lineBetween(1400, 1400, 1400, 2200);
    graphics.lineBetween(1400, 2200, 2200, 2200);

    // Base areas
    graphics.fillStyle(0x0044aa, 0.3); // Blue base (bottom-left)
    graphics.fillRect(0, 1800, 400, 600);

    graphics.fillStyle(0xaa4400, 0.3); // Red base (top-right)
    graphics.fillRect(2000, 0, 400, 400);

    this.physics.world.setBounds(0, 0, 2400, 2400);
  }

  private createHero() {
    this.hero = this.physics.add.sprite(400, 2000, "hero");
    this.hero.setCollideWorldBounds(true);
    this.hero.setDepth(10);

    // Set initial position in state sync
    const state = stateSync.getState();
    const localPlayer = state.players.values().next().value;
    if (localPlayer) {
      localPlayer.x = this.hero.x;
      localPlayer.y = this.hero.y;
    }
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
    this.cameras.main.setZoom(1);
  }

  private setupNetworkListeners() {
    network.on("game:input", (data: unknown) => {
      const inputData = data as {
        playerId: string;
        input: { x: number; y: number; type: string };
        tick: number;
      };
      console.log("[game] remote input:", inputData);
      // Here you would update other players' positions
    });

    network.on("game:state", (data: unknown) => {
      const stateData = data as { tick: number; players: unknown[] };
      stateSync.applyServerState({ players: new Map() }, stateData.tick);
    });
  }

  private gameLoop() {
    stateSync.incrementTick();
    this.tickText.setText(`Tick: ${stateSync.getTick()} (Server: ${stateSync.getServerTick()})`);

    // Update ping periodically
    if (stateSync.getTick() % 60 === 0) {
      this.updatePing();
    }
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

    // Update state sync with local player position
    const state = stateSync.getState();
    const localPlayer = state.players.values().next().value;
    if (localPlayer) {
      localPlayer.x = this.hero.x;
      localPlayer.y = this.hero.y;
      localPlayer.vx = vx;
      localPlayer.vy = vy;
    }
  }

  private sendInput() {
    const state = stateSync.getState();
    const localPlayer = state.players.values().next().value;
    if (!localPlayer) return;

    const input: InputCommand = {
      type: "move",
      x: localPlayer.x,
      y: localPlayer.y,
      tick: stateSync.getTick(),
    };

    stateSync.queueInput(input);
    network.sendInput(this.matchId, input, stateSync.getTick());
  }

  private updatePing() {
    // Simple ping estimation (would need proper implementation with timestamps)
    const ping = Math.floor(Math.random() * 30) + 20; // Placeholder
    this.pingText.setText(`Ping: ${ping} ms`);
  }
}
