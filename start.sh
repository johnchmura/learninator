#!/bin/bash

# Quiz App Startup Script for WSL/Linux
# This script starts both the backend and frontend servers
# Backend uses conda environment "learn"
# Frontend uses npm with package-lock.json

echo "================================================"
echo "   Starting Quiz App"
echo "================================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo -e "${RED}Error: conda is not installed or not in PATH${NC}"
    echo "Please install Miniconda or Anaconda first."
    exit 1
fi

# Initialize conda for bash
eval "$(conda shell.bash hook)"

# Check if backend conda environment exists
echo -e "${BLUE}[1/4]${NC} Setting up backend conda environment..."
if ! conda env list | grep -q "^learn "; then
    echo -e "${YELLOW}Creating conda environment 'learn'...${NC}"
    conda create -n learn python=3.10 -y
fi

# Activate conda environment
conda activate learn

# Check if requirements are installed
cd backend
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing backend dependencies in conda env 'learn'...${NC}"
    pip install -r requirements.txt
else
    echo -e "${GREEN}Backend dependencies already installed${NC}"
fi

cd ..

# Check if frontend dependencies are installed
echo -e "${BLUE}[2/4]${NC} Checking frontend dependencies..."
cd frontend

# Check if we're using Windows npm in WSL (common issue)
NPM_PATH=$(which npm)
if [[ "$NPM_PATH" == *"Program Files"* ]] || [[ "$NPM_PATH" == *"/mnt/c/"* ]]; then
    echo -e "${RED}Warning: Windows npm detected in WSL environment${NC}"
    echo -e "${YELLOW}Please install Node.js natively in WSL:${NC}"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    cd ..
    exit 1
fi

# Clean up any corrupted node_modules from Windows npm
if [ -d "node_modules" ] && [ ! -w "node_modules" ]; then
    echo -e "${YELLOW}Removing corrupted node_modules...${NC}"
    rm -rf node_modules package-lock.json
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies (this will create package-lock.json)...${NC}"
    npm install --legacy-peer-deps
elif [ ! -f "package-lock.json" ]; then
    echo -e "${YELLOW}Generating package-lock.json...${NC}"
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}Frontend dependencies already installed${NC}"
fi

cd ..

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    conda deactivate 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend server in background
echo -e "${BLUE}[3/4]${NC} Starting backend server (conda env: learn)..."
cd backend
conda activate learn
uvicorn main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}Backend started successfully on http://localhost:8000${NC}"
else
    echo -e "${RED}Failed to start backend. Check backend.log for errors.${NC}"
    exit 1
fi

# Start frontend server in background
echo -e "${BLUE}[4/4]${NC} Starting frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}Frontend started successfully on http://localhost:5173${NC}"
else
    echo -e "${RED}Failed to start frontend. Check frontend.log for errors.${NC}"
    kill $BACKEND_PID
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}   Quiz App is Running!${NC}"
echo "================================================"
echo ""
echo "  Backend:  http://localhost:8000 (conda env: learn)"
echo "  Frontend: http://localhost:5173"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "  Logs:"
echo "    - Backend:  backend.log"
echo "    - Frontend: frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running and display logs
tail -f backend.log frontend.log &
TAIL_PID=$!

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID

# Cleanup tail process
kill $TAIL_PID 2>/dev/null
