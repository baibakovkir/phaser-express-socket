#!/bin/bash

# Phase 3 Local Testing Script
# This script sets up everything needed to test Phase 3 gameplay locally

set -e

echo "=========================================="
echo "  Phase 3 Local Testing Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists, create from example if not
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Start Docker services
echo ""
echo -e "${YELLOW}Starting Docker services (PostgreSQL, Redis)...${NC}"
docker compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker compose ps | grep -q "postgres"; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL failed to start${NC}"
    exit 1
fi

if docker compose ps | grep -q "redis"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis failed to start${NC}"
    exit 1
fi

# Install dependencies if needed
echo ""
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    npm install -w server
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    npm install -w client
fi

if [ ! -d "web/node_modules" ]; then
    echo "Installing web dependencies..."
    npm install -w web
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Generate Prisma client
echo ""
echo -e "${YELLOW}Generating Prisma client...${NC}"
npm run db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Run database migrations
echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
npm run db:migrate
echo -e "${GREEN}✓ Database migrations completed${NC}"

# Seed heroes
echo ""
echo -e "${YELLOW}Seeding heroes...${NC}"
npm run db:seed
echo -e "${GREEN}✓ Heroes seeded${NC}"

echo ""
echo "=========================================="
echo "  Starting Development Servers"
echo "=========================================="
echo ""
echo -e "${GREEN}Starting all services...${NC}"
echo ""
echo "Services will be available at:"
echo "  - Web App (Auth/Lobby):  http://localhost:5174"
echo "  - Game Client:           http://localhost:5173"
echo "  - API Server:            http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start all services
npm run dev
