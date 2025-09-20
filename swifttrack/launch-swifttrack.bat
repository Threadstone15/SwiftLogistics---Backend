@echo off
cls
title SwiftTrack Backend Launcher

echo.
echo ========================================
echo 🚀 SwiftTrack Backend Launcher
echo ========================================
echo.

REM Change to the SwiftTrack directory
cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm is not installed
    echo Installing pnpm globally...
    npm install -g pnpm
    if errorlevel 1 (
        echo ❌ Failed to install pnpm
        pause
        exit /b 1
    )
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.
echo 🚀 Launching SwiftTrack Backend...
echo.

REM Run the launcher script
node launch-swifttrack.js

if errorlevel 1 (
    echo.
    echo ❌ Launch failed!
    echo.
    echo 📋 Troubleshooting steps:
    echo 1. Ensure Docker Desktop is running
    echo 2. Check if ports 3000, 3002, 5432 are available
    echo 3. Run: pnpm install
    echo 4. Check Docker logs: docker-compose logs
    echo.
    pause
    exit /b 1
)

pause