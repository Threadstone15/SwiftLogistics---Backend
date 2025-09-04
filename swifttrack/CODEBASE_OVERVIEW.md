# SwiftTrack Backend Codebase Overview

## Table of Contents

1. Introduction
2. Monorepo Structure
3. Main Components
   - API Gateway
   - Microservices
   - Shared Packages
4. TypeScript API Endpoints
5. Workflow: Request to Response
6. Development Workflow
7. Key Files and Folders

---

## 1. Introduction

SwiftTrack is a logistics management backend built with a microservices architecture using Node.js, TypeScript, and NestJS. It provides REST APIs and real-time WebSocket support for order, driver, warehouse, and tracking management.

---

## 2. Monorepo Structure

The project uses a pnpm monorepo with the following main folders:

- `apps/` — Application entry points (API Gateway, order-service, etc.)
- `packages/` — Shared libraries (db, message-bus, security, shared)
- `infrastructure/` — Mocks and supporting services
- `docs/` — Documentation
- `scripts/` — Setup and utility scripts

---

## 3. Main Components

### API Gateway (`apps/api-gateway`)

- **Purpose:** Central entry point for all HTTP and WebSocket traffic.
- **Tech:** NestJS, TypeScript
- **Responsibilities:**
  - Routing requests to microservices
  - Authentication & authorization
  - Rate limiting, validation, error handling
  - Serving Swagger API docs

### Microservices (`apps/order-service`, etc.)

- **Purpose:** Handle domain-specific logic (orders, drivers, etc.)
- **Tech:** NestJS, TypeScript
- **Communication:** Via message bus or direct HTTP (depending on service)

### Shared Packages (`packages/`)

- **db:** Database connection, entities, migrations
- **message-bus:** Abstraction for inter-service messaging
- **security:** JWT, password hashing, authorization helpers
- **shared:** DTOs, types, utilities, error classes

---

## 4. TypeScript API Endpoints

### Authentication (`apps/api-gateway/src/auth/`)

- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — User login
- `POST /api/v1/auth/driver/login` — Driver login
- `POST /api/v1/auth/refresh` — Refresh JWT
- `POST /api/v1/auth/logout` — Logout
- `GET /api/v1/auth/profile` — Get user profile
- `POST /api/v1/auth/change-password` — Change password

### Orders (`apps/api-gateway/src/orders/`)

- `POST /api/v1/orders` — Create order
- `GET /api/v1/orders` — List orders
- `GET /api/v1/orders/:id` — Get order by ID
- `PUT /api/v1/orders/:id` — Update order
- `DELETE /api/v1/orders/:id` — Cancel order
- `POST /api/v1/orders/:id/assign-driver` — Assign driver
- `PUT /api/v1/orders/:id/status` — Update status
- `GET /api/v1/orders/:id/tracking` — Get tracking info
- `POST /api/v1/orders/:id/rating` — Rate order

### Drivers (`apps/api-gateway/src/drivers/`)

- `GET /api/v1/drivers` — List drivers
- `GET /api/v1/drivers/profile` — Get driver profile
- `PUT /api/v1/drivers/profile` — Update driver profile
- `GET /api/v1/drivers/current-orders` — Get current orders
- `POST /api/v1/drivers/location` — Update location
- `PUT /api/v1/drivers/availability` — Update availability
- `GET /api/v1/drivers/:id` — Get driver by ID
- `GET /api/v1/drivers/:id/performance` — Get performance metrics

### Warehouse (`apps/api-gateway/src/warehouse/`)

- `GET /api/v1/warehouse/inventory` — Get inventory
- `GET /api/v1/warehouse/locations` — Get warehouse locations
- `GET /api/v1/warehouse/:location/orders` — Get warehouse orders
- `POST /api/v1/warehouse/:location/process-order` — Process order
- `GET /api/v1/warehouse/analytics` — Get analytics
- `PUT /api/v1/warehouse/:location/capacity` — Update capacity

### Tracking (`apps/api-gateway/src/tracking/`)

- `GET /api/v1/tracking/:orderId` — Track order

### Admin (`apps/api-gateway/src/admin/`)

- `GET /api/v1/admin/dashboard` — Dashboard data
- `GET /api/v1/admin/system-health` — System health

### Health (`apps/api-gateway/src/health/`)

- `GET /health` — System health check

### WebSocket (`apps/api-gateway/src/websocket/`)

- Real-time order tracking, location/status updates

---

## 5. Workflow: Request to Response

1. **Client sends HTTP request** to API Gateway (e.g., create order).
2. **API Gateway**:
   - Validates request (DTOs, pipes)
   - Authenticates user (JWT, roles)
   - Forwards to appropriate controller/service
3. **Controller** (e.g., `orders.controller.ts`) handles the route, calls service logic.
4. **Service** (e.g., `orders.service.ts`) performs business logic, interacts with DB or other microservices.
5. **Response** is returned to the client, with error handling and formatting as per API spec.
6. **WebSocket events** are emitted for real-time updates (e.g., order status/location changes).

---

## 6. Development Workflow

- Use `pnpm install` at the root to install all dependencies.
- Use `pnpm run dev:api-gateway` to start the API Gateway in dev mode.
- Use `pnpm run dev:order-service` for the order microservice.
- Use Docker Compose for local infrastructure (DB, message broker, etc.).
- Use Swagger docs at `/api/docs` for API exploration.

---

## 7. Key Files and Folders

- `apps/api-gateway/src/app.module.ts` — Main NestJS module, imports all feature modules
- `apps/api-gateway/src/main.ts` — App bootstrap, global middleware
- `apps/api-gateway/src/orders/` — Order controllers/services
- `packages/shared/src/dto/` — Shared DTOs for validation and typing
- `packages/shared/src/types/` — Shared TypeScript types (e.g., UserType, JwtPayload)
- `packages/security/src/` — JWT and password utilities
- `docker-compose.yml` — Local dev infrastructure
- `Makefile` — Common dev commands

---

## Summary

SwiftTrack is a modular, scalable backend for logistics, using NestJS and TypeScript. The API Gateway exposes REST and WebSocket endpoints, delegating business logic to microservices and using shared packages for common code. The codebase is organized for maintainability and rapid development.
