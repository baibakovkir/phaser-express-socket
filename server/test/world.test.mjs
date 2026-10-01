import assert from 'node:assert/strict';
import test from 'node:test';
import { MatchWorld } from '../dist/match/world.js';

const players = [
  { playerId: 'blue', username: 'Blue', team: 1 },
  { playerId: 'red', username: 'Red', team: 2 },
];
const heroes = [{ id: 'fighter', maxHp: 100, speed: 300, attack: 40 }];

function startedWorld() {
  const world = new MatchWorld('test', players, heroes);
  assert.equal(world.selectHero('blue', 'fighter'), true);
  assert.equal(world.selectHero('red', 'fighter'), true);
  assert.equal(world.status, 'playing');
  return world;
}

test('movement is bounded by server speed and rejects forged input', () => {
  const world = startedWorld();
  const blue = world.players.get('blue');
  const startX = blue.x;
  world.setInput('blue', { seq: 1, dx: 50, dy: 0, attack: false });
  world.step();
  assert.equal(blue.x, startX);
  world.setInput('blue', { seq: 2, dx: 1, dy: 1, attack: false });
  world.step();
  assert.ok(blue.x - startX < 10);
  assert.ok(blue.y - 250 < 10);
  assert.equal(blue.lastProcessedSeq, 2);
  world.setInput('blue', { seq: 1, dx: -1, dy: 0, attack: false });
  world.step();
  assert.ok(blue.x > startX);
});

test('only server-calculated range and cooldown can apply damage', () => {
  const world = startedWorld();
  const blue = world.players.get('blue');
  const red = world.players.get('red');
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: true });
  world.step();
  assert.equal(red.hp, 100);
  red.x = blue.x + 100;
  world.step();
  assert.equal(red.hp, 60);
  world.step();
  assert.equal(red.hp, 60);
  for (let i = 0; i < 23; i++) world.step();
  assert.equal(red.hp, 20);
});

test('server declares the winner after five kills', () => {
  const world = new MatchWorld('finish-test', players, [{ ...heroes[0], attack: 100 }]);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  const blue = world.players.get('blue');
  const red = world.players.get('red');
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: true });
  for (let kill = 1; kill <= 5; kill++) {
    red.x = blue.x + 100;
    red.y = blue.y;
    for (let ticks = 0; ticks < 151 && red.hp > 0; ticks++) world.step();
    assert.equal(red.hp, 0);
    assert.equal(blue.kills, kill);
    if (kill < 5) {
      while (red.hp === 0) world.step();
    }
  }
  assert.equal(world.snapshot().status, 'finished');
  assert.equal(world.snapshot().winnerTeam, 1);
});
