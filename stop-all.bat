@echo off
echo ============================================
echo Stopping Finance Management System
echo ============================================
echo.

echo Stopping Docker services...
docker-compose down
echo.

echo Killing Node processes (Backend/Frontend)...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo Node processes stopped
) else (
    echo No Node processes found
)
echo.

echo ============================================
echo All services stopped successfully!
echo ============================================
pause
