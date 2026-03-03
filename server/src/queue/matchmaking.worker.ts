import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis.js";
import { getIO } from "../socket.js";
import type { MatchmakingJobData } from "./matchmaking.queue.js";

const TEAM_SIZE = 3;
const MATCH_SIZE = TEAM_SIZE * 2;

const waitingPlayers: MatchmakingJobData[] = [];

export function initMatchmakingWorker() {
  const worker = new Worker<MatchmakingJobData>(
    "matchmaking",
    async (job: Job<MatchmakingJobData>) => {
      const { playerId, socketId, mmr } = job.data;

      const alreadyQueued = waitingPlayers.some(
        (p) => p.playerId === playerId,
      );
      if (alreadyQueued) return;

      waitingPlayers.push({ playerId, socketId, mmr, joinedAt: Date.now() });
      console.log(
        `[matchmaking] ${waitingPlayers.length}/${MATCH_SIZE} players in queue`,
      );

      if (waitingPlayers.length >= MATCH_SIZE) {
        const matchPlayers = waitingPlayers.splice(0, MATCH_SIZE);
        const matchId = `match-${Date.now()}`;

        const io = getIO();
        const team1 = matchPlayers.slice(0, TEAM_SIZE);
        const team2 = matchPlayers.slice(TEAM_SIZE);

        for (const p of matchPlayers) {
          const socket = io.sockets.sockets.get(p.socketId);
          if (socket) {
            socket.join(matchId);
          }
        }

        io.to(matchId).emit("match:found", {
          matchId,
          team1: team1.map((p) => ({ playerId: p.playerId })),
          team2: team2.map((p) => ({ playerId: p.playerId })),
        });

        console.log(`[matchmaking] match created: ${matchId}`);
      }
    },
    { connection: redis },
  );

  worker.on("failed", (job, err) => {
    console.error(`[matchmaking] job ${job?.id} failed:`, err);
  });

  console.log("[matchmaking] worker started");
}
