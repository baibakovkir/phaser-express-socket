import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export interface Player {
  id: string;
  username: string;
  email?: string;
  mmr: number;
}

export interface LobbyPlayer {
  playerId: string;
  username: string;
  mmr: number;
  ready: boolean;
  isHost: boolean;
}

export interface Lobby {
  id: string;
  name: string;
  hostId: string;
  players: LobbyPlayer[];
  isPrivate: boolean;
}

export interface MatchFoundData {
  matchId: string;
  team1: { playerId: string; username: string; mmr: number }[];
  team2: { playerId: string; username: string; mmr: number }[];
}

class NetworkManager {
  private socket: Socket;
  private token: string | null = null;
  private player: Player | null = null;

  constructor() {
    this.socket = io(SERVER_URL, { autoConnect: false });
  }

  connect() {
    this.socket.connect();

    this.socket.on("connect", () => {
      console.log("[network] connected:", this.socket.id);
      // Re-authenticate if we have a token
      if (this.token) {
        this.authenticateSocket(this.token);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("[network] disconnected");
    });
  }

  private authenticateSocket(token: string) {
    this.socket.emit("auth", { token }, (response: { success: boolean; error?: string; player?: Player }) => {
      if (response.success && response.player) {
        this.player = response.player;
        console.log("[network] socket authenticated as", response.player.username);
      } else {
        console.warn("[network] socket auth failed:", response.error);
        this.token = null;
        this.player = null;
      }
    });
  }

  // Authentication
  async register(username: string, email: string, password: string): Promise<{ success: boolean; token?: string; player?: Player; error?: string }> {
    try {
      const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      this.token = data.token;
      this.player = data.player;
      this.authenticateSocket(data.token);
      return { success: true, token: data.token, player: data.player };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; player?: Player; error?: string }> {
    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      this.token = data.token;
      this.player = data.player;
      this.authenticateSocket(data.token);
      return { success: true, token: data.token, player: data.player };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async getCurrentPlayer(): Promise<{ success: boolean; player?: Player; error?: string }> {
    if (!this.token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${SERVER_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${this.token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      this.player = data.player;
      return { success: true, player: data.player };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  // Lobby methods
  createLobby(name: string, isPrivate: boolean = false, password?: string): Promise<{ success: boolean; lobby?: Lobby; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit("lobby:create", { name, isPrivate, password }, (response: { success: boolean; lobby?: Lobby; error?: string }) => {
        resolve(response);
      });
    });
  }

  joinLobby(lobbyId: string, password?: string): Promise<{ success: boolean; lobby?: Lobby; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit("lobby:join", { lobbyId, password }, (response: { success: boolean; lobby?: Lobby; error?: string }) => {
        resolve(response);
      });
    });
  }

  leaveLobby(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit("lobby:leave", (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  }

  setReady(ready: boolean): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit("lobby:ready", { ready }, (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  }

  kickPlayer(targetId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit("lobby:kick", { targetId }, (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  }

  listLobbies(): Promise<{ lobbies: Lobby[] }> {
    return new Promise((resolve) => {
      this.socket.emit("lobby:list", (response: { lobbies: Lobby[] }) => {
        resolve(response);
      });
    });
  }

  // Queue methods
  joinQueue(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.player) {
        resolve({ success: false, error: "Not authenticated" });
        return;
      }
      this.socket.emit("queue:join", { playerId: this.player.id }, (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  }

  leaveQueue(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit("queue:leave", (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  }

  // Game state sync
  sendInput(matchId: string, input: unknown, tick: number) {
    this.socket.emit("game:input", { matchId, input, tick });
  }

  // Event listeners
  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket.off(event, callback);
  }

  // Getters
  getToken(): string | null {
    return this.token;
  }

  getPlayer(): Player | null {
    return this.player;
  }

  getSocketId(): string | undefined {
    return this.socket.id;
  }

  isConnected(): boolean {
    return this.socket.connected;
  }
}

export const network = new NetworkManager();
