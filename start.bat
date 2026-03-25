@echo off
setlocal EnableDelayedExpansion
title eBay Misspelling Hunter

echo.
echo   eBay Misspelling Hunter
echo   -------------------------------------------

:: 1. Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo   Node.js is not installed.
    echo   Download it from: https://nodejs.org  ^(use the LTS version^)
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -e "process.stdout.write(process.versions.node)"') do set NODE_VER=%%v
echo   Node.js %NODE_VER% detected

:: 2. Install dependencies if needed
if not exist "%~dp0node_modules" goto install
if not exist "%~dp0server\node_modules" goto install
if not exist "%~dp0client\node_modules" goto install
goto skip_install

:install
echo.
echo   Installing dependencies (first run -- this takes ~30 seconds)...
cd /d "%~dp0"
call npm run install:all --silent
echo   Dependencies installed
:skip_install

:: 3. Create server/.env if missing
if not exist "%~dp0server\.env" (
    echo.
    echo   No eBay API key found.
    echo   Get a free key at: https://developer.ebay.com/my/keys
    echo.
    set /p APP_ID="  Paste your eBay App ID (or press Enter to skip): "
    echo EBAY_APP_ID=!APP_ID!> "%~dp0server\.env"
    echo PORT=3001>> "%~dp0server\.env"
    echo SCAN_INTERVAL_MINUTES=120>> "%~dp0server\.env"
    echo MAX_LISTINGS=500>> "%~dp0server\.env"
    echo   server\.env created
)

:: 4. Build client if dist is missing
if not exist "%~dp0client\dist" (
    echo.
    echo   Building the app...
    cd /d "%~dp0"
    call npm run build --silent
    echo   Build complete
)

:: 5. Launch
echo.
echo   Launching...
echo   Opening http://localhost:3001 in your browser
echo   Press Ctrl+C to stop
echo.

:: Open browser after short delay
start "" timeout /t 2 >nul & start "" "http://localhost:3001"

cd /d "%~dp0"
call npm start
