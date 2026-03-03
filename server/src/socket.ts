import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { matchmakingQueue } from "./queue/matchmaking.queue.js";

let io: Server;

export function getIO(): Server {
  return io;
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("queue:join", async (data: { playerId: string }) => {
      console.log(`[queue] player ${data.playerId} joining matchmaking`);
      await matchmakingQueue.add("find-match", {
        playerId: data.playerId,
        socketId: socket.id,
        mmr: 1000,
        joinedAt: Date.now(),
      });
      socket.emit("queue:joined");
    });

    socket.on("queue:leave", async (data: { playerId: string }) => {
      console.log(`[queue] player ${data.playerId} leaving matchmaking`);
      socket.emit("queue:left");
    });

    socket.on("game:input", (data: { matchId: string; input: unknown }) => {
      socket.to(data.matchId).emit("game:input", {
        playerId: socket.id,
        input: data.input,
      });
    });

    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  console.log("[socket] initialized");
}
