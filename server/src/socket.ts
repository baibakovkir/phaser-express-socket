import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { matchmakingQueue } from "./queue/matchmaking.queue.js";
import { lobbyManager, LobbyPlayer } from "./lib/lobby.js";
import { verifySocketToken, AuthPayload } from "./middleware/auth.middleware.js";
import { prisma } from "./lib/prisma.js";
import { matchManager } from './match/manager.js';
import { removeQueuedPlayer } from './queue/matchmaking.worker.js';
import type { GameInput } from '@moba/shared';
import { decodeInput } from '@moba/shared/codec';

interface AuthenticatedSocket extends Socket {
  auth?: AuthPayload;
}

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
  matchManager.init(io);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    // Authenticate socket connection
    socket.on("auth", async (data: { token: string }, callback: (response: { success: boolean; error?: string; player?: AuthPayload }) => void) => {
      try {
        const payload = verifySocketToken(data.token);
        if (!payload) {
          return callback({ success: false, error: "Invalid token" });
        }

        // Verify player exists
        const player = await prisma.player.findUnique({
          where: { id: payload.playerId },
          select: { id: true, username: true, mmr: true },
        });

        if (!player) {
          return callback({ success: false, error: "Player not found" });
        }

        socket.auth = { playerId: player.id, username: player.username };
        callback({ success: true, player: { playerId: player.id, username: player.username, mmr: player.mmr } });
      } catch (error) {
        console.error("[socket] auth error:", error);
        callback({ success: false, error: "Authentication failed" });
      }
    });

    // Lobby: Create
    socket.on("lobby:create", async (data: { name: string; isPrivate: boolean; password?: string }, callback: (response: { success: boolean; lobby?: unknown; error?: string }) => void) => {
      if (!socket.auth) {
        return callback({ success: false, error: "Not authenticated" });
      }

      const player = await prisma.player.findUnique({
        where: { id: socket.auth.playerId },
      });

      if (!player) {
        return callback({ success: false, error: "Player not found" });
      }

      // Check if already in a lobby
      const existingLobbyId = lobbyManager.getPlayerLobbyId(player.id);
      if (existingLobbyId) {
        return callback({ success: false, error: "Already in a lobby" });
      }

      const lobbyId = `lobby-${Date.now()}-${socket.id}`;
      const lobbyPlayer: LobbyPlayer = {
        playerId: player.id,
        socketId: socket.id,
        username: player.username,
        mmr: player.mmr,
        ready: false,
        joinedAt: Date.now(),
      };

      const lobby = lobbyManager.createLobby(lobbyId, data.name || `${player.username}'s Lobby`, lobbyPlayer, data.isPrivate, data.password);

      socket.join(lobbyId);
      socket.to(lobbyId).emit("lobby:updated", { lobby: sanitizeLobby(lobby) });

      console.log(`[lobby] created: ${lobbyId} by ${player.username}`);
      callback({ success: true, lobby: sanitizeLobby(lobby) });
    });

    // Lobby: Join
    socket.on("lobby:join", async (data: { lobbyId: string; password?: string }, callback: (response: { success: boolean; lobby?: unknown; error?: string }) => void) => {
      if (!socket.auth) {
        return callback({ success: false, error: "Not authenticated" });
      }

      const player = await prisma.player.findUnique({
        where: { id: socket.auth.playerId },
      });

      if (!player) {
        return callback({ success: false, error: "Player not found" });
      }

      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        return callback({ success: false, error: "Lobby not found" });
      }

      if (lobby.isPrivate && lobby.password !== data.password) {
        return callback({ success: false, error: "Invalid lobby password" });
      }

      const lobbyPlayer: LobbyPlayer = {
        playerId: player.id,
        socketId: socket.id,
        username: player.username,
        mmr: player.mmr,
        ready: false,
        joinedAt: Date.now(),
      };

      const result = lobbyManager.joinLobby(data.lobbyId, lobbyPlayer);
      if (!result.success) {
        return callback({ success: false, error: result.error });
      }

      socket.join(data.lobbyId);
      io.to(data.lobbyId).emit("lobby:updated", { lobby: sanitizeLobby(lobby) });

      console.log(`[lobby] ${player.username} joined: ${data.lobbyId}`);
      callback({ success: true, lobby: sanitizeLobby(lobby) });
    });

    // Lobby: Leave
    socket.on("lobby:leave", (callback: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth) {
        return callback({ success: false, error: "Not authenticated" });
      }

      const result = lobbyManager.leaveLobby(socket.auth.playerId);
      if (result.error) {
        return callback({ success: false, error: result.error });
      }

      if (result.lobby) {
        io.to(result.lobby.id).emit("lobby:updated", { lobby: sanitizeLobby(result.lobby) });
      }

      console.log(`[lobby] player left: ${socket.auth.playerId}`);
      callback({ success: true });
    });

    // Lobby: Set Ready
    socket.on("lobby:ready", (data: { ready: boolean }, callback: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth) {
        return callback({ success: false, error: "Not authenticated" });
      }

      const result = lobbyManager.setPlayerReady(socket.auth.playerId, data.ready);
      if (!result.success) {
        return callback({ success: false, error: result.error });
      }

      const lobbyId = lobbyManager.getPlayerLobbyId(socket.auth.playerId);
      if (lobbyId) {
        const lobby = lobbyManager.getLobby(lobbyId);
        if (lobby) {
          io.to(lobbyId).emit("lobby:updated", { lobby: sanitizeLobby(lobby) });
        }
      }

      callback({ success: true });
    });

    // Lobby: Kick Player
    socket.on("lobby:kick", async (data: { targetId: string }, callback: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth) {
        return callback({ success: false, error: "Not authenticated" });
      }

      const result = lobbyManager.kickPlayer(socket.auth.playerId, data.targetId);
      if (!result.success) {
        return callback({ success: false, error: result.error });
      }

      const lobbyId = lobbyManager.getPlayerLobbyId(socket.auth.playerId);
      if (lobbyId) {
        const lobby = lobbyManager.getLobby(lobbyId);
        if (lobby) {
          io.to(lobbyId).emit("lobby:updated", { lobby: sanitizeLobby(lobby) });
        }

        // Notify kicked player
        const targetSocket = result.socketId ? io.sockets.sockets.get(result.socketId) : undefined;
        if (targetSocket) {
          targetSocket.emit("lobby:kicked");
          targetSocket.leave(lobbyId);
        }
      }

      callback({ success: true });
    });

    // Lobby: List Public Lobbies
    socket.on("lobby:list", (callback: (response: { lobbies: unknown[] }) => void) => {
      const lobbies = lobbyManager.getAllPublicLobbies().map(sanitizeLobby);
      callback({ lobbies });
    });

    socket.on('lobby:start', async (callback: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth) return callback({ success: false, error: 'Not authenticated' });
      const lobbyId = lobbyManager.getPlayerLobbyId(socket.auth.playerId);
      const lobby = lobbyId && lobbyManager.getLobby(lobbyId);
      if (!lobby || lobby.hostId !== socket.auth.playerId) return callback({ success: false, error: 'Only the host can start this lobby' });
      try {
        const result = await matchManager.create(lobby.players.map(player => ({
          playerId: player.playerId,
          username: player.username,
          socketId: player.socketId,
        })));
        if (result.success) lobbyManager.deleteLobby(lobby.id);
        callback({ success: result.success, error: result.error });
      } catch (error) {
        console.error('[lobby] failed to start match', error);
        callback({ success: false, error: 'Failed to start match' });
      }
    });

    socket.on('match:select-hero', (data: { matchId: string; heroId: string }, callback: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth || !data || typeof data.matchId !== 'string' || typeof data.heroId !== 'string') {
        return callback({ success: false, error: 'Invalid selection' });
      }
      const success = matchManager.selectHero(socket.auth.playerId, socket.id, data.matchId, data.heroId);
      callback({ success, ...(!success ? { error: 'Hero selection rejected' } : {}) });
    });

    // Queue: Join (from lobby)
    socket.on("queue:join", async (data: { playerId: string }, callback?: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth) {
        callback?.({ success: false, error: "Not authenticated" });
        return;
      }

      const player = await prisma.player.findUnique({
        where: { id: socket.auth.playerId },
      });

      if (!player) {
        callback?.({ success: false, error: "Player not found" });
        return;
      }

      console.log(`[queue] player ${player.id} joining matchmaking`);
      await matchmakingQueue.add("find-match", {
        playerId: player.id,
        socketId: socket.id,
        mmr: player.mmr,
        username: player.username,
        joinedAt: Date.now(),
      }, { jobId: player.id, removeOnComplete: true, removeOnFail: true });

      socket.emit("queue:joined");
      callback?.({ success: true });
    });

    // Queue: Leave
    socket.on("queue:leave", async (callback: (response: { success: boolean; error?: string }) => void) => {
      if (!socket.auth) {
        return callback({ success: false, error: "Not authenticated" });
      }

      console.log(`[queue] player ${socket.auth.playerId} leaving matchmaking`);
      removeQueuedPlayer(socket.auth.playerId);
      const job = await matchmakingQueue.getJob(socket.auth.playerId);
      if (job) await job.remove().catch(() => undefined);
      socket.emit("queue:left");
      callback({ success: true });
    });

    // Game: Input (for state sync)
    socket.on("game:input", (data: { matchId: string; input: Uint8Array }) => {
      if (!socket.auth || !data || typeof data.matchId !== 'string' || !data.input) return;
      try {
        if (!(data.input instanceof Uint8Array) || data.input.byteLength > 64) return;
        matchManager.input(socket.auth.playerId, socket.id, data.matchId, decodeInput(data.input) as GameInput);
      } catch {
        // Malformed binary input is ignored.
      }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);

      if (socket.auth) {
        matchManager.disconnect(socket.auth.playerId);
        removeQueuedPlayer(socket.auth.playerId);
        void matchmakingQueue.getJob(socket.auth.playerId).then(job => job?.remove()).catch(error => console.error('[queue] cleanup failed', error));
        // Leave any lobby
        const result = lobbyManager.leaveLobby(socket.auth.playerId);
        if (result.lobby) {
          io.to(result.lobby.id).emit("lobby:updated", { lobby: sanitizeLobby(result.lobby) });
        }
      }
    });
  });

  console.log("[socket] initialized");
}

// Remove sensitive data from lobby before sending to clients
function sanitizeLobby(lobby: ReturnType<typeof lobbyManager.getLobby>) {
  if (!lobby) return null;
  return {
    id: lobby.id,
    name: lobby.name,
    hostId: lobby.hostId,
    players: lobby.players.map((p) => ({
      playerId: p.playerId,
      username: p.username,
      mmr: p.mmr,
      ready: p.ready,
      isHost: p.playerId === lobby.hostId,
    })),
    createdAt: lobby.createdAt,
    isPrivate: lobby.isPrivate,
  };
}
