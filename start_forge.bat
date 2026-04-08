@echo off
SETLOCAL
TITLE DECISIONFORGE — NEURAL SIMULATION ENGINE

echo ============================================================
echo [1/3] Terminating Existing Ports (8002/3000)...
:: Find PIDs and kill them specifically to avoid mass-killing
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%b in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%b >nul 2>&1

echo [2/3] Starting DECISIONFORGE-BACKEND (Port 8002)...
:: Neural Simulation Mode is ACTIVE in main.py
start "BFG-Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8002"

echo [3/3] Starting DECISIONFORGE-FRONTEND (Port 3000)...
start "BFG-Frontend" cmd /k "cd AIML-frontend-main && npm run dev"

echo ============================================================
echo SYSTEM IS ACTIVE IN HIGH-SPEED SIMULATION MODE
echo ============================================================
echo.
echo ➜ DASHBOARD: http://localhost:3000
echo ➜ BACKEND:   http://localhost:8002
echo.
echo * NOTE: The system will return pre-calculated results for the Promptathon demo.
echo ============================================================
pause
