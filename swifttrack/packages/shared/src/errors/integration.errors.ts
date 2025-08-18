import { BaseError } from './base.error';

export class IntegrationError extends BaseError {
  readonly statusCode = 502;
  readonly isOperational = true;

  constructor(service: string, message: string, correlationId?: string) {
    super(`${service} integration error: ${message}`, correlationId);
  }
}

export class CircuitBreakerOpenError extends BaseError {
  readonly statusCode = 503;
  readonly isOperational = true;

  constructor(service: string, correlationId?: string) {
    super(`${service} circuit breaker is open`, correlationId);
  }
}

export class TimeoutError extends BaseError {
  readonly statusCode = 504;
  readonly isOperational = true;

  constructor(service: string, timeoutMs: number, correlationId?: string) {
    super(`${service} timeout after ${timeoutMs}ms`, correlationId);
  }
}

export class RetryExhaustedError extends BaseError {
  readonly statusCode = 503;
  readonly isOperational = true;

  constructor(service: string, attempts: number, correlationId?: string) {
    super(`${service} retry exhausted after ${attempts} attempts`, correlationId);
  }
}
