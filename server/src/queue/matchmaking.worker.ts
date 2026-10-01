import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis.js";
import { matchManager } from '../match/manager.js';
import type { MatchmakingJobData } from "./matchmaking.queue.js";

const TEAM_SIZE = 3;
const MATCH_SIZE = TEAM_SIZE * 2;
const MMR_RANGE = 300; // Max MMR difference for fair matching

interface QueuedPlayer extends MatchmakingJobData {
  attempts: number;
}

const waitingPlayers: QueuedPlayer[] = [];
let formingMatch = false;

export function removeQueuedPlayer(playerId: string): void {
  const index = waitingPlayers.findIndex(player => player.playerId === playerId);
  if (index !== -1) waitingPlayers.splice(index, 1);
}

export function initMatchmakingWorker() {
  const worker = new Worker<MatchmakingJobData>(
    "matchmaking",
    async (job: Job<MatchmakingJobData>) => {
      const { playerId, socketId, mmr, username } = job.data;

      // Check if already queued
      const alreadyQueued = waitingPlayers.some((p) => p.playerId === playerId);
      if (alreadyQueued) {
        console.log(`[matchmaking] player ${playerId} already in queue`);
        return;
      }

      waitingPlayers.push({ playerId, socketId, mmr, username, joinedAt: Date.now(), attempts: 0 });
      console.log(
        `[matchmaking] ${waitingPlayers.length}/${MATCH_SIZE} players in queue`,
      );

      if (waitingPlayers.length >= MATCH_SIZE) {
        tryFormMatch();
      }
    },
    { connection: redis },
  );

  worker.on("failed", (job, err) => {
    console.error(`[matchmaking] job ${job?.id} failed:`, err);
  });

  // Try to form matches periodically
  setInterval(tryFormMatch, 2000);

  console.log("[matchmaking] worker started");
}

function tryFormMatch() {
  if (formingMatch || waitingPlayers.length < MATCH_SIZE) return;

  // Sort by MMR for better matching
  waitingPlayers.sort((a, b) => a.mmr - b.mmr);

  // Try to find 6 players with similar MMR
  const basePlayer = waitingPlayers[0];
  const matchCandidates: QueuedPlayer[] = [basePlayer];

  for (let i = 1; i < waitingPlayers.length && matchCandidates.length < MATCH_SIZE; i++) {
    const player = waitingPlayers[i];
    const avgMmr = matchCandidates.reduce((sum, p) => sum + p.mmr, 0) / matchCandidates.length;
    
    // Allow wider MMR range as wait time increases
    const maxMmrDiff = MMR_RANGE + (player.attempts * 50);
    
    if (Math.abs(player.mmr - avgMmr) <= maxMmrDiff) {
      matchCandidates.push(player);
    }
  }

  if (matchCandidates.length === MATCH_SIZE) {
    formingMatch = true;
    void formMatch(matchCandidates).finally(() => { formingMatch = false; });
  } else {
    // Increase attempt counter for all waiting players
    for (const player of waitingPlayers) {
      player.attempts++;
    }
  }
}

async function formMatch(players: QueuedPlayer[]) {

  // Split into two teams based on MMR (balanced)
  const sorted = [...players].sort((a, b) => a.mmr - b.mmr);
  const team1 = [sorted[0], sorted[3], sorted[4]]; // Lower MMR + mid
  const team2 = [sorted[1], sorted[2], sorted[5]]; // Higher MMR + mid

  const balanced = team1.flatMap((p, i) => [p, team2[i]]);
  let result;
  try {
    result = await matchManager.create(
      balanced.map(p => ({ playerId: p.playerId, username: p.username, socketId: p.socketId })),
      () => players.every(player => waitingPlayers.some(waiting => waiting.playerId === player.playerId && waiting.socketId === player.socketId)),
    );
  } catch (error) {
    console.error('[matchmaking] match creation failed:', error);
    return;
  }
  if (!result.success) {
    console.error('[matchmaking] match creation failed:', result.error);
    return;
  }

  // Remove matched players from queue
  const matchedIds = new Set(players.map((p) => p.playerId));
  const remainingPlayers = waitingPlayers.filter((p) => !matchedIds.has(p.playerId));
  waitingPlayers.length = 0;
  waitingPlayers.push(...remainingPlayers);

  console.log(`[matchmaking] match created: ${result.matchId} with ${players.length} players`);
}
