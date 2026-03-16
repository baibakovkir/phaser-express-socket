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

const ROLE_ICONS: Record<string, string> = {
  tank: "🛡️",
  assassin: "⚔️",
  mage: "🔮",
  support: "💚",
  marksman: "🏹",
  fighter: "👊",
};

export class ChampionSelectScene extends Phaser.Scene {
  private selectedChampion: Champion | null = null;
  private championCards: Phaser.GameObjects.Container[] = [];
  private confirmButton!: Phaser.GameObjects.Container;
  private continueButton!: Phaser.GameObjects.Container;
  private isTestMode: boolean = false;
  private selectedTeam: number = 1;
  private champions: Champion[] = [];
  private previewContainer!: Phaser.GameObjects.Container;
  private currentPhase: "side" | "champion" = "side";

  // Side selection elements
  private sideElements: Phaser.GameObjects.GameObject[] = [];

  // Champion select elements
  private championElements: Phaser.GameObjects.GameObject[] = [];

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

    // Background gradient
    this.createBackground();

    // Main title
    this.add
      .text(cx, 25, "CHAMPION SELECT", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    if (this.isTestMode) {
      this.add
        .text(cx, 50, "🤖 Practice vs Bots", {
          fontSize: "14px",
          color: "#ff88ff",
          fontFamily: "monospace",
        })
        .setOrigin(0.5);
    }

    // Show loading text
    const loadingText = this.add
      .text(cx, cy, "Loading champions...", {
        fontSize: "20px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    // Load champions from API
    await loadChampionsFromAPI();
    this.champions = getAllChampions();
    loadingText.destroy();

    // Phase 1: Side Selection
    this.createSideSelection(cx, cy);

    // Phase 2: Champion Grid (hidden initially)
    this.createChampionSelect(cx, cy);
    this.setChampionSelectVisible(false);

    // Preview panel (always visible during champion select)
    this.createPreviewPanel(cx);
    this.previewContainer.setVisible(false);
  }

  private setChampionSelectVisible(visible: boolean) {
    this.championElements.forEach((el) => {
      if ('setVisible' in el) {
        (el as any).setVisible(visible);
      }
    });
  }

  private setSideSelectVisible(visible: boolean) {
    this.sideElements.forEach((el) => {
      if ('setVisible' in el) {
        (el as any).setVisible(visible);
      }
    });
  }

  private createBackground() {
    const { width, height } = this.cameras.main;

    // Dark background
    const bg = this.add.rectangle(0, 0, width, height, 0x0f0f1a);
    bg.setOrigin(0);
    bg.setDepth(-10);

    // Subtle grid pattern
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a2e, 0.3);
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();
    grid.setDepth(-9);
  }

  private createSideSelection(cx: number, cy: number) {
    // Side selection title
    const sideTitle = this.add
      .text(cx, cy - 80, "CHOOSE YOUR SIDE", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.sideElements.push(sideTitle);

    // Side description
    const sideDesc = this.add
      .text(cx, cy - 45, "Select which team you want to play on", {
        fontSize: "14px",
        color: "#8888aa",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    this.sideElements.push(sideDesc);

    // Blue team card
    const blueCard = this.createSideCard(cx - 140, cy + 40, "BLUE", "0088ff", "⚔️", "Bottom Lane", "Traditional side");
    this.sideElements.push(blueCard);

    // Red team card
    const redCard = this.createSideCard(cx + 140, cy + 40, "RED", "ff4444", "🔥", "Top Lane", "Mirror side");
    this.sideElements.push(redCard);

    // Continue button (hidden until side selected)
    const continueBtnBg = this.add
      .rectangle(cx, cy + 160, 200, 50, 0x00ff88)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    const continueBtnText = this.add
      .text(cx, cy + 160, "CONTINUE →", {
        fontSize: "18px",
        color: "#000000",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.continueButton = this.add.container(0, 0, [continueBtnBg, continueBtnText]);

    continueBtnBg.on("pointerdown", () => {
      this.goToChampionSelect();
    });

    this.sideElements.push(continueBtnBg);
    this.sideElements.push(continueBtnText);

    // Store reference for showing later
    (this as any).continueBtnBg = continueBtnBg;
    (this as any).continueBtnText = continueBtnText;
  }

  private createSideCard(
    x: number,
    y: number,
    title: string,
    colorHex: string,
    icon: string,
    subtitle: string,
    description: string
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);
    const cardWidth = 220;
    const cardHeight = 180;
    const color = parseInt(colorHex, 16);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
    bg.lineStyle(3, color, 0.5);
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
    card.add(bg);

    // Icon
    const iconText = this.add
      .text(0, -cardHeight / 2 + 30, icon, {
        fontSize: "42px",
      })
      .setOrigin(0.5);
    card.add(iconText);

    // Title
    const titleText = this.add
      .text(0, -cardHeight / 2 + 75, title, {
        fontSize: "22px",
        color: "#" + colorHex,
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    card.add(titleText);

    // Subtitle
    const subText = this.add
      .text(0, -cardHeight / 2 + 105, subtitle, {
        fontSize: "12px",
        color: "#aabbcc",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    card.add(subText);

    // Description
    const descText = this.add
      .text(0, -cardHeight / 2 + 130, description, {
        fontSize: "10px",
        color: "#667788",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    card.add(descText);

    // Interactive hit zone
    const hitZone = this.add.zone(0, 0, cardWidth, cardHeight).setInteractive({ useHandCursor: true });
    card.add(hitZone);

    // Hover effects
    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x252540, 1);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
      bg.lineStyle(3, color, 1);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x1a1a2e, 1);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
      bg.lineStyle(3, color, 0.5);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
    });

    hitZone.on("pointerdown", () => {
      this.selectSide(title === "BLUE" ? 1 : 2, bg, cardWidth, cardHeight, color);
    });

    // Store for later
    (card as any).bgGraphics = bg;
    (card as any).cardWidth = cardWidth;
    (card as any).cardHeight = cardHeight;
    (card as any).cardColor = color;

    return card;
  }

  private selectSide(team: number, bg: Phaser.GameObjects.Graphics, width: number, height: number, color: number) {
    this.selectedTeam = team;

    // Reset all side cards
    const cards = this.sideElements.filter(
      (el) => el instanceof Phaser.GameObjects.Container && el.list.some((item) => item instanceof Phaser.GameObjects.Graphics)
    ) as Phaser.GameObjects.Container[];

    cards.forEach((card) => {
      const cardBg = (card as any).bgGraphics as Phaser.GameObjects.Graphics | undefined;
      const cardWidth = (card as any).cardWidth as number | undefined;
      const cardHeight = (card as any).cardHeight as number | undefined;
      const cardColor = (card as any).cardColor as number | undefined;
      if (cardBg && cardWidth && cardHeight && cardColor) {
        cardBg.clear();
        cardBg.fillStyle(0x1a1a2e, 1);
        cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
        cardBg.lineStyle(3, cardColor, 0.5);
        cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 12);
      }
    });

    // Highlight selected
    bg.clear();
    bg.fillStyle(0x252540, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.lineStyle(4, color, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

    // Show continue button
    const continueBtnBg = (this as any).continueBtnBg as Phaser.GameObjects.Rectangle | undefined;
    const continueBtnText = (this as any).continueBtnText as Phaser.GameObjects.Text | undefined;
    if (continueBtnBg && continueBtnText) {
      continueBtnBg.setVisible(true);
      continueBtnText.setVisible(true);
    }
  }

  private goToChampionSelect() {
    this.currentPhase = "champion";

    // Animate out side selection
    this.tweens.add({
      targets: this.sideElements,
      alpha: 0,
      x: -300,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.setSideSelectVisible(false);
        this.setChampionSelectVisible(true);

        // Animate in champion select
        this.championElements.forEach((el) => {
          (el as any).setAlpha(0);
          if (el instanceof Phaser.GameObjects.Container || el instanceof Phaser.GameObjects.Text || el instanceof Phaser.GameObjects.Graphics) {
            (el as any).x = (el as any).x + 300 || 300;
          }
        });

        this.tweens.add({
          targets: this.championElements,
          alpha: 1,
          x: (target: any) => target.x - 300,
          duration: 300,
          ease: "Power2",
        });
      },
    });
  }

  private createChampionSelect(cx: number, cy: number) {
    // Team indicator
    const teamColor = this.selectedTeam === 1 ? "0088ff" : "ff4444";
    const teamName = this.selectedTeam === 1 ? "BLUE" : "RED";
    const teamText = this.add
      .text(cx, cy - 200, `PLAYING ON ${teamName}`, {
        fontSize: "16px",
        color: "#" + teamColor,
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.championElements.push(teamText);

    // Champion grid
    this.createChampionGrid(cx, cy - 20);

    // Back button
    const backButton = this.add
      .text(80, this.cameras.main.height - 40, "← BACK TO SIDE SELECT", {
        fontSize: "14px",
        color: "#8888aa",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerdown", () => {
      this.returnToSideSelect();
    });
    this.championElements.push(backButton);

    // Confirm button (bottom right)
    const confirmBg = this.add.graphics();
    confirmBg.fillStyle(0x333333, 1);
    confirmBg.fillRoundedRect(0, 0, 180, 50, 10);
    confirmBg.lineStyle(2, 0x666666, 1);
    confirmBg.strokeRoundedRect(0, 0, 180, 50, 10);

    const confirmText = this.add
      .text(90, 25, "SELECT CHAMPION", {
        fontSize: "14px",
        color: "#666666",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const confirmHitZone = this.add.zone(0, 0, 180, 50).setInteractive({ useHandCursor: true });
    confirmHitZone.on("pointerdown", () => {
      this.confirmSelection();
    });

    this.confirmButton = this.add.container(this.cameras.main.width - 100, this.cameras.main.height - 40, [
      confirmBg,
      confirmText,
      confirmHitZone,
    ]);
    this.confirmButton.setVisible(false);
    this.championElements.push(this.confirmButton);

    // Initially hide all champion elements
    this.setChampionSelectVisible(false);
  }

  private returnToSideSelect() {
    this.currentPhase = "side";
    this.confirmButton.setVisible(false);

    // Animate out champion select
    this.tweens.add({
      targets: this.championElements,
      alpha: 0,
      x: (target: any) => target.x + 300,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.setChampionSelectVisible(false);
        this.setSideSelectVisible(true);

        // Reset positions and animate in side selection
        this.sideElements.forEach((el) => {
          (el as any).setAlpha(0);
          if (el instanceof Phaser.GameObjects.Container || el instanceof Phaser.GameObjects.Text || el instanceof Phaser.GameObjects.Graphics) {
            (el as any).x = ((el as any).x || 0) - 300;
          }
        });

        this.tweens.add({
          targets: this.sideElements,
          alpha: 1,
          x: (target: any) => target.x + 300,
          duration: 300,
          ease: "Power2",
        });
      },
    });

    // Clear preview
    this.previewContainer.setVisible(false);
  }

  private createChampionGrid(centerX: number, centerY: number) {
    const cardWidth = 140;
    const cardHeight = 180;
    const spacingX = 20;
    const spacingY = 20;
    const cols = 4;
    const rows = Math.ceil(this.champions.length / cols);

    // Calculate total grid size
    const totalWidth = cols * cardWidth + (cols - 1) * spacingX;
    const totalHeight = rows * cardHeight + (rows - 1) * spacingY;

    // Start position (centered)
    const startX = centerX - totalWidth / 2 + cardWidth / 2;
    const startY = centerY - totalHeight / 2;

    // Grid background panel
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x151525, 0.9);
    gridBg.fillRoundedRect(centerX - totalWidth / 2 - 20, startY - 20, totalWidth + 40, totalHeight + 40, 16);
    gridBg.lineStyle(2, 0x2a2a4e, 1);
    gridBg.strokeRoundedRect(centerX - totalWidth / 2 - 20, startY - 20, totalWidth + 40, totalHeight + 40, 16);
    this.championElements.push(gridBg);

    this.champions.forEach((champion, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);

      this.createChampionCard(x, y, cardWidth, cardHeight, champion);
    });
  }

  private createChampionCard(x: number, y: number, width: number, height: number, champion: Champion) {
    const card = this.add.container(x, y);
    const roleColor = ROLE_COLORS[champion.role as keyof typeof ROLE_COLORS] || 0xffffff;
    const roleIcon = ROLE_ICONS[champion.role] || "⭐";

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x25253a, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.lineStyle(2, roleColor, 0.6);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    card.add(bg);

    // Role icon badge
    const roleBadge = this.add.circle(-width / 2 + 20, -height / 2 + 18, 10, roleColor, 0.3);
    roleBadge.setStrokeStyle(1, roleColor);
    card.add(roleBadge);

    const roleIconText = this.add
      .text(-width / 2 + 20, -height / 2 + 18, roleIcon, {
        fontSize: "14px",
      })
      .setOrigin(0.5);
    card.add(roleIconText);

    // Champion color accent bar
    const accentBar = this.add.rectangle(width / 2 - 8, -height / 2 + 8, 6, 20, champion.color);
    card.add(accentBar);

    // Champion name (compact)
    const nameText = this.add
      .text(0, -height / 2 + 35, champion.name, {
        fontSize: "11px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    card.add(nameText);

    // Role text
    const roleText = this.add
      .text(0, -height / 2 + 50, champion.role.toUpperCase(), {
        fontSize: "8px",
        color: "#" + roleColor.toString(16).padStart(6, "0"),
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
    card.add(roleText);

    // Champion portrait circle
    const portraitCircle = this.add.circle(0, -height / 2 + 80, 28, champion.color, 0.2);
    portraitCircle.setStrokeStyle(2, champion.color);
    card.add(portraitCircle);

    // Compact stats
    const statsY = -height / 2 + 120;
    const stats = [
      { label: "HP", value: champion.hp },
      { label: "ATK", value: champion.attack },
      { label: "SPD", value: champion.speed },
    ];

    stats.forEach((stat, index) => {
      const statX = -45 + index * 45;
      const value = this.add
        .text(statX, statsY, stat.value.toString(), {
          fontSize: "12px",
          color: "#ffffff",
          fontFamily: "monospace",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0);
      card.add(value);

      const label = this.add
        .text(statX, statsY + 12, stat.label, {
          fontSize: "7px",
          color: "#667788",
          fontFamily: "monospace",
        })
        .setOrigin(0.5, 0);
      card.add(label);
    });

    // Interactive hit zone
    const hitZone = this.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });
    card.add(hitZone);

    // Hover effects
    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x303045, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.lineStyle(3, roleColor, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.showPreview(champion);
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x25253a, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.lineStyle(2, roleColor, 0.6);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    });

    hitZone.on("pointerdown", () => {
      this.selectChampion(champion, bg, width, height, roleColor);
    });

    // Store for later
    (card as any).bgGraphics = bg;
    (card as any).cardWidth = width;
    (card as any).cardHeight = height;
    (card as any).roleColor = roleColor;

    this.championCards.push(card);
    this.championElements.push(card);
  }

  private createPreviewPanel(cx: number) {
    const y = this.cameras.main.height - 110;
    const panelWidth = 600;
    const panelHeight = 140;

    this.previewContainer = this.add.container(0, 0);
    this.previewContainer.setDepth(20);

    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a15, 0.95);
    bg.fillRoundedRect(cx - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 12);
    bg.lineStyle(2, 0x333355, 1);
    bg.strokeRoundedRect(cx - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 12);
    this.previewContainer.add(bg);

    // Panel border glow
    const borderGlow = this.add.graphics();
    borderGlow.lineStyle(3, 0x00ff88, 0.3);
    borderGlow.strokeRoundedRect(cx - panelWidth / 2 + 2, y - panelHeight / 2 + 2, panelWidth - 4, panelHeight - 4, 10);
    this.previewContainer.add(borderGlow);

    // Title
    const title = this.add
      .text(cx - panelWidth / 2 + 20, y - panelHeight / 2 + 15, "CHAMPION PREVIEW", {
        fontSize: "11px",
        color: "#00ff88",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0, 0);
    this.previewContainer.add(title);

    // Champion name
    const nameText = this.add
      .text(cx - panelWidth / 2 + 20, y - panelHeight / 2 + 35, "", {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0, 0);
    this.previewContainer.add(nameText);

    // Role and stats
    const roleText = this.add
      .text(cx - panelWidth / 2 + 20, y - panelHeight / 2 + 62, "", {
        fontSize: "12px",
        color: "#8899aa",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.previewContainer.add(roleText);

    // Abilities hint
    const abilitiesHint = this.add
      .text(cx - panelWidth / 2 + 20, y + panelHeight / 2 - 20, "Hover over a champion to see details", {
        fontSize: "10px",
        color: "#556677",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.previewContainer.add(abilitiesHint);

    this.previewContainer.setVisible(false);
  }

  private showPreview(champion: Champion) {
    this.previewContainer.setVisible(true);

    const roleColor = ROLE_COLORS[champion.role as keyof typeof ROLE_COLORS] || 0xffffff;
    const roleColorHex = "#" + roleColor.toString(16).padStart(6, "0");
    const roleIcon = ROLE_ICONS[champion.role] || "⭐";

    const texts = this.previewContainer.list.filter((c) => c instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text[];

    if (texts.length >= 4) {
      texts[1].setText(champion.name);
      texts[2].setText(`${roleIcon} ${champion.role.toUpperCase()}  •  HP: ${champion.hp}  •  ATK: ${champion.attack}  •  SPD: ${champion.speed}`);
      texts[2].setColor(roleColorHex);

      // Update abilities hint
      if (champion.abilities && champion.abilities.length > 0) {
        const abilityNames = champion.abilities.map((a) => `[${a.key}] ${a.name}`).join("  ");
        texts[3].setText(`Abilities: ${abilityNames}`);
        texts[3].setColor("#8899aa");
      } else {
        texts[3].setText("Basic attacks and auto-abilities");
        texts[3].setColor("#556677");
      }
    }
  }

  private selectChampion(
    champion: Champion,
    bg: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    roleColor: number
  ) {
    // Deselect previous
    this.championCards.forEach((card) => {
      const cardBg = (card as any).bgGraphics as Phaser.GameObjects.Graphics | undefined;
      const cardWidth = (card as any).cardWidth as number | undefined;
      const cardHeight = (card as any).cardHeight as number | undefined;
      const cardRoleColor = (card as any).roleColor as number | undefined;
      if (cardBg && cardWidth && cardHeight && cardRoleColor) {
        cardBg.clear();
        cardBg.fillStyle(0x25253a, 1);
        cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
        cardBg.lineStyle(2, cardRoleColor, 0.6);
        cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 10);
      }
    });

    // Select new
    this.selectedChampion = champion;
    bg.clear();
    bg.fillStyle(0x303045, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.lineStyle(4, 0x00ff88, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Enable confirm button
    const confirmBg = this.confirmButton.list[0] as Phaser.GameObjects.Graphics;
    const confirmText = this.confirmButton.list[1] as Phaser.GameObjects.Text;

    confirmBg.clear();
    confirmBg.fillStyle(0x00ff88, 1);
    confirmBg.fillRoundedRect(0, 0, 180, 50, 10);
    confirmBg.lineStyle(2, 0x00ff88, 1);
    confirmBg.strokeRoundedRect(0, 0, 180, 50, 10);

    confirmText.setColor("#000000");
    confirmText.setText("PLAY AS " + champion.name.toUpperCase());

    this.confirmButton.setVisible(true);
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
