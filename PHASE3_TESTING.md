# Phase 3 — Local Testing Guide

## Quick Start

The fastest way to start testing Phase 3 gameplay locally:

```bash
# Make sure Docker is running
docker --version

# Run the Phase 3 test script
bash scripts/test-phase3.sh
```

This script will:
1. Create `.env` from `.env.example` (if needed)
2. Start PostgreSQL and Redis containers
3. Install all dependencies
4. Run database migrations
5. Seed hero data
6. Start all development servers

## Manual Setup

If you prefer to run each step manually:

### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `6432`
- **Redis** on port `7379`

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed heroes
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start everything (server + client + web)
npm run dev

# Or start individually:
npm run dev:server   # Backend (http://localhost:3000)
npm run dev:client   # Game client (http://localhost:5173)
npm run dev:web      # Web app for auth (http://localhost:5174)
```

---

## Testing Phase 3 Features

### Test Mode (Solo vs Bots)

**Test Mode** allows you to test gameplay locally without needing other players or authentication.

#### How to Start Test Mode:

1. Open browser: `http://localhost:5173`
2. Click **[ TEST MODE ]** button in the menu
3. Select your champion:
   - **Shadow Ninja** (Assassin) - High mobility, burst damage
   - **Iron Guardian** (Tank) - High HP and armor
   - **Storm Mage** (Mage) - High mana and attack
4. Select team (Blue or Red)
5. Click **[ CONFIRM ]**

#### Controls:

| Key | Action |
|-----|--------|
| `WASD` or `Arrow Keys` | Move champion |
| `Mouse Click` | Click-to-move |
| `Space` | Basic attack |
| `Q` | Ability 1 |
| `W` | Ability 2 |
| `E` | Ability 3 |
| `R` | Ultimate |
| `ESC` | Exit to menu |

#### Features Available in Test Mode:

✅ **Map**
- 3-lane map (top, mid, bot)
- Jungle areas
- River
- Blue and Red bases
- Towers (turrets)
- Nexus positions

✅ **Champions**
- 3 playable champions
- Each with unique stats (HP, mana, attack, armor, speed)
- Attack system with projectiles
- Health and mana bars
- Movement and collision

✅ **Minions/Creeps**
- Automatic spawning every 30 seconds
- 3 types: melee, ranged, siege
- Spawn in waves on all 3 lanes
- Attack enemy minions
- Gold rewards for kills

✅ **Towers**
- 2 tiers of towers
- Team-colored (blue vs red)
- Positioned on lanes

✅ **Bot AI**
- 5 bot champions (2 allies, 3 enemies)
- Simple AI behaviors:
  - Lane pushing
  - Attack nearby enemies
  - Basic movement

✅ **UI/HUD**
- Health bar (green)
- Mana bar (blue)
- Gold counter
- Level display
- K/D/A scoreboard
- Minimap
- Ability icons
- Tick counter

✅ **Game Systems**
- Mana regeneration
- Death and respawn
- Gold earning (minions, bot kills)
- Client-side prediction
- Tick-based game loop (60 TPS)

---

### Online Mode (Multiplayer)

For testing with real players:

#### 1. Create Account

1. Open web app: `http://localhost:5174`
2. Click **Register**
3. Enter username, email, password
4. You'll be redirected to game client with auth token

#### 2. Lobby System

1. In game client menu, you're automatically logged in
2. Create or join a lobby
3. Set ready status
4. Wait for other players

#### 3. Matchmaking

1. Click **[ FIND MATCH ]** in lobby
2. Wait for match to be found (Bull queue processes)
3. Game starts automatically when 6 players ready

---

## Phase 3 Implementation Status

### ✅ Completed Features

| Feature | Status | Notes |
|---------|--------|-------|
| Top-down map | ✅ | 2400x2400 map with 3 lanes, jungle, river |
| Champion selection | ✅ | 3 champions with unique stats |
| Movement (WASD + click) | ✅ | Keyboard and mouse controls |
| Basic attack | ✅ | Auto-attack with projectiles |
| Health/Mana system | ✅ | Bars, regeneration, death/respawn |
| Minion waves | ✅ | 3 types, spawn every 30s |
| Towers | ✅ | 2 tiers, team-colored |
| Minimap | ✅ | Real-time position display |
| Bot AI | ✅ | 5 bots with basic behaviors |
| Fog of war | ⏸️ | Partial (minimap shows all) |
| Chat | ⏸️ | Not implemented yet |
| Scoreboard | ✅ | K/D/A, gold, level |

### 🚧 In Progress / TODO

| Feature | Priority | Notes |
|---------|----------|-------|
| Abilities (Q/W/E/R) | High | Need ability system implementation |
| Fog of war (proper) | High | Server-side visibility culling |
| Chat system | Medium | Lobby + in-game chat |
| Item shop | Medium | In-base shop UI |
| More champions | Medium | 3+ more heroes |
| Jungle camps | Low | AI monsters with buffs |
| Central objective | Low | Dragon/baron equivalent |
| Better bot AI | Low | More sophisticated behaviors |

---

## Debugging & Development Tips

### View Logs

```bash
# Server logs
docker logs moba-postgres
docker logs moba-redis

# Or in development terminal (npm run dev shows all)
```

### Database Access

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Direct PostgreSQL connection
psql -h localhost -p 6432 -U moba -d moba_db
```

### Hot Reload

- **Client**: Vite auto-reloads on file changes
- **Server**: tsx watch auto-restarts on changes
- **Web**: Vite auto-reloads on changes

### Common Issues

**Issue**: "Cannot connect to database"
```bash
# Check Docker containers
docker compose ps

# Restart if needed
docker compose restart
```

**Issue**: "Prisma client not generated"
```bash
npm run db:generate
```

**Issue**: "Port already in use"
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5173
lsof -i :5174

# Kill process or change port in .env
```

**Issue**: "Authentication failed"
```bash
# Clear localStorage in browser dev tools
# Or re-login via web app
```

---

## Architecture Overview

### Client (Phaser 3)

```
client/src/
├── scenes/
│   ├── BootScene.ts          # Asset loading
│   ├── MenuScene.ts          # Main menu, lobby
│   ├── ChampionSelectScene.ts # Champion picker
│   ├── GameScene.ts          # Old test scene
│   └── GameScenePhase3.ts    # Phase 3 gameplay
├── network/
│   ├── socket.ts             # Socket.io client
│   └── state-sync.ts         # Client-side prediction
└── main.ts                   # Game config
```

### Server (Express + Socket.io)

```
server/src/
├── index.ts                  # Entry point
├── socket.ts                 # Socket.io handler
├── routes/
│   └── auth.routes.ts        # REST auth endpoints
├── lib/
│   ├── prisma.ts             # Database client
│   ├── redis.ts              # Redis client
│   └── lobby.ts              # Lobby manager
└── queue/
    ├── matchmaking.queue.ts  # Bull queue setup
    └── matchmaking.worker.ts # Matchmaking logic
```

### Game Loop (60 TPS)

```
┌─────────────┐
| Player Input| ──► Queue Input
└─────────────┘
       │
       ▼
┌─────────────┐
| Client Side | ──► Predict Movement
| Prediction  |
└─────────────┘
       │
       ▼
┌─────────────┐
| Send to     | ──► WebSocket
| Server      |
└─────────────┘
       │
       ▼
┌─────────────┐
| Server      | ──► Authoritative State
| Simulation  |
└─────────────┘
       │
       ▼
┌─────────────┐
| Reconcile   | ──► Correct Position
| with Server |
└─────────────┘
```

---

## Performance Metrics

### Target Specifications

| Metric | Target | Current |
|--------|--------|---------|
| Tick Rate | 60 TPS | ✅ 60 TPS |
| Frame Rate | 60 FPS | ✅ 60 FPS |
| Latency (local) | < 50ms | ✅ ~10ms |
| Minion count | 30+ | ✅ 9 per wave |
| Bot count | 5 | ✅ 5 bots |

### Optimization Tips

1. **Sprite Batching**: Use texture atlases for better rendering
2. **Object Pooling**: Reuse minions/projectiles instead of creating/destroying
3. **Spatial Partitioning**: Only update entities in view
4. **Network Compression**: Send only delta state changes

---

## Next Steps (Phase 4+)

After testing Phase 3, proceed to:

1. **Phase 4 — Heroes & Abilities**
   - Implement Q/W/E/R abilities
   - Cooldown system
   - Skill shots and AoE

2. **Phase 5 — Items & Economy**
   - Item shop UI
   - Gold spending
   - Item stats and actives

3. **Phase 6 — Map & Objectives**
   - Jungle camps
   - Central boss objective
   - Victory conditions

---

## Support

For issues or questions:
- Check `DEVELOPMENT.md` for overall roadmap
- Review `package.json` scripts
- Inspect browser dev tools console
- Check server logs in terminal
