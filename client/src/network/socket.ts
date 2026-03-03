import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

class NetworkManager {
  private socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL, { autoConnect: false });
  }

  connect() {
    this.socket.connect();

    this.socket.on("connect", () => {
      console.log("[network] connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("[network] disconnected");
    });
  }

  joinQueue(playerId: string) {
    this.socket.emit("queue:join", { playerId });
  }

  leaveQueue(playerId: string) {
    this.socket.emit("queue:leave", { playerId });
  }

  sendInput(matchId: string, input: unknown) {
    this.socket.emit("game:input", { matchId, input });
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket.off(event, callback);
  }

  get id() {
    return this.socket.id;
  }
}

export const network = new NetworkManager();
