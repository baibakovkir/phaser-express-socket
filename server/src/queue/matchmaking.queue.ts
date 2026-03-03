import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export interface MatchmakingJobData {
  playerId: string;
  socketId: string;
  mmr: number;
  joinedAt: number;
}

export const matchmakingQueue = new Queue<MatchmakingJobData>(
  "matchmaking",
  { connection: redis },
);
