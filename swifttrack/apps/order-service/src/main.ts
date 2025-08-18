import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
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

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.ORDER_SERVICE_PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Order Service is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Order Service:', error);
  process.exit(1);
});
