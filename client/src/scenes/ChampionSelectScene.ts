import Phaser from "phaser";
import { Champion, getAllChampions, loadChampionsFromAPI } from "./GameScenePhase3.js";

const ROLE_COLORS = {
  tank: 0x4488ff,
  assassin: 0x00ff88,
  mage: 0xaa44ff,
  support: 0x00ffaa,
  marksman: 0xff8800,
  fighter: 0xff4444,
};

export class ChampionSelectScene extends Phaser.Scene {
  private selectedChampion: Champion | null = null;
  private championCards: Phaser.GameObjects.Container[] = [];
  private confirmButton!: Phaser.GameObjects.Text;
  private isTestMode: boolean = false;
  private selectedTeam: number = 1;
  private champions: Champion[] = [];
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "ChampionSelectScene" });
  }

  init(data: { isTestMode?: boolean; team?: number }) {
    this.isTestMode = data.isTestMode ?? false;
    this.selectedTeam = data.team ?? 1;
  }

  async create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Show loading text
    this.loadingText = this.add
      .text(cx, cy, "Loading champions...", {
        fontSize: "24px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    // Load champions from API (shared with GameScene)
    await loadChampionsFromAPI();
    this.champions = getAllChampions();
    
    // Hide loading text
    this.loadingText.destroy();

    // Background
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e);
    bg.setOrigin(0);
    bg.setDepth(-1);

    // Title - higher
    this.add
      .text(cx, 30, "CHAMPION SELECT", {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    if (this.isTestMode) {
      this.add
        .text(cx, 58, "Test Mode - Practice with bots", {
          fontSize: "13px",
          color: "#ff88ff",
          fontFamily: "monospace",
        })
        .setOrigin(0.5);
    }

    // Team selection (test mode only) - higher
    if (this.isTestMode) {
      this.createTeamSelection(cx, 82);
    }

    // Create champion cards in GRID layout - start below team selection
    // Grid Row 1: y=140, Grid Row 2: y=365
    this.createChampionGrid(cx, 140);

    // Champion preview area - at bottom
    this.createPreviewArea(cx, this.cameras.main.height - 120);

    // Confirm button - at very bottom with higher depth
    this.confirmButton = this.add
      .text(cx, this.cameras.main.height - 40, "[ CONFIRM ]", {
        fontSize: "18px",
        color: "#666666",
        fontFamily: "monospace",
        backgroundColor: "#333333",
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  private createChampionGrid(centerX: number, startY: number) {
    const cardWidth = 170;
    const cardHeight = 200;
    const spacingX = 25;
    const spacingY = 25;
    const cols = 3; // 3 columns for 6 champions = 2 rows
    const rows = 2;

    // Calculate total grid size
    const totalWidth = cols * cardWidth + (cols - 1) * spacingX;
    const totalHeight = rows * cardHeight + (rows - 1) * spacingY;

    // Start position (centered)
    const startX = centerX - totalWidth / 2 + cardWidth / 2;

    console.log(`[ChampionGrid] Total size: ${totalWidth}x${totalHeight}, Start: (${startX}, ${startY})`);

    this.champions.forEach((champion, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);

      console.log(`[ChampionGrid] Card ${index} (${champion.name}): (${x}, ${y})`);
      this.createChampionCard(x, y, cardWidth, cardHeight, champion);
    });
  }

  private createTeamSelection(cx: number, y: number) {
    const container = this.add.container(0, 0);

    const label = this.add
      .text(cx, y, "Select Team:", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    container.add(label);

    // Blue team button
    const blueBtn = this.add
      .text(cx - 100, y + 40, "[ BLUE ]", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#0088ff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    blueBtn.on("pointerdown", () => {
      this.selectedTeam = 1;
      blueBtn.setStyle({ backgroundColor: "#0088ff" });
      redBtn.setStyle({ backgroundColor: "#ff6600" });
    });
    container.add(blueBtn);

    // Red team button
    const redBtn = this.add
      .text(cx + 100, y + 40, "[ RED ]", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        backgroundColor: "#ff6600",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    redBtn.on("pointerdown", () => {
      this.selectedTeam = 2;
      blueBtn.setStyle({ backgroundColor: "#0066ff" });
      redBtn.setStyle({ backgroundColor: "#ff8844" });
    });
    container.add(redBtn);
  }

  private createChampionCard(x: number, y: number, width: number, height: number, champion: Champion) {
    const card = this.add.container(x, y);

    // Card background using Graphics for proper stroke styling
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a3e);
    bg.fillRect(-width / 2, -height / 2, width, height);
    bg.lineStyle(2, champion.color);
    bg.strokeRect(-width / 2, -height / 2, width, height);
    
    // Make it interactive
    const hitZone = this.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });
    card.add(bg);
    card.add(hitZone);

    // Champion color indicator
    const colorBar = this.add.rectangle(0, -height / 2 + 10, width - 14, 5, champion.color);
    card.add(colorBar);

    // Champion name
    const nameText = this.add
      .text(0, -height / 2 + 22, champion.name, {
        fontSize: "11px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    card.add(nameText);

    // Role
    const roleText = this.add
      .text(0, -height / 2 + 36, champion.role.toUpperCase(), {
        fontSize: "8px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    card.add(roleText);

    // Champion sprite placeholder (circle with color)
    const spriteCircle = this.add.circle(0, -height / 2 + 65, 22, champion.color, 0.8);
    spriteCircle.setStrokeStyle(2, champion.color);
    card.add(spriteCircle);

    // Stats in compact form
    const statsY = -height / 2 + 95;
    const stats = [
      { label: "HP", value: champion.hp || 0 },
      { label: "ATK", value: champion.attack || 0 },
      { label: "SPD", value: champion.speed || 0 },
    ];

    stats.forEach((stat, index) => {
      const statX = -50 + index * 50;
      const label = this.add
        .text(statX, statsY, stat.label, {
          fontSize: "7px",
          color: "#666666",
          fontFamily: "monospace",
        })
        .setOrigin(0.5, 0);
      card.add(label);

      const value = this.add
        .text(statX, statsY + 10, (stat.value ?? 0).toString(), {
          fontSize: "10px",
          color: "#ffffff",
          fontFamily: "monospace",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0);
      card.add(value);
    });

    // Hover effects
    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x3a3a4e);
      bg.fillRect(-width / 2, -height / 2, width, height);
      bg.lineStyle(3, champion.color);
      bg.strokeRect(-width / 2, -height / 2, width, height);
      this.showPreview(champion);
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x2a2a3e);
      bg.fillRect(-width / 2, -height / 2, width, height);
      bg.lineStyle(2, champion.color);
      bg.strokeRect(-width / 2, -height / 2, width, height);
    });

    hitZone.on("pointerdown", () => {
      this.selectChampion(champion, bg, width, height);
    });

    // Store bg graphics for later selection updates
    (card as any).bgGraphics = bg;
    (card as any).cardWidth = width;
    (card as any).cardHeight = height;

    this.championCards.push(card);
  }

  private createPreviewArea(cx: number, y: number) {
    // Preview container (hidden initially)
    const previewContainer = this.add.container(0, 0);
    previewContainer.setName("preview");
    previewContainer.setDepth(50); // Ensure it's visible but below button

    const previewBg = this.add.rectangle(cx, y, 500, 100, 0x000000, 0.8);
    previewBg.setStrokeStyle(2, 0x00ff88);
    previewContainer.add(previewBg);

    const previewTitle = this.add
      .text(cx - 230, y - 30, "Preview:", {
        fontSize: "14px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    previewContainer.add(previewTitle);

    const previewName = this.add
      .text(cx - 230, y - 5, "", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0, 0);
    previewContainer.add(previewName);

    const previewRole = this.add
      .text(cx - 230, y + 15, "", {
        fontSize: "12px",
        color: "#888888",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    previewContainer.add(previewRole);

    const previewDesc = this.add
      .text(cx - 230, y + 35, "", {
        fontSize: "11px",
        color: "#aaaaaa",
        fontFamily: "monospace",
        wordWrap: { width: 480 },
      })
      .setOrigin(0, 0);
    previewContainer.add(previewDesc);

    previewContainer.setVisible(false);
  }

  private showPreview(champion: Champion) {
    const previewContainer = this.children.getByName("preview") as Phaser.GameObjects.Container | undefined;
    if (!previewContainer) return;

    previewContainer.setVisible(true);

    const texts = previewContainer.list.filter((c) => c instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text[];
    if (texts.length >= 4) {
      texts[1].setText(champion.name);
      texts[2].setText(`${champion.role.toUpperCase()} • HP: ${champion.hp} • ATK: ${champion.attack}`);
      texts[3].setText(`${champion.role} champion with ${champion.hp} HP and ${champion.attack} attack power`);
    }
  }

  private selectChampion(champion: Champion, bg: Phaser.GameObjects.Graphics, width: number, height: number) {
    // Deselect previous - reset all cards
    this.championCards.forEach((card) => {
      const cardBg = (card as any).bgGraphics as Phaser.GameObjects.Graphics | undefined;
      const cardWidth = (card as any).cardWidth as number | undefined;
      const cardHeight = (card as any).cardHeight as number | undefined;
      if (cardBg && cardWidth && cardHeight) {
        cardBg.clear();
        cardBg.fillStyle(0x2a2a3e);
        cardBg.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
        cardBg.lineStyle(3, 0xffffff);
        cardBg.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
      }
    });

    // Select new
    this.selectedChampion = champion;
    bg.clear();
    bg.fillStyle(0x2a2a3e);
    bg.fillRect(-width / 2, -height / 2, width, height);
    bg.lineStyle(5, 0x00ff88);
    bg.strokeRect(-width / 2, -height / 2, width, height);

    // Enable confirm button - remove old listeners first
    this.confirmButton.removeAllListeners();
    this.confirmButton
      .setText("[ CONFIRM ]")
      .setStyle({
        color: "#ffffff",
        backgroundColor: "#00ff88",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        console.log("[ChampionSelect] Confirm button clicked!");
        this.confirmSelection();
      });
    
    console.log("[ChampionSelect] Champion selected:", champion.name);
  }

  private confirmSelection() {
    if (!this.selectedChampion) {
      console.warn("[ChampionSelect] No champion selected!");
      return;
    }

    console.log("[ChampionSelect] Confirmed:", {
      champion: this.selectedChampion.name,
      team: this.selectedTeam,
      isTestMode: this.isTestMode,
      championId: this.selectedChampion.id,
    });

    try {
      // Stop current scene and start game scene
      console.log("[ChampionSelect] Starting GameScenePhase3...");
      this.scene.stop("ChampionSelectScene");
      this.scene.start("GameScenePhase3", {
        matchId: this.isTestMode ? "test-mode" : "online-match",
        isTestMode: this.isTestMode,
        championId: this.selectedChampion.id,
        team: this.selectedTeam,
      });
      console.log("[ChampionSelect] GameScenePhase3 started successfully");
    } catch (error) {
      console.error("[ChampionSelect] Error starting game scene:", error);
    }
  }
}
