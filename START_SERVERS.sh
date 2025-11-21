#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║     Starting Retech Inventory System          ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ backend directory not found!"
    exit 1
fi

# Check if desktop directory exists
if [ ! -d "desktop" ]; then
    echo "❌ desktop directory not found!"
    exit 1
fi

# Start backend server
echo -e "${BLUE}📡 Starting Backend Server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait a moment for backend to start
sleep 2

# Start desktop app
echo -e "${BLUE}🖥️  Starting Desktop App...${NC}"
cd ../desktop
npm run dev &
DESKTOP_PID=$!
echo -e "${GREEN}✅ Desktop app started (PID: $DESKTOP_PID)${NC}"
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║           Servers Running                      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:3001"
echo -e "${GREEN}Desktop:${NC}  Electron window should open"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $DESKTOP_PID
