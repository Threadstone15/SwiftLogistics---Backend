# 📋 SwiftTrack Backend Setup Checklist

Use this checklist to ensure your SwiftTrack backend is properly set up and running.

## ✅ Prerequisites Checklist

- [ ] **Node.js 18+** installed and working (`node --version`)
- [ ] **pnpm** installed and working (`pnpm --version`)
- [ ] **Docker Desktop** installed and running (`docker --version`)
- [ ] **Git** available for cloning the repository

## ✅ Setup Process Checklist

### 1. Repository Setup

- [ ] Repository cloned from GitHub
- [ ] Navigate to `SwiftLogistics---Backend/swifttrack` directory
- [ ] All project files visible

### 2. Dependencies

- [ ] Run `pnpm install` successfully
- [ ] All packages installed without errors
- [ ] Node modules directory created

### 3. Infrastructure Services

- [ ] Run `docker-compose up -d` successfully
- [ ] All 9 Docker containers running (`docker-compose ps`)
- [ ] PostgreSQL container healthy
- [ ] Redis container healthy
- [ ] RabbitMQ container healthy
- [ ] MinIO container healthy

### 4. Package Building

- [ ] Run `pnpm run build:packages` successfully
- [ ] @swifttrack/shared package built
- [ ] @swifttrack/security package built
- [ ] @swifttrack/message-bus package built
- [ ] @swifttrack/db package built

### 5. Database Setup

- [ ] Run `pnpm run db:migrate` successfully
- [ ] All database tables created
- [ ] Custom types and indexes created
- [ ] Migration completed without errors

### 6. Initial Data

- [ ] Run `pnpm run db:seed` successfully
- [ ] 6 users created (1 admin, 5 clients)
- [ ] 3 drivers created
- [ ] 20 orders created
- [ ] 4 warehouse records created

## ✅ Verification Checklist

### Service Connectivity

- [ ] PostgreSQL: `docker exec swifttrack-postgres pg_isready -U postgres`
- [ ] Redis: `docker exec swifttrack-redis redis-cli ping`
- [ ] All containers show "Up" status in `docker-compose ps`

### Database Verification

- [ ] Connect to database: `docker exec -it swifttrack-postgres psql -U postgres -d swifttrack`
- [ ] Check tables exist: `\dt`
- [ ] Check users: `SELECT * FROM users;`
- [ ] Check orders: `SELECT COUNT(*) FROM orders;`

### Web Interface Access

- [ ] Grafana accessible: http://localhost:3001 (admin/admin)
- [ ] RabbitMQ Management: http://localhost:15672 (guest/guest)
- [ ] MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
- [ ] Prometheus: http://localhost:9090

## ✅ Application Startup Checklist

### API Gateway

- [ ] Run `pnpm run dev:api-gateway`
- [ ] Service starts without errors
- [ ] Health check accessible: http://localhost:3000/health
- [ ] Swagger docs accessible: http://localhost:3000/api/docs

### Login Verification

- [ ] Admin login works: admin@swifttrack.com / Admin123!
- [ ] Client login works: client1@example.com / Client123!
- [ ] Driver login works: driver1@swifttrack.com / Driver123!

## 🚨 Troubleshooting Checklist

### If Docker services fail:

- [ ] Check Docker Desktop is running
- [ ] Check ports 3000, 5432, 6379, 15672 are available
- [ ] Run `docker-compose down` then `docker-compose up -d`
- [ ] Check logs: `docker-compose logs [service-name]`

### If package build fails:

- [ ] Check Node.js version is 18+
- [ ] Clear cache: `pnpm run clean`
- [ ] Reinstall: `rm -rf node_modules && pnpm install`
- [ ] Build individually: `pnpm --filter=@swifttrack/shared build`

### If database migration fails:

- [ ] Check PostgreSQL is running and accessible
- [ ] Check if database exists
- [ ] Reset database: `docker-compose down -v && docker-compose up -d`
- [ ] Wait for PostgreSQL to be ready, then retry migration

### If API Gateway fails to start:

- [ ] Check all packages are built successfully
- [ ] Check PostgreSQL and Redis are accessible
- [ ] Check port 3000 is available
- [ ] Review application logs for specific errors

## 📝 Success Criteria

Your setup is complete when:

✅ **All Docker containers are running**
✅ **All packages build successfully**
✅ **Database migration completes**
✅ **Initial data is seeded**
✅ **API Gateway starts and responds to health checks**
✅ **All web interfaces are accessible**
✅ **Test login credentials work**

## 🎯 Next Steps

Once your checklist is complete:

1. **API Development**: Start building additional endpoints
2. **Frontend Integration**: Connect your frontend application
3. **Testing**: Run the test suites
4. **Customization**: Modify configurations for your specific needs

---

**Need Help?**

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- Run `health-check.bat` (Windows) or `health-check.sh` (macOS/Linux) to verify services
- Review logs: `docker-compose logs -f`
