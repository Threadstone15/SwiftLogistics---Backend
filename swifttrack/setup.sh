#!/bin/bash

# SwiftTrack Backend Quick Setup Script
# This script automates the entire setup process

set -e  # Exit on any error

echo "🚀 Starting SwiftTrack Backend Setup..."
echo "======================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ and try again."
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi
echo "✅ pnpm $(pnpm --version) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker $(docker --version) found"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker is running"

echo ""
echo "🔧 Installing dependencies..."
pnpm install

echo ""
echo "🐳 Starting infrastructure services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until docker exec swifttrack-postgres pg_isready -U postgres &> /dev/null; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Check if Redis is ready
echo "🔍 Checking Redis connection..."
until docker exec swifttrack-redis redis-cli ping &> /dev/null; do
    echo "Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready"

echo ""
echo "📦 Building packages..."
pnpm run build:packages

echo ""
echo "🗄️ Running database migrations..."
pnpm run db:migrate

echo ""
echo "🌱 Seeding initial data..."
pnpm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Available Endpoints:"
echo "  • API Gateway:      http://localhost:3000"
echo "  • Health Check:     http://localhost:3000/health"
echo "  • Swagger Docs:     http://localhost:3000/api/docs"
echo "  • Grafana:          http://localhost:3001 (admin/admin)"
echo "  • RabbitMQ:         http://localhost:15672 (guest/guest)"
echo "  • MinIO Console:    http://localhost:9001 (minioadmin/minioadmin)"
echo "  • Prometheus:       http://localhost:9090"
echo "  • Jaeger:           http://localhost:16686"

echo ""
echo "👥 Default Login Credentials:"
echo "  • Admin:   admin@swifttrack.com / Admin123!"
echo "  • Client:  client1@example.com / Client123!"
echo "  • Driver:  driver1@swifttrack.com / Driver123!"

echo ""
echo "🚀 To start the backend services:"
echo "  pnpm run dev:api-gateway"
echo ""
echo "📖 For detailed instructions, see SETUP_GUIDE.md"
