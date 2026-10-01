export interface GameInput {
  seq: number;
  dx: number;
  dy: number;
  attack: boolean;
  cast?: 'Q' | '1' | '2' | '3';
}

export interface MatchParticipant {
  playerId: string;
  username: string;
  team: 1 | 2;
}

export interface MatchFound {
  matchId: string;
  participants: MatchParticipant[];
  heroes: { id: string; name: string; role: string; color: number }[];
}

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
  lastProcessedSeq: number;
}

export interface WorldEffect {
  id: number;
  casterId: string;
  kind: string;
  x: number;
  y: number;
  targetId?: string;
  tick: number;
}

export interface WorldSnapshot {
  matchId: string;
  tick: number;
  status: 'selecting' | 'playing' | 'finished';
  players: WorldPlayer[];
  effects: WorldEffect[];
  winnerTeam?: 1 | 2;
}
