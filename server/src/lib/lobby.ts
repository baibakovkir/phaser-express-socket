export interface LobbyPlayer {
  playerId: string;
  socketId: string;
  username: string;
  mmr: number;
  ready: boolean;
  joinedAt: number;
}

export interface Lobby {
  id: string;
  name: string;
  hostId: string;
  players: LobbyPlayer[];
  createdAt: number;
  isPrivate: boolean;
  password?: string;
}

class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerLobbies: Map<string, string> = new Map(); // playerId -> lobbyId

  createLobby(
    id: string,
    name: string,
    hostPlayer: LobbyPlayer,
    isPrivate: boolean,
    password?: string,
  ): Lobby {
    const lobby: Lobby = {
      id,
      name,
      hostId: hostPlayer.playerId,
      players: [hostPlayer],
      createdAt: Date.now(),
      isPrivate,
      password,
    };

    this.lobbies.set(id, lobby);
    this.playerLobbies.set(hostPlayer.playerId, id);

    return lobby;
  }

  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  getAllPublicLobbies(): Lobby[] {
    return Array.from(this.lobbies.values()).filter((lobby) => !lobby.isPrivate);
  }

  joinLobby(lobbyId: string, player: LobbyPlayer): { success: boolean; error?: string } {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }

    if (lobby.players.length >= 6) {
      return { success: false, error: "Lobby is full" };
    }

    if (lobby.players.some((p) => p.playerId === player.playerId)) {
      return { success: false, error: "Already in lobby" };
    }

    lobby.players.push(player);
    this.playerLobbies.set(player.playerId, lobbyId);

    return { success: true };
  }

  leaveLobby(playerId: string): { lobby?: Lobby; error?: string } {
    const lobbyId = this.playerLobbies.get(playerId);

    if (!lobbyId) {
      return { error: "Player not in any lobby" };
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      this.playerLobbies.delete(playerId);
      return { error: "Lobby not found" };
    }

    lobby.players = lobby.players.filter((p) => p.playerId !== playerId);
    this.playerLobbies.delete(playerId);

    // If host left, transfer host or delete lobby
    if (lobby.hostId === playerId) {
      if (lobby.players.length > 0) {
        lobby.hostId = lobby.players[0].playerId;
      } else {
        this.lobbies.delete(lobbyId);
      }
    }

    // Delete empty lobby
    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId);
    }

    return { lobby };
  }

  setPlayerReady(playerId: string, ready: boolean): { success: boolean; error?: string } {
    const lobbyId = this.playerLobbies.get(playerId);
    if (!lobbyId) {
      return { success: false, error: "Player not in any lobby" };
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }

    const player = lobby.players.find((p) => p.playerId === playerId);
    if (!player) {
      return { success: false, error: "Player not found in lobby" };
    }

    player.ready = ready;
    return { success: true };
  }

  kickPlayer(kickerId: string, targetId: string): { success: boolean; error?: string } {
    const lobbyId = this.playerLobbies.get(kickerId);
    if (!lobbyId) {
      return { success: false, error: "Kicker not in any lobby" };
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }

    if (lobby.hostId !== kickerId) {
      return { success: false, error: "Only host can kick players" };
    }

    const targetPlayer = lobby.players.find((p) => p.playerId === targetId);
    if (!targetPlayer) {
      return { success: false, error: "Target player not found" };
    }

    lobby.players = lobby.players.filter((p) => p.playerId !== targetId);
    this.playerLobbies.delete(targetId);

    return { success: true };
  }

  deleteLobby(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      for (const player of lobby.players) {
        this.playerLobbies.delete(player.playerId);
      }
      this.lobbies.delete(lobbyId);
    }
  }

  getPlayerLobbyId(playerId: string): string | undefined {
    return this.playerLobbies.get(playerId);
  }

  getAllPlayersInLobby(lobbyId: string): LobbyPlayer[] {
    const lobby = this.lobbies.get(lobbyId);
    return lobby ? lobby.players : [];
  }
}

export const lobbyManager = new LobbyManager();
