@echo off
TITLE ZENSAR SKILL NAVIGATOR — ELITE DEPLOYMENT
COLOR 0B

echo.
echo ============================================================
echo   ZEN  SAR — QUALITY ENGINEERING SKILL NAVIGATOR
echo ============================================================
echo.
echo [1/4] Checking environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it from: https://nodejs.org/
    pause
    exit /b
)

echo [2/4] Syncing dependencies...
call npm install

echo [3/4] Initializing AI Engine (Ollama)...
ollama -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama is not installed. AI features will be offline.
    echo Download it at: https://ollama.com/download
) else (
    echo Found Ollama! Pulling Zensar IQ signature (this may take a moment on first run)...
    SET OLLAMA_ORIGINS=*
    start /b ollama serve
    timeout /t 8 >nul
    call ollama pull minimax-m2.5:cloud
)

echo.
echo [4/4] STARTING THE COMPLETE ECOSYSTEM...
echo.
echo ============================================================
echo   THE APP IS STARTING!
echo   1. Frontend: http://localhost:8080
echo   2. Backend Server: http://localhost:3001
echo   3. AI Engine: ACTIVE (Ollama)
echo ============================================================
echo.

npm run dev
pause
