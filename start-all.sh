#!/bin/bash

echo "============================================"
echo "Starting Finance Management System"
echo "============================================"
echo ""

echo "[1/3] Starting Docker Services (PostgreSQL, Redis)..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start Docker services"
    exit 1
fi
echo "Docker services started successfully!"
echo ""

echo "Waiting for database to be ready..."
sleep 5
echo ""

echo "[2/3] Starting Backend (NestJS)..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..
echo "Backend PID: $BACKEND_PID"
echo ""

echo "Waiting for backend to initialize..."
sleep 10
echo ""

echo "[3/3] Starting Frontend (React + Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
echo "Frontend PID: $FRONTEND_PID"
echo ""

echo "============================================"
echo "All services started successfully!"
echo "============================================"
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:3000/api/docs"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop all services, run: ./stop-all.sh"
echo "Or press Ctrl+C to stop this script (services will continue running)"
echo ""

# Keep script running to show logs
trap "echo 'Use ./stop-all.sh to stop all services'; exit 0" INT TERM
wait
