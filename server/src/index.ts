import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { heroesRoutes } from "./routes/heroes.routes.js";
import { initSocket } from "./socket.js";
import { initMatchmakingWorker } from "./queue/matchmaking.worker.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

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

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/auth", authRoutes);
app.use("/heroes", heroesRoutes);

initSocket(httpServer);
initMatchmakingWorker();

httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
