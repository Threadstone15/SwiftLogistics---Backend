#!/bin/bash

# SwiftTrack Backend Health Check Script
echo "🔍 SwiftTrack Backend Health Check"
echo "=================================="
echo ""

# Check Docker services
echo "📊 Docker Services Status:"
docker-compose ps

echo ""
echo "🌐 Service Health Checks:"

# Check API Gateway
echo -n "API Gateway (http://localhost:3000/health): "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check PostgreSQL
echo -n "PostgreSQL (localhost:5432): "
if docker exec swifttrack-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check Redis
echo -n "Redis (localhost:6379): "
if docker exec swifttrack-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check RabbitMQ
echo -n "RabbitMQ Management (http://localhost:15672): "
if curl -s http://localhost:15672 > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
echo "🔗 Quick Access Links:"
echo "  • API Gateway:     http://localhost:3000"
echo "  • Health Check:    http://localhost:3000/health"
echo "  • API Docs:        http://localhost:3000/api/docs"
echo "  • Grafana:         http://localhost:3001"
echo "  • RabbitMQ:        http://localhost:15672"
echo "  • MinIO:           http://localhost:9001"
echo "  • Prometheus:      http://localhost:9090"
echo "  • Jaeger:          http://localhost:16686"
