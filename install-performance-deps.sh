#!/bin/bash

echo "========================================="
echo "Installing Performance Optimization Dependencies"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "❌ Error: Must run from project root directory"
  exit 1
fi

echo "${BLUE}📦 Installing Frontend Dependencies...${NC}"
cd frontend

# PWA and Service Worker
echo "Installing PWA and Service Worker dependencies..."
npm install --save-dev vite-plugin-pwa vite-plugin-compression

# React Query Persistence
echo "Installing React Query persistence..."
npm install @tanstack/query-sync-storage-persister

# Workbox (if needed for custom service worker)
echo "Installing Workbox..."
npm install workbox-webpack-plugin workbox-window

echo "${GREEN}✅ Frontend dependencies installed!${NC}"
echo ""

cd ..

echo "${BLUE}📦 Checking Backend Dependencies...${NC}"
cd backend

# Check if Redis dependencies are installed
if grep -q "@nestjs/cache-manager" package.json; then
  echo "${GREEN}✅ Backend cache dependencies already installed!${NC}"
else
  echo "${YELLOW}⚠️  Backend cache dependencies not found. Please install manually:${NC}"
  echo "npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis"
fi

cd ..

echo ""
echo "${GREEN}=========================================${NC}"
echo "${GREEN}✅ Installation Complete!${NC}"
echo "${GREEN}=========================================${NC}"
echo ""
echo "${BLUE}Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Frontend Setup:${NC}"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "2. ${YELLOW}Backend Setup:${NC}"
echo "   cd backend"
echo "   npm run migration:run"
echo "   npm run start:dev"
echo ""
echo "3. ${YELLOW}Redis Setup:${NC}"
echo "   Make sure Redis is running:"
echo "   docker run -d -p 6379:6379 redis:alpine"
echo "   OR"
echo "   redis-server"
echo ""
echo "4. ${YELLOW}Environment Variables:${NC}"
echo "   Backend .env:"
echo "   REDIS_HOST=localhost"
echo "   REDIS_PORT=6379"
echo ""
echo "5. ${YELLOW}Testing:${NC}"
echo "   - Test offline mode in browser DevTools"
echo "   - Run Lighthouse audit"
echo "   - Check Redis cache: redis-cli"
echo ""
echo "6. ${YELLOW}Documentation:${NC}"
echo "   Read CACHING_AND_PERFORMANCE.md for details"
echo ""
echo "${GREEN}Happy optimizing! 🚀${NC}"
