import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeInput, decodeInput, encodeSnapshot, decodeSnapshot } from '@moba/shared/codec';

test('protobuf round trip keeps authoritative fields in a smaller snapshot', () => {
  const participants = [
    { playerId: 'uuid-blue-player', username: 'Blue', team: 1 },
    { playerId: 'uuid-red-player', username: 'Red', team: 2 },
  ];
  const player = (entry, x) => ({
    id: entry.playerId, username: entry.username, team: entry.team, heroId: 'mage',
    x, y: 250, hp: 320, maxHp: 350, mana: 120, maxMana: 150,
    speed: 330, kills: 1, deaths: 0, lastProcessedSeq: 42,
  });
  const snapshot = {
    matchId: 'match-uuid', tick: 128, status: 'playing',
    players: [player(participants[0], 151), player(participants[1], 1101)],
    effects: [{ id: 1, casterId: participants[0].playerId, kind: 'nova', x: 300, y: 260, targetId: participants[1].playerId, tick: 126 }],
  };
  const bytes = encodeSnapshot(snapshot, participants.map(item => item.playerId));
  assert.ok(bytes.byteLength < Buffer.byteLength(JSON.stringify(snapshot)) / 2);
  assert.deepEqual(decodeSnapshot(bytes, snapshot.matchId, participants), snapshot);
  const input = { seq: 8, dx: -1, dy: 0, attack: true, cast: '1' };
  assert.deepEqual(decodeInput(encodeInput(input)), input);
});
