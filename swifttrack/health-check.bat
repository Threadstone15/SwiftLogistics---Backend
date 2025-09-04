@echo off
REM SwiftTrack Backend Health Check Script for Windows

echo.
echo 🔍 SwiftTrack Backend Health Check
echo ==================================
echo.

echo 📊 Docker Services Status:
docker-compose ps

echo.
echo 🌐 Service Health Checks:

echo | set /p dummy="API Gateway (http://localhost:3000/health): "
curl -s http://localhost:3000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ OK
) else (
    echo ❌ FAILED
)

echo | set /p dummy="PostgreSQL (localhost:5432): "
docker exec swifttrack-postgres pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ OK
) else (
    echo ❌ FAILED
)

echo | set /p dummy="Redis (localhost:6379): "
docker exec swifttrack-redis redis-cli ping >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ OK
) else (
    echo ❌ FAILED
)

echo | set /p dummy="RabbitMQ Management (http://localhost:15672): "
curl -s http://localhost:15672 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ OK
) else (
    echo ❌ FAILED
)

echo.
echo 🔗 Quick Access Links:
echo   • API Gateway:     http://localhost:3000
echo   • Health Check:    http://localhost:3000/health
echo   • API Docs:        http://localhost:3000/api/docs
echo   • Grafana:         http://localhost:3001
echo   • RabbitMQ:        http://localhost:15672
echo   • MinIO:           http://localhost:9001
echo   • Prometheus:      http://localhost:9090
echo   • Jaeger:          http://localhost:16686
echo.
pause
