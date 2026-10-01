import assert from 'node:assert/strict';
import test from 'node:test';
import { Worker } from 'node:worker_threads';

test('compiled match worker owns ticks and rejects client coordinates', async () => {
  const worker = new Worker(new URL('../dist/match/match.worker.js', import.meta.url), {
    workerData: {
      matchId: 'worker-test',
      participants: [{ playerId: 'one', username: 'One', team: 1 }],
      heroes: [{ id: 'hero', maxHp: 100, speed: 300, attack: 20 }],
    },
  });

  try {
    const snapshots = [];
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Worker did not produce a playing snapshot')), 3000);
      worker.on('error', reject);
      worker.on('message', message => {
        if (message.type !== 'snapshot') return;
        snapshots.push(message.snapshot);
        if (message.snapshot.status === 'selecting') {
          worker.postMessage({ type: 'select', playerId: 'one', heroId: 'hero' });
          worker.postMessage({ type: 'input', playerId: 'one', input: { seq: 1, dx: 1, dy: 0, attack: false, x: 9999 } });
        }
        if (message.snapshot.tick >= 4) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
    const latest = snapshots.at(-1);
    assert.equal(latest.status, 'playing');
    assert.ok(latest.players[0].x > 120);
    assert.ok(latest.players[0].x < 200);
  } finally {
    await worker.terminate();
  }
});
