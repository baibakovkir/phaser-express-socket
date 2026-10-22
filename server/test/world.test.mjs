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
  const startY = blue.y;
  world.setInput('blue', { seq: 1, dx: 50, dy: 0, attack: false });
  world.step();
  assert.equal(blue.x, startX);
  world.setInput('blue', { seq: 2, dx: 1, dy: 1, attack: false });
  world.step();
  assert.ok(blue.x - startX < 10);
  assert.ok(blue.y - startY < 10);
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
  assert.ok(world.snapshot().effects.some(effect => effect.kind === 'attack' && effect.casterId === 'blue'));
  red.x = blue.x + 100;
  red.y = blue.y;
  for (let i = 0; i < 24; i++) world.step();
  assert.equal(red.hp, 60);
  world.step();
  assert.equal(red.hp, 60);
  for (let i = 0; i < 23; i++) world.step();
  assert.equal(red.hp, 20);
});

test('lane and jungle spawn on separate clocks, and camps can stack after a pull', () => {
  const world = startedWorld();
  world.tick = 899;
  world.step();
  assert.equal(world.snapshot().units.filter(unit => unit.kind === 'creep').length, 12);
  assert.equal(world.snapshot().units.filter(unit => unit.kind === 'neutral').length, 0);
  world.tick = 1799;
  world.step();
  assert.equal(world.snapshot().units.filter(unit => unit.kind === 'neutral').length, 8);
  const camp = [...world.units.units.values()].filter(unit => unit.kind === 'neutral' && unit.campId === 1);
  for (const neutral of camp) neutral.x += 220;
  world.tick = 3599;
  world.step();
  assert.equal(world.snapshot().units.filter(unit => unit.kind === 'neutral' && unit.x < 1100 && unit.y > 1000).length, 2);
  assert.equal([...world.units.units.values()].filter(unit => unit.kind === 'neutral' && unit.campId === 1).length, 4);
  assert.ok(world.snapshot().units.some(unit => unit.kind === 'boss'));
});

test('neutral aggro follows a player and can be pulled onto a lane creep', () => {
  const world = startedWorld();
  world.tick = 1799;
  world.step();
  const blue = world.players.get('blue');
  const neutral = [...world.units.units.values()].find(unit => unit.kind === 'neutral' && unit.campId === 1);
  const creep = [...world.units.units.values()].find(unit => unit.kind === 'creep' && unit.team === 1);
  blue.x = neutral.x + 90;
  blue.y = neutral.y;
  world.step();
  assert.equal(neutral.aggroPlayerId, 'blue');
  const startX = neutral.x;
  blue.x += 180;
  for (let i = 0; i < 20; i++) world.step();
  assert.ok(neutral.x > startX + 20);
  blue.x = 320;
  blue.y = 1750;
  creep.x = neutral.x + 25;
  creep.y = neutral.y;
  for (let i = 0; i < 40; i++) world.step();
  assert.ok(creep.hp < creep.maxHp);
});

test('tower protects barracks and throne; destroyed throne decides the match', () => {
  const world = startedWorld();
  const units = [...world.units.units.values()];
  const barracks = units.find(unit => unit.kind === 'barracks' && unit.team === 2 && unit.lane === 1);
  const throne = units.find(unit => unit.kind === 'throne' && unit.team === 2);
  assert.equal(world.units.damageUnit(1, barracks.id, 1000, 1), false);
  assert.equal(world.units.damageUnit(1, throne.id, 1800, 1), false);
  for (const tower of units.filter(unit => unit.kind === 'tower' && unit.team === 2 && unit.lane === 1)) {
    assert.equal(world.units.damageUnit(1, tower.id, 650, 1), true);
  }
  assert.equal(world.units.damageUnit(1, barracks.id, 1000, 1), true);
  for (const other of units.filter(unit => unit.kind === 'barracks' && unit.team === 2 && unit.lane === 2)) {
    for (const tower of units.filter(unit => unit.kind === 'tower' && unit.team === 2 && unit.lane === 2)) {
      world.units.damageUnit(1, tower.id, 650, 1);
    }
    world.units.damageUnit(1, other.id, 1000, 1);
  }
  assert.equal(world.units.damageUnit(1, throne.id, 1800, 1), true);
  world.step();
  assert.equal(world.snapshot().status, 'finished');
  assert.equal(world.snapshot().winnerTeam, 1);
});

test('dash stops at server-owned structures', () => {
  const hero = { ...heroes[0], abilities: [{ key: 'Q', cooldown: 1000, manaCost: 0, damage: 0, range: 200 }] };
  const world = new MatchWorld('dash-test', players, [hero]);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  const blue = world.players.get('blue');
  blue.x = 340;
  blue.y = 1210;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: 'Q' });
  world.step();
  assert.ok(blue.x > 340 && blue.x < 390);
  assert.equal(blue.y, 1210);
});

test('database ability costs mana and obeys cooldown and range', () => {
  const abilityHero = {
    id: 'mage', maxHp: 100, maxMana: 100, manaRegen: 0, speed: 300, attack: 10,
    abilities: [{ key: '1', cooldown: 1000, manaCost: 25, damage: 30, range: 200 }],
  };
  const world = new MatchWorld('ability-test', players, [abilityHero]);
  world.selectHero('blue', 'mage');
  world.selectHero('red', 'mage');
  const blue = world.players.get('blue');
  const red = world.players.get('red');
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: '1' });
  world.step();
  assert.equal(red.hp, 100);
  assert.equal(blue.mana, 75);
  assert.equal(world.snapshot().effects.at(-1).kind, 'nova');
  for (let i = 0; i < 30; i++) world.step();
  red.x = blue.x + 100;
  red.y = blue.y;
  world.setInput('blue', { seq: 2, dx: 0, dy: 0, attack: false, cast: '1' });
  world.step();
  assert.equal(red.hp, 70);
  assert.equal(blue.mana, 50);
  world.setInput('blue', { seq: 3, dx: 0, dy: 0, attack: false, cast: '1' });
  world.step();
  assert.equal(red.hp, 70);
  assert.equal(blue.mana, 50);
  assert.equal(world.snapshot().effects.at(-1).kind, 'nova');
});

test('ability damage remains authoritative when both players cast', () => {
  const hero = {
    id: 'fighter', maxHp: 100, maxMana: 100, speed: 300, attack: 10,
    abilities: [{ key: '1', cooldown: 1000, manaCost: 0, damage: 100, range: 200 }],
  };
  const world = new MatchWorld('decisive-test', players, [hero]);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  const blue = world.players.get('blue');
  const red = world.players.get('red');
  red.x = blue.x + 100;
  red.y = blue.y;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: '1' });
  world.setInput('red', { seq: 1, dx: 0, dy: 0, attack: false, cast: '1' });
  world.step();
  assert.equal(world.status, 'playing');
  assert.equal(blue.hp, 100);
  assert.equal(red.hp, 0);
});
