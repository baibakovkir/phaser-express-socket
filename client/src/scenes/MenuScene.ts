import Phaser from "phaser";
import { network, Lobby } from "../network/socket.js";

export class MenuScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private authPanel!: Phaser.GameObjects.Container;
  private lobbyPanel!: Phaser.GameObjects.Container;
  private lobbyListPanel!: Phaser.GameObjects.Container;
  private currentPlayer: { id: string; username: string } | null = null;
  private currentLobby: Lobby | null = null;

  // Form fields
  private usernameInput!: Phaser.GameObjects.Text;
  private emailInput!: Phaser.GameObjects.Text;
  private passwordInput!: Phaser.GameObjects.Text;
  private isLoginMode: boolean = true;

  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Title
    this.add
      .text(cx, cy - 200, "MOBA 3v3", {
        fontSize: "48px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(cx, cy - 240, "", {
        fontSize: "14px",
        color: "#ff6666",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    // Create panels
    this.createAuthPanel(cx, cy);
    this.createLobbyPanel(cx, cy);
    this.createLobbyListPanel(cx, cy);

    this.updateUI();

    // Network listeners
    network.on("lobby:updated", (data: { lobby: Lobby }) => {
      if (data.lobby) {
        this.currentLobby = data.lobby;
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
  }

  private createAuthPanel(cx: number, cy: number) {
    this.authPanel = this.add.container(0, 0);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(cx - 200, cy - 100, 400, 280, 10);
    bg.lineStyle(2, 0x00ff88);
    bg.strokeRoundedRect(cx - 200, cy - 100, 400, 280, 10);
    this.authPanel.add(bg);

    // Title
    this.authPanel.add(
      this.add.text(cx, cy - 70, "Login", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "monospace",
      }).setOrigin(0.5)
    );

    // Input backgrounds
    const createInputBg = (y: number) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x2a2a3e, 1);
      graphics.fillRoundedRect(cx - 150, y - 15, 300, 30, 5);
      return graphics;
    };

    createInputBg(cy - 20);
    createInputBg(cy + 20);
    createInputBg(cy + 60);

    // Username
    this.authPanel.add(
      this.add.text(cx - 140, cy - 30, "Username:", {
        fontSize: "14px",
        color: "#aaaaaa",
        fontFamily: "monospace",
      })
    );
    this.usernameInput = this.add
      .text(cx - 140, cy - 10, "", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0.5);
    this.authPanel.add(this.usernameInput);

    // Email
    this.authPanel.add(
      this.add.text(cx - 140, cy + 10, "Email:", {
        fontSize: "14px",
        color: "#aaaaaa",
        fontFamily: "monospace",
      })
    );
    this.emailInput = this.add
      .text(cx - 140, cy + 30, "", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0.5);
    this.authPanel.add(this.emailInput);

    // Password
    this.authPanel.add(
      this.add.text(cx - 140, cy + 50, "Password:", {
        fontSize: "14px",
        color: "#aaaaaa",
        fontFamily: "monospace",
      })
    );
    this.passwordInput = this.add
      .text(cx - 140, cy + 70, "", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0.5);
    this.authPanel.add(this.passwordInput);

    // Toggle button (Login/Register)
    const toggleBtn = this.add
      .text(cx, cy + 120, "[ Switch to Register ]", {
        fontSize: "14px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    toggleBtn.on("pointerdown", () => {
      this.isLoginMode = !this.isLoginMode;
      toggleBtn.setText(this.isLoginMode ? "[ Switch to Register ]" : "[ Switch to Login ]");
      this.authPanel.list[1].setText(this.isLoginMode ? "Login" : "Register");
    });
    this.authPanel.add(toggleBtn);

    // Submit button
    const submitBtn = this.add
      .text(cx, cy + 150, "[ SUBMIT ]", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#00ff88",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    submitBtn.on("pointerover", () => submitBtn.setColor("#000000"));
    submitBtn.on("pointerout", () => submitBtn.setColor("#ffffff"));
    submitBtn.on("pointerdown", () => this.handleSubmit());
    this.authPanel.add(submitBtn);

    // Input handling
    this.input.keyboard.on("keydown", (event: KeyboardEvent) => {
      if (!this.authPanel.visible) return;

      const key = event.key.toLowerCase();
      if (key.length === 1 && key.match(/[a-z0-9@._-]/i)) {
        this.addCharacter(key);
      } else if (event.key === "Backspace") {
        this.removeCharacter();
      }
    });
  }

  private addCharacter(char: string) {
    const activeInput = this.getActiveInput();
    if (activeInput) {
      const currentText = activeInput.text;
      if (currentText.length < 30) {
        activeInput.setText(currentText + char);
      }
    }
  }

  private removeCharacter() {
    const activeInput = this.getActiveInput();
    if (activeInput) {
      const currentText = activeInput.text;
      activeInput.setText(currentText.slice(0, -1));
    }
  }

  private getActiveInput(): Phaser.GameObjects.Text | null {
    // Simple focus simulation - last clicked input
    return this.passwordInput; // Default to password for simplicity
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
    this.lobbyPanel.add(
      this.add.text(cx, cy - 90, "Lobby", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "monospace",
      }).setOrigin(0.5)
    );

    // Lobby info
    this.lobbyPanel.add(
      this.add.text(cx, cy - 50, "Lobby Name: ", {
        fontSize: "16px",
        color: "#aaaaaa",
        fontFamily: "monospace",
      }).setOrigin(0.5)
    );

    this.lobbyPanel.add(
      this.add.text(cx, cy - 25, "Players: ", {
        fontSize: "16px",
        color: "#aaaaaa",
        fontFamily: "monospace",
      }).setOrigin(0.5)
    );

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

    this.lobbyPanel.setVisible(false);
  }

  private createLobbyListPanel(cx: number, cy: number) {
    this.lobbyListPanel = this.add.container(0, 0);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(cx + 100, cy - 150, 350, 380, 10);
    bg.lineStyle(2, 0x888888);
    bg.strokeRoundedRect(cx + 100, cy - 150, 350, 380, 10);
    this.lobbyListPanel.add(bg);

    // Title
    this.lobbyListPanel.add(
      this.add.text(cx + 275, cy - 125, "Public Lobbies", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
      }).setOrigin(0.5)
    );

    // Refresh button
    const refreshBtn = this.add
      .text(cx + 275, cy - 95, "[ REFRESH ]", {
        fontSize: "14px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    refreshBtn.on("pointerdown", () => this.refreshLobbyList());
    this.lobbyListPanel.add(refreshBtn);

    // Lobby list container
    this.lobbyListPanel.add(
      this.add.text(cx + 275, cy - 65, "Click refresh to load lobbies", {
        fontSize: "12px",
        color: "#666666",
        fontFamily: "monospace",
      }).setOrigin(0.5)
    );

    this.lobbyListPanel.setVisible(false);
  }

  private updateUI() {
    const isLoggedIn = network.getPlayer() !== null;
    this.authPanel.setVisible(!isLoggedIn);
    this.lobbyPanel.setVisible(isLoggedIn);
    this.lobbyListPanel.setVisible(isLoggedIn && !this.currentLobby);

    if (isLoggedIn && !this.currentLobby) {
      this.refreshLobbyList();
    }
  }

  private async handleSubmit() {
    const username = this.usernameInput.text.trim();
    const email = this.emailInput.text.trim();
    const password = this.passwordInput.text.trim();

    if (!username || !password) {
      this.statusText.setText("Username and password required");
      return;
    }

    if (!this.isLoginMode && !email) {
      this.statusText.setText("Email required for registration");
      return;
    }

    this.statusText.setText("Processing...");

    let result;
    if (this.isLoginMode) {
      result = await network.login(email, password);
    } else {
      result = await network.register(username, email, password);
    }

    if (result.success) {
      this.currentPlayer = { id: result.player.id, username: result.player.username };
      this.statusText.setText(`Welcome, ${result.player.username}!`);
      this.updateUI();
    } else {
      this.statusText.setText(result.error || "Authentication failed");
    }
  }

  private async refreshLobbyList() {
    const result = await network.listLobbies();
    // Display lobbies (simplified - would need proper UI list)
    console.log("Available lobbies:", result.lobbies);
  }

  private async createLobby() {
    const result = await network.createLobby(`${this.currentPlayer.username}'s Lobby`, false);
    if (result.success) {
      this.currentLobby = result.lobby;
      this.updateLobbyDisplay();
    }
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

  private updateLobbyDisplay() {
    if (!this.currentLobby) return;

    // Update lobby panel with current lobby info
    this.lobbyPanel.list[1].setText(this.currentLobby.name);

    const playerList = this.currentLobby.players
      .map((p) => `${p.username} [${p.ready ? "READY" : "NOT READY"}]`)
      .join("\n");

    this.lobbyPanel.list[2].setText(`Players:\n${playerList}`);
  }
}
