╔══════════════════════════════════════════════════════════════╗
║     ZENSAR SKILLMATRIX - QUICK START GUIDE                   ║
╚══════════════════════════════════════════════════════════════╝

🔴 IF YOU SEE "Database connection failed":
   The backend server is NOT running. Choose ONE method below:

═══════════════════════════════════════════════════════════════
METHOD 1: Double-Click to Start (EASIEST)
═══════════════════════════════════════════════════════════════

1. Double-click this file:  📁 START_ALL.bat
2. Wait 10 seconds
3. Open browser: http://localhost:8081/admin

This starts 3 services:
  ✓ Backend Server (port 3001)
  ✓ Frontend UI (port 8081)
  ✓ Ollama AI (port 11434)

═══════════════════════════════════════════════════════════════
METHOD 2: VS Code Terminal
═══════════════════════════════════════════════════════════════

1. Open VS Code terminal
2. Run this command:

   npm run dev

═══════════════════════════════════════════════════════════════
METHOD 3: Manual Start (2 Terminals)
═══════════════════════════════════════════════════════════════

Terminal 1 (Backend):
   node server-postgres.cjs

Terminal 2 (Frontend):
   npm run dev:ui

═══════════════════════════════════════════════════════════════
CHECK IF IT'S WORKING
═══════════════════════════════════════════════════════════════

Open browser and test:
   http://localhost:3001/api/employees

If you see JSON data → Server is running ✅
If you see error → Server not running 🔴

═══════════════════════════════════════════════════════════════
OFFLINE MODE (No Database Needed)
═══════════════════════════════════════════════════════════════

The app now works WITHOUT the database!
If server is not found, it automatically uses sample/mock data.

You'll see: "Using offline mock data" message but app works normally.

═══════════════════════════════════════════════════════════════
