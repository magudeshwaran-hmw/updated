@echo off
echo Starting Zensar SkillMatrix Server...
echo.
echo Checking if PostgreSQL is running on port 1234...
echo.

REM Start the backend server
node server-postgres.cjs

pause
