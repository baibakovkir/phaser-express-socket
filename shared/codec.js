import protocol from './generated/protocol.js';

const { Input, Snapshot } = protocol.moba;
const STATUS = { selecting: 0, playing: 1, finished: 2 };
const STATUS_BY_NUMBER = ['selecting', 'playing', 'finished'];
const UNIT_KINDS = ['creep', 'neutral', 'tower', 'barracks', 'throne', 'fountain', 'shrine', 'boss'];

export function encodeInput(input) {
  return Input.encode({
    seq: input.seq,
    dx: input.dx,
    dy: input.dy,
    attack: input.attack,
    cast: input.cast || '',
    targetUnit: input.targetUnitId || 0,
    aimX: input.aimX ?? 0,
    aimY: input.aimY ?? 0,
    aimed: input.aimX !== undefined && input.aimY !== undefined,
  }).finish();
}

export function decodeInput(data) {
  const message = Input.decode(data);
  return {
    seq: message.seq,
    dx: message.dx,
    dy: message.dy,
    attack: message.attack,
    ...(message.cast ? { cast: message.cast } : {}),
    ...(message.targetUnit ? { targetUnitId: message.targetUnit } : {}),
    ...(message.aimed ? { aimX: message.aimX, aimY: message.aimY } : {}),
  };
}

export function encodeSnapshot(snapshot, playerIds) {
  const index = new Map(playerIds.map((id, position) => [id, position]));
  return Snapshot.encode({
    tick: snapshot.tick,
    status: STATUS[snapshot.status],
    winnerTeam: snapshot.winnerTeam || 0,
    players: snapshot.players.map(player => ({
      index: index.get(player.id),
      x: Math.round(player.x),
      y: Math.round(player.y),
      hp: player.hp,
      maxHp: player.maxHp,
      mana: player.mana,
      maxMana: player.maxMana,
      speed: Math.round(player.speed),
      kills: player.kills,
      deaths: player.deaths,
      lastProcessedSeq: player.lastProcessedSeq,
      heroId: player.heroId,
      gold: player.gold,
      goldEarned: player.goldEarned,
      lastHits: player.lastHits,
      assists: player.assists,
      inventory: player.inventory,
      abilityReadyTicks: player.abilityReadyTicks,
    })),
    effects: snapshot.effects.map(effect => ({
      id: effect.id,
      caster: effect.casterId ? (index.get(effect.casterId) ?? -1) + 1 : 0,
      kind: effect.kind,
      x: Math.round(effect.x),
      y: Math.round(effect.y),
      target: effect.targetId ? (index.get(effect.targetId) ?? -1) + 1 : 0,
      tick: effect.tick,
      sourceUnit: effect.sourceUnitId || 0,
      amount: effect.amount || 0,
      abilityKey: effect.abilityKey || '',
      originX: Math.round(effect.originX ?? 0),
      originY: Math.round(effect.originY ?? 0),
      hasOrigin: effect.originX !== undefined && effect.originY !== undefined,
    })),
    units: snapshot.units.map(unit => ({
      id: unit.id,
      kind: UNIT_KINDS.indexOf(unit.kind) + 1,
      team: unit.team,
      lane: unit.lane,
      x: Math.round(unit.x),
      y: Math.round(unit.y),
      hp: unit.hp,
      maxHp: unit.maxHp,
    })),
  }).finish();
}

export function decodeSnapshot(data, matchId, participants) {
  const message = Snapshot.decode(data);
  if (!STATUS_BY_NUMBER[message.status]) throw new Error('Invalid snapshot status');
  return {
    matchId,
    tick: message.tick,
    status: STATUS_BY_NUMBER[message.status],
    ...(message.winnerTeam ? { winnerTeam: message.winnerTeam } : {}),
    players: message.players.map(player => {
      const participant = participants[player.index];
      if (!participant) throw new Error('Invalid snapshot player index');
      return {
        id: participant.playerId,
        username: participant.username,
        team: participant.team,
        heroId: player.heroId,
        x: player.x,
        y: player.y,
        hp: player.hp,
        maxHp: player.maxHp,
        mana: player.mana,
        maxMana: player.maxMana,
        speed: player.speed,
        kills: player.kills,
        deaths: player.deaths,
        gold: player.gold,
        goldEarned: player.goldEarned,
        lastHits: player.lastHits,
        assists: player.assists,
        inventory: player.inventory.map(slot => ({ itemIndex: slot.itemIndex, readyTick: slot.readyTick })),
        abilityReadyTicks: player.abilityReadyTicks,
        lastProcessedSeq: player.lastProcessedSeq,
      };
    }),
    effects: message.effects.map(effect => {
      const caster = effect.caster ? participants[effect.caster - 1] : undefined;
      if (effect.caster && !caster) throw new Error('Invalid effect caster index');
      return {
        id: effect.id,
        ...(caster ? { casterId: caster.playerId } : {}),
        ...(effect.sourceUnit ? { sourceUnitId: effect.sourceUnit } : {}),
        kind: effect.kind,
        x: effect.x,
        y: effect.y,
        ...(effect.target ? { targetId: participants[effect.target - 1]?.playerId } : {}),
        tick: effect.tick,
        ...(effect.amount ? { amount: effect.amount } : {}),
        ...(effect.abilityKey ? { abilityKey: effect.abilityKey } : {}),
        ...(effect.hasOrigin ? { originX: effect.originX, originY: effect.originY } : {}),
      };
    }),
    units: message.units.map(unit => {
      const kind = UNIT_KINDS[unit.kind - 1];
      if (!kind) throw new Error('Invalid unit kind');
      return {
        id: unit.id,
        kind,
        team: unit.team,
        lane: unit.lane,
        x: unit.x,
        y: unit.y,
        hp: unit.hp,
        maxHp: unit.maxHp,
      };
    }),
  };
}
