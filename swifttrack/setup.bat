@echo off
REM SwiftTrack Backend Quick Setup Script for Windows
REM This script automates the entire setup process

echo.
echo 🚀 Starting SwiftTrack Backend Setup...
echo ======================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check pnpm
pnpm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ pnpm is not installed. Installing pnpm...
    npm install -g pnpm
)
echo ✅ pnpm found

REM Check Docker
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker found

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo 🔧 Installing dependencies...
pnpm install

echo.
echo 🐳 Starting infrastructure services...
docker-compose up -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 📦 Building packages...
pnpm run build:packages

echo.
echo 🗄️ Running database migrations...
pnpm run db:migrate

echo.
echo 🌱 Seeding initial data...
pnpm run db:seed

echo.
echo 🎉 Setup completed successfully!
echo ================================
echo.

echo 📊 Service Status:
docker-compose ps

echo.
echo 🌐 Available Endpoints:
echo   • API Gateway:      http://localhost:3000
echo   • Health Check:     http://localhost:3000/health
echo   • Swagger Docs:     http://localhost:3000/api/docs
echo   • Grafana:          http://localhost:3001 (admin/admin)
echo   • RabbitMQ:         http://localhost:15672 (guest/guest)
echo   • MinIO Console:    http://localhost:9001 (minioadmin/minioadmin)
echo   • Prometheus:       http://localhost:9090
echo   • Jaeger:           http://localhost:16686

echo.
echo 👥 Default Login Credentials:
echo   • Admin:   admin@swifttrack.com / Admin123!
echo   • Client:  client1@example.com / Client123!
echo   • Driver:  driver1@swifttrack.com / Driver123!

echo.
echo 🚀 To start the backend services:
echo   pnpm run dev:api-gateway
echo.
echo 📖 For detailed instructions, see SETUP_GUIDE.md
echo.
pause
