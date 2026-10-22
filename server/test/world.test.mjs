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

const itemCatalog = [
  { index: 1, id: 'kunai', name: 'Kunai', description: '', price: 250, stats: { attack: 8 }, components: [], cooldown: 0 },
  { index: 2, id: 'sandals', name: 'Sandals', description: '', price: 250, stats: { speed: 16 }, components: [], cooldown: 0 },
  { index: 3, id: 'moon_blade', name: 'Moon Blade', description: '', price: 1100, stats: { attack: 22, speed: 25 }, components: ['kunai', 'sandals'], cooldown: 0 },
  { index: 4, id: 'healing_charm', name: 'Healing Charm', description: '', price: 1150, stats: { maxHp: 120 }, components: [], activeKind: 'heal', cooldown: 30 },
  { index: 5, id: 'smoke_bell', name: 'Smoke Bell', description: '', price: 1150, stats: { speed: 25 }, components: [], activeKind: 'shield', cooldown: 25 },
];

function itemWorld() {
  const world = new MatchWorld('items', players, heroes, itemCatalog);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  return world;
}

test('only a player last hit awards creep gold; passive income continues during death', () => {
  const world = itemWorld();
  const blue = world.players.get('blue');
  world.tick = 899;
  world.step();
  const first = [...world.units.units.values()].find(unit => unit.kind === 'creep' && unit.team === 2);
  const second = [...world.units.units.values()].find(unit => unit.kind === 'creep' && unit.team === 2 && unit.id !== first.id);
  const before = blue.gold;
  world.units.damageUnit(1, first.id, first.hp, world.tick, blue.id);
  assert.equal(blue.gold, before + 35);
  assert.equal(blue.lastHits, 1);
  world.units.damageUnit(1, second.id, second.hp, world.tick);
  assert.equal(blue.gold, before + 35);
  blue.hp = 0;
  world.tick = 929;
  world.step();
  assert.equal(blue.gold, before + 37);
});

test('fountain purchase consumes components atomically and recalculates passive stats', () => {
  const world = itemWorld();
  const blue = world.players.get('blue');
  assert.equal(world.buyItem('blue', 'kunai').success, true);
  assert.equal(world.buyItem('blue', 'sandals').success, true);
  assert.equal(blue.attack, 48);
  assert.equal(world.buyItem('blue', 'moon_blade').success, false);
  blue.gold = 600;
  assert.equal(world.buyItem('blue', 'moon_blade').success, true);
  assert.deepEqual(blue.inventory.map(slot => slot.itemIndex), [3]);
  assert.equal(blue.attack, 62);
  assert.equal(blue.speed, 325);
  assert.equal(blue.gold, 0);
  blue.x = 1600;
  assert.equal(world.buyItem('blue', 'smoke_bell').success, false);
});

test('active items have server cooldowns and temporary shields', () => {
  const world = itemWorld();
  const blue = world.players.get('blue');
  blue.gold = 1150;
  assert.equal(world.buyItem('blue', 'smoke_bell').success, true);
  assert.equal(world.useItem('blue', 0).success, true);
  assert.equal(blue.itemShield, 130);
  blue.shield = 80;
  assert.equal(world.useItem('blue', 0).success, false);
  world.tick = 149;
  world.step();
  assert.equal(blue.itemShield, 0);
  assert.equal(blue.shield, 80);
  assert.equal(world.useItem('blue', 0).success, false);
  world.tick = 750;
  assert.equal(world.useItem('blue', 0).success, true);
});

test('healing charm chooses the weakest nearby ally', () => {
  const team = [players[0], { playerId: 'green', username: 'Green', team: 1 }, players[1]];
  const world = new MatchWorld('healing', team, heroes, itemCatalog);
  for (const member of team) world.selectHero(member.playerId, 'fighter');
  const blue = world.players.get('blue');
  const green = world.players.get('green');
  blue.gold = 1150;
  assert.equal(world.buyItem('blue', 'healing_charm').success, true);
  green.x = blue.x + 50;
  green.y = blue.y;
  blue.hp = 100;
  green.hp = 20;
  assert.equal(world.useItem('blue', 0).success, true);
  assert.equal(green.hp, green.maxHp);
  assert.equal(blue.hp, 100);
});

test('assisting a hero kill awards gold once', () => {
  const team = [players[0], { playerId: 'green', username: 'Green', team: 1 }, players[1]];
  const world = new MatchWorld('assists', team, heroes);
  for (const member of team) world.selectHero(member.playerId, 'fighter');
  world.units.units.clear();
  const blue = world.players.get('blue');
  const green = world.players.get('green');
  const red = world.players.get('red');
  blue.x = green.x = 1000;
  blue.y = green.y = 1000;
  red.x = 1100;
  red.y = 1000;
  red.hp = 70;
  world.step();
  assert.equal(red.hp, 0);
  assert.equal(blue.assists, 1);
  assert.equal(blue.goldEarned, 60);
  assert.equal(green.kills, 1);
  assert.equal(green.goldEarned, 180);
});

test('allied fountain restores health and mana', () => {
  const world = new MatchWorld('fountain', players, [{ ...heroes[0], maxMana: 100, hpRegen: 0, manaRegen: 0 }]);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  const blue = world.players.get('blue');
  blue.hp = 50;
  blue.mana = 0;
  for (let index = 0; index < 30; index++) world.step();
  assert.ok(blue.hp >= 64.9);
  assert.ok(blue.mana >= 19.9);
});

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
  assert.equal(world.snapshot().units.filter(unit => unit.kind === 'neutral').length, 10);
  const camp = [...world.units.units.values()].filter(unit => unit.kind === 'neutral' && unit.campId === 1);
  for (const neutral of camp) neutral.x += 220;
  world.tick = 3599;
  world.step();
  assert.equal(world.snapshot().units.filter(unit => unit.kind === 'neutral' && unit.x < 850 && unit.y > 500 && unit.y < 700).length, 2);
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

test('neutral leash returns the unit home instead of chasing across the map', () => {
  const world = startedWorld();
  world.tick = 1799;
  world.step();
  const blue = world.players.get('blue');
  const neutral = [...world.units.units.values()].find(unit => unit.kind === 'neutral' && unit.campId === 1);
  const homeX = neutral.homeX;
  blue.x = homeX + 90;
  blue.y = neutral.y;
  world.step();
  blue.x = homeX + 550;
  let farthest = neutral.x;
  for (let i = 0; i < 300; i++) {
    world.step();
    farthest = Math.max(farthest, neutral.x);
  }
  assert.ok(farthest <= homeX + 365);
  assert.ok(Math.abs(neutral.x - homeX) < 10);
  assert.equal(neutral.returning, false);
});

test('automatic attacks prioritize a selected creep for last hits', () => {
  const world = startedWorld();
  world.tick = 899;
  world.step();
  const blue = world.players.get('blue');
  const creeps = [...world.units.units.values()].filter(unit => unit.kind === 'creep' && unit.team === 2);
  const [near, selected] = creeps;
  near.x = blue.x + 75;
  near.y = blue.y;
  selected.x = blue.x + 110;
  selected.y = blue.y;
  selected.hp = 40;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, targetUnitId: selected.id });
  world.step();
  assert.equal(world.units.units.has(selected.id), false);
  assert.equal(near.hp, near.maxHp);
});

test('creeps keep a wide formation while moving along a lane', () => {
  const world = startedWorld();
  world.tick = 899;
  world.step();
  const formation = [...world.units.units.values()].filter(unit => unit.kind === 'creep' && unit.team === 2 && unit.lane === 2);
  assert.equal(formation.length, 3);
  for (let i = 0; i < 45; i++) world.step();
  assert.ok(Math.hypot(formation[0].x - formation[1].x, formation[0].y - formation[1].y) > 30);
  assert.ok(Math.hypot(formation[1].x - formation[2].x, formation[1].y - formation[2].y) > 30);
});

test('a selected creep takes priority for an aimed spell', () => {
  const hero = { ...heroes[0], maxMana: 100,
    abilities: [{ key: '1', cooldown: 1000, manaCost: 10, damage: 60, range: 120 }] };
  const world = new MatchWorld('aim-test', players, [hero]);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  world.tick = 899;
  world.step();
  const blue = world.players.get('blue');
  const [near, selected] = [...world.units.units.values()].filter(unit => unit.kind === 'creep' && unit.team === 2);
  near.x = blue.x + 65;
  near.y = blue.y;
  selected.x = blue.x + 105;
  selected.y = blue.y;
  const aimedX = selected.x;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: '1', targetUnitId: selected.id });
  world.step();
  assert.ok(selected.hp < selected.maxHp);
  assert.equal(near.hp, near.maxHp);
  assert.equal(world.snapshot().effects.find(effect => effect.kind === 'strike')?.x, aimedX);
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
  const tower = [...world.units.units.values()].find(unit => unit.kind === 'tower' && unit.team === 1 && unit.lane === 1);
  blue.x = tower.x - 90;
  blue.y = tower.y;
  const startX = blue.x;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: 'Q' });
  world.step();
  assert.ok(blue.x > startX && blue.x < tower.x - 48);
  assert.equal(blue.y, tower.y);
});

test('Q pressed while dead is ignored and works after respawn', () => {
  const hero = { ...heroes[0], maxMana: 100, abilities: [{ key: 'Q', cooldown: 1000, manaCost: 10, damage: 0, range: 200 }] };
  const world = new MatchWorld('respawn-cast', players, [hero]);
  world.selectHero('blue', 'fighter');
  world.selectHero('red', 'fighter');
  const blue = world.players.get('blue');
  blue.hp = 0;
  blue.respawnTick = 2;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: 'Q' });
  world.step();
  assert.equal(blue.hp, 0);
  world.step();
  assert.equal(blue.hp, blue.maxHp);
  assert.equal(blue.mana, 100);
  world.setInput('blue', { seq: 2, dx: 0, dy: 0, attack: false, cast: 'Q' });
  world.step();
  assert.equal(blue.mana, 90);
  assert.ok(blue.x > 320);
  assert.ok(world.snapshot().effects.some(effect => effect.kind === 'dash' && effect.casterId === 'blue'));
});

test('database ability costs mana and obeys cooldown and range', () => {
  const abilityHero = {
    id: 'mage', maxHp: 100, maxMana: 100, manaRegen: 0, speed: 300, attack: 10,
    abilities: [{ key: '1', cooldown: 1000, manaCost: 25, damage: 30, range: 200 }],
  };
  const world = new MatchWorld('ability-test', players, [abilityHero]);
  world.selectHero('blue', 'mage');
  world.selectHero('red', 'mage');
  world.units.units.clear();
  const blue = world.players.get('blue');
  const red = world.players.get('red');
  blue.x = 1000;
  blue.y = 1000;
  blue.nextAttackTick = 1000;
  world.setInput('blue', { seq: 1, dx: 0, dy: 0, attack: false, cast: '1' });
  world.step();
  assert.equal(red.hp, 100);
  assert.equal(blue.mana, 75);
  assert.equal(world.snapshot().effects.at(-1).kind, 'nova');
  for (let i = 0; i < 30; i++) world.step();
  red.x = blue.x + 180;
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


test('duplicate lifesteal items stack and item slots have independent cooldowns', () => {
  const catalog = [
    { index: 1, id: 'blood', name: 'Blood', description: '', price: 100, stats: { lifesteal: 0.25 }, components: [], cooldown: 0 },
    { index: 2, id: 'leaf', name: 'Leaf', description: '', price: 100, stats: {}, components: [], activeKind: 'heal', cooldown: 30 },
  ];
  const world = new MatchWorld('stack', players, heroes, catalog);
  world.selectHero('blue', 'fighter'); world.selectHero('red', 'fighter');
  const blue = world.players.get('blue');
  for (const id of ['blood', 'blood', 'leaf', 'leaf']) assert.equal(world.buyItem('blue', id).success, true);
  assert.equal(blue.lifesteal, 0.5);
  assert.equal(world.useItem('blue', 2).success, true);
  assert.equal(world.useItem('blue', 2).success, false);
  assert.equal(world.useItem('blue', 3).success, true);
  world.units.units.clear();
  const red = world.players.get('red');
  blue.x = 1000; blue.y = 1000; red.x = 1080; red.y = 1000;
  blue.hp = 40; red.hp = 100; red.nextAttackTick = 1000;
  world.step();
  assert.equal(red.hp, 60);
  assert.equal(blue.hp, 60);
});

test('last stand stops respawns, elimination wins, and 30:00 is a draw when both survive', () => {
  const world = startedWorld();
  const blue = world.players.get('blue');
  const red = world.players.get('red');
  blue.hp = 0; blue.respawnTick = 45001;
  world.tick = 15 * 60 * 30 - 1;
  world.step();
  assert.equal(blue.hp, 0);
  assert.equal(world.status, 'finished');
  assert.equal(world.winnerTeam, 2);
  const draw = startedWorld();
  draw.tick = 30 * 60 * 30 - 1;
  draw.step();
  assert.equal(draw.status, 'finished');
  assert.equal(draw.winnerTeam, undefined);
});
