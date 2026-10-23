export interface GameInput {
  seq: number;
  dx: number;
  dy: number;
  attack: boolean;
  cast?: 'Q' | '1' | '2' | '3';
  aimX?: number;
  aimY?: number;
  targetUnitId?: number;
}

export interface MatchParticipant {
  playerId: string;
  username: string;
  team: 1 | 2;
}

export interface MatchFound {
  matchId: string;
  participants: MatchParticipant[];
  heroes: { id: string; name: string; role: string; color: number;
    abilities: { key: 'Q' | '1' | '2' | '3'; name: string; manaCost: number; cooldown: number; range: number }[] }[];
  items: ItemDefinition[];
}

export interface ItemDefinition {
  index: number;
  id: string;
  name: string;
  description: string;
  price: number;
  stats: { attack?: number; maxHp?: number; maxMana?: number; speed?: number; hpRegen?: number; manaRegen?: number; lifesteal?: number };
  components: string[];
  activeKind?: 'heal' | 'shield';
  cooldown: number;
}

export interface InventorySlot { itemIndex: number; readyTick: number }

export interface WorldPlayer {
  id: string;
  username: string;
  team: 1 | 2;
  heroId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  speed: number;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  goldEarned: number;
  lastHits: number;
  inventory: InventorySlot[];
  abilityReadyTicks: number[];
  lastProcessedSeq: number;
}

export interface WorldEffect {
  id: number;
  casterId?: string;
  sourceUnitId?: number;
  kind: string;
  x: number;
  y: number;
  targetId?: string;
  tick: number;
  amount?: number;
}

export type UnitKind = 'creep' | 'neutral' | 'tower' | 'barracks' | 'throne' | 'fountain' | 'shrine' | 'boss';

export interface WorldUnit {
  id: number;
  kind: UnitKind;
  team: 0 | 1 | 2;
  lane: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export interface WorldSnapshot {
  matchId: string;
  tick: number;
  status: 'selecting' | 'playing' | 'finished';
  players: WorldPlayer[];
  units: WorldUnit[];
  effects: WorldEffect[];
  winnerTeam?: 1 | 2;
}
