export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'swifttrack',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  services: {
    orderService: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3001',
    },
    driverService: {
      url: process.env.DRIVER_SERVICE_URL || 'http://localhost:3002',
    },
    trackingService: {
      url: process.env.TRACKING_SERVICE_URL || 'http://localhost:3003',
    },
    warehouseService: {
      url: process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:3004',
    },
    notificationService: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    },
    adminService: {
      url: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006',
    },
  },
  external: {
    cmsService: {
      url: process.env.CMS_SERVICE_URL || 'http://localhost:8080/cms',
      username: process.env.CMS_USERNAME,
      password: process.env.CMS_PASSWORD,
    },
    rosService: {
      url: process.env.ROS_SERVICE_URL || 'http://localhost:8081/ros',
      apiKey: process.env.ROS_API_KEY,
    },
    wmsService: {
      host: process.env.WMS_HOST || 'localhost',
      port: parseInt(process.env.WMS_PORT, 10) || 8082,
      timeout: parseInt(process.env.WMS_TIMEOUT, 10) || 30000,
    },
  },
});
