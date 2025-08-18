# SwiftTrack Development Makefile
.PHONY: help setup install build dev test clean docker-up docker-down migrate seed smoke-test

# Default target
help:
	@echo "SwiftTrack Development Commands:"
	@echo "  setup      - Initialize development environment"
	@echo "  install    - Install all dependencies"
	@echo "  build      - Build all services"
	@echo "  dev        - Start all services in development mode"
	@echo "  test       - Run all tests"
	@echo "  clean      - Clean build artifacts"
	@echo "  docker-up  - Start infrastructure services"
	@echo "  docker-down- Stop infrastructure services"
	@echo "  migrate    - Run database migrations"
	@echo "  seed       - Seed database with test data"
	@echo "  smoke-test - Run end-to-end smoke tests"

# Setup development environment
setup:
	@echo "🚀 Setting up SwiftTrack development environment..."
	node scripts/setup.js
	@echo "✅ Setup completed!"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "✅ Dependencies installed!"

# Build all services
build:
	@echo "🔨 Building all services..."
	pnpm run build
	@echo "✅ Build completed!"

# Start development servers
dev:
	@echo "🚀 Starting development servers..."
	@$(MAKE) docker-up
	@sleep 10
	@$(MAKE) migrate
	@$(MAKE) seed
	pnpm run dev

# Run tests
test:
	@echo "🧪 Running tests..."
	pnpm run test
	@echo "✅ Tests completed!"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Clean completed!"

# Start infrastructure services
docker-up:
	@echo "🐳 Starting infrastructure services..."
	docker compose up -d postgres redis rabbitmq minio prometheus grafana jaeger mock-cms mock-ros mock-wms
	@echo "⏳ Waiting for services to be ready..."
	@sleep 15
	@echo "✅ Infrastructure services started!"

# Stop infrastructure services
docker-down:
	@echo "🛑 Stopping infrastructure services..."
	docker compose down
	@echo "✅ Infrastructure services stopped!"

# Run database migrations
migrate:
	@echo "🗃️  Running database migrations..."
	cd packages/db && pnpm run migrate:up
	@echo "✅ Migrations completed!"

# Seed database
seed:
	@echo "🌱 Seeding database..."
	cd packages/db && pnpm run seed
	@echo "✅ Database seeded!"

# Run smoke tests
smoke-test:
	@echo "🧪 Running smoke tests..."
	node scripts/smoke-test.js
	@echo "✅ Smoke tests completed!"

# Full development setup
dev-setup: setup install docker-up migrate seed
	@echo "🎉 Development environment ready!"
	@echo "🚀 Run 'make dev' to start all services"

# Production build
prod-build:
	@echo "🏭 Building for production..."
	NODE_ENV=production pnpm run build
	@echo "✅ Production build completed!"

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:3000/api/v1/health || echo "❌ API Gateway not healthy"
	@curl -f http://localhost:3001/health || echo "❌ Order Service not healthy"
	@curl -f http://localhost:5432 || echo "❌ PostgreSQL not healthy"
	@curl -f http://localhost:6379 || echo "❌ Redis not healthy"
	@curl -f http://localhost:15672 || echo "❌ RabbitMQ not healthy"
	@echo "✅ Health check completed!"

# Logs
logs:
	@echo "📋 Showing service logs..."
	docker compose logs -f

# Database reset
reset-db:
	@echo "⚠️  Resetting database..."
	@read -p "This will delete all data. Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down postgres; \
		docker volume rm swifttrack_postgres_data || true; \
		$(MAKE) docker-up; \
		sleep 10; \
		$(MAKE) migrate; \
		$(MAKE) seed; \
		echo "✅ Database reset completed!"; \
	else \
		echo "❌ Database reset cancelled."; \
	fi
