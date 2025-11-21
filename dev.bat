@echo off
echo ============================================
echo Starting FMS in Development Mode
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

echo Starting all services with concurrently...
echo.
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:5173
echo API Docs: http://localhost:3000/api/docs
echo.

npm run dev

pause
