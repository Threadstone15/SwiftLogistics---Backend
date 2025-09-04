# SwiftTrack Backend Setup Guide

A comprehensive guide to set up and run the SwiftTrack logistics management backend system.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with: `npm install -g pnpm`
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### Verify Prerequisites

```bash
node --version    # Should be v18+
pnpm --version    # Should be v8+
docker --version  # Should be 20+
git --version     # Any recent version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Threadstone15/SwiftLogistics---Backend.git
cd SwiftLogistics---Backend/swifttrack
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Infrastructure Services

```bash
docker-compose up -d
```

### 4. Verify Services Are Running

```bash
docker-compose ps
```

All services should show "Up" status:

- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (ports 5672, 15672)
- MinIO (ports 9000, 9001)
- Prometheus (port 9090)
- Grafana (port 3001)
- Jaeger (port 16686)
- Mock Services (ports 8080, 8081, 8082)

### 5. Build Packages

```bash
pnpm run build:packages
```

### 6. Run Database Migrations

```bash
pnpm run db:migrate
```

### 7. Seed Initial Data

```bash
pnpm run db:seed
```

### 8. Start Backend Services

```bash
# Start API Gateway (main service)
pnpm run dev:api-gateway

# In separate terminals, start other services:
pnpm run dev:order-service
```

## 📁 Project Structure

```
swifttrack/
├── apps/                    # Microservices
│   ├── api-gateway/        # Main API gateway
│   └── order-service/      # Order management service
├── packages/               # Shared packages
│   ├── shared/            # Common types and DTOs
│   ├── security/          # Authentication & security
│   ├── message-bus/       # Event messaging
│   └── db/               # Database entities & migrations
├── infra/                 # Infrastructure configs
├── infrastructure/        # Mock services
└── docs/                 # Documentation
```

## 🔧 Detailed Setup Instructions

### Environment Configuration

The system uses default environment variables. For production, create `.env` files:

#### Root `.env` (optional)

```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=swifttrack
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
```

### Package Building (Step by Step)

If the quick build fails, build packages individually:

```bash
# Build shared types first
pnpm --filter="@swifttrack/shared" build

# Build security package
pnpm --filter="@swifttrack/security" build

# Build message bus
pnpm --filter="@swifttrack/message-bus" build

# Build database package
pnpm --filter="@swifttrack/db" build
```

### Database Setup (Manual)

If automatic migration fails:

```bash
# Navigate to db package
cd packages/db

# Run migrations manually
pnpm migrate:up

# Run seeds manually
pnpm seed
```

## 🌐 Service Endpoints

Once running, these endpoints will be available:

### Core Services

- **API Gateway**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Swagger Docs**: http://localhost:3000/api/docs

### Infrastructure Services

- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686

### Mock External Services

- **CMS Mock**: http://localhost:8080
- **ROS Mock**: http://localhost:8081
- **WMS Mock**: http://localhost:8082

## 👥 Default User Accounts

The system comes with pre-seeded test accounts:

### Admin Account

- **Email**: admin@swifttrack.com
- **Password**: Admin123!
- **Role**: Administrator

### Client Accounts

- **Email**: client1@example.com
- **Password**: Client123!
- **Role**: Client

### Driver Accounts

- **Email**: driver1@swifttrack.com
- **Password**: Driver123!
- **Role**: Driver

## 🧪 Testing the Setup

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Database Connection

```bash
# Connect to PostgreSQL
docker exec -it swifttrack-postgres psql -U postgres -d swifttrack

# List tables
\dt

# Check user data
SELECT * FROM users;
```

### 3. Redis Connection

```bash
docker exec -it swifttrack-redis redis-cli ping
```

## 🛠️ Development Commands

### Workspace Commands

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# Build specific packages
pnpm run build:packages

# Run tests
pnpm test

# Lint code
pnpm lint
```

### Database Commands

```bash
# Run migrations
pnpm run db:migrate

# Rollback migration
pnpm run db:rollback

# Seed database
pnpm run db:seed

# Create new migration
pnpm run db:migration:create MigrationName
```

### Service Commands

```bash
# Start API Gateway
pnpm run dev:api-gateway

# Start Order Service
pnpm run dev:order-service

# Start all services (if configured)
pnpm run dev
```

### Docker Commands

```bash
# Start all infrastructure
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

#### 2. Docker Services Not Starting

```bash
# Check Docker status
docker system info

# Restart Docker Desktop
# Clean up containers
docker-compose down --volumes
docker system prune -f
```

#### 3. Database Connection Failed

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify database exists
docker exec -it swifttrack-postgres psql -U postgres -c "\l"
```

#### 4. Package Build Errors

```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build:packages
```

#### 5. TypeScript Compilation Errors

```bash
# Check Node version
node --version

# Clear TypeScript cache
pnpm run clean
rm -rf node_modules/.cache
```

### Log Locations

- **Application Logs**: Console output
- **Docker Logs**: `docker-compose logs [service]`
- **PostgreSQL Logs**: `docker-compose logs postgres`
- **RabbitMQ Logs**: `docker-compose logs rabbitmq`

## 📊 Monitoring

### Health Checks

- API Gateway: http://localhost:3000/health
- Database: Automatic via TypeORM connection
- Redis: Automatic via health check endpoint
- RabbitMQ: http://localhost:15672

### Metrics & Observability

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Jaeger Tracing**: http://localhost:16686

## 🚀 Production Deployment

### Environment Variables

Set these for production:

```env
NODE_ENV=production
DATABASE_HOST=your-db-host
DATABASE_PASSWORD=secure-password
JWT_ACCESS_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_HOST=your-redis-host
RABBITMQ_URL=amqp://your-rabbitmq-url
```

### Security Checklist

- [ ] Change default passwords
- [ ] Use environment-specific secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper logging
- [ ] Configure rate limiting

## 📞 Support

### Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Documentation](http://localhost:3000/api/docs)
- [Frontend Integration Guide](./docs/FRONTEND_INTEGRATION_GUIDE.md)

### Getting Help

1. Check this setup guide first
2. Review error logs
3. Check GitHub issues
4. Contact the development team

---

## 📝 Quick Reference

### Essential Commands

```bash
# Full setup from scratch
git clone <repo-url>
cd SwiftLogistics---Backend/swifttrack
pnpm install
docker-compose up -d
pnpm run build:packages
pnpm run db:migrate
pnpm run db:seed
pnpm run dev:api-gateway

# Daily development
docker-compose up -d
pnpm run dev:api-gateway

# Shutdown
docker-compose down
```

### Key Ports

- 3000: API Gateway
- 5432: PostgreSQL
- 6379: Redis
- 15672: RabbitMQ UI
- 9090: Prometheus
- 3001: Grafana
- 16686: Jaeger

---

✅ **Setup Complete!** Your SwiftTrack backend should now be running successfully.
