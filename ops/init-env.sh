#!/bin/sh
set -eu

cd "${DEPLOY_DIR:-/opt/ninjas-x}"
if [ -s .env ]; then
  echo "Using existing production environment"
  exit 0
fi

umask 077
postgres_password=$(openssl rand -hex 32)
jwt_secret=$(openssl rand -hex 48)
cat > .env.next <<EOF
POSTGRES_PASSWORD=$postgres_password
DATABASE_URL=postgresql://moba:$postgres_password@postgres:5432/moba_db
JWT_SECRET=$jwt_secret
EOF
mv .env.next .env
echo "Initialized production environment"
