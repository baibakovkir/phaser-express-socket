import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

interface AuthRequest {
  playerId?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthRequest;
    }
  }
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await prisma.player.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const player = await prisma.player.create({
      data: {
        username,
        email,
        passwordHash,
        mmr: 1000,
      },
    });

    const token = jwt.sign({ playerId: player.id, username: player.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
        mmr: player.mmr,
      },
    });
  } catch (error) {
    console.error("[auth] register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, player.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ playerId: player.id, username: player.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
        mmr: player.mmr,
      },
    });
  } catch (error) {
    console.error("[auth] login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string };

    const player = await prisma.player.findUnique({
      where: { id: decoded.playerId },
      select: {
        id: true,
        username: true,
        email: true,
        mmr: true,
        createdAt: true,
      },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json({ player });
  } catch (error) {
    console.error("[auth] me error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export { router as authRoutes, JWT_SECRET };
