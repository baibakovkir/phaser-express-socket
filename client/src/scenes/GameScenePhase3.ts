import Phaser from "phaser";
import { network } from "../network/socket.js";
import { stateSync, InputCommand, PlayerState } from "../network/stateSync.js";

// Champion definitions (matching database format)
export interface Champion {
  id: string;
  name: string;
  role: "tank" | "assassin" | "mage" | "support" | "marksman" | "fighter";
  hp: number;
  mana: number;
  attack: number;
  armor: number;
  speed: number;
  color: number;
  attackRange: number;
  attackSpeed: number;
  maxHp: number;
  maxMana: number;
  hpRegen: number; // HP regenerated per second
  manaRegen: number; // Mana regenerated per second
  abilities?: Ability[];
}

export interface Ability {
  key: string;
  name: string;
  description: string;
  cooldown: number;
  manaCost: number;
  damage: number;
  range: number;
}

// Default champions (fallback if not loaded from API)
const DEFAULT_CHAMPIONS: Record<string, Champion> = {
  warrior: {
    id: "warrior",
    name: "Warrior",
    role: "tank",
    hp: 600,
    mana: 100,
    attack: 55,
    armor: 35,
    speed: 340,
    color: 0x4488ff,
    attackRange: 120,
    attackSpeed: 1000,
    maxHp: 600,
    maxMana: 100,
    hpRegen: 5, // HP per second
    manaRegen: 3, // Mana per second
    abilities: [
      { key: "Q", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 10, damage: 0, range: 200 },
      { key: "1", name: "Shield Bash", description: "Stun enemy with shield", cooldown: 5000, manaCost: 15, damage: 60, range: 120 },
      { key: "2", name: "War Cry", description: "Boost attack power", cooldown: 8000, manaCost: 20, damage: 0, range: 0 },
      { key: "3", name: "Heroic Leap", description: "Leap and slam enemies", cooldown: 12000, manaCost: 30, damage: 150, range: 200 },
    ],
  },
  assassin: {
    id: "assassin",
    name: "Shadow Assassin",
    role: "assassin",
    hp: 400,
    mana: 120,
    attack: 65,
    armor: 25,
    speed: 360,
    color: 0x00ff88,
    attackRange: 150,
    attackSpeed: 1000,
    maxHp: 400,
    maxMana: 120,
    hpRegen: 3,
    manaRegen: 4,
    abilities: [
      { key: "Q", name: "Dash", description: "Dash forward", cooldown: 2500, manaCost: 15, damage: 0, range: 250 },
      { key: "1", name: "Poison Blade", description: "Poison enemy", cooldown: 4000, manaCost: 20, damage: 70, range: 150 },
      { key: "2", name: "Smoke Bomb", description: "Become invisible", cooldown: 10000, manaCost: 25, damage: 0, range: 0 },
      { key: "3", name: "Death Mark", description: "Mark for death", cooldown: 15000, manaCost: 40, damage: 200, range: 200 },
    ],
  },
  mage: {
    id: "mage",
    name: "Arcane Mage",
    role: "mage",
    hp: 350,
    mana: 150,
    attack: 45,
    armor: 20,
    speed: 330,
    color: 0xaa44ff,
    attackRange: 180,
    attackSpeed: 1000,
    maxHp: 350,
    maxMana: 150,
    hpRegen: 2,
    manaRegen: 6,
    abilities: [
      { key: "Q", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 20, damage: 0, range: 200 },
      { key: "1", name: "Ice Nova", description: "Freeze enemies", cooldown: 5000, manaCost: 30, damage: 80, range: 200 },
      { key: "2", name: "Arcane Shield", description: "Magic shield", cooldown: 8000, manaCost: 35, damage: 0, range: 0 },
      { key: "3", name: "Meteor", description: "Call meteor", cooldown: 18000, manaCost: 50, damage: 250, range: 300 },
    ],
  },
  support: {
    id: "support",
    name: "Holy Priest",
    role: "support",
    hp: 380,
    mana: 130,
    attack: 40,
    armor: 22,
    speed: 335,
    color: 0x00ffaa,
    attackRange: 160,
    attackSpeed: 1000,
    maxHp: 380,
    maxMana: 130,
    hpRegen: 3,
    manaRegen: 5,
    abilities: [
      { key: "Q", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 15, damage: 0, range: 200 },
      { key: "1", name: "Smite", description: "Holy damage", cooldown: 4000, manaCost: 20, damage: 90, range: 180 },
      { key: "2", name: "Blessing", description: "Buff ally", cooldown: 10000, manaCost: 30, damage: 0, range: 0 },
      { key: "3", name: "Resurrection", description: "Revive ally", cooldown: 30000, manaCost: 60, damage: 0, range: 0 },
    ],
  },
  marksman: {
    id: "marksman",
    name: "Ranger",
    role: "marksman",
    hp: 420,
    mana: 100,
    attack: 60,
    armor: 23,
    speed: 350,
    color: 0xff8800,
    attackRange: 200,
    attackSpeed: 900,
    maxHp: 420,
    maxMana: 100,
    hpRegen: 3,
    manaRegen: 3.5,
    abilities: [
      { key: "Q", name: "Dash", description: "Dash forward", cooldown: 2500, manaCost: 15, damage: 0, range: 220 },
      { key: "1", name: "Multi Shot", description: "Hit multiple", cooldown: 5000, manaCost: 25, damage: 60, range: 250 },
      { key: "2", name: "Escape", description: "Dash backward", cooldown: 8000, manaCost: 15, damage: 0, range: 0 },
      { key: "3", name: "Rain of Arrows", description: "Arrow barrage", cooldown: 15000, manaCost: 45, damage: 180, range: 280 },
    ],
  },
  fighter: {
    id: "fighter",
    name: "Berserker",
    role: "fighter",
    hp: 500,
    mana: 100,
    attack: 58,
    armor: 30,
    speed: 345,
    color: 0xff4444,
    attackRange: 130,
    attackSpeed: 1100,
    maxHp: 500,
    maxMana: 100,
    hpRegen: 4,
    manaRegen: 3,
    abilities: [
      { key: "Q", name: "Dash", description: "Dash forward", cooldown: 2800, manaCost: 12, damage: 0, range: 220 },
      { key: "1", name: "Bloodlust", description: "Attack speed boost", cooldown: 6000, manaCost: 20, damage: 0, range: 0 },
      { key: "2", name: "Rage", description: "Damage boost", cooldown: 10000, manaCost: 25, damage: 0, range: 0 },
      { key: "3", name: "Execute", description: "Finish enemy", cooldown: 12000, manaCost: 35, damage: 200, range: 130 },
    ],
  },
};

// Runtime champion storage (will be populated from API or defaults)
let CHAMPIONS: Record<string, Champion> = { ...DEFAULT_CHAMPIONS };

// Load champions from API
export async function loadChampionsFromAPI(): Promise<Record<string, Champion>> {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${SERVER_URL}/heroes`);
    if (!response.ok) throw new Error("Failed to fetch heroes");

    const data = await response.json();
    const loaded: Record<string, Champion> = {};

    data.heroes.forEach((h: any) => {
      loaded[h.id] = {
        id: h.id,
        name: h.name,
        role: h.role.toLowerCase(),
        hp: h.baseHp || 500,
        mana: h.baseMana || 100,
        attack: h.baseAttack || 50,
        armor: h.baseArmor || 25,
        speed: h.baseSpeed || 340,
        color: h.color || 0xffffff,
        attackRange: h.attackRange || 150,
        attackSpeed: h.attackSpeed || 1000,
        maxHp: h.maxHp || h.baseHp || 500,
        maxMana: h.maxMana || h.baseMana || 100,
        hpRegen: h.hpRegen || 3, // Default 3 HP/sec
        manaRegen: h.manaRegen || 2, // Default 2 mana/sec
        abilities: h.abilities || [
          { key: "1", name: "Dash", description: "Dash forward", cooldown: 3000, manaCost: 15, damage: 0, range: 200 },
          { key: "2", name: "Ability 2", description: "Second ability", cooldown: 5000, manaCost: 25, damage: 100, range: 250 },
          { key: "3", name: "Ability 3", description: "Third ability", cooldown: 8000, manaCost: 30, damage: 0, range: 0 },
          { key: "4", name: "Ultimate", description: "Ultimate ability", cooldown: 15000, manaCost: 50, damage: 200, range: 300 },
        ],
      };
    });

    CHAMPIONS = loaded;
    console.log("[GameScene] Loaded", Object.keys(CHAMPIONS).length, "champions from API");
    return CHAMPIONS;
  } catch (error) {
    console.warn("[GameScene] Failed to load from API, using defaults:", error);
    CHAMPIONS = { ...DEFAULT_CHAMPIONS };
    return CHAMPIONS;
  }
}

// Get champion by ID
export function getChampion(id: string): Champion {
  return CHAMPIONS[id] || DEFAULT_CHAMPIONS["assassin"];
}

// Get all champions
export function getAllChampions(): Champion[] {
  return Object.values(CHAMPIONS);
}

// Minion types
interface MinionType {
  type: "melee" | "ranged" | "siege";
  hp: number;
  attack: number;
  speed: number;
  goldValue: number;
  color: number;
  size: number;
}

const MINION_TYPES: Record<string, MinionType> = {
  melee: { type: "melee", hp: 120, attack: 12, speed: 120, goldValue: 20, color: 0xffaa00, size: 16 },
  ranged: { type: "ranged", hp: 80, attack: 18, speed: 120, goldValue: 25, color: 0xff8800, size: 14 },
  siege: { type: "siege", hp: 200, attack: 25, speed: 100, goldValue: 40, color: 0xff4400, size: 20 },
};

// Tower definitions
interface TowerDef {
  tier: number;
  hp: number;
  attack: number;
  range: number;
  color: number;
}

const TOWER_DEFS: Record<number, TowerDef> = {
  1: { tier: 1, hp: 2000, attack: 100, range: 250, color: 0x8888ff },
  2: { tier: 2, hp: 3000, attack: 150, range: 280, color: 0x6666ff },
  3: { tier: 3, hp: 4000, attack: 200, range: 300, color: 0x4444ff },
};

// Bot AI states
enum BotState {
  LANING = "laning",
  RECALLING = "recalling",
  RETREATING = "retreating",
  ATTACKING = "attacking",
  PUSHING = "pushing",
}

interface BotData {
  id: string;
  state: BotState;
  targetX: number;
  targetY: number;
  attackTarget: string | null;
  lastAttackTime: number;
  behaviorTick: number;
  hp?: number;
  isDead?: boolean;
  respawnTime?: number;
}

export class GameScenePhase3 extends Phaser.Scene {
  // Map constants
  private readonly MAP_SIZE = 2400;
  private readonly TILE_SIZE = 64;
  private readonly LANE_WIDTH = 200;

  // Team constants
  private readonly BLUE_TEAM = 1;
  private readonly RED_TEAM = 2;

  // Game objects
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private playerSprite!: Phaser.Physics.Arcade.Sprite;
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private minions: Phaser.GameObjects.Container[] = [];
  private towers: Phaser.GameObjects.Container[] = [];
  private nexuses: Phaser.GameObjects.Container[] = [];
  private bots: Map<string, { sprite: Phaser.Physics.Arcade.Sprite; data: BotData; healthBar: Phaser.GameObjects.Graphics }> = new Map();
  private projectiles: Phaser.GameObjects.Container[] = [];

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private mousePointer!: Phaser.Input.Pointer;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private abilityKeys: Record<string, Phaser.Input.Keyboard.Key> = {}; // 1, 2, 3, 4
  private lastAbilityTime: Record<string, number> = {}; // Track ability cooldowns

  // Game state
  private matchId!: string;
  private isTestMode: boolean = false;
  private playerTeam!: number;
  private playerChampion!: Champion;
  private lastInputTick = 0;
  private readonly INPUT_TICK_RATE = 1000 / 60;
  private lastInputTime = 0;
  private lastAttackTime = 0;
  private moveSpeed = 340;

  // UI
  private uiContainer!: Phaser.GameObjects.Container;
  private tickText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private healthBarFull!: Phaser.GameObjects.Graphics;
  private healthBarCurrent!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private manaBarFull!: Phaser.GameObjects.Graphics;
  private manaBarCurrent!: Phaser.GameObjects.Graphics;
  private manaText!: Phaser.GameObjects.Text;
  private abilityIcons!: Phaser.GameObjects.Container;
  private abilityCooldownOverlays: Phaser.GameObjects.Graphics[] = [];
  private abilityCooldownTexts: Phaser.GameObjects.Text[] = [];

  // Stats
  private playerGold = 500;
  private playerLevel = 1;
  private playerKills = 0;
  private playerDeaths = 0;
  private playerAssists = 0;
  private currentHP = 500;
  private currentMana = 200;

  // Nexus healing
  private nexusHealingEnabled = false;

  // Minion spawning
  private minionSpawnTimer!: Phaser.Time.TimerEvent;
  private minionWave = 0;
  private readonly MINION_SPAWN_INTERVAL = 30000; // 30 seconds per wave

  // Bot spawning
  private botSpawnTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: "GameScenePhase3" });
  }

  init(data: { matchId?: string; isTestMode?: boolean; championId?: string; team?: number }) {
    console.log("[GameScenePhase3] init called with data:", data);
    this.matchId = data.matchId || "local";
    this.isTestMode = data.isTestMode ?? false;
    const championId = data.championId || "assassin";
    console.log("[GameScenePhase3] Loading champion:", championId);
    this.playerChampion = getChampion(championId);
    this.playerTeam = data.team || this.BLUE_TEAM;
    console.log("[GameScenePhase3] Champion loaded:", this.playerChampion.name, "Team:", this.playerTeam);
    this.currentHP = this.playerChampion.hp;
    this.currentMana = this.playerChampion.mana;
    this.moveSpeed = this.playerChampion.speed;
    stateSync.reset();
  }

  create() {
    console.log("[GameScenePhase3] create called, isTestMode:", this.isTestMode, "team:", this.playerTeam);
    console.log("[GameScenePhase3] Champion:", this.playerChampion.name, "HP:", this.currentHP);
    console.log("[GameScenePhase3] Champion abilities:", this.playerChampion.abilities);

    // Create world bounds
    this.physics.world.setBounds(0, 0, this.MAP_SIZE, this.MAP_SIZE);

    // Create UI first (on top of everything)
    this.createUI();

    // Create map
    this.createMap();

    // Create player
    this.createPlayer();

    // Setup input
    this.setupInput();

    // Setup camera
    this.setupCamera();

    // Create towers
    this.createTowers();

    // Create nexuses
    this.createNexuses();

    // Setup minion spawning
    this.setupMinionSpawning();

    // Setup bots for test mode
    if (this.isTestMode) {
      this.setupBots();
    }

    // Setup collisions
    this.setupCollisions();

    // Setup network listeners (only in online mode)
    if (!this.isTestMode) {
      this.setupNetworkListeners();
    }

    // Start game loop
    this.time.addEvent({
      delay: this.INPUT_TICK_RATE,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true,
    });

    // Spawn first minion wave after delay
    this.time.delayedCall(5000, () => this.spawnMinionWave());

    // Enable nexus healing after 3 seconds (prevent instant heal on spawn)
    this.time.delayedCall(3000, () => {
      this.nexusHealingEnabled = true;
      console.log("[Nexus] Healing enabled");
    });
  }

  private setupCollisions() {
    // Player collides with bots
    this.physics.add.collider(this.playerSprite, Array.from(this.bots.values()).map(b => b.sprite));

    // Player collides with nexuses
    this.physics.add.collider(this.playerSprite, this.nexuses);

    // Bots collide with each other
    const botSprites = Array.from(this.bots.values()).map(b => b.sprite);
    botSprites.forEach((bot1, i) => {
      for (let j = i + 1; j < botSprites.length; j++) {
        this.physics.add.collider(bot1, botSprites[j]);
      }
    });

    // Bots collide with nexuses
    this.nexuses.forEach((nexus) => {
      botSprites.forEach((bot) => {
        this.physics.add.collider(bot, nexus);
      });
    });

    // Minions collide with ALL other minions (enemy AND allied - to prevent stacking)
    this.minions.forEach((minion1, i) => {
      const mData1 = (minion1 as any).minionData;
      if (!mData1 || mData1.hp <= 0) return;

      for (let j = i + 1; j < this.minions.length; j++) {
        const minion2 = this.minions[j];
        const mData2 = (minion2 as any).minionData;
        if (!mData2 || mData2.hp <= 0) continue;

        // ALL minions collide (prevents stacking and creates fighting lines)
        this.physics.add.collider(minion1, minion2);
      }
    });

    // Minions collide with enemy nexuses (can't walk through)
    this.nexuses.forEach((nexus) => {
      this.minions.forEach((minion) => {
        const mData = (minion as any).minionData;
        if (!mData || mData.hp <= 0) return;
        
        const nexusData = (nexus as any).nexusData;
        if (!nexusData || nexusData.hp <= 0) return;
        
        // Only collide with enemy nexus
        if (mData.team !== nexusData.team) {
          this.physics.add.collider(minion, nexus);
        }
      });
    });

    // Minions collide with enemy towers (can't walk through)
    this.towers.forEach((tower) => {
      this.minions.forEach((minion) => {
        const mData = (minion as any).minionData;
        if (!mData || mData.hp <= 0) return;
        
        const towerData = (tower as any).towerData;
        if (!towerData || towerData.hp <= 0) return;
        
        // Only collide with enemy tower
        if (mData.team !== towerData.team) {
          this.physics.add.collider(minion, tower);
        }
      });
    });

    console.log("[Physics] Collision setup complete (minions, towers, nexuses)");
  }

  update(time: number) {
    // Send inputs at fixed rate
    if (time - this.lastInputTime >= this.INPUT_TICK_RATE) {
      this.sendInput();
      this.lastInputTime = time;
    }

    // Handle player movement
    this.handleMovement();

    // Update bot AI and respawn (always run for test mode, respawn check for all modes)
    if (this.isTestMode) {
      this.updateBots(time);
    } else {
      // Still check for bot respawn in non-test mode
      this.updateBotRespawns(time);
    }

    // Update minions
    this.updateMinions();

    // Update projectiles
    this.updateProjectiles();

    // Update towers (attack enemies)
    this.updateTowers(time);

    // Nexus healing for allies
    this.updateNexusHealing(time);

    // Regenerate HP and mana (per second stats, scaled by delta time ~60fps)
    const hpRegenPerFrame = (this.playerChampion.hpRegen || 3) / 60;
    const manaRegenPerFrame = (this.playerChampion.manaRegen || 2) / 60;
    
    if (this.currentHP < this.playerChampion.maxHp) {
      this.currentHP = Math.min(this.currentHP + hpRegenPerFrame, this.playerChampion.maxHp);
      this.updateHealthManaUI();
    }
    
    if (this.currentMana < this.playerChampion.maxMana) {
      this.currentMana = Math.min(this.currentMana + manaRegenPerFrame, this.playerChampion.maxMana);
      this.updateHealthManaUI();
    }

    // Update ability cooldown displays
    this.updateAbilityCooldowns();

    // Update health bar
    this.updatePlayerHealthBar();
  }

  private createMap() {
    this.mapGraphics = this.add.graphics();

    // Background
    this.mapGraphics.fillStyle(0x111122);
    this.mapGraphics.fillRect(0, 0, this.MAP_SIZE, this.MAP_SIZE);

    // Grid lines
    this.mapGraphics.lineStyle(1, 0x222244);
    for (let x = 0; x <= this.MAP_SIZE; x += this.TILE_SIZE) {
      this.mapGraphics.lineBetween(x, 0, x, this.MAP_SIZE);
    }
    for (let y = 0; y <= this.MAP_SIZE; y += this.TILE_SIZE) {
      this.mapGraphics.lineBetween(0, y, this.MAP_SIZE, y);
    }

    // Single middle lane - DIAGONAL from nexus to nexus
    // Blue nexus: (250, MAP_SIZE - 250), Red nexus: (MAP_SIZE - 250, 250)
    this.createLane("mid", 250, this.MAP_SIZE - 250, this.MAP_SIZE - 250, 250);

    // Jungle areas (expanded for single lane)
    this.mapGraphics.fillStyle(0x1a1a33, 0.5);
    // Top-left jungle
    this.mapGraphics.fillCircle(600, 800, 200);
    this.mapGraphics.fillCircle(800, 1200, 200);
    // Bottom-right jungle
    this.mapGraphics.fillCircle(this.MAP_SIZE - 600, this.MAP_SIZE - 800, 200);
    this.mapGraphics.fillCircle(this.MAP_SIZE - 800, this.MAP_SIZE - 1200, 200);

    // River (diagonal - perpendicular to lane)
    this.mapGraphics.lineStyle(20, 0x3344aa, 0.3);
    this.mapGraphics.lineBetween(0, this.MAP_SIZE, this.MAP_SIZE, 0);

    // Base areas
    // Blue base (bottom-left)
    this.mapGraphics.fillStyle(0x0044aa, 0.4);
    this.mapGraphics.fillRect(0, this.MAP_SIZE - 500, 500, 500);

    // Red base (top-right)
    this.mapGraphics.fillStyle(0xaa4400, 0.4);
    this.mapGraphics.fillRect(this.MAP_SIZE - 500, 0, 500, 500);

    // Nexus positions
    this.mapGraphics.fillStyle(0x0088ff, 0.6);
    this.mapGraphics.fillCircle(250, this.MAP_SIZE - 250, 60); // Blue nexus
    this.mapGraphics.fillStyle(0xff8800, 0.6);
    this.mapGraphics.fillCircle(this.MAP_SIZE - 250, 250, 60); // Red nexus
  }

  private createLane(name: string, ...points: number[]) {
    this.mapGraphics.lineStyle(this.LANE_WIDTH, 0x333355, 0.5);
    for (let i = 0; i < points.length - 2; i += 2) {
      this.mapGraphics.lineBetween(points[i], points[i + 1], points[i + 2], points[i + 3]);
    }
  }

  private createPlayer() {
    // Spawn player at nexus (on diagonal lane)
    // Blue nexus: (250, MAP_SIZE - 250), Red nexus: (MAP_SIZE - 250, 250)
    const startX = this.playerTeam === this.BLUE_TEAM ? 250 : this.MAP_SIZE - 250;
    const startY = this.playerTeam === this.BLUE_TEAM ? this.MAP_SIZE - 250 : 250;

    // Create player sprite with collision
    this.playerSprite = this.physics.add.sprite(startX, startY, "hero");
    this.playerSprite.setTint(this.playerChampion.color);
    this.playerSprite.setCollideWorldBounds(true);
    this.playerSprite.setDepth(10);

    // Set collision box safely
    if (this.playerSprite.body) {
      this.playerSprite.body.setSize(30, 30);
      this.playerSprite.body.setOffset(-15, -15);
    }

    // Initialize state sync
    const playerId = this.isTestMode ? "test-player" : network.getPlayer()?.id || "unknown";
    stateSync.initLocalPlayer(playerId, this.playerTeam, this.playerChampion.id);

    // Create health bar
    this.playerHealthBar = this.add.graphics();
    this.playerHealthBar.setDepth(11);
    this.updatePlayerHealthBar();
  }

  private createNexuses() {
    // Blue team nexus (bottom-left)
    const blueNexus = this.add.container(250, this.MAP_SIZE - 250);
    const blueBase = this.add.circle(0, 0, 80, 0x0088ff, 0.8);
    blueBase.setStrokeStyle(4, 0x00ffff);
    const blueCore = this.add.circle(0, 0, 40, 0x00ffff);
    blueNexus.add([blueBase, blueCore]);
    blueNexus.setDepth(5);

    // Add physics body for collision
    this.physics.add.existing(blueNexus);
    const blueBody = blueNexus.body as Phaser.Physics.Arcade.Body;
    blueBody.setCircle(80);
    blueBody.setImmovable(true);
    blueBody.setAllowGravity(false);

    // Create nexus health bar
    const blueNexusHealthBar = this.add.graphics();
    blueNexus.add(blueNexusHealthBar);

    (blueNexus as any).nexusData = {
      id: "blue-nexus",
      team: this.BLUE_TEAM,
      hp: 5000,
      maxHp: 5000,
      regen: 10, // HP per second
    };

    this.updateNexusHealthBar(blueNexus, blueNexusHealthBar);
    this.nexuses.push(blueNexus);

    // Red team nexus (top-right)
    const redNexus = this.add.container(this.MAP_SIZE - 250, 250);
    const redBase = this.add.circle(0, 0, 80, 0xff8800, 0.8);
    redBase.setStrokeStyle(4, 0xffff00);
    const redCore = this.add.circle(0, 0, 40, 0xffff00);
    redNexus.add([redBase, redCore]);
    redNexus.setDepth(5);

    // Add physics body for collision
    this.physics.add.existing(redNexus);
    const redBody = redNexus.body as Phaser.Physics.Arcade.Body;
    redBody.setCircle(80);
    redBody.setImmovable(true);
    redBody.setAllowGravity(false);

    // Create nexus health bar
    const redNexusHealthBar = this.add.graphics();
    redNexus.add(redNexusHealthBar);

    (redNexus as any).nexusData = {
      id: "red-nexus",
      team: this.RED_TEAM,
      hp: 5000,
      maxHp: 5000,
      regen: 10,
    };

    this.updateNexusHealthBar(redNexus, redNexusHealthBar);
    this.nexuses.push(redNexus);

    console.log(`[Nexus] Created 2 nexuses with collision and HP bars`);
  }

  private createTowers() {
    const towerPositions = [
      // Blue team towers (bottom-left area)
      { x: 600, y: this.MAP_SIZE - 400, team: this.BLUE_TEAM, tier: 1 },
      { x: 400, y: this.MAP_SIZE - 600, team: this.BLUE_TEAM, tier: 1 },
      { x: 800, y: this.MAP_SIZE - 800, team: this.BLUE_TEAM, tier: 2 },

      // Red team towers (top-right area)
      { x: this.MAP_SIZE - 600, y: 400, team: this.RED_TEAM, tier: 1 },
      { x: this.MAP_SIZE - 400, y: 600, team: this.RED_TEAM, tier: 1 },
      { x: this.MAP_SIZE - 800, y: 800, team: this.RED_TEAM, tier: 2 },
    ];

    towerPositions.forEach((pos, index) => {
      const towerDef = TOWER_DEFS[pos.tier];
      const tower = this.add.container(pos.x, pos.y);

      // Tower base
      const base = this.add.rectangle(0, 0, 50, 50, pos.team === this.BLUE_TEAM ? 0x0066ff : 0xff6600);
      base.setStrokeStyle(2, 0xffffff);

      // Tower top
      const top = this.add.circle(0, 0, 20, towerDef.color);

      tower.add([base, top]);
      tower.setDepth(5);

      // Add physics body for collision
      this.physics.add.existing(tower);
      const towerBody = tower.body as Phaser.Physics.Arcade.Body;
      towerBody.setCircle(30);
      towerBody.setImmovable(true);
      towerBody.setAllowGravity(false);

      // Store tower data
      (tower as any).towerData = {
        id: `tower-${index}`,
        team: pos.team,
        tier: pos.tier,
        hp: towerDef.hp,
        maxHp: towerDef.hp,
        attack: towerDef.attack,
        range: towerDef.range,
        lastAttackTime: 0,
      };

      // Create tower health bar
      const towerHealthBar = this.add.graphics();
      this.updateTowerHealthBar(tower, towerHealthBar);
      tower.add(towerHealthBar);

      this.towers.push(tower);
    });

    console.log(`[Towers] Created ${this.towers.length} towers with collision`);
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

    // Space for basic attack
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Q, 1, 2, 3 for abilities
    this.abilityKeys = {
      "Q": this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      "1": this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      "2": this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      "3": this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    };

    this.mousePointer = this.input.activePointer;
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.MAP_SIZE, this.MAP_SIZE);
    this.cameras.main.setZoom(1);
  }

  private createUI() {
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setDepth(1000);
    this.uiContainer.setScrollFactor(0);

    // Test mode indicator
    if (this.isTestMode) {
      this.modeText = this.add
        .text(10, 10, "TEST MODE - Press ESC to exit", {
          fontSize: "14px",
          color: "#ff88ff",
          fontFamily: "monospace",
          backgroundColor: "#441144",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0, 0);
      this.uiContainer.add(this.modeText);

      this.input.keyboard?.on("keydown-ESC", () => {
        this.scene.stop("GameScenePhase3");
        this.scene.start("MenuScene");
      });
    }

    // Champion name
    this.add
      .text(10, this.isTestMode ? 40 : 10, this.playerChampion.name, {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0, 0);

    // Health bar (full)
    this.healthBarFull = this.add.graphics();
    this.healthBarFull.fillRect(10, this.isTestMode ? 65 : 35, 200, 15);
    this.healthBarFull.fillStyle(0x330000);
    this.healthBarFull.fillRect(12, this.isTestMode ? 67 : 37, 196, 11);
    this.uiContainer.add(this.healthBarFull);

    // Health bar (current) - initialize first, then update
    this.healthBarCurrent = this.add.graphics();
    this.uiContainer.add(this.healthBarCurrent);
    this.updateHealthManaUI();

    // HP text (current hp / max hp)
    this.hpText = this.add
      .text(15, this.isTestMode ? 80 : 50, `${Math.floor(this.currentHP)} / ${this.playerChampion.maxHp}`, {
        fontSize: "11px",
        color: "#00ff00",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.hpText);

    // Mana bar (full)
    this.manaBarFull = this.add.graphics();
    this.manaBarFull.fillRect(10, this.isTestMode ? 85 : 55, 200, 10);
    this.manaBarFull.fillStyle(0x000033);
    this.manaBarFull.fillRect(12, this.isTestMode ? 87 : 57, 196, 6);
    this.uiContainer.add(this.manaBarFull);

    // Mana bar (current) - initialize first, then update
    this.manaBarCurrent = this.add.graphics();
    this.uiContainer.add(this.manaBarCurrent);
    this.updateHealthManaUI();

    // Mana text (current mana / max mana)
    this.manaText = this.add
      .text(15, this.isTestMode ? 105 : 75, `${Math.floor(this.currentMana)} / ${this.playerChampion.maxMana}`, {
        fontSize: "11px",
        color: "#0088ff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.manaText);

    // Stats
    this.goldText = this.add
      .text(220, this.isTestMode ? 40 : 10, `Gold: ${this.playerGold}`, {
        fontSize: "14px",
        color: "#ffaa00",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.goldText);

    this.levelText = this.add
      .text(220, this.isTestMode ? 60 : 30, `Level: ${this.playerLevel}`, {
        fontSize: "14px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.levelText);

    this.scoreText = this.add
      .text(220, this.isTestMode ? 80 : 50, `K/D/A: ${this.playerKills}/${this.playerDeaths}/${this.playerAssists}`, {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.scoreText);

    // Tick counter
    this.tickText = this.add
      .text(10, this.isTestMode ? 110 : 80, `Tick: 0`, {
        fontSize: "12px",
        color: "#00ff88",
        fontFamily: "monospace",
      })
      .setOrigin(0, 0);
    this.uiContainer.add(this.tickText);

    // Controls hint
    this.add
      .text(this.cameras.main.width - 10, 10, "WASD/Arrows: Move | Space: Attack | Q/W/E/R: Abilities", {
        fontSize: "12px",
        color: "#666666",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0);

    // Ability icons (Q, 1, 2, 3)
    this.abilityIcons = this.add.container(this.cameras.main.width - 10, this.cameras.main.height - 60);
    this.abilityIcons.setScrollFactor(0);
    this.abilityIcons.setDepth(1000);

    const abilityColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
    const abilityKeys = ["Q", "1", "2", "3"];

    abilityKeys.forEach((key, index) => {
      const x = -150 + index * 52;
      const bg = this.add.rectangle(x, 0, 42, 42, 0x222222);
      bg.setStrokeStyle(3, abilityColors[index]);
      
      // Key text
      const keyText = this.add.text(x, 0, key, {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      }).setOrigin(0.5);

      // Cooldown overlay (dark fill that shrinks from bottom)
      const cooldownOverlay = this.add.graphics();
      cooldownOverlay.setVisible(false);

      // Cooldown text (shows remaining seconds)
      const cooldownText = this.add.text(x, 0, "", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5);
      cooldownText.setVisible(false);

      this.abilityIcons.add(bg);
      this.abilityIcons.add(keyText);
      this.abilityIcons.add(cooldownOverlay);
      this.abilityIcons.add(cooldownText);
      
      this.abilityCooldownOverlays.push(cooldownOverlay);
      this.abilityCooldownTexts.push(cooldownText);
    });

    this.uiContainer.add(this.abilityIcons);

    // Controls hint
    this.add
      .text(this.cameras.main.width - 10, 10, "WASD: Move | SPACE: Attack | Q/1/2/3: Abilities", {
        fontSize: "12px",
        color: "#666666",
        fontFamily: "monospace",
      })
      .setOrigin(1, 0);
  }

  private updateHealthManaUI() {
    if (!this.healthBarCurrent || !this.manaBarCurrent || !this.playerChampion) return;

    this.healthBarCurrent.clear();
    this.healthBarCurrent.fillStyle(0x00ff00);
    const hpPercent = this.currentHP / this.playerChampion.maxHp;
    this.healthBarCurrent.fillRect(12, this.isTestMode ? 67 : 37, 196 * hpPercent, 11);

    this.manaBarCurrent.clear();
    this.manaBarCurrent.fillStyle(0x0088ff);
    const manaPercent = this.currentMana / this.playerChampion.maxMana;
    this.manaBarCurrent.fillRect(12, this.isTestMode ? 87 : 57, 196 * manaPercent, 6);

    // Update HP text
    if (this.hpText) {
      this.hpText.setText(`${Math.floor(this.currentHP)} / ${this.playerChampion.maxHp}`);
    }

    // Update mana text
    if (this.manaText) {
      this.manaText.setText(`${Math.floor(this.currentMana)} / ${this.playerChampion.maxMana}`);
    }
  }

  private updatePlayerHealthBar() {
    this.playerHealthBar.clear();

    const barWidth = 40;
    const barHeight = 5;
    const hpPercent = this.currentHP / this.playerChampion.maxHp;

    // Background
    this.playerHealthBar.fillStyle(0x330000);
    this.playerHealthBar.fillRect(this.playerSprite.x - barWidth / 2, this.playerSprite.y - 30, barWidth, barHeight);

    // Current HP (green for player)
    this.playerHealthBar.fillStyle(0x00ff00);
    this.playerHealthBar.fillRect(this.playerSprite.x - barWidth / 2, this.playerSprite.y - 30, barWidth * hpPercent, barHeight);
  }

  private updateBotHealthBar(bot: { sprite: Phaser.Physics.Arcade.Sprite; data: BotData; healthBar: Phaser.GameObjects.Graphics }) {
    const sprite = bot.sprite as any;
    const currentHP = sprite.botHP || 500;
    const maxHP = sprite.botMaxHP || 500;
    const hpPercent = Math.max(0, currentHP / maxHP);
    const botTeam = sprite.team as number;

    bot.healthBar.clear();
    const barWidth = 40;
    const barHeight = 5;

    // Background
    bot.healthBar.fillStyle(0x330000);
    bot.healthBar.fillRect(bot.sprite.x - barWidth / 2, bot.sprite.y - 30, barWidth, barHeight);

    // Current HP (green for allies, red for enemies)
    const hpColor = botTeam === this.playerTeam ? 0x00ff00 : 0xff0000;
    bot.healthBar.fillStyle(hpColor);
    bot.healthBar.fillRect(bot.sprite.x - barWidth / 2, bot.sprite.y - 30, barWidth * hpPercent, barHeight);
  }

  private updateTowerHealthBar(tower: Phaser.GameObjects.Container, healthBar: Phaser.GameObjects.Graphics) {
    const towerData = (tower as any).towerData;
    if (!towerData) return;

    healthBar.clear();
    const barWidth = 60;
    const barHeight = 6;
    const hpPercent = towerData.hp / towerData.maxHp;

    // Background
    healthBar.fillStyle(0x330000);
    healthBar.fillRect(-barWidth / 2, -40, barWidth, barHeight);

    // Current HP (green for allies, red for enemies)
    const hpColor = towerData.team === this.playerTeam ? 0x00ff00 : 0xff0000;
    healthBar.fillStyle(hpColor);
    healthBar.fillRect(-barWidth / 2, -40, barWidth * hpPercent, barHeight);
  }

  private updateNexusHealthBar(nexus: Phaser.GameObjects.Container, healthBar: Phaser.GameObjects.Graphics) {
    const nexusData = (nexus as any).nexusData;
    if (!nexusData) return;

    healthBar.clear();
    const barWidth = 100;
    const barHeight = 8;
    const hpPercent = nexusData.hp / nexusData.maxHp;

    // Background
    healthBar.fillStyle(0x330000);
    healthBar.fillRect(-barWidth / 2, -100, barWidth, barHeight);

    // Current HP (green for allies, red for enemies)
    const hpColor = nexusData.team === this.playerTeam ? 0x00ff00 : 0xff0000;
    healthBar.fillStyle(hpColor);
    healthBar.fillRect(-barWidth / 2, -100, barWidth * hpPercent, barHeight);
  }

  private updateTowers(time: number) {
    const now = Date.now();

    this.towers.forEach((tower) => {
      const towerData = (tower as any).towerData;
      if (!towerData || towerData.hp <= 0) return;

      // Find ALL enemies in range (player, bots, minions)
      const enemiesInRange: any[] = [];

      // Check player
      if (this.playerTeam !== towerData.team) {
        const distToPlayer = Phaser.Math.Distance.Between(tower.x, tower.y, this.playerSprite.x, this.playerSprite.y);
        if (distToPlayer <= towerData.range) {
          enemiesInRange.push({ target: this.playerSprite, isPlayer: true });
        }
      }

      // Check bots
      this.bots.forEach((bot) => {
        const botTeam = (bot.sprite as any).team as number;
        if (botTeam !== towerData.team) {
          const distToBot = Phaser.Math.Distance.Between(tower.x, tower.y, bot.sprite.x, bot.sprite.y);
          if (distToBot <= towerData.range) {
            enemiesInRange.push({ target: bot.sprite, isPlayer: false, isBot: true, botId: bot.data.id });
          }
        }
      });

      // Check enemy minions
      this.minions.forEach((minion) => {
        const minionData = (minion as any).minionData;
        if (minionData && minionData.team !== towerData.team && minionData.hp > 0) {
          const distToMinion = Phaser.Math.Distance.Between(tower.x, tower.y, minion.x, minion.y);
          if (distToMinion <= towerData.range) {
            enemiesInRange.push({ target: minion, isPlayer: false, isBot: false, isMinion: true, minionId: minionData.id });
          }
        }
      });

      // Attack ALL enemies in range if cooldown ready
      if (enemiesInRange.length > 0 && now - towerData.lastAttackTime > 1000) {
        towerData.lastAttackTime = now;
        
        // Attack all enemies
        enemiesInRange.forEach((enemy) => {
          if (enemy.isPlayer) {
            this.towerAttackPlayer(tower, enemy.target);
          } else if (enemy.isBot) {
            this.towerAttackBot(tower, enemy.target, enemy.botId);
          } else if (enemy.isMinion) {
            this.towerAttackMinion(tower, enemy.target, enemy.minionId);
          }
        });
      }
    });
  }

  private towerAttackPlayer(tower: Phaser.GameObjects.Container, target: Phaser.GameObjects.Sprite) {
    const towerData = (tower as any).towerData;

    // Create tower projectile with collision detection
    const projectile = this.add.container(tower.x, tower.y);
    const orb = this.add.circle(0, 0, 8, 0xffff00);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
      body.setCircle(8);
    }

    // Store projectile data for collision detection
    (projectile as any).projectileData = {
      damage: towerData.attack,
      isTowerProjectile: true,
      targetSprite: target,
    };

    // Destroy after 2 seconds if missed
    this.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    this.projectiles.push(projectile);
  }

  private towerAttackBot(tower: Phaser.GameObjects.Container, target: Phaser.GameObjects.Sprite, botId: string) {
    const towerData = (tower as any).towerData;

    // Create tower projectile with collision detection
    const projectile = this.add.container(tower.x, tower.y);
    const orb = this.add.circle(0, 0, 8, 0xffff00);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
      body.setCircle(8);
    }

    // Store projectile data for collision detection
    (projectile as any).projectileData = {
      damage: towerData.attack,
      isTowerProjectile: true,
      botId: botId,
    };

    // Destroy after 2 seconds if missed
    this.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    this.projectiles.push(projectile);
  }

  private towerAttackMinion(tower: Phaser.GameObjects.Container, target: Phaser.GameObjects.Container, minionId: string) {
    const towerData = (tower as any).towerData;

    // Create tower projectile with collision detection
    const projectile = this.add.container(tower.x, tower.y);
    const orb = this.add.circle(0, 0, 8, 0xffff00);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
      body.setCircle(8);
    }

    // Store projectile data for collision detection
    (projectile as any).projectileData = {
      damage: towerData.attack,
      isTowerProjectile: true,
      minionId: minionId,
    };

    // Destroy after 2 seconds if missed
    this.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    this.projectiles.push(projectile);
  }

  private updateNexusHealing(time: number) {
    // Don't heal until enabled (prevent instant heal on spawn)
    if (!this.nexusHealingEnabled) return;

    const now = Date.now();
    const HEAL_AMOUNT = 50; // HP per second
    const HEAL_INTERVAL = 1000; // Heal every second
    const HEAL_RADIUS = 300; // Healing radius

    this.nexuses.forEach((nexus) => {
      const nexusData = (nexus as any).nexusData;
      if (!nexusData || nexusData.hp <= 0) return;

      // Last heal time tracking
      if (!nexusData.lastHealTime) nexusData.lastHealTime = 0;

      if (now - nexusData.lastHealTime >= HEAL_INTERVAL) {
        nexusData.lastHealTime = now;

        // Heal allied bots in range
        this.bots.forEach((bot) => {
          const botTeam = (bot.sprite as any).team as number;
          if (botTeam === nexusData.team) {
            const distToBot = Phaser.Math.Distance.Between(nexus.x, nexus.y, bot.sprite.x, bot.sprite.y);
            if (distToBot <= HEAL_RADIUS) {
              const sprite = bot.sprite as any;
              if (!sprite.botHP) sprite.botHP = 500;
              const maxHP = sprite.botMaxHP || 500;
              sprite.botHP = Math.min(sprite.botHP + HEAL_AMOUNT, maxHP);
              this.updateBotHealthBar(bot);

              // Show heal effect
              this.showHealEffect(bot.sprite.x, bot.sprite.y, HEAL_AMOUNT);
            }
          }
        });

        // Heal allied minions in range
        this.minions.forEach((minion) => {
          const minionData = (minion as any).minionData;
          if (minionData && minionData.team === nexusData.team && minionData.hp > 0) {
            const distToMinion = Phaser.Math.Distance.Between(nexus.x, nexus.y, minion.x, minion.y);
            if (distToMinion <= HEAL_RADIUS && minionData.hp < minionData.maxHp) {
              minionData.hp = Math.min(minionData.hp + HEAL_AMOUNT, minionData.maxHp);
              this.updateMinionHealthBar(minion);

              // Show heal effect
              this.showHealEffect(minion.x, minion.y, HEAL_AMOUNT);
            }
          }
        });

        // Heal player if allied
        if (this.playerTeam === nexusData.team) {
          const distToPlayer = Phaser.Math.Distance.Between(nexus.x, nexus.y, this.playerSprite.x, this.playerSprite.y);
          if (distToPlayer <= HEAL_RADIUS && this.currentHP < this.playerChampion.maxHp) {
            this.currentHP = Math.min(this.currentHP + HEAL_AMOUNT, this.playerChampion.maxHp);
            this.updateHealthManaUI();

            // Show heal effect
            this.showHealEffect(this.playerSprite.x, this.playerSprite.y, HEAL_AMOUNT);
          }
        }
      }
    });
  }

  private showHealEffect(x: number, y: number, amount: number) {
    const text = this.add.text(x, y, `+${amount}`, {
      fontSize: "18px",
      color: "#00ff00",
      fontFamily: "monospace",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    text.setDepth(100);
    text.setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy(),
    });
  }

  private handleMovement() {
    let vx = 0;
    let vy = 0;

    // Keyboard movement
    if (this.cursors.left.isDown || this.wasd.a.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.d.isDown) vx = 1;

    if (this.cursors.up.isDown || this.wasd.w.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.s.isDown) vy = 1;

    // Mouse click to move
    if (this.mousePointer.isDown && !this.attackKey.isDown) {
      const worldPoint = this.cameras.main.getWorldPoint(this.mousePointer.x, this.mousePointer.y);
      const dx = worldPoint.x - this.playerSprite.x;
      const dy = worldPoint.y - this.playerSprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 10) {
        vx = dx / dist;
        vy = dy / dist;
      }
    }

    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx = (vx / len) * this.moveSpeed;
      vy = (vy / len) * this.moveSpeed;
    }

    this.playerSprite.setVelocity(vx, vy);

    // Update state sync
    const state = stateSync.getState();
    const localPlayer = state.players.values().next().value;
    if (localPlayer) {
      localPlayer.x = this.playerSprite.x;
      localPlayer.y = this.playerSprite.y;
      localPlayer.vx = vx;
      localPlayer.vy = vy;
    }

    // Auto-attack: check for enemies in range every frame
    this.performAutoAttack();

    // Handle abilities (1, 2, 3, 4)
    for (const [key, keyCode] of Object.entries(this.abilityKeys)) {
      if (Phaser.Input.Keyboard.JustDown(keyCode)) {
        this.useAbility(key);
      }
    }
  }

  private performAutoAttack() {
    const now = Date.now();
    if (now - this.lastAttackTime < this.playerChampion.attackSpeed) return;

    // Find nearest enemy (bots, towers, nexus, minions)
    let nearestEnemy: any = null;
    let nearestDist = this.playerChampion.attackRange;
    let enemyType: "bot" | "tower" | "nexus" | "minion" = "bot";
    let targetId: string | null = null;

    // Check bots
    this.bots.forEach((bot) => {
      const botTeam = (bot.sprite as any).team as number;
      if (botTeam !== this.playerTeam) {
        const dist = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, bot.sprite.x, bot.sprite.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = bot.sprite;
          enemyType = "bot";
          targetId = bot.data.id;
        }
      }
    });

    // Check towers
    this.towers.forEach((tower) => {
      const towerData = (tower as any).towerData;
      if (towerData && towerData.team !== this.playerTeam && towerData.hp > 0) {
        const dist = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, tower.x, tower.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = tower;
          enemyType = "tower";
          targetId = null;
        }
      }
    });

    // Check nexus
    this.nexuses.forEach((nexus) => {
      const nexusData = (nexus as any).nexusData;
      if (nexusData && nexusData.team !== this.playerTeam && nexusData.hp > 0) {
        const dist = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, nexus.x, nexus.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = nexus;
          enemyType = "nexus";
          targetId = null;
        }
      }
    });

    // Check enemy minions
    this.minions.forEach((minion) => {
      const minionData = (minion as any).minionData;
      if (minionData && minionData.team !== this.playerTeam && minionData.hp > 0) {
        const dist = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, minion.x, minion.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = minion;
          enemyType = "minion";
          targetId = minionData.id;
        }
      }
    });

    // Attack nearest enemy - create projectile that deals damage on collision
    if (nearestEnemy) {
      this.lastAttackTime = now;
      const targetX = nearestEnemy.x;
      const targetY = nearestEnemy.y;

      // Create projectile with damage info - damage applied on collision
      this.createAttackProjectile(
        this.playerSprite.x,
        this.playerSprite.y,
        targetX,
        targetY,
        this.playerChampion.color,
        this.playerChampion.attack,
        enemyType,
        targetId
      );
    }
  }

  private createAttackProjectile(
    x1: number, y1: number, x2: number, y2: number,
    color: number, damage: number,
    targetType: "bot" | "tower" | "nexus" | "minion",
    targetId: string | null
  ) {
    const projectile = this.add.container(x1, y1);
    const orb = this.add.circle(0, 0, 8, color);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);

    // Add physics body to projectile
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(Math.cos(angle) * 600, Math.sin(angle) * 600);
      body.setCircle(8);
    }

    // Store damage info on projectile
    (projectile as any).projectileData = {
      damage,
      targetType,
      targetId,
      isPlayerProjectile: true,
    };

    // Destroy after 2 seconds (missed)
    this.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    this.projectiles.push(projectile);
  }

  private useAbility(key: string) {
    console.log(`[Ability] Key ${key} pressed`);

    const ability = this.playerChampion.abilities?.find(a => a.key === key);

    if (!ability) {
      console.warn(`[Ability] No ability found for key: ${key}`);
      console.log(`[Ability] Champion abilities:`, this.playerChampion.abilities);
      return;
    }

    console.log(`[Ability] Found ability:`, ability);

    const now = Date.now();
    const lastTime = this.lastAbilityTime[key] || 0;

    // Check cooldown
    if (now - lastTime < ability.cooldown) {
      console.log(`[Ability] On cooldown: ${ability.name} (${Math.ceil((ability.cooldown - (now - lastTime)) / 1000)}s remaining)`);
      return;
    }

    // Check mana
    if (this.currentMana < ability.manaCost) {
      console.log(`[Ability] Not enough mana: ${ability.name} (need ${ability.manaCost}, have ${Math.floor(this.currentMana)})`);
      return;
    }

    // Handle Dash ability (Q - key 1)
    if (ability.name === "Dash") {
      this.performDash(ability);
      this.currentMana -= ability.manaCost;
      this.lastAbilityTime[key] = now;
      this.updateHealthManaUI();
      console.log(`[Ability] Used: ${ability.name} (mana: ${ability.manaCost}, range: ${ability.range})`);
      return;
    }

    // Use the ability
    this.currentMana -= ability.manaCost;
    this.lastAbilityTime[key] = now;
    this.updateHealthManaUI();

    console.log(`[Ability] Used: ${ability.name} (mana: ${ability.manaCost}, damage: ${ability.damage}, range: ${ability.range})`);

    // Find target for ability
    let nearestEnemy: any = null;
    let nearestDist = ability.range;

    this.bots.forEach((bot) => {
      const botTeam = (bot.sprite as any).team as number;
      if (botTeam !== this.playerTeam) {
        const dist = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, bot.sprite.x, bot.sprite.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = bot.sprite;
        }
      }
    });

    if (nearestEnemy && ability.damage > 0) {
      const botId = (nearestEnemy as any).botId;
      const color = ability.damage < 0 ? 0x00ff00 : 0xff0000; // Green for heal, red for damage

      this.createProjectile(
        this.playerSprite.x,
        this.playerSprite.y,
        nearestEnemy.x,
        nearestEnemy.y,
        color,
        () => {
          if (botId) {
            this.damageBot(botId, ability.damage);
          }
        }
      );
    }

    // Show ability effect
    this.showAbilityEffect(key);
  }

  private performDash(ability: Ability) {
    // Get dash direction from movement or mouse
    let dashAngle = 0;
    
    // Check if moving
    let vx = 0;
    let vy = 0;
    
    if (this.cursors.left.isDown || this.wasd.a.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.d.isDown) vx = 1;
    
    if (this.cursors.up.isDown || this.wasd.w.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.s.isDown) vy = 1;
    
    if (vx !== 0 || vy !== 0) {
      // Use movement direction
      dashAngle = Math.atan2(vy, vx);
    } else {
      // Use mouse direction
      const worldPoint = this.cameras.main.getWorldPoint(this.mousePointer.x, this.mousePointer.y);
      dashAngle = Phaser.Math.Angle.Between(this.playerSprite.x, this.playerSprite.y, worldPoint.x, worldPoint.y);
    }
    
    // Dash distance
    const dashDistance = ability.range || 200;
    const targetX = this.playerSprite.x + Math.cos(dashAngle) * dashDistance;
    const targetY = this.playerSprite.y + Math.sin(dashAngle) * dashDistance;
    
    // Create dash visual effect
    const dashEffect = this.add.circle(this.playerSprite.x, this.playerSprite.y, 20, this.playerChampion.color, 0.6);
    dashEffect.setDepth(100);
    this.tweens.add({
      targets: dashEffect,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => dashEffect.destroy(),
    });
    
    // Dash animation
    this.tweens.add({
      targets: this.playerSprite,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        // Ensure player is at the target position
        this.playerSprite.x = targetX;
        this.playerSprite.y = targetY;
      },
    });
    
    console.log(`[Dash] Dashing ${dashDistance}px at angle ${dashAngle}`);
  }

  private showAbilityEffect(key: string) {
    // Create visual effect at player position
    const effect = this.add.circle(this.playerSprite.x, this.playerSprite.y, 40, 0x00ff88, 0.6);
    effect.setDepth(100);

    this.tweens.add({
      targets: effect,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => effect.destroy(),
    });
  }

  private updateAbilityCooldowns() {
    const abilityOrder = ["Q", "1", "2", "3"];
    const now = Date.now();

    abilityOrder.forEach((key, index) => {
      const ability = this.playerChampion.abilities?.find(a => a.key === key);
      if (!ability) return;

      const lastTime = this.lastAbilityTime[key] || 0;
      const elapsed = now - lastTime;
      const cooldownRemaining = Math.max(0, ability.cooldown - elapsed);

      const overlay = this.abilityCooldownOverlays[index];
      const cooldownText = this.abilityCooldownTexts[index];

      if (cooldownRemaining > 0) {
        // Show cooldown overlay - fills from bottom, shrinks down
        const cooldownPercent = cooldownRemaining / ability.cooldown;
        
        overlay.clear();
        overlay.fillStyle(0x000000, 0.7);
        // Draw from bottom up, shrinking as cooldown progresses
        const fillHeight = 40 * cooldownPercent;
        overlay.fillRect(-20, 20 - fillHeight, 40, fillHeight);
        overlay.setVisible(true);

        // Show cooldown text - remaining seconds
        const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
        cooldownText.setText(secondsRemaining.toString());
        cooldownText.setVisible(true);
      } else {
        // Hide cooldown
        overlay.clear();
        overlay.setVisible(false);
        cooldownText.setVisible(false);
      }
    });
  }

  private createProjectile(x1: number, y1: number, x2: number, y2: number, color: number, onHit?: () => void) {
    const projectile = this.add.container(x1, y1);
    const orb = this.add.circle(0, 0, 6, color);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);

    // Add physics body to projectile
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
    }

    // Destroy after 1 second
    this.time.delayedCall(1000, () => {
      projectile.destroy();
      if (onHit) onHit();
    });

    this.projectiles.push(projectile);
  }

  private createVisualProjectile(x2: number, y2: number, color: number) {
    // Create visual-only projectile that flies to target position
    // Damage is already applied instantly, this is just for visual feedback
    const projectile = this.add.container(this.playerSprite.x, this.playerSprite.y);
    const orb = this.add.circle(0, 0, 6, color);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(this.playerSprite.x, this.playerSprite.y, x2, y2);

    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
    }

    // Destroy after 1 second (visual only)
    this.time.delayedCall(1000, () => {
      projectile.destroy();
    });

    this.projectiles.push(projectile);
  }

  private updateProjectiles() {
    this.projectiles = this.projectiles.filter((proj) => {
      if (!proj.active) {
        return false;
      }

      // Check if projectile is out of bounds
      if (proj.y < 0 || proj.y > this.MAP_SIZE || proj.x < 0 || proj.x > this.MAP_SIZE) {
        proj.destroy();
        return false;
      }

      // Check collision with targets
      const projData = (proj as any).projectileData;
      if (projData) {
        // Player projectiles - hit enemies
        if (projData.isPlayerProjectile) {
          // Check collision with bots
          for (const [botId, bot] of this.bots.entries()) {
            const botTeam = (bot.sprite as any).team as number;
            if (botTeam !== this.playerTeam) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, bot.sprite.x, bot.sprite.y);
              if (dist < 20) {
                // Hit!
                this.damageBot(botId, projData.damage);
                proj.destroy();
                return false;
              }
            }
          }

          // Check collision with towers
          for (const tower of this.towers) {
            const towerData = (tower as any).towerData;
            if (towerData && towerData.team !== this.playerTeam && towerData.hp > 0) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, tower.x, tower.y);
              if (dist < 30) {
                // Hit!
                this.damageTower(tower, projData.damage);
                proj.destroy();
                return false;
              }
            }
          }

          // Check collision with nexus
          for (const nexus of this.nexuses) {
            const nexusData = (nexus as any).nexusData;
            if (nexusData && nexusData.team !== this.playerTeam && nexusData.hp > 0) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, nexus.x, nexus.y);
              if (dist < 50) {
                // Hit!
                this.damageNexus(nexus, projData.damage);
                proj.destroy();
                return false;
              }
            }
          }

          // Check collision with minions
          for (const minion of this.minions) {
            const minionData = (minion as any).minionData;
            if (minionData && minionData.team !== this.playerTeam && minionData.hp > 0) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, minion.x, minion.y);
              if (dist < 15) {
                // Hit!
                this.damageMinion(minionData.id, projData.damage);
                proj.destroy();
                return false;
              }
            }
          }
        }
        // Bot projectiles - hit player and allied bots/minions/towers/nexus
        else if (projData.isBotProjectile) {
          const shooterTeam = projData.shooterTeam as number;
          
          // Check collision with player
          if (shooterTeam !== this.playerTeam) {
            const dist = Phaser.Math.Distance.Between(proj.x, proj.y, this.playerSprite.x, this.playerSprite.y);
            if (dist < 20) {
              this.currentHP -= projData.damage;
              this.updateHealthManaUI();
              this.showDamageNumber(this.playerSprite.x, this.playerSprite.y, projData.damage);
              
              if (this.currentHP <= 0) {
                this.playerDeaths++;
                this.respawnPlayer();
              }
              proj.destroy();
              return false;
            }
          }
          
          // Check collision with allied bots (shooter is enemy to player's team)
          // Skip dead bots - they can't be hit
          this.bots.forEach((bot, botId) => {
            const botTeam = (bot.sprite as any).team as number;
            if (botTeam !== shooterTeam && !bot.data.isDead) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, bot.sprite.x, bot.sprite.y);
              if (dist < 20) {
                this.damageBot(botId, projData.damage);
                proj.destroy();
              }
            }
          });
          
          // Check collision with towers
          this.towers.forEach((tower) => {
            const towerData = (tower as any).towerData;
            if (towerData && towerData.team !== shooterTeam && towerData.hp > 0) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, tower.x, tower.y);
              if (dist < 30) {
                this.damageTower(tower, projData.damage);
                proj.destroy();
              }
            }
          });
          
          // Check collision with nexus
          this.nexuses.forEach((nexus) => {
            const nexusData = (nexus as any).nexusData;
            if (nexusData && nexusData.team !== shooterTeam && nexusData.hp > 0) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, nexus.x, nexus.y);
              if (dist < 50) {
                this.damageNexus(nexus, projData.damage);
                proj.destroy();
              }
            }
          });
          
          // Check collision with minions
          for (const minion of this.minions) {
            const minionData = (minion as any).minionData;
            if (minionData && minionData.team !== shooterTeam && minionData.hp > 0) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, minion.x, minion.y);
              if (dist < 15) {
                this.damageMinion(minionData.id, projData.damage);
                proj.destroy();
                return false;
              }
            }
          }
        }
        // Tower projectiles - hit player and allied bots/minions
        else if (projData.isTowerProjectile) {
          // Check collision with player
          if (projData.targetSprite) {
            const dist = Phaser.Math.Distance.Between(proj.x, proj.y, projData.targetSprite.x, projData.targetSprite.y);
            if (dist < 20) {
              // Hit player!
              this.currentHP -= projData.damage;
              this.updateHealthManaUI();
              this.showDamageNumber(projData.targetSprite.x, projData.targetSprite.y, projData.damage);
              console.log(`[Tower] Player took ${projData.damage} damage from tower`);

              if (this.currentHP <= 0) {
                this.playerDeaths++;
                this.respawnPlayer();
              }
              proj.destroy();
              return false;
            }
          }

          // Check collision with bot
          if (projData.botId) {
            const bot = this.bots.get(projData.botId);
            if (bot) {
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, bot.sprite.x, bot.sprite.y);
              if (dist < 20) {
                // Hit bot!
                const sprite = bot.sprite as any;
                if (!sprite.botHP) sprite.botHP = 500;
                sprite.botHP -= projData.damage;
                this.updateBotHealthBar(bot);
                this.showDamageNumber(bot.sprite.x, bot.sprite.y, projData.damage);
                console.log(`[Tower] Bot took ${projData.damage} damage from tower`);

                if (sprite.botHP <= 0) {
                  bot.healthBar.destroy();
                  bot.sprite.destroy();
                  this.bots.delete(projData.botId);
                }
                proj.destroy();
                return false;
              }
            }
          }

          // Check collision with minion
          if (projData.minionId) {
            const minion = this.minions.find((m) => {
              const mData = (m as any).minionData;
              return mData && mData.id === projData.minionId;
            });

            if (minion) {
              const data = (minion as any).minionData;
              const dist = Phaser.Math.Distance.Between(proj.x, proj.y, minion.x, minion.y);
              if (dist < 15) {
                // Hit minion!
                data.hp -= projData.damage;
                this.updateMinionHealthBar(minion);
                this.showDamageNumber(minion.x, minion.y, projData.damage);
                console.log(`[Tower] Minion took ${projData.damage} damage from tower`);

                if (data.hp <= 0) {
                  minion.destroy();
                }
                proj.destroy();
                return false;
              }
            }
          }
        }
      }

      return true;
    });
  }

  private setupMinionSpawning() {
    this.minionSpawnTimer = this.time.addEvent({
      delay: this.MINION_SPAWN_INTERVAL,
      callback: this.spawnMinionWave,
      callbackScope: this,
      loop: true,
    });
  }

  private spawnMinionWave() {
    this.minionWave++;
    console.log(`[Game] Spawning minion wave ${this.minionWave}`);

    // Spawn for both teams
    this.spawnMinionsForTeam(this.BLUE_TEAM);
    this.spawnMinionsForTeam(this.RED_TEAM);
  }

  private spawnMinionsForTeam(team: number) {
    // Single lane spawn points - RIGHT AT NEXUS (diagonal lane)
    // Blue nexus: (250, MAP_SIZE - 250), Red nexus: (MAP_SIZE - 250, 250)
    const spawnPoint = team === this.BLUE_TEAM
      ? { x: 250, y: this.MAP_SIZE - 250 }  // Blue nexus position
      : { x: this.MAP_SIZE - 250, y: 250 };  // Red nexus position

    const targetPoint = team === this.BLUE_TEAM
      ? { x: this.MAP_SIZE - 250, y: 250 }  // Enemy nexus (top-right)
      : { x: 250, y: this.MAP_SIZE - 250 };  // Enemy nexus (bottom-left)

    // Spawn 3 melee, 2 ranged, 1 siege (every 3rd wave)
    // Melee minions - spawn closer together at nexus
    for (let i = 0; i < 3; i++) {
      this.createMinion(spawnPoint.x + i * 20, spawnPoint.y - i * 20, "melee", team, targetPoint.x, targetPoint.y);
    }

    // Ranged minions
    for (let i = 0; i < 2; i++) {
      this.createMinion(spawnPoint.x + 60 + i * 20, spawnPoint.y - 60 - i * 20, "ranged", team, targetPoint.x, targetPoint.y);
    }

    // Siege minion (every 3rd wave)
    if (this.minionWave % 3 === 0) {
      this.createMinion(spawnPoint.x + 120, spawnPoint.y - 120, "siege", team, targetPoint.x, targetPoint.y);
    }
  }

  private createMinion(x: number, y: number, type: "melee" | "ranged" | "siege", team: number, targetX: number, targetY: number) {
    const minionType = MINION_TYPES[type];
    const minion = this.add.container(x, y);

    const body = this.add.circle(0, 0, minionType.size, minionType.color);
    body.setStrokeStyle(2, team === this.BLUE_TEAM ? 0x0088ff : 0xff8800);
    minion.add(body);

    minion.setDepth(5);

    // Add physics body for collision
    this.physics.add.existing(minion);
    const bodyPhysics = minion.body as Phaser.Physics.Arcade.Body;
    bodyPhysics.setCircle(minionType.size);
    bodyPhysics.setCollideWorldBounds(false);

    // Create minion health bar
    const healthBar = this.add.graphics();
    minion.add(healthBar);

    // Store minion data
    (minion as any).minionData = {
      id: `minion-${Date.now()}-${Math.random()}`,
      type,
      team,
      hp: minionType.hp,
      maxHp: minionType.hp,
      attack: minionType.attack,
      attackRange: 80,
      speed: minionType.speed,
      targetX,
      targetY,
      lastAttackTime: 0,
      healthBar,
    };

    this.updateMinionHealthBar(minion);
    this.minions.push(minion);
  }

  private updateMinionHealthBar(minion: Phaser.GameObjects.Container) {
    const data = (minion as any).minionData;
    if (!data) return;

    const healthBar = data.healthBar as Phaser.GameObjects.Graphics;
    if (!healthBar) return;

    healthBar.clear();
    const barWidth = 30;
    const barHeight = 4;
    const hpPercent = Math.max(0, data.hp / data.maxHp);

    // Background
    healthBar.fillStyle(0x330000);
    healthBar.fillRect(-barWidth / 2, -20, barWidth, barHeight);

    // Current HP (green for allies, red for enemies)
    const hpColor = data.team === this.playerTeam ? 0x00ff00 : 0xff0000;
    healthBar.fillStyle(hpColor);
    healthBar.fillRect(-barWidth / 2, -20, barWidth * hpPercent, barHeight);
  }

  private updateMinions() {
    const now = Date.now();

    this.minions = this.minions.filter((minion) => {
      if (!minion.active) return false;

      const data = (minion as any).minionData;
      if (!data || data.hp <= 0) return false;

      // PRIORITY 1: Check for enemy minions in range - FIGHT FIRST!
      const nearestEnemyMinion = this.findNearestEnemyMinion(minion, 100);
      if (nearestEnemyMinion) {
        const fightDist = Phaser.Math.Distance.Between(minion.x, minion.y, nearestEnemyMinion.x, nearestEnemyMinion.y);
        if (fightDist <= data.attackRange) {
          // Attack enemy minion
          if (now - data.lastAttackTime > 1000) {
            data.lastAttackTime = now;
            this.minionAttack(minion, nearestEnemyMinion);
          }
          // Stop moving when attacking
          minion.x = minion.x;
          minion.y = minion.y;
        } else {
          // Move toward enemy minion to fight
          const dx = nearestEnemyMinion.x - minion.x;
          const dy = nearestEnemyMinion.y - minion.y;
          const moveDist = Math.sqrt(dx * dx + dy * dy);
          if (moveDist > 0) {
            const vx = (dx / moveDist) * data.speed;
            const vy = (dy / moveDist) * data.speed;
            minion.x += vx * 0.016;
            minion.y += vy * 0.016;
          }
        }
        // Update minion health bar
        this.updateMinionHealthBar(minion);
        return true;
      }

      // PRIORITY 2: No enemy minions nearby - push lane to tower/nexus
      // Find target (enemy tower, nexus, hero, bot)
      const target = this.findMinionTarget(minion);

      if (target) {
        // Check if target is a move target (tower/nexus) or attack target
        if ((target as any).isMoveTarget) {
          // Move towards objective (tower/nexus)
          const dx = target.x - minion.x;
          const dy = target.y - minion.y;
          const moveDist = Math.sqrt(dx * dx + dy * dy);
          if (moveDist > 0) {
            const vx = (dx / moveDist) * data.speed;
            const vy = (dy / moveDist) * data.speed;
            minion.x += vx * 0.016;
            minion.y += vy * 0.016;
          }
        } else {
          // Attack target (hero, bot)
          const dist = Phaser.Math.Distance.Between(minion.x, minion.y, target.x, target.y);
          if (dist <= data.attackRange) {
            if (now - data.lastAttackTime > 1000) {
              data.lastAttackTime = now;
              this.minionAttack(minion, target);
            }
          } else {
            // Move toward target
            const dx = target.x - minion.x;
            const dy = target.y - minion.y;
            const moveDist = Math.sqrt(dx * dx + dy * dy);
            if (moveDist > 0) {
              const vx = (dx / moveDist) * data.speed;
              const vy = (dy / moveDist) * data.speed;
              minion.x += vx * 0.016;
              minion.y += vy * 0.016;
            }
          }
        }
      } else {
        // No target, move towards lane target
        const dx = data.targetX - minion.x;
        const dy = data.targetY - minion.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 50) {
          const vx = (dx / dist) * data.speed;
          const vy = (dy / dist) * data.speed;
          minion.x += vx * 0.016;
          minion.y += vy * 0.016;
        }
      }

      // Update minion health bar
      this.updateMinionHealthBar(minion);

      return true;
    });

    // Handle minion collisions (all minions push each other)
    this.handleMinionCollisions();
  }

  private findNearestEnemyMinion(minion: Phaser.GameObjects.Container, range: number): Phaser.GameObjects.Container | null {
    const data = (minion as any).minionData;
    if (!data) return null;

    let nearest: Phaser.GameObjects.Container | null = null;
    let nearestDist = range;

    for (const other of this.minions) {
      const otherData = (other as any).minionData;
      if (!otherData || otherData.team === data.team || otherData.hp <= 0) continue;

      const dist = Phaser.Math.Distance.Between(minion.x, minion.y, other.x, other.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = other;
      }
    }

    return nearest;
  }

  private handleMinionCollisions() {
    const minionPushDistance = 25; // Minimum distance between all minions

    for (let i = 0; i < this.minions.length; i++) {
      const minion1 = this.minions[i];
      const data1 = (minion1 as any).minionData;
      if (!data1 || data1.hp <= 0) continue;

      for (let j = i + 1; j < this.minions.length; j++) {
        const minion2 = this.minions[j];
        const data2 = (minion2 as any).minionData;
        if (!data2 || data2.hp <= 0) continue;

        // ALL minions push each other (allied and enemy)
        const dist = Phaser.Math.Distance.Between(minion1.x, minion1.y, minion2.x, minion2.y);
        if (dist < minionPushDistance && dist > 0) {
          // Push minions apart
          const dx = minion1.x - minion2.x;
          const dy = minion1.y - minion2.y;
          const pushForce = (minionPushDistance - dist) / 2;

          minion1.x += (dx / dist) * pushForce;
          minion1.y += (dy / dist) * pushForce;
          minion2.x -= (dx / dist) * pushForce;
          minion2.y -= (dy / dist) * pushForce;
        }
      }
    }
  }

  private findMinionTarget(minion: Phaser.GameObjects.Container): any {
    const data = (minion as any).minionData;
    if (!data) return null;

    const minionTeam = data.team;
    const enemyTeam = minionTeam === this.BLUE_TEAM ? this.RED_TEAM : this.BLUE_TEAM;

    // Check if all enemy towers are destroyed (for nexus immunity)
    const allEnemyTowersDestroyed = this.towers.every((t) => {
      const tData = (t as any).towerData;
      return !tData || tData.team !== enemyTeam || tData.hp <= 0;
    });

    // PRIORITY 1: Enemy towers in lane (highest priority - push objective)
    // Find the CLOSEST living enemy tower (can't skip towers)
    let closestTower: any = null;
    let closestTowerDist = Infinity;

    this.towers.forEach((t) => {
      const tData = (t as any).towerData;
      if (!tData || tData.team !== enemyTeam || tData.hp <= 0) return;

      const distToTower = Phaser.Math.Distance.Between(minion.x, minion.y, t.x, t.y);
      if (distToTower < closestTowerDist) {
        closestTowerDist = distToTower;
        closestTower = t;
      }
    });

    if (closestTower) {
      const distToTower = Phaser.Math.Distance.Between(minion.x, minion.y, closestTower.x, closestTower.y);
      if (distToTower <= data.attackRange) {
        return closestTower; // In attack range - attack!
      }
      // Move towards tower
      return { x: closestTower.x, y: closestTower.y, isMoveTarget: true };
    }

    // PRIORITY 2: Enemy nexus (ONLY if all towers are destroyed)
    if (allEnemyTowersDestroyed) {
      const enemyNexus = this.nexuses.find((n) => {
        const nData = (n as any).nexusData;
        return nData && nData.team !== minionTeam && nData.hp > 0;
      });
      if (enemyNexus) {
        const distToNexus = Phaser.Math.Distance.Between(minion.x, minion.y, enemyNexus.x, enemyNexus.y);
        if (distToNexus <= data.attackRange) {
          return enemyNexus; // In attack range - attack!
        }
        // Move towards nexus
        return { x: enemyNexus.x, y: enemyNexus.y, isMoveTarget: true };
      }
    }

    // Note: Enemy minions are handled separately in updateMinions() as PRIORITY 1
    // They are checked before calling this function

    // PRIORITY 3: Enemy heroes (aggressive - attack if close)
    if (this.playerSprite && this.playerTeam !== minionTeam) {
      const distToHero = Phaser.Math.Distance.Between(minion.x, minion.y, this.playerSprite.x, this.playerSprite.y);
      if (distToHero < 250) { // Aggro range for heroes
        return this.playerSprite;
      }
    }

    // PRIORITY 4: Enemy bots
    const enemyBot = Array.from(this.bots.values()).find((b) => {
      const botTeam = (b.sprite as any).team as number;
      return botTeam !== minionTeam;
    });
    if (enemyBot) {
      const distToBot = Phaser.Math.Distance.Between(minion.x, minion.y, enemyBot.sprite.x, enemyBot.sprite.y);
      if (distToBot < 250) {
        return enemyBot.sprite;
      }
    }

    return null;
  }

  private minionAttack(minion: Phaser.GameObjects.Container, target: any) {
    const data = (minion as any).minionData;
    if (!data) return;

    // Check nexus immunity - can't damage nexus if towers are alive
    if ((target as any).nexusData) {
      const enemyTeam = data.team === this.BLUE_TEAM ? this.RED_TEAM : this.BLUE_TEAM;
      const hasLivingTowers = this.towers.some((t) => {
        const tData = (t as any).towerData;
        return tData && tData.team === enemyTeam && tData.hp > 0;
      });
      if (hasLivingTowers) {
        // Nexus is immune - don't attack
        return;
      }
    }

    // Show attack visual
    const attackEffect = this.add.circle(minion.x, minion.y, 20, 0xffff00, 0.6);
    attackEffect.setDepth(100);
    this.tweens.add({
      targets: attackEffect,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => attackEffect.destroy(),
    });

    // Deal damage to target
    if (target === this.playerSprite) {
      // Enemy hero
      this.currentHP -= data.attack;
      this.updateHealthManaUI();
      this.showDamageNumber(this.playerSprite.x, this.playerSprite.y, data.attack);

      if (this.currentHP <= 0) {
        this.playerDeaths++;
        this.respawnPlayer();
      }
    } else if ((target as any).minionData) {
      // Enemy minion
      const targetData = (target as any).minionData;
      targetData.hp -= data.attack;
      this.updateMinionHealthBar(target);

      if (targetData.hp <= 0) {
        // Kill reward
        if (data.team === this.playerTeam) {
          this.playerGold += MINION_TYPES[data.type].goldValue;
          this.updateStatsUI();
        }
        target.destroy();
      }
    } else if ((target as any).towerData) {
      // Tower
      this.damageTower(target, data.attack);
    } else if ((target as any).nexusData) {
      // Nexus (only if towers are dead)
      this.damageNexus(target, data.attack);
    } else if ((target as any).botId || target instanceof Phaser.Physics.Arcade.Sprite) {
      // Enemy bot
      const bot = Array.from(this.bots.values()).find(b => b.sprite === target);
      if (bot) {
        const sprite = target as any;
        if (!sprite.botHP) sprite.botHP = 500;
        sprite.botHP -= data.attack;
        this.updateBotHealthBar(bot);
        this.showDamageNumber(target.x, target.y, data.attack);

        if (sprite.botHP <= 0) {
          bot.healthBar.destroy();
          target.destroy();
          this.bots.delete(bot.data.id);
        }
      }
    }
  }

  private setupBots() {
    // Spawn bots for single diagonal middle lane - 2 per team
    // Lane runs from bottom-left (blue nexus) to top-right (red nexus)
    const botConfigs = [
      // Blue team (bottom-left) - spawn near nexus in lane
      { id: "bot1", team: this.BLUE_TEAM, x: 400, y: this.MAP_SIZE - 400, champion: "warrior" },
      { id: "bot2", team: this.BLUE_TEAM, x: 500, y: this.MAP_SIZE - 500, champion: "assassin" },
      // Red team (top-right) - spawn near nexus in lane
      { id: "bot3", team: this.RED_TEAM, x: this.MAP_SIZE - 400, y: 400, champion: "mage" },
      { id: "bot4", team: this.RED_TEAM, x: this.MAP_SIZE - 500, y: 500, champion: "fighter" },
    ];

    botConfigs.forEach((config) => {
      console.log(`[Bots] Spawning ${config.champion} bot at (${config.x}, ${config.y}) team ${config.team}`);
      this.createBot(config.id, config.team, config.x, config.y, config.champion);
    });

    console.log(`[Bots] Total bots spawned: ${this.bots.size}`);
  }

  private createBot(id: string, team: number, x: number, y: number, championId: string) {
    const champion = getChampion(championId);
    if (!champion) {
      console.warn("[GameScene] Unknown champion for bot:", championId);
      return;
    }

    const sprite = this.physics.add.sprite(x, y, "hero");
    sprite.setTint(champion.color);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(10);

    // Set collision box safely
    if (sprite.body) {
      sprite.body.setSize(30, 30);
      sprite.body.setOffset(-15, -15);
    }

    (sprite as any).team = team;
    (sprite as any).championSpeed = champion.speed;
    (sprite as any).botId = id; // Store bot ID for damage tracking
    (sprite as any).botHP = champion.hp; // Store bot HP
    (sprite as any).botMaxHP = champion.maxHp; // Store max HP for calculations
    (sprite as any).championAttack = champion.attack;
    (sprite as any).championAttackRange = champion.attackRange;
    (sprite as any).championData = champion; // Store full champion data

    const healthBar = this.add.graphics();
    healthBar.setDepth(11);

    const botData: BotData = {
      id,
      state: BotState.LANING,
      // Target is enemy nexus (diagonal lane)
      targetX: team === this.BLUE_TEAM ? this.MAP_SIZE - 250 : 250,
      targetY: team === this.BLUE_TEAM ? 250 : this.MAP_SIZE - 250,
      attackTarget: null,
      lastAttackTime: 0,
      behaviorTick: 0,
    };

    this.bots.set(id, { sprite, data: botData, healthBar });
  }

  private updateBots(time: number) {
    const now = Date.now();

    this.bots.forEach((bot, botId) => {
      // Check for respawn
      if (bot.data.isDead && bot.data.respawnTime) {
        if (now >= bot.data.respawnTime) {
          this.respawnBot(botId);
        }
        return; // Skip update for dead bots
      }

      const sprite = bot.sprite;
      const data = bot.data;
      const champion = (sprite as any).championData as Champion;
      const botTeam = (sprite as any).team as number;
      const botHP = (sprite as any).botHP || champion.hp;
      const botMaxHP = (sprite as any).botMaxHP || champion.maxHp;
      const botAttack = (sprite as any).championAttack || champion.attack;
      const botAttackRange = (sprite as any).championAttackRange || champion.attackRange;
      const botSpeed = (sprite as any).championSpeed || champion.speed;

      // Update bot state
      data.behaviorTick++;

      // Check if bot should retreat (low HP)
      const hpPercent = botHP / botMaxHP;
      const shouldRetreat = hpPercent < 0.3;

      // Find nearest enemy (priority: low HP targets, then closest)
      let nearestEnemy: Phaser.GameObjects.Container | Phaser.Physics.Arcade.Sprite | null = null;
      let nearestDist = botAttackRange + 50;
      let nearestEnemyHP = 1000;

      // Check player
      if (this.playerTeam !== botTeam && this.playerSprite.active) {
        const playerDist = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.playerSprite.x, this.playerSprite.y);
        if (playerDist < nearestDist || (playerDist < nearestDist + 100 && this.currentHP < nearestEnemyHP)) {
          nearestDist = playerDist;
          nearestEnemy = this.playerSprite;
          nearestEnemyHP = this.currentHP;
        }
      }

      // Check other bots (skip dead bots)
      this.bots.forEach((otherBot) => {
        if (otherBot === bot || (otherBot.sprite as any).team === botTeam) return;
        // Skip dead bots - they can't be targeted
        if (otherBot.data.isDead) return;

        const otherHP = (otherBot.sprite as any).botHP || 500;
        const enemyDist = Phaser.Math.Distance.Between(sprite.x, sprite.y, otherBot.sprite.x, otherBot.sprite.y);

        // Prioritize low HP enemies
        if (otherHP < nearestEnemyHP && enemyDist < nearestDist + 50) {
          nearestDist = enemyDist;
          nearestEnemy = otherBot.sprite;
          nearestEnemyHP = otherHP;
        } else if (enemyDist < nearestDist) {
          nearestDist = enemyDist;
          nearestEnemy = otherBot.sprite;
          nearestEnemyHP = otherHP;
        }
      });

      // Check enemy minions (for farming)
      let nearestMinion: Phaser.GameObjects.Container | null = null;
      let nearestMinionDist = botAttackRange + 30;

      this.minions.forEach((minion) => {
        const minionData = (minion as any).minionData;
        if (!minionData || minionData.team === botTeam || minionData.hp <= 0) return;

        const minionDist = Phaser.Math.Distance.Between(sprite.x, sprite.y, minion.x, minion.y);
        if (minionDist < nearestMinionDist) {
          nearestMinionDist = minionDist;
          nearestMinion = minion;
        }
      });

      // Decision making
      if (shouldRetreat) {
        // RETREAT MODE - run back to nexus for healing
        data.state = BotState.RETREATING;
        // Retreat to nexus position (where healing is)
        const retreatX = botTeam === this.BLUE_TEAM ? 250 : this.MAP_SIZE - 250;
        const retreatY = botTeam === this.BLUE_TEAM ? this.MAP_SIZE - 250 : 250;
        const dx = retreatX - sprite.x;
        const dy = retreatY - sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 100) {
          const vx = (dx / dist) * botSpeed;
          const vy = (dy / dist) * botSpeed;
          sprite.setVelocity(vx, vy);
        } else {
          // Safe at nexus, stop and heal
          sprite.setVelocity(0, 0);
          // Heal over time at nexus (only when very close to nexus)
          if (botHP < botMaxHP && dist < 150) {
            (sprite as any).botHP = Math.min(botHP + 50, botMaxHP);
            this.updateBotHealthBar(bot);
          }
        }
      } else if (nearestEnemy && nearestDist < botAttackRange + 100) {
        // ATTACK MODE - engage enemy
        data.state = BotState.ATTACKING;

        // Kiting: move backward if enemy is too close and we just attacked
        const tooClose = nearestDist < botAttackRange * 0.5;
        
        if (tooClose && now - data.lastAttackTime < 500) {
          // Move away from enemy
          const dx = sprite.x - nearestEnemy.x;
          const dy = sprite.y - nearestEnemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const vx = (dx / dist) * botSpeed * 0.8;
            const vy = (dy / dist) * botSpeed * 0.8;
            sprite.setVelocity(vx, vy);
          }
        } else if (nearestDist > botAttackRange) {
          // Move toward enemy
          const dx = nearestEnemy.x - sprite.x;
          const dy = nearestEnemy.y - sprite.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const vx = (dx / dist) * botSpeed;
          const vy = (dy / dist) * botSpeed;
          sprite.setVelocity(vx, vy);
        } else {
          // In attack range - stop and attack
          sprite.setVelocity(0, 0);
          
          // Attack if cooldown ready
          if (now - data.lastAttackTime > 1000) {
            data.lastAttackTime = now;
            
            // Attack nearest enemy (prioritize low HP)
            if (nearestEnemy === this.playerSprite) {
              this.createBotProjectile(sprite, this.playerSprite, botAttack, botTeam);
            } else {
              // Check if it's another bot
              const targetBot = Array.from(this.bots.values()).find(b => b.sprite === nearestEnemy);
              if (targetBot) {
                this.createBotProjectile(sprite, nearestEnemy, botAttack, botTeam);
              }
            }
          }
        }
      } else if (nearestMinion && nearestMinionDist < 300) {
        // FARM MODE - attack minions for gold
        data.state = BotState.LANING;

        if (nearestMinionDist > botAttackRange) {
          // Move toward minion
          const minionX = (nearestMinion as Phaser.GameObjects.Container).x;
          const minionY = (nearestMinion as Phaser.GameObjects.Container).y;
          const dx = minionX - sprite.x;
          const dy = minionY - sprite.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const vx = (dx / dist) * botSpeed;
          const vy = (dy / dist) * botSpeed;
          sprite.setVelocity(vx, vy);
        } else {
          // Attack minion
          sprite.setVelocity(0, 0);
          if (now - data.lastAttackTime > 1000) {
            data.lastAttackTime = now;
            this.createBotProjectile(sprite, nearestMinion, botAttack, botTeam);
          }
        }
      } else {
        // LANE MODE - move toward lane target
        data.state = BotState.LANING;
        
        const dx = data.targetX - sprite.x;
        const dy = data.targetY - sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 100) {
          const vx = (dx / dist) * botSpeed;
          const vy = (dy / dist) * botSpeed;
          sprite.setVelocity(vx, vy);
        } else {
          // Wait at lane position, look for enemies
          sprite.setVelocity(0, 0);
        }
      }

      // Update bot health bar
      this.updateBotHealthBar(bot);
    });
  }

  private createBotProjectile(
    shooter: Phaser.Physics.Arcade.Sprite,
    target: Phaser.GameObjects.Container | Phaser.Physics.Arcade.Sprite,
    damage: number,
    shooterTeam: number
  ) {
    const projectile = this.add.container(shooter.x, shooter.y);
    const orb = this.add.circle(0, 0, 8, shooter.tint || 0xffffff);
    projectile.add(orb);
    projectile.setDepth(20);

    const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, target.x, target.y);
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(Math.cos(angle) * 600, Math.sin(angle) * 600);
      body.setCircle(8);
    }

    // Get target bot ID if targeting a bot
    let targetBotId: string | null = null;
    const targetBot = Array.from(this.bots.values()).find(b => b.sprite === target);
    if (targetBot) {
      targetBotId = targetBot.data.id;
    }

    // Store projectile data
    (projectile as any).projectileData = {
      damage,
      shooterTeam,
      isBotProjectile: true,
      targetBotId,
    };

    // Destroy after 2 seconds
    this.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });

    this.projectiles.push(projectile);
  }

  private damageMinion(minionId: string, damage: number) {
    const minion = this.minions.find((m) => {
      const mData = (m as any).minionData;
      return mData && mData.id === minionId;
    });
    
    if (!minion) return;

    const data = (minion as any).minionData;
    if (!data) return;

    data.hp -= damage;

    // Update minion health bar immediately
    this.updateMinionHealthBar(minion);

    if (data.hp <= 0) {
      // Minion died - grant gold
      this.playerGold += MINION_TYPES[data.type].goldValue;
      this.playerKills++;
      this.updateStatsUI();

      // Visual death effect
      this.showDeathEffect(minion.x, minion.y, 0xffaa00, 15);

      // Remove minion
      minion.destroy();
    }
  }

  private damageBot(botId: string, damage: number) {
    const bot = this.bots.get(botId);
    if (!bot) return;

    // Use sprite's botHP for damage tracking
    const sprite = bot.sprite as any;
    if (!sprite.botHP) sprite.botHP = 500;

    sprite.botHP -= damage;

    console.log(`[Combat] Bot ${botId} took ${damage} damage, HP: ${sprite.botHP}`);

    // Show damage number
    this.showDamageNumber(bot.sprite.x, bot.sprite.y, damage);

    // Update bot health bar immediately
    this.updateBotHealthBar(bot);

    if (sprite.botHP <= 0) {
      // Bot died - mark as dead for respawn
      bot.data.isDead = true;
      bot.data.respawnTime = Date.now() + 5000; // 5 second respawn
      console.log(`[Bots] Bot ${botId} marked as dead, respawn at ${bot.data.respawnTime} (in 5s)`);

      // Grant gold to killer (player if player's team shot it)
      this.playerGold += 100;
      this.playerKills++;
      this.updateStatsUI();

      // Visual death effect
      this.showDeathEffect(bot.sprite.x, bot.sprite.y);

      // Hide bot but don't destroy yet (for respawn)
      bot.sprite.setVisible(false);
      if (bot.sprite.body) {
        bot.sprite.body.enable = false;
      }
      bot.healthBar.setVisible(false);

      // Clean up any projectiles targeting this dead bot
      this.projectiles = this.projectiles.filter((proj) => {
        const projData = (proj as any).projectileData;
        if (projData && projData.targetBotId === botId) {
          proj.destroy();
          return false;
        }
        return true;
      });

      console.log(`[Bots] Bot ${botId} died, will respawn in 5s`);
    }
  }

  // Update bot respawns (called in non-test mode)
  private updateBotRespawns(time: number) {
    const now = Date.now();
    this.bots.forEach((bot, botId) => {
      if (bot.data.isDead && bot.data.respawnTime) {
        const timeUntilRespawn = bot.data.respawnTime - now;
        if (timeUntilRespawn <= 0) {
          console.log(`[Bots] Respawn timer expired for ${botId}, respawning...`);
          this.respawnBot(botId);
        } else {
          console.log(`[Bots] ${botId} dead, respawn in ${timeUntilRespawn}ms`);
        }
      }
    });
  }

  private respawnBot(botId: string) {
    const bot = this.bots.get(botId);
    console.log(`[Bots] respawnBot called for ${botId}, bot exists: ${!!bot}, isDead: ${bot?.data.isDead}`);
    if (!bot || !bot.data.isDead) return;

    const champion = (bot.sprite as any).championData as Champion;
    const botTeam = (bot.sprite as any).team as number;

    // Reset HP
    (bot.sprite as any).botHP = champion.maxHp;
    bot.data.isDead = false;
    bot.data.respawnTime = undefined;

    // Respawn at nexus (base) - diagonal lane positions
    const respawnX = botTeam === this.BLUE_TEAM ? 400 : this.MAP_SIZE - 400;
    const respawnY = botTeam === this.BLUE_TEAM ? this.MAP_SIZE - 400 : 400;
    bot.sprite.setPosition(respawnX, respawnY);

    // Show bot again
    bot.sprite.setVisible(true);
    if (bot.sprite.body) {
      bot.sprite.body.enable = true;
    }
    bot.healthBar.setVisible(true);

    // Visual respawn effect
    this.showRespawnEffect(respawnX, respawnY, botTeam);

    this.updateBotHealthBar(bot);
    console.log(`[Bots] Bot ${botId} respawned at (${respawnX}, ${respawnY}) with HP: ${champion.maxHp}`);
  }

  private showRespawnEffect(x: number, y: number, team: number) {
    const color = team === this.BLUE_TEAM ? 0x0088ff : 0xff8800;
    const effect = this.add.circle(x, y, 30, color, 0.8);
    effect.setDepth(100);

    this.tweens.add({
      targets: effect,
      scale: 2,
      alpha: 0,
      duration: 800,
      onComplete: () => effect.destroy(),
    });

    // Show "Respawned!" text
    const text = this.add.text(x, y - 30, 'RESPAWNED!', {
      fontSize: '14px',
      color: team === this.BLUE_TEAM ? '#0088ff' : '#ff8800',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setDepth(101);
    text.setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  private damageTower(tower: Phaser.GameObjects.Container, damage: number) {
    const towerData = (tower as any).towerData;
    if (!towerData) return;

    towerData.hp -= damage;
    console.log(`[Combat] Tower took ${damage} damage, HP: ${towerData.hp}/${towerData.maxHp}`);

    // Show damage number
    this.showDamageNumber(tower.x, tower.y, damage);

    // Update tower health bar
    const towerHealthBar = tower.list.find((item: any) => item instanceof Phaser.GameObjects.Graphics);
    if (towerHealthBar) {
      this.updateTowerHealthBar(tower, towerHealthBar as Phaser.GameObjects.Graphics);
    }

    if (towerData.hp <= 0) {
      // Tower destroyed
      this.playerGold += 300;
      console.log(`[Combat] Tower destroyed!`);

      // Visual explosion
      this.showDeathEffect(tower.x, tower.y, 0xffaa00, 60);

      // Remove tower
      tower.destroy();
    }
  }

  private damageNexus(nexus: Phaser.GameObjects.Container, damage: number) {
    const nexusData = (nexus as any).nexusData;
    if (!nexusData) return;

    nexusData.hp -= damage;
    console.log(`[Combat] NEXUS took ${damage} damage, HP: ${nexusData.hp}/${nexusData.maxHp}`);

    // Show damage number
    this.showDamageNumber(nexus.x, nexus.y, damage);

    // Update nexus health bar
    const nexusHealthBar = nexus.list.find((item: any) => item instanceof Phaser.GameObjects.Graphics);
    if (nexusHealthBar) {
      this.updateNexusHealthBar(nexus, nexusHealthBar as Phaser.GameObjects.Graphics);
    }

    if (nexusData.hp <= 0) {
      // Nexus destroyed - VICTORY!
      console.log(`[VICTORY] Enemy nexus destroyed!`);

      // Visual explosion
      this.showDeathEffect(nexus.x, nexus.y, 0xffffff, 100);

      // Show victory/defeat message
      const enemyNexus = this.nexuses.find(n => (n as any).nexusData?.team !== this.playerTeam);
      const isVictory = enemyNexus === nexus;

      const message = this.add.text(this.cameras.main.scrollX + 640, this.cameras.main.scrollY + 360,
        isVictory ? 'VICTORY!' : 'DEFEAT', {
        fontSize: '72px',
        color: isVictory ? '#00ff88' : '#ff4444',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }).setOrigin(0.5);

      message.setDepth(2000);

      // Game over after 3 seconds
      this.time.delayedCall(3000, () => {
        this.scene.stop('GameScenePhase3');
        this.scene.start('MenuScene');
      });
    }
  }

  private showDamageNumber(x: number, y: number, damage: number) {
    const color = damage > 0 ? 0xff0000 : 0x00ff00;
    const text = this.add.text(x, y, Math.abs(damage).toString(), {
      fontSize: "20px",
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: "monospace",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });
    text.setDepth(100);
    text.setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }

  private showDeathEffect(x: number, y: number, color: number = 0xff4444, size: number = 30) {
    const effect = this.add.circle(x, y, size, color, 0.8);
    effect.setDepth(100);

    this.tweens.add({
      targets: effect,
      scale: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => effect.destroy(),
    });
  }

  private respawnPlayer() {
    // Respawn at nexus (on diagonal lane)
    const startX = this.playerTeam === this.BLUE_TEAM ? 250 : this.MAP_SIZE - 250;
    const startY = this.playerTeam === this.BLUE_TEAM ? this.MAP_SIZE - 250 : 250;

    this.playerSprite.setPosition(startX, startY);
    this.currentHP = this.playerChampion.maxHp;
    this.currentMana = this.playerChampion.maxMana;
    this.updateHealthManaUI();
  }

  private setupNetworkListeners() {
    network.on("game:input", (data: unknown) => {
      const inputData = data as { playerId: string; input: InputCommand; tick: number };
      console.log("[game] remote input:", inputData);
    });

    network.on("game:state", (data: unknown) => {
      const stateData = data as { tick: number; players: unknown[] };
      stateSync.applyServerState({ players: new Map() }, stateData.tick);
    });
  }

  private gameLoop() {
    stateSync.incrementTick();

    this.tickText.setText(`Tick: ${stateSync.getTick()}`);
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

    if (!this.isTestMode) {
      network.sendInput(this.matchId, input, stateSync.getTick());
    }
  }

  private updateStatsUI() {
    this.goldText.setText(`Gold: ${this.playerGold}`);
    this.levelText.setText(`Level: ${this.playerLevel}`);
    this.scoreText.setText(`K/D/A: ${this.playerKills}/${this.playerDeaths}/${this.playerAssists}`);
  }

  shutdown() {
    this.minionSpawnTimer?.remove();
    this.botSpawnTimer?.remove();
    stateSync.reset();
  }
}
