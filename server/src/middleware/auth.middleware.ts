import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../routes/auth.routes.js";

export interface AuthPayload {
  playerId: string;
  username: string;
  mmr?: number;
}

export function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.auth = { playerId: decoded.playerId };
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

export function verifySocketToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}
