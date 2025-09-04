import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(`📦 [ORDER-SERVICE] Starting SwiftTrack Order Service...`);
  console.log(`📅 [ORDER-SERVICE] Startup Time: ${new Date().toISOString()}`);
  console.log(`🌍 [ORDER-SERVICE] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ [ORDER-SERVICE] Database: ${process.env.DATABASE_NAME || 'swifttrack'}`);
  console.log(`🚪 [ORDER-SERVICE] Port: ${process.env.ORDER_SERVICE_PORT || 3001}`);
  
  console.log(`📋 [ORDER-SERVICE] Configuring Winston logger...`);
  const logger = WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/order-service.log' }),
    ],
  });

  console.log(`🏗️ [ORDER-SERVICE] Creating NestJS application...`);
  const app = await NestFactory.create(AppModule, { logger });
  console.log(`✅ [ORDER-SERVICE] NestJS application created successfully`);

  console.log(`⚙️ [ORDER-SERVICE] Configuring global validation pipes...`);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  console.log(`✅ [ORDER-SERVICE] Global validation pipes configured`);

  const port = process.env.ORDER_SERVICE_PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Order Service is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Order Service:', error);
  process.exit(1);
});
