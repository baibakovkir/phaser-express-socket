export interface GameState {
  tick: number;
  players: Map<string, PlayerState>;
  minions: Map<string, MinionState>;
  towers: Map<string, TowerState>;
}

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  level: number;
  gold: number;
  team: number;
  heroId: string;
  isDead: boolean;
  respawnTick: number;
}

export interface MinionState {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  team: number;
  type: "melee" | "ranged" | "siege";
  targetX?: number;
  targetY?: number;
}

export interface TowerState {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  team: number;
  tier: number;
}

export interface InputCommand {
  type: "move" | "attack" | "ability";
  x: number;
  y: number;
  targetId?: string;
  abilityId?: string;
  tick: number;
}

class StateSyncManager {
  private gameState: GameState;
  private inputQueue: InputCommand[] = [];
  private processedTick: number = 0;
  private serverTick: number = 0;
  private localTick: number = 0;
  private readonly TICK_RATE = 60; // 60 ticks per second
  private readonly INTERPOLATION_DELAY = 100; // ms

  constructor() {
    this.gameState = {
      tick: 0,
      players: new Map(),
      minions: new Map(),
      towers: new Map(),
    };
  }

  // Initialize local player
  initLocalPlayer(playerId: string, team: number, heroId: string) {
    this.gameState.players.set(playerId, {
      id: playerId,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      gold: 500,
      team,
      heroId,
      isDead: false,
      respawnTick: 0,
    });
  }

  // Add input to queue and send to server
  queueInput(input: InputCommand) {
    input.tick = this.localTick;
    this.inputQueue.push(input);
    return input;
  }

  // Process inputs locally (client-side prediction)
  processLocalInput(input: InputCommand, playerId: string) {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    switch (input.type) {
      case "move":
        player.x = input.x;
        player.y = input.y;
        break;
      case "attack":
        // Handle attack logic
        break;
      case "ability":
        // Handle ability logic
        break;
    }
  }

  // Apply server state (reconciliation)
  applyServerState(state: Partial<GameState>, tick: number) {
    this.serverTick = tick;

    // Update players from server
    if (state.players) {
      for (const [id, serverPlayer] of state.players.entries()) {
        const localPlayer = this.gameState.players.get(id);
        if (localPlayer) {
          // Blend server position with local prediction
          localPlayer.x = serverPlayer.x;
          localPlayer.y = serverPlayer.y;
          localPlayer.hp = serverPlayer.hp;
          localPlayer.mana = serverPlayer.mana;
          localPlayer.level = serverPlayer.level;
          localPlayer.gold = serverPlayer.gold;
          localPlayer.isDead = serverPlayer.isDead;
          localPlayer.respawnTick = serverPlayer.respawnTick;
        } else {
          this.gameState.players.set(id, serverPlayer);
        }
      }
    }

    // Clear processed inputs
    this.inputQueue = this.inputQueue.filter((input) => input.tick > tick);
  }

  // Get current game state
  getState(): GameState {
    return this.gameState;
  }

  // Get player state
  getPlayer(playerId: string): PlayerState | undefined {
    return this.gameState.players.get(playerId);
  }

  // Update tick counters
  incrementTick() {
    this.localTick++;
    this.gameState.tick = this.localTick;
  }

  // Get current tick
  getTick(): number {
    return this.localTick;
  }

  // Get server tick
  getServerTick(): number {
    return this.serverTick;
  }

  // Get input queue
  getInputQueue(): InputCommand[] {
    return this.inputQueue;
  }

  // Clear input queue (after server acknowledgment)
  clearInputQueue(upToTick: number) {
    this.inputQueue = this.inputQueue.filter((input) => input.tick > upToTick);
    this.processedTick = upToTick;
  }

  // Interpolate position for smooth rendering
  interpolatePosition(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    alpha: number,
  ): { x: number; y: number } {
    return {
      x: x1 + (x2 - x1) * alpha,
      y: y1 + (y2 - y1) * alpha,
    };
  }

  // Reset state
  reset() {
    this.gameState = {
      tick: 0,
      players: new Map(),
      minions: new Map(),
      towers: new Map(),
    };
    this.inputQueue = [];
    this.processedTick = 0;
    this.serverTick = 0;
    this.localTick = 0;
  }
}

export const stateSync = new StateSyncManager();
