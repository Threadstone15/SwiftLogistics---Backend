# SwiftTrack Logistics Platform

# SwiftTrack Logistics Management System

## Overview

SwiftTrack is a comprehensive logistics management system built with a microservices architecture using Node.js, NestJS, PostgreSQL, Redis, and RabbitMQ. The system provides real-time order tracking, route optimization, warehouse management, and seamless integration with external systems.

## 🏗️ Architecture

### System Components

- **API Gateway** - Central entry point for all client requests
- **Order Service** - Handles order lifecycle and saga orchestration
- **Driver Service** - Manages driver information and assignments
- **Tracking Service** - Real-time location tracking and route optimization
- **Warehouse Service** - Inventory and warehouse management
- **Notification Service** - Multi-channel notifications (SMS, Email, Push)
- **Admin Service** - System administration and analytics

### External System Integration

- **CMS (SOAP)** - Customer Management System integration
- **ROS (REST)** - Route Optimization Service
- **WMS (TCP)** - Warehouse Management System

### Infrastructure

- **Database**: PostgreSQL 15+ with TypeORM
- **Cache**: Redis for sessions and real-time data
- **Message Broker**: RabbitMQ (with Kafka migration readiness)
- **Storage**: MinIO (S3-compatible) for file storage
- **Monitoring**: Prometheus + Grafana
- **Documentation**: OpenAPI/Swagger

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swifttrack
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis rabbitmq minio
   ```

5. **Run database migrations**
   ```bash
   pnpm run db:migrate
   ```

6. **Seed initial data**
   ```bash
   pnpm run db:seed
   ```

7. **Start development servers**
   ```bash
   # Start all services
   pnpm run dev
   
   # Or start individual services
   pnpm run dev:api-gateway
   pnpm run dev:order-service
   ```

### Quick Development Setup

```bash
# One-command setup (requires Docker)
make dev-setup

# Start everything
make dev
```

## 📚 API Documentation

Once running, access the API documentation:

- **API Gateway**: http://localhost:3000/api/docs
- **Order Service**: http://localhost:3001/api/docs

## Default Credentials

```
Admin: admin@swifttrack.com / Admin123!
Client: client1@example.com / Client123!
Driver: driver1@swifttrack.com / Driver123!
```

## 🔐 Authentication Example

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swifttrack.com","password":"Admin123!"}'

# Use token
curl -X GET http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer <your-token>"
```

## 🧪 Mock Services

External system mocks for development:

- **CMS Mock (SOAP)**: http://localhost:8080
- **ROS Mock (REST)**: http://localhost:8081  
- **WMS Mock (TCP)**: localhost:8082

## 📊 Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3333 (admin/admin123)
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

## Architecture Overview

SwiftTrack is built as a microservices architecture using NestJS, integrating three heterogeneous systems:

1. **Client Management System (CMS)** - Legacy SOAP/XML API
2. **Route Optimization System (ROS)** - Modern REST/JSON API  
3. **Warehouse Management System (WMS)** - Proprietary TCP/IP messaging

### Services

- **API Gateway** - REST + WebSocket gateway with authentication
- **Order Service** - Order intake, state machine, saga orchestration
- **Driver Service** - Driver profiles, manifests, POD uploads
- **Tracking Service** - Real-time location tracking and notifications
- **Warehouse Service** - Warehouse and inventory management
- **Notification Service** - Push notifications, email, SMS
- **Admin Service** - Admin views, reports, feature flags
- **Integration Services** - CMS, ROS, WMS adapters

### Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS
- **Database**: PostgreSQL 15+ with TypeORM
- **Cache/Queues**: Redis, RabbitMQ
- **Auth**: JWT with Argon2 password hashing
- **Storage**: S3-compatible (MinIO)
- **Observability**: Winston, OpenTelemetry, Prometheus, Grafana

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker and Docker Compose

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd swifttrack
```

2. Install dependencies:
```bash
pnpm install
```

3. Start infrastructure services:
```bash
docker compose up -d postgres redis rabbitmq minio grafana prometheus
```

4. Setup environment and database:
```bash
pnpm setup
pnpm db:migrate
pnpm db:seed
```

5. Start all services:
```bash
pnpm dev
```

6. Run smoke tests:
```bash
pnpm smoke-test
```

### API Documentation

- API Gateway: http://localhost:3000/docs
- Health Check: http://localhost:3000/health
- Grafana: http://localhost:3001 (admin/admin)

## Development

### Project Structure

```
swifttrack/
├── apps/                    # Microservices
│   ├── api-gateway/        # REST + WebSocket gateway
│   ├── order-service/      # Order processing
│   ├── driver-service/     # Driver management
│   ├── tracking-service/   # Real-time tracking
│   ├── warehouse-service/  # Warehouse operations
│   ├── notification-service/ # Notifications
│   ├── admin-service/      # Admin operations
│   └── integration-*/      # External system adapters
├── packages/               # Shared libraries
│   ├── db/                # Database entities & migrations
│   ├── shared/            # Common types & utilities
│   ├── message-bus/       # Message broker abstraction
│   └── security/          # Authentication & authorization
├── infra/                 # Infrastructure configuration
├── docs/                  # Documentation
└── scripts/               # Development scripts
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/swifttrack

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=swifttrack-pods

# External Services
CMS_SOAP_URL=http://localhost:8080/cms/soap
ROS_REST_URL=http://localhost:8081/ros/api
WMS_TCP_HOST=localhost
WMS_TCP_PORT=8082
```

### Database Migrations

```bash
# Run migrations
pnpm db:migrate

# Create new migration
cd packages/db
pnpm migration:create MigrationName

# Seed data
pnpm db:seed
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Smoke test
pnpm smoke-test
```

### Code Quality

```bash
# Lint
pnpm lint

# Format
pnpm format
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register client
- `POST /auth/login` - Login (client/driver/admin)
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout

### Orders
- `POST /orders` - Create order (idempotent)
- `GET /orders` - List orders with filters
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status
- `POST /orders/:id/confirm` - Confirm delivery
- `POST /orders/:id/fail` - Mark order failed
- `POST /orders/:id/pod` - Upload proof of delivery

### Drivers
- `GET /drivers/me/manifest` - Get driver manifest
- `GET /drivers/me/route` - Get optimized route
- `POST /drivers/me/location` - Update driver location
- `POST /drivers/me/ack-route` - Acknowledge route

### Warehouse
- `GET /warehouse/:orderId` - Get warehouse info
- `POST /warehouse/:orderId/arrive` - Mark arrival
- `POST /warehouse/:orderId/depart` - Mark departure

### Admin
- `GET /admin/reports/throughput` - Performance reports
- `GET /admin/audit` - Audit logs

## WebSocket Events

### Client Portal
- Join room: `orders/{orderId}`
- Events: `order.status.updated`, `order.location.updated`

### Driver App
- Join room: `drivers/{driverId}`
- Events: `route.updated`, `manifest.updated`, `order.assigned`

## State Machine

Order status transitions:
```
placed → at_warehouse → picked → in_transit → delivered → confirmed
                                          ↘ failed
```

## Integration Patterns

### Saga Pattern
Order processing uses orchestrated saga with compensations:
1. Create in CMS
2. Add to WMS
3. Plan route in ROS
4. Assign driver
5. Notify client

### Outbox Pattern
Domain events are stored in outbox table and published to RabbitMQ asynchronously.

### Circuit Breaker
External service calls protected with circuit breakers and retry logic.

## Monitoring

- **Metrics**: Prometheus metrics at `/metrics`
- **Health**: Health checks at `/health` and `/ready`
- **Tracing**: OpenTelemetry distributed tracing
- **Logs**: Structured logging with Winston
- **Dashboards**: Grafana dashboards for monitoring

## Security

- TLS termination at load balancer
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and IP allowlisting
- Audit logging for all operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run quality checks: `pnpm lint && pnpm test`
5. Submit a pull request

## License

Copyright (c) 2025 Swift Logistics (Pvt) Ltd. All rights reserved.
