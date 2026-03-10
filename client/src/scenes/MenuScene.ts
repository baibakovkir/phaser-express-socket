import Phaser from "phaser";
import { network, Lobby, Player } from "../network/socket.js";

const WEB_URL = import.meta.env.VITE_WEB_URL || "http://localhost:5174";

export class MenuScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private lobbyPanel!: Phaser.GameObjects.Container;
  private currentPlayer: Player | null = null;
  private currentLobby: Lobby | null = null;

  constructor() {
    super({ key: "MenuScene" });
  }

  async create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Title
    this.add
      .text(cx, cy - 200, "NINJAS X", {
        fontSize: "48px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(cx, cy - 240, "Connecting...", {
        fontSize: "14px",
        color: "#ff6666",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    // Create panels
    this.createLobbyPanel(cx, cy);

    // Connect to socket and wait for authentication
    const authenticated = await network.connect();

    // Check if we have a player after authentication
    const player = network.getPlayer();
    if (authenticated && player) {
      this.currentPlayer = player;
      this.statusText.setText(`Logged in as ${player.username}`);
    } else {
      this.statusText.setText("Not authenticated - Redirecting to login...");
      // Redirect to web app for login
      setTimeout(() => {
        window.location.href = WEB_URL + "/login";
      }, 2000);
    }

    // Network listeners
    network.on("lobby:updated", (data: unknown) => {
      const lobbyData = data as { lobby: Lobby };
      if (lobbyData.lobby) {
        this.currentLobby = lobbyData.lobby;
        this.updateLobbyDisplay();
      }
    });

    network.on("lobby:kicked", () => {
      this.statusText.setText("You were kicked from the lobby");
      this.currentLobby = null;
      this.updateUI();
    });

    network.on("queue:joined", () => {
      this.statusText.setText("Searching for match...");
    });

    network.on("match:found", (data: unknown) => {
      const matchData = data as { matchId: string; team1: unknown[]; team2: unknown[] };
      this.statusText.setText("Match found!");
      this.time.delayedCall(1500, () => {
        this.scene.start("GameScene", { matchId: matchData.matchId });
      });
    });

    this.updateUI();
  }

  private createLobbyPanel(cx: number, cy: number) {
    this.lobbyPanel = this.add.container(0, 0);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(cx - 250, cy - 120, 500, 320, 10);
    bg.lineStyle(2, 0x0088ff);
    bg.strokeRoundedRect(cx - 250, cy - 120, 500, 320, 10);
    this.lobbyPanel.add(bg);

    // Title
    const lobbyTitle = this.add.text(cx, cy - 90, "Lobby", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "monospace",
    }).setOrigin(0.5);
    this.lobbyPanel.add(lobbyTitle);

    // Lobby name display
    const lobbyNameText = this.add.text(cx, cy - 50, "Lobby Name: ", {
      fontSize: "16px",
      color: "#aaaaaa",
      fontFamily: "monospace",
    }).setOrigin(0.5);
    this.lobbyPanel.add(lobbyNameText);

    // Players display
    const playersText = this.add.text(cx, cy - 25, "Players: ", {
      fontSize: "16px",
      color: "#aaaaaa",
      fontFamily: "monospace",
    }).setOrigin(0.5);
    this.lobbyPanel.add(playersText);

    // Ready button
    const readyBtn = this.add
      .text(cx - 100, cy + 80, "[ READY ]", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#ffaa00",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    readyBtn.on("pointerdown", () => this.toggleReady());
    this.lobbyPanel.add(readyBtn);

    // Leave button
    const leaveBtn = this.add
      .text(cx + 100, cy + 80, "[ LEAVE ]", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#ff4444",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    leaveBtn.on("pointerdown", () => this.leaveLobby());
    this.lobbyPanel.add(leaveBtn);

    // Find match button
    const findMatchBtn = this.add
      .text(cx, cy + 130, "[ FIND MATCH ]", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#00ff88",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    findMatchBtn.on("pointerdown", () => this.findMatch());
    this.lobbyPanel.add(findMatchBtn);

    // Test mode button (solo practice)
    const testModeBtn = this.add
      .text(cx, cy + 180, "[ TEST MODE ]", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#8844ff",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    testModeBtn.on("pointerdown", () => this.startTestMode());
    this.lobbyPanel.add(testModeBtn);

    this.lobbyPanel.setVisible(false);
  }

  private updateUI() {
    const isLoggedIn = network.getPlayer() !== null;
    this.lobbyPanel.setVisible(isLoggedIn);
  }

  private toggleReady() {
    network.setReady(true);
  }

  private async leaveLobby() {
    await network.leaveLobby();
    this.currentLobby = null;
    this.updateUI();
  }

  private async findMatch() {
    const result = await network.joinQueue();
    if (result.success) {
      this.statusText.setText("Searching for match...");
    } else {
      this.statusText.setText(result.error || "Failed to join queue");
    }
  }

  private startTestMode() {
    this.statusText.setText("Starting test mode...");
    this.time.delayedCall(500, () => {
      this.scene.start("ChampionSelectScene", { isTestMode: true });
    });
  }

  private updateLobbyDisplay() {
    if (!this.currentLobby) return;

    // Update lobby panel with current lobby info
    const lobbyNameText = this.lobbyPanel.list[1] as Phaser.GameObjects.Text;
    const playersText = this.lobbyPanel.list[2] as Phaser.GameObjects.Text;
    
    lobbyNameText.setText(this.currentLobby.name);

    const playerList = this.currentLobby.players
      .map((p) => `${p.username} [${p.ready ? "READY" : "NOT READY"}]`)
      .join("\n");

    playersText.setText(`Players:\n${playerList}`);
  }
}
