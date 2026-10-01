export interface GameInput {
  seq: number;
  dx: number;
  dy: number;
  attack: boolean;
}

export interface MatchParticipant {
  playerId: string;
  username: string;
  team: 1 | 2;
}

export interface MatchFound {
  matchId: string;
  participants: MatchParticipant[];
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
  speed: number;
  kills: number;
  deaths: number;
  lastProcessedSeq: number;
}

export interface WorldSnapshot {
  matchId: string;
  tick: number;
  status: 'selecting' | 'playing' | 'finished';
  players: WorldPlayer[];
  winnerTeam?: 1 | 2;
}
