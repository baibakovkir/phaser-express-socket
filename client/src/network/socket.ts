import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Get token from URL params (passed by web app) or localStorage
function getStoredToken(): string | null {
  try {
    // First, check URL parameters (passed from web app)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      // Store in localStorage for future use
      localStorage.setItem('auth_token', tokenFromUrl);
      // Clean up URL (remove token parameter)
      window.history.replaceState({}, document.title, window.location.pathname);
      return tokenFromUrl;
    }
    
    // Fall back to localStorage
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

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
  private authPromise: Promise<boolean> | null = null;

  constructor() {
    this.socket = io(SERVER_URL, { autoConnect: false });
  }

  async connect(): Promise<boolean> {
    // Try to get token from URL params or localStorage (set by React web app)
    const storedToken = getStoredToken();
    if (storedToken) {
      this.token = storedToken;
    }

    // If no token, we can't authenticate
    if (!this.token) {
      console.log("[network] no token found, not authenticated");
      return false;
    }

    // Return existing promise if already connecting
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = new Promise<boolean>((resolve) => {
      this.socket.connect();

      this.socket.on("connect", () => {
        console.log("[network] connected:", this.socket.id);
        // Authenticate if we have a token
        if (this.token) {
          this.authenticateSocket(this.token, resolve);
        } else {
          resolve(false);
        }
      });

      this.socket.on("connect_error", (error) => {
        console.error("[network] connection error:", error);
        resolve(false);
      });
    });

    return this.authPromise;
  }

  private authenticateSocket(token: string, callback?: (success: boolean) => void) {
    this.socket.emit("auth", { token }, (response: { success: boolean; error?: string; player?: Player }) => {
      if (response.success && response.player) {
        this.player = response.player;
        console.log("[network] socket authenticated as", response.player.username);
        callback?.(true);
      } else {
        console.warn("[network] socket auth failed:", response.error);
        this.token = null;
        this.player = null;
        callback?.(false);
      }
    });
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
