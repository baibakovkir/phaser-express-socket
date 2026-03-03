import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:7379";

export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});
