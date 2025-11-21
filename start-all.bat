@echo off
echo ============================================
echo Starting Finance Management System
echo ============================================
echo.

echo [1/3] Starting Docker Services (PostgreSQL, Redis)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)
echo Docker services started successfully!
echo.

echo Waiting for database to be ready...
timeout /t 5 /nobreak
echo.

echo [2/3] Starting Backend (NestJS)...
start "FMS Backend" cmd /k "cd backend && npm run start:dev"
echo Backend starting in separate window...
echo.

echo Waiting for backend to initialize...
timeout /t 10 /nobreak
echo.

echo [3/3] Starting Frontend (React + Vite)...
start "FMS Frontend" cmd /k "cd frontend && npm run dev"
echo Frontend starting in separate window...
echo.

echo ============================================
echo All services started successfully!
echo ============================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:3000/api/docs
echo.
echo Press any key to view Docker logs...
pause > nul
docker-compose logs -f
