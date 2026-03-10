# Phaser Express Socket — 3v3 MOBA

## Overview

A real-time 3v3 MOBA (Multiplayer Online Battle Arena) built with:

- **Client**: Phaser 3 (HTML5 game engine) + Vite
- **Server**: Express + Socket.io (real-time game state)
- **Database**: PostgreSQL (player accounts, stats, match history)
- **Queue**: Bull + Redis (matchmaking, job processing)
- **Infrastructure**: Docker Compose

---

## ⚠️ Critical Files - DO NOT DELETE

### `/server/.env` - Server Environment File
**This file MUST exist for the server to run!**

If you see error `Environment variable not found: DATABASE_URL`, the file is missing.

**To restore:**
```bash
cp server/.env.example server/.env
```

**Location:** `/home/kirill/dev/personal/phaser-express-socket/server/.env`

See [`ENV_FILES_WARNING.md`](./ENV_FILES_WARNING.md) for details.

---

## Architecture

```
┌─────────────┐       WebSocket        ┌──────────────────┐
│  Phaser 3   │ ◄────────────────────► │   Express +      │
│  Client     │                        │   Socket.io      │
│  (Vite)     │                        │   Game Server    │
└─────────────┘                        └──────┬───────────┘
                                              │
                               ┌──────────────┼──────────────┐
                               │              │              │
                        ┌──────▼─────┐ ┌──────▼─────┐ ┌─────▼──────┐
                        │ PostgreSQL │ │   Redis    │ │   Bull     │
                        │ (accounts, │ │ (pub/sub,  │ │ (match-    │
                        │  matches)  │ │  cache)    │ │  making)   │
                        └────────────┘ └────────────┘ └────────────┘
```

---

## Roadmap

### Phase 1 — Boilerplate & Infrastructure ✅
- [x] Project structure (monorepo: `/client`, `/server`)
- [x] Docker Compose: Postgres, Redis
- [x] Express server with Socket.io
- [x] Phaser 3 client with Vite
- [x] Bull queue for matchmaking
- [x] Database schema (Prisma ORM)

### Phase 2 — Core Networking ✅
- [x] Player authentication (JWT / session-based)
- [x] Lobby system: create/join/leave
- [x] Matchmaking queue (3v3): Bull job processes queue, forms teams
- [x] Socket.io rooms per match
- [x] Client-server state synchronization (tick-based)
- [x] Latency compensation / interpolation

### Phase 3 — Core Gameplay ✅
- [x] Top-down map with lanes, jungle, bases
- [x] Champion/hero selection screen
- [x] Movement (click-to-move / WASD)
- [x] Basic attack system (auto-attack, abilities)
- [x] Health, mana, death/respawn
- [x] Minion/creep waves (AI-controlled)
- [x] Towers / turrets
- [ ] Fog of war (The server must not send data to the client) — Partial
- [ ] Minimap (REMOVED - per PHASE3_ISSUES_AND_SOLUTIONS.md)
- [ ] Chat
- [x] Scoreboard
- [x] Tick Rate vs Frame Rate (60 TPS / 60 FPS)
- [x] **Auto-attack system** - Heroes automatically attack all enemies within range
- [x] **HP bar colors** - Allies have green HP bars, enemies have red HP bars
- [x] **Nexus collision** - Nexus objects now have physics collision
- [x] **Instant damage** - Damage applied immediately (hitscan), projectiles are visual only
- [x] **Minion combat** - Minions have HP bars, collision, and attack enemies (minions, heroes, towers, nexus)
- [x] **Nexus HP bar** - Nexus displays HP bar showing current health
- [x] **Champion grid layout** - Fixed grid spacing to prevent card overlap
- [x] **Ability debug logging** - Console logging for ability usage debugging

**Testing**: See [`PHASE3_TESTING.md`](./PHASE3_TESTING.md) for local testing instructions.

**Recent Changes** (March 10, 2026):
- **Reworked attack mechanic**: Heroes now automatically attack ALL enemies within range without needing to press spacebar
- **Fixed HP bar colors**: Allied heroes/towers/minions now display green HP bars, enemies display red HP bars
- **Added nexus collision**: Nexus objects now have physics bodies and units collide with them
- **Added nexus HP bar**: Nexus now displays a health bar above it
- **Instant damage processing**: Damage is now applied immediately (hitscan), projectiles are visual-only for feedback
- **Bot HP bar updates**: Bot health bars now update immediately when taking damage
- **Minion combat system**: Minions now have HP bars, physics collision, and full combat logic (attack enemy minions, heroes, towers, and nexus)
- **Removed minimap**: Minimap removed per PHASE3_ISSUES_AND_SOLUTIONS.md to simplify code and improve performance
- **Fixed champion grid layout**: Increased spacing between champion cards to prevent overlap
- **Added ability debug logging**: Console now logs detailed ability usage information for debugging
- **Nerfed minion stats**: Reduced minion HP, attack damage, and movement speed for better game balance
- **Heroes attack minions**: Hero auto-attack now targets enemy minions in addition to bots, towers, and nexus
- **Improved minion engagement**: Minions now aggressively engage nearest enemy minions and stop to fight
- **Dynamic minion collision**: Enemy minions push each other apart to prevent passing through
- **Nexus healing**: Nexus now heals allied heroes, bots, and minions within 300px range (+50 HP/sec)
- **Towers attack minions**: Towers now target and attack ALL enemy units in range including minions

### Phase 4 — Heroes & Abilities
- [ ] Design 6+ heroes with unique kits (Q, W, E, R)
- [ ] Cooldown system
- [ ] Skill shots, AoE, targeted abilities
- [ ] Status effects (stun, slow, silence, etc.)
- [ ] Leveling & skill points

### Phase 5 — Items & Economy
- [ ] Gold from minion kills, hero kills, objectives
- [ ] Item shop (in-base)
- [ ] Item stat bonuses
- [ ] Item build paths / recipes

### Phase 6 — Map & Objectives
- [ ] 3-lane map design (simplified for 3v3)
- [ ] Jungle camps with buffs
- [ ] Central objective (boss / dragon equivalent)
- [ ] Victory condition: destroy enemy nexus/core

### Phase 7 — Polish & Meta
- [ ] Match history (Postgres)
- [ ] Player stats / leaderboard
- [ ] Ranked matchmaking (ELO/MMR)
- [ ] Chat system (lobby + in-game)
- [ ] Spectator mode
- [ ] Reconnect support

### Phase 8 — Deployment
- [ ] Production Docker setup
- [ ] CI/CD pipeline
- [ ] Horizontal scaling (multiple game server instances)
- [ ] CDN for static assets

---

## Database Schema (initial)

```
Player
  - id            UUID PK
  - username      VARCHAR UNIQUE
  - email         VARCHAR UNIQUE
  - password_hash VARCHAR
  - mmr           INT DEFAULT 1000
  - created_at    TIMESTAMP
  - updated_at    TIMESTAMP

Match
  - id            UUID PK
  - status        ENUM(queued, in_progress, finished)
  - winner_team   INT NULLABLE
  - started_at    TIMESTAMP
  - ended_at      TIMESTAMP NULLABLE
  - duration_sec  INT NULLABLE

MatchPlayer
  - id            UUID PK
  - match_id      UUID FK -> Match
  - player_id     UUID FK -> Player
  - team          INT (1 or 2)
  - hero_id       VARCHAR
  - kills         INT DEFAULT 0
  - deaths        INT DEFAULT 0
  - assists       INT DEFAULT 0
  - gold_earned   INT DEFAULT 0
  - damage_dealt  INT DEFAULT 0

Hero
  - id            VARCHAR PK
  - name          VARCHAR
  - role          ENUM(tank, assassin, mage, support, marksman)
  - base_hp       INT
  - base_mana     INT
  - base_attack   INT
  - base_armor    INT
  - base_speed    FLOAT
```

---

## Art & Icons — Creation Ideas

### Tools for Pixel Art / Game Assets
| Tool | Type | Notes |
|------|------|-------|
| **Aseprite** | Pixel art editor | Industry standard for 2D sprite sheets, $20 or compile free from source |
| **Piskel** | Free pixel art | Browser-based, good for quick sprites |
| **LibreSprite** | Free pixel art | Open-source Aseprite fork |
| **Tiled** | Map editor | Create tilemaps for the arena (export to JSON for Phaser) |
| **TexturePacker** | Sprite packer | Optimize sprite sheets / atlases for Phaser |

### AI-Assisted Asset Generation
| Tool | Use Case | Notes |
|------|----------|-------|
| **Midjourney / DALL-E / Stable Diffusion** | Concept art, splash art | Generate hero portraits, ability icons, UI elements |
| **PixelLab** | AI pixel art | Specialized in pixel-art style generation |
| **Remove.bg** | Background removal | Clean up generated assets |
| **Upscayl** | AI upscaling | Upscale low-res generated art |

### Asset Strategy
1. **Prototype phase**: Use free placeholder assets from [OpenGameArt.org](https://opengameart.org/) or [itch.io](https://itch.io/game-assets/free)
2. **Hero icons**: Generate base concepts with AI (Stable Diffusion), then clean up in Aseprite
3. **Ability icons**: 32x32 or 64x64 pixel icons — design a consistent style guide (color palette, border style)
4. **Map tiles**: Use Tiled to build the arena map, export as JSON tilemap for Phaser
5. **UI elements**: Design in Figma, export as PNGs/SVGs — health bars, minimap, scoreboard, item shop
6. **Animations**: Sprite sheets with walk/attack/cast/death frames per hero (Aseprite timeline)
7. **Particles**: Phaser 3 particle emitter for ability effects — fire, ice, lightning, etc.

### Style Recommendations
- **Top-down perspective** (45° or direct top-down) — simpler art, good for MOBA readability
- **Consistent palette**: Pick 16-32 colors max (use Lospec palettes)
- **Team colors**: Red vs Blue with clear visual distinction
- **Tile size**: 32x32 or 64x64 px for map tiles
- **Hero sprites**: 64x64 or 128x128 px with 4-8 animation frames per action

---

## Tech Stack Details

| Layer | Tech | Version |
|-------|------|---------|
| Game Engine | Phaser 3 | ^3.80 |
| Bundler | Vite | ^5.x |
| Server | Express | ^4.x |
| Real-time | Socket.io | ^4.x |
| ORM | Prisma | ^5.x |
| Database | PostgreSQL | 16 |
| Cache/PubSub | Redis | 7 |
| Queue | BullMQ | ^5.x |
| Language | TypeScript | ^5.x |
| Containers | Docker Compose | v2 |

---

## Running the Project

```bash
# Start infrastructure
docker compose up -d

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed heroes (optional)
npm run db:seed

# Start development (server + client)
npm run dev
```

---

## Phase 2 — API & Socket Events

### REST API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new player |
| POST | `/auth/login` | Login with email/password |
| GET | `/auth/me` | Get current player (requires Bearer token) |

**Register Request:**
```json
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "securepass123"
}
```

**Login Request:**
```json
{
  "email": "player1@example.com",
  "password": "securepass123"
}
```

**Response (both):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "player": {
    "id": "uuid",
    "username": "player1",
    "email": "player1@example.com",
    "mmr": 1000
  }
}
```

### Socket.io Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `auth` | `{ token: string }` | Authenticate socket connection |
| `lobby:create` | `{ name, isPrivate, password? }` | Create a new lobby |
| `lobby:join` | `{ lobbyId, password? }` | Join an existing lobby |
| `lobby:leave` | - | Leave current lobby |
| `lobby:ready` | `{ ready: boolean }` | Set ready status |
| `lobby:kick` | `{ targetId: string }` | Kick player (host only) |
| `lobby:list` | - | Get public lobbies list |
| `queue:join` | `{ playerId: string }` | Join matchmaking queue |
| `queue:leave` | - | Leave matchmaking queue |
| `game:input` | `{ matchId, input, tick }` | Send game input |

#### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `lobby:updated` | `{ lobby: Lobby }` | Lobby state changed |
| `lobby:kicked` | - | You were kicked from lobby |
| `queue:joined` | - | Successfully joined queue |
| `queue:left` | - | Left matchmaking queue |
| `match:found` | `{ matchId, team1, team2 }` | Match found! |
| `game:input` | `{ playerId, input, tick }` | Other player's input |

---

## Project Structure

```
phaser-express-socket/
├── client/
│   ├── src/
│   │   ├── network/
│   │   │   ├── socket.ts        # Network manager with auth
│   │   │   └── state-sync.ts    # Tick-based state sync
│   │   ├── scenes/
│   │   │   ├── BootScene.ts     # Assets loading
│   │   │   ├── MenuScene.ts     # Auth + Lobby UI
│   │   │   └── GameScene.ts     # Main gameplay
│   │   └── main.ts
│   └── package.json
├── server/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts        # Database client
│   │   │   ├── redis.ts         # Redis client
│   │   │   └── lobby.ts         # Lobby manager
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── queue/
│   │   │   ├── matchmaking.queue.ts
│   │   │   └── matchmaking.worker.ts
│   │   ├── routes/
│   │   │   └── auth.routes.ts   # REST auth endpoints
│   │   ├── index.ts             # Server entry
│   │   └── socket.ts            # Socket.io handler
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts              # Hero seed data
│   └── package.json
└── package.json
```
