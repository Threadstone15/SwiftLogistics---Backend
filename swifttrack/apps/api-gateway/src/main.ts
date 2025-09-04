import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(`🚀 [API-GATEWAY] Starting SwiftTrack API Gateway...`);
  console.log(`📅 [API-GATEWAY] Startup Time: ${new Date().toISOString()}`);
  console.log(`🌍 [API-GATEWAY] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 [API-GATEWAY] Log Level: ${process.env.LOG_LEVEL || 'info'}`);
  
  // Configure logger
  console.log(`📋 [API-GATEWAY] Configuring Winston logger...`);
  const logger = WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      process.env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.simple()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:4173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API documentation
  const config = new DocumentBuilder()
    .setTitle('SwiftTrack API')
    .setDescription('SwiftTrack Logistics Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Orders', 'Order management')
    .addTag('Drivers', 'Driver operations')
    .addTag('Warehouse', 'Warehouse operations')
    .addTag('Admin', 'Administrative operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.API_GATEWAY_PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});
