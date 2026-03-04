export interface Player {
  id: string;
  username: string;
  email: string;
  mmr: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  player: Player;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
