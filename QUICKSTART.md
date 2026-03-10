# Quick Start - Phase 3 Testing

## Start Everything with One Command

```bash
bash scripts/test-phase3.sh
```

This script will:
1. ✅ Create `.env` file (if missing)
2. ✅ Start PostgreSQL & Redis (Docker)
3. ✅ Install dependencies
4. ✅ Run database migrations
5. ✅ Seed hero data
6. ✅ Start all dev servers

## Access Points

Once started, open your browser:

| Service | URL | Purpose |
|---------|-----|---------|
| **Web App** | http://localhost:5174 | 🆕 Landing page, Register/Login |
| **Game Client** | http://localhost:5173 | Play the game |
| **API Server** | http://localhost:3000 | Backend API |

## 🎮 Quick Test Mode (Recommended)

### Option 1: From Web App
1. Go to http://localhost:5174
2. Click **"Play Free Now"** or **"Register"**
3. Create an account
4. Click **"Launch Game"**

### Option 2: Direct Game Access
1. Go to http://localhost:5173
2. Click **[ TEST MODE ]** button in the menu
3. Select your champion
4. Select team (Blue or Red)
5. Click **[ CONFIRM ]**
6. Play against bots!

### Controls

| Key | Action |
|-----|--------|
| `WASD` / `Arrow Keys` | Move champion |
| `Mouse Click` | Click-to-move |
| `Space` | Basic attack |
| `Q` | Ability 1 |
| `W` | Ability 2 |
| `E` | Ability 3 |
| `R` | Ultimate |
| `ESC` | Exit to menu |

## Stop Everything

```bash
# Stop dev servers (Ctrl+C in terminal)

# Stop Docker containers
docker compose down
```

## Troubleshooting

**Port already in use?**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

**Docker containers not starting?**
```bash
# Check Docker is running
docker ps

# Restart containers
docker compose restart
```

**Database errors?**
```bash
# Reset database
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:seed
```

---

For detailed documentation, see [`PHASE3_TESTING.md`](./PHASE3_TESTING.md)

For web theme details, see [`WEB_THEME_UPDATE.md`](./WEB_THEME_UPDATE.md)
