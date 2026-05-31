@echo off
echo.
echo ========================================
echo   ⚡ SmarterBlinkit - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo ⚠️  WARNING: backend\.env file not found!
    echo Please create .env file with your credentials.
    echo See SETUP_GUIDE.md for instructions.
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   🚀 Starting SmarterBlinkit...
echo ========================================
echo.
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "SmarterBlinkit Backend" cmd /k "cd backend && npm start"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "SmarterBlinkit Frontend" cmd /k "cd frontend && npm run dev"

REM Wait 3 seconds for frontend to start
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ SmarterBlinkit is running!
echo ========================================
echo.
echo 🌐 Open in browser: http://localhost:5173
echo.
echo Demo Accounts:
echo   Buyer:  buyer@test.com  / buyer123
echo   Seller: seller@test.com / seller123
echo   Owner:  owner@test.com  / owner123
echo.
echo Press any key to open in browser...
pause >nul

REM Open in default browser
start http://localhost:5173

echo.
echo To stop servers, close the terminal windows.
echo.
