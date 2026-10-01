#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo 'Node.js is required' >&2; exit 1; }
command -v npm >/dev/null || { echo 'npm is required' >&2; exit 1; }
command -v docker >/dev/null || { echo 'Docker Compose is required' >&2; exit 1; }

if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 22 ]]; then
  echo 'Node.js 22 is required. Run nvm use or select the version from .nvmrc.' >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo 'Docker daemon is unavailable. Start Docker and grant this user access.' >&2
  exit 1
fi

if [[ ! -f server/.env ]]; then
  cp server/.env.example server/.env
  echo 'Created server/.env from server/.env.example'
fi

npm ci
docker compose up -d

for attempt in {1..30}; do
  if docker compose exec -T postgres pg_isready -U moba -d moba_db >/dev/null 2>&1 && \
     [[ "$(docker compose exec -T redis redis-cli ping 2>/dev/null | tr -d '\r')" == PONG ]]; then
    break
  fi
  if [[ "$attempt" == 30 ]]; then
    echo 'PostgreSQL or Redis did not become ready within 60 seconds.' >&2
    docker compose ps >&2
    exit 1
  fi
  sleep 2
done

npm run db:generate
npm run db:deploy
npm run db:seed

echo 'Ready. Run npm run dev, then open http://localhost:5174.'
