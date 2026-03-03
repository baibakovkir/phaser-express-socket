# Phaser Express Socket — 3v3 MOBA

## Overview

A real-time 3v3 MOBA (Multiplayer Online Battle Arena) built with:

- **Client**: Phaser 3 (HTML5 game engine) + Vite
- **Server**: Express + Socket.io (real-time game state)
- **Database**: PostgreSQL (player accounts, stats, match history)
- **Queue**: Bull + Redis (matchmaking, job processing)
- **Infrastructure**: Docker Compose

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

### Phase 2 — Core Networking
- [ ] Player authentication (JWT / session-based)
- [ ] Lobby system: create/join/leave
- [ ] Matchmaking queue (3v3): Bull job processes queue, forms teams
- [ ] Socket.io rooms per match
- [ ] Client-server state synchronization (tick-based)
- [ ] Latency compensation / interpolation

### Phase 3 — Core Gameplay
- [ ] Top-down map with lanes, jungle, bases
- [ ] Champion/hero selection screen
- [ ] Movement (click-to-move / WASD)
- [ ] Basic attack system (auto-attack, abilities)
- [ ] Health, mana, death/respawn
- [ ] Minion/creep waves (AI-controlled)
- [ ] Towers / turrets
- [ ] Fog of war

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

# Start development (server + client)
npm run dev
```
