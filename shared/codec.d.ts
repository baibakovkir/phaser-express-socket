import type { GameInput, MatchParticipant, WorldSnapshot } from './index.js';

export function encodeInput(input: GameInput): Uint8Array;
export function decodeInput(data: Uint8Array): GameInput;
export function encodeSnapshot(snapshot: WorldSnapshot, playerIds: string[]): Uint8Array;
export function decodeSnapshot(data: Uint8Array, matchId: string, participants: MatchParticipant[]): WorldSnapshot;
