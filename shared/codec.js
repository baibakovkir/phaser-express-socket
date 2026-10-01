import protocol from './generated/protocol.js';

const { Input, Snapshot } = protocol.moba;
const STATUS = { selecting: 0, playing: 1, finished: 2 };
const STATUS_BY_NUMBER = ['selecting', 'playing', 'finished'];

export function encodeInput(input) {
  return Input.encode({
    seq: input.seq,
    dx: input.dx,
    dy: input.dy,
    attack: input.attack,
    cast: input.cast || '',
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
    })),
    effects: snapshot.effects.map(effect => ({
      id: effect.id,
      caster: index.get(effect.casterId),
      kind: effect.kind,
      x: Math.round(effect.x),
      y: Math.round(effect.y),
      target: effect.targetId ? (index.get(effect.targetId) ?? -1) + 1 : 0,
      tick: effect.tick,
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
        lastProcessedSeq: player.lastProcessedSeq,
      };
    }),
    effects: message.effects.map(effect => {
      const caster = participants[effect.caster];
      if (!caster) throw new Error('Invalid effect caster index');
      return {
        id: effect.id,
        casterId: caster.playerId,
        kind: effect.kind,
        x: effect.x,
        y: effect.y,
        ...(effect.target ? { targetId: participants[effect.target - 1]?.playerId } : {}),
        tick: effect.tick,
      };
    }),
  };
}
