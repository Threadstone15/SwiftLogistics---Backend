#!/bin/bash

# SwiftTrack Development Startup Script

set -e

echo "🚀 Starting SwiftTrack Development Environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

if ! command_exists pnpm; then
    echo "⚠️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ Prerequisites check passed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please review and update if needed."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis rabbitmq minio prometheus grafana

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
until docker-compose exec postgres pg_isready -U postgres; do
    echo "⏳ Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready"

# Run migrations
echo "🗃️  Running database migrations..."
pnpm run db:migrate

# Seed initial data
echo "🌱 Seeding initial data..."
pnpm run db:seed

# Start mock services
echo "🧪 Starting mock external services..."
docker-compose up -d cms-mock ros-mock wms-mock

echo ""
echo "🎉 SwiftTrack development environment is ready!"
echo ""
echo "📚 Available services:"
echo "  • API Gateway:        http://localhost:3000"
echo "  • API Documentation:  http://localhost:3000/api/docs"
echo "  • Order Service:      http://localhost:3001"
echo "  • Grafana Dashboard:  http://localhost:3333 (admin/admin123)"
echo "  • Prometheus:         http://localhost:9090"
echo "  • RabbitMQ Mgmt:      http://localhost:15672 (admin/admin123)"
echo "  • MinIO Console:      http://localhost:9001 (minioadmin/minioadmin123)"
echo ""
echo "🧪 Mock services:"
echo "  • CMS Mock (SOAP):    http://localhost:8080"
echo "  • ROS Mock (REST):    http://localhost:8081"
echo "  • WMS Mock (TCP):     localhost:8082"
echo ""
echo "🔐 Default credentials:"
echo "  • Admin: admin@swifttrack.com / Admin123!"
echo "  • Client: client1@example.com / Client123!"
echo "  • Driver: driver1@swifttrack.com / Driver123!"
echo ""
echo "🚀 To start the application services, run:"
echo "  pnpm run dev"
echo ""
echo "📖 For more information, check the README.md file"
