import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./routes/auth.routes.js";
import { heroesRoutes } from "./routes/heroes.routes.js";
import { initSocket } from "./socket.js";
import { initMatchmakingWorker } from "./queue/matchmaking.worker.js";
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';

const PORT = parseInt(process.env.PORT || "3000", 10);
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Production JWT_SECRET must contain at least 32 characters');
}

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN || "http://localhost:5173",
    process.env.WEB_ORIGIN || "http://localhost:5174",
  ],
  credentials: true,
}));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await Promise.all([prisma.$queryRaw`SELECT 1`, redis.ping()]);
    res.json({ status: "ok", timestamp: Date.now() });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use("/auth", authRoutes);
app.use("/heroes", heroesRoutes);

if (process.env.NODE_ENV === 'production') {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const game = path.join(root, 'client/dist');
  const site = path.join(root, 'web/dist');
  app.use('/game', express.static(game));
  app.get('/game', (_req, res) => res.redirect(308, '/game/'));
  app.get('/game/*', (_req, res) => res.sendFile(path.join(game, 'index.html')));
  app.use(express.static(site));
  app.get('*', (_req, res) => res.sendFile(path.join(site, 'index.html')));
}

initSocket(httpServer);
initMatchmakingWorker();

httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
