@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting SwiftTrack Development Environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ pnpm not found. Installing pnpm...
    npm install -g pnpm
)

echo ✅ Prerequisites check passed

REM Create .env if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ Created .env file. Please review and update if needed.
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Start infrastructure services
echo 🐳 Starting infrastructure services...
docker-compose up -d postgres redis rabbitmq minio prometheus grafana

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak

REM Wait for PostgreSQL
:waitpostgres
docker-compose exec postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo ⏳ Waiting for PostgreSQL...
    timeout /t 2 /nobreak
    goto waitpostgres
)

echo ✅ PostgreSQL is ready

REM Run migrations
echo 🗃️ Running database migrations...
pnpm run db:migrate

REM Seed initial data
echo 🌱 Seeding initial data...
pnpm run db:seed

REM Start mock services
echo 🧪 Starting mock external services...
docker-compose up -d cms-mock ros-mock wms-mock

echo.
echo 🎉 SwiftTrack development environment is ready!
echo.
echo 📚 Available services:
echo   • API Gateway:        http://localhost:3000
echo   • API Documentation:  http://localhost:3000/api/docs
echo   • Order Service:      http://localhost:3001
echo   • Grafana Dashboard:  http://localhost:3333 (admin/admin123)
echo   • Prometheus:         http://localhost:9090
echo   • RabbitMQ Mgmt:      http://localhost:15672 (admin/admin123)
echo   • MinIO Console:      http://localhost:9001 (minioadmin/minioadmin123)
echo.
echo 🧪 Mock services:
echo   • CMS Mock (SOAP):    http://localhost:8080
echo   • ROS Mock (REST):    http://localhost:8081
echo   • WMS Mock (TCP):     localhost:8082
echo.
echo 🔐 Default credentials:
echo   • Admin: admin@swifttrack.com / Admin123!
echo   • Client: client1@example.com / Client123!
echo   • Driver: driver1@swifttrack.com / Driver123!
echo.
echo 🚀 To start the application services, run:
echo   pnpm run dev
echo.
echo 📖 For more information, check the README.md file
echo.
pause
