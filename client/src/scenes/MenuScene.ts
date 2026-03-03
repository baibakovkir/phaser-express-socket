import Phaser from "phaser";
import { network } from "../network/socket.js";

export class MenuScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private playerId: string;

  constructor() {
    super({ key: "MenuScene" });
    this.playerId = `player-${Math.random().toString(36).slice(2, 8)}`;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.add
      .text(cx, cy - 120, "MOBA 3v3", {
        fontSize: "48px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 60, `ID: ${this.playerId}`, {
        fontSize: "14px",
        color: "#666",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const findMatchBtn = this.add
      .text(cx, cy + 20, "[ FIND MATCH ]", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#333",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    findMatchBtn.on("pointerover", () => findMatchBtn.setColor("#00ff88"));
    findMatchBtn.on("pointerout", () => findMatchBtn.setColor("#ffffff"));
    findMatchBtn.on("pointerdown", () => this.onFindMatch());

    this.statusText = this.add
      .text(cx, cy + 100, "", {
        fontSize: "18px",
        color: "#aaa",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    network.on("queue:joined", () => {
      this.statusText.setText("Searching for match...");
    });

    network.on("match:found", (data: unknown) => {
      const matchData = data as { matchId: string };
      this.statusText.setText("Match found!");
      this.time.delayedCall(1000, () => {
        this.scene.start("GameScene", { matchId: matchData.matchId });
      });
    });
  }

  private onFindMatch() {
    network.joinQueue(this.playerId);
    this.statusText.setText("Joining queue...");
  }
}
