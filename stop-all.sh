#!/bin/bash

echo "============================================"
echo "Stopping Finance Management System"
echo "============================================"
echo ""

echo "Stopping Docker services..."
docker-compose down
echo ""

echo "Killing Node processes (Backend/Frontend)..."
pkill -f "nest start" || echo "No backend process found"
pkill -f "vite" || echo "No frontend process found"
echo ""

echo "============================================"
echo "All services stopped successfully!"
echo "============================================"
