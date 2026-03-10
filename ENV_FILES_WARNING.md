# ⚠️ IMPORTANT: Environment Files

## DO NOT DELETE OR MODIFY

The following `.env` files are critical for running the application:

### 1. `/server/.env` ✅
**Location:** `/home/kirill/dev/personal/phaser-express-socket/server/.env`

This file contains server-specific environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Server port (3000)
- `CLIENT_ORIGIN` - Game client URL
- `WEB_ORIGIN` - Web app URL
- `JWT_SECRET` - JWT signing secret

**DO NOT DELETE THIS FILE!**

### 2. `/.env` (Root)
**Location:** `/home/kirill/dev/personal/phaser-express-socket/.env`

Root environment file for the monorepo. Should match server/.env values.

---

## Recovery

If `/server/.env` is accidentally deleted:

1. Copy from `.env.example`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Or recreate with these values:
   ```
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

3. Restart the server:
   ```bash
   npm run dev:server
   ```

---

## Git Protection

Both `.env` files are in `.gitignore` and should **NEVER** be committed:
- `/.env`
- `/server/.env`

Only `.env.example` files should be committed to git.

---

## Quick Fix Command

If server shows "DATABASE_URL not found" error:
```bash
# Check if file exists
ls -la server/.env

# If missing, restore from example
cp server/.env.example server/.env

# Restart server
npm run dev:server
```
