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
echo 🔍 Validating workspace structure...
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the swifttrack directory.
    pause
    exit /b 1
)

if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found. Please run this script from the swifttrack directory.
    pause
    exit /b 1
)
echo ✅ Workspace structure validated

echo.
echo 🔧 Installing dependencies...
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Package installation failed. Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo 🐳 Starting infrastructure services...
call docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start Docker services. Please check Docker Desktop is running.
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Verifying service health...
call docker-compose ps
echo.
echo 📊 Checking PostgreSQL connection...
timeout /t 5 /nobreak >nul

echo.
echo 📦 Building packages...
call pnpm run build:packages
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Package build failed. Please check the output above.
    pause
    exit /b 1
)

echo.
echo 🗄️ Running database migrations...
call pnpm run db:migrate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database migration failed. Please check the output above.
    pause
    exit /b 1
)

echo.
echo 🌱 Seeding initial data...
call pnpm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database seeding failed. Please check the output above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo ================================
echo.

echo 📊 Service Status:
call docker-compose ps
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Could not check service status. Services may still be starting up.
)

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
echo 🚀 To start the backend services, run one of:
echo   pnpm run dev              (Start all services)
echo   pnpm run dev:api-gateway  (Start API Gateway only)
echo.
echo 🧪 To run health checks:
echo   .\health-check.bat
echo.
echo 📖 For detailed instructions, see SETUP_GUIDE.md
echo 🔧 For troubleshooting, see SETUP_CHECKLIST.md
echo.

echo 📋 Setup Summary:
echo ==================
echo ✅ Dependencies installed
echo ✅ Infrastructure services started
echo ✅ Database migrated and seeded
echo ✅ Packages built
echo.
echo 🎯 Next Steps:
echo   1. Review any compilation warnings above
echo   2. Start the backend: pnpm run dev
echo   3. Test endpoints: http://localhost:3000/health
echo   4. View API docs: http://localhost:3000/api/docs
echo.
echo ⚡ Quick Test:
echo   curl http://localhost:3000/health
echo.
pause
