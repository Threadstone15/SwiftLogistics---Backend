# 🚀 SwiftTrack Backend - Single File Launcher

## Overview

This directory contains comprehensive single-file launchers for the complete SwiftTrack backend system. Choose the appropriate launcher for your operating system.

## Quick Start

### Windows (PowerShell/Command Prompt)

```cmd
# Option 1: Double-click the batch file
launch-swifttrack.bat

# Option 2: Run from command line
cd path\to\swifttrack
launch-swifttrack.bat
```

### Unix/Linux/macOS (Bash)

```bash
# Make executable and run
chmod +x launch-swifttrack.sh
./launch-swifttrack.sh

# Or run directly with bash
bash launch-swifttrack.sh
```

### Cross-platform (Node.js)

```bash
# Direct Node.js execution
node launch-swifttrack.js
```

## What Gets Started

### 🐳 Infrastructure Services (Docker)

- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Caching and sessions
- **RabbitMQ** (port 5672, UI: 15672) - Message broker
- **MinIO** (port 9000, Console: 9001) - Object storage
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3001) - Monitoring dashboards
- **Jaeger** (port 16686) - Distributed tracing
- **Mock Services** - CMS, ROS, WMS simulators

### 🚀 Backend Services

- **API Gateway** (port 3000) - Main REST API
- **Order Service** (port 3002) - Order processing microservice

### 📊 Key Endpoints

- **API Documentation**: `http://localhost:3000/docs`
- **Health Checks**: `http://localhost:3000/api/v1/health`
- **Authentication**: `http://localhost:3000/api/v1/auth/login`
- **Orders API**: `http://localhost:3000/api/v1/orders`
- **Admin Dashboard**: `http://localhost:3000/api/v1/admin`

## Prerequisites

### Required Software

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **pnpm** - Auto-installed by launcher
3. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
4. **Git** (for cloning) - [Download](https://git-scm.com/)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 5GB free space
- **Ports**: 3000, 3002, 5432, 6379, 5672, 9000, 9090, 3001, 16686

## Launcher Features

### 🔍 Automatic Prerequisites Check

- Verifies Node.js, pnpm, Docker availability
- Auto-installs missing dependencies where possible
- Clear error messages with resolution steps

### 🏥 Health Monitoring

- Infrastructure service health checks
- Database connectivity verification
- API endpoint validation
- Automatic retry logic with timeouts

### 📋 Comprehensive Logging

- Color-coded console output
- Service-specific log prefixes
- Timestamp tracking
- Error context and troubleshooting

### 🛑 Graceful Shutdown

- Ctrl+C handler for clean exit
- Automatic Docker cleanup
- Process termination management
- Resource cleanup verification

## Configuration

### Environment Variables

The launcher automatically sets up:

```bash
PORT=3000                    # API Gateway port
ORDER_SERVICE_PORT=3002      # Order Service port
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=swifttrack
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Database Setup

- Automatic schema migration
- Seed data population
- Connection health verification
- Retry logic for startup delays

## Troubleshooting

### Common Issues

#### 🚨 "Docker is not running"

```bash
# Windows: Start Docker Desktop
# macOS: Start Docker Desktop
# Linux: sudo systemctl start docker
```

#### 🚨 "Port already in use"

```bash
# Check what's using the port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # macOS/Linux

# Kill the process or change ports in docker-compose.yml
```

#### 🚨 "Database connection failed"

```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait 30 seconds then retry
```

#### 🚨 "Build failed"

```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm build
```

### Debug Mode

Add debug logging by setting:

```bash
export DEBUG=swifttrack:*     # Unix
set DEBUG=swifttrack:*        # Windows
```

## Development vs Production

### Development Mode (Default)

- Hot reload disabled (static build)
- Detailed logging enabled
- Mock services included
- Debug endpoints available

### Production Configuration

To run in production mode:

```bash
export NODE_ENV=production
node launch-swifttrack.js
```

## Postman Integration

Import the comprehensive API collection:

```
SwiftTrack_Postman_Collection.json
```

Contains 50+ endpoints with:

- Authentication flows
- Sample data
- Error scenarios
- Environment variables

## Frontend Integration

### CORS Configuration

Pre-configured for these frontend URLs:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3001` (Alternative dev port)
- `http://localhost:8080` (Webpack dev server)

### Authentication

- JWT-based authentication
- Mock user storage for development
- Registration and login endpoints ready
- Role-based access control implemented

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │────│   API Gateway    │
│  (React/Vue)    │    │   (Port 3000)    │
└─────────────────┘    └──────────────────┘
                                │
                       ┌────────┼────────┐
                       │                 │
              ┌─────────────────┐ ┌─────────────────┐
              │  Order Service  │ │  Future Services│
              │   (Port 3002)   │ │   (Expandable)  │
              └─────────────────┘ └─────────────────┘
                       │
              ┌─────────────────┐
              │  Infrastructure │
              │   (Docker)      │
              │ • PostgreSQL    │
              │ • Redis         │
              │ • RabbitMQ      │
              │ • MinIO         │
              │ • Monitoring    │
              └─────────────────┘
```

## Support

### Documentation

- **API Docs**: `http://localhost:3000/docs`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Setup Guide**: `SETUP_GUIDE.md`

### Logs Location

- **API Gateway**: `apps/api-gateway/logs/`
- **Order Service**: `apps/order-service/logs/`
- **Docker**: `docker-compose logs [service]`

### Health Endpoints

- **Overall**: `GET /api/v1/health`
- **Database**: `GET /api/v1/health/database`
- **Services**: `GET /api/v1/health/services`

---

## 🎉 Success Indicators

When properly launched, you should see:

```
🚀 SWIFTTRACK BACKEND - FULLY OPERATIONAL
========================================

📊 SERVICE ENDPOINTS:
🌐 API Gateway:      http://localhost:3000
📚 API Documentation: http://localhost:3000/docs
📦 Order Service:    http://localhost:3002

✅ CORS configured for frontend
✅ Authentication working
✅ Comprehensive logging enabled
✅ Ready for production use!
```

**The SwiftTrack backend is now fully operational and ready for frontend integration! 🚀**
