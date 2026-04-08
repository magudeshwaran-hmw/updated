@echo off
echo ==========================================
echo  ZENSAR SKILLMATRIX - STARTING ALL SERVICES
echo ==========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo [1/3] Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "node server-postgres.cjs"

echo.
echo [2/3] Starting Frontend (Port 8081)...
start "Frontend" cmd /k "npm run dev:ui"

echo.
echo [3/3] Starting Ollama AI...
start "Ollama" cmd /k "set OLLAMA_ORIGINS=* && ollama serve"

echo.
echo ==========================================
echo  All services starting...
echo.
echo  - Backend:  http://localhost:3001
echo  - Frontend: http://localhost:8081
echo  - Ollama:   http://localhost:11434
echo.
echo  Wait 5-10 seconds for all services to start
echo ==========================================

pause
