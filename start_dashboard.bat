@echo off
setlocal EnableDelayedExpansion
title EcoML - Carbon Footprint Dashboard
echo ==============================================================
echo        EcoML - AI Carbon Footprint Estimator Launcher
echo ==============================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%carbon-footprint-estimator\backend"
set "FRONTEND_DIR=%SCRIPT_DIR%carbon-footprint-estimator\frontend"
set "PYTHON_EXE=%SCRIPT_DIR%venv\Scripts\python.exe"

echo [1/2] Starting Flask Backend (port 5000)...
start "EcoML Backend API" cmd /k "cd /d "%BACKEND_DIR%" && "%PYTHON_EXE%" app.py"

echo [2/2] Starting React Vite Frontend (port 5173)...
start "EcoML Frontend UI" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ==============================================================
echo   Both servers are now running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:5000
echo ==============================================================
echo Keep the server windows open while using the dashboard.
echo.
pause
