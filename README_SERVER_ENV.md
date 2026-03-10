# ⚠️ STOP - Important Server File Notice

## If Server Shows "DATABASE_URL not found" Error

The `/server/.env` file is missing or corrupted.

### Quick Fix (1 command):
```bash
cp /home/kirill/dev/personal/phaser-express-socket/server/.env.example /home/kirill/dev/personal/phaser-express-socket/server/.env && npm run dev:server
```

### Manual Fix:
1. **Check if file exists:**
   ```bash
   ls -la server/.env
   ```

2. **If missing, restore it:**
   ```bash
   cp server/.env.example server/.env
   ```

3. **Restart server:**
   ```bash
   npm run dev:server
   ```

---

## File Location
**Server .env:** `/home/kirill/dev/personal/phaser-express-socket/server/.env`

This file is **NEVER** committed to git (it's in `.gitignore`).
Each developer must have their own local copy.

---

## Contents (for reference)
```env
DATABASE_URL="postgresql://moba:moba_secret@localhost:6432/moba_db"
REDIS_URL="redis://localhost:7379"
PORT=3000
CLIENT_PORT=5173
CLIENT_ORIGIN="http://localhost:5173"
WEB_PORT=5174
WEB_ORIGIN="http://localhost:5174"
JWT_SECRET="change-me-in-production"
NODE_ENV=development
```

---

## Documentation
- See [`ENV_FILES_WARNING.md`](./ENV_FILES_WARNING.md) for full details
- See [`DEVELOPMENT.md`](./DEVELOPMENT.md) for setup instructions
- See [`QUICKSTART.md`](./QUICKSTART.md) for quick start guide
