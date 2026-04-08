@echo off
echo ==========================================
echo  STARTING BACKEND SERVER ONLY
echo ==========================================
echo.
echo This will start the Node.js server on port 3001
echo.
echo Press any key to start...
pause >nul

echo.
echo Starting server...
node server-postgres.cjs

echo.
echo Server stopped. Press any key to exit...
pause
