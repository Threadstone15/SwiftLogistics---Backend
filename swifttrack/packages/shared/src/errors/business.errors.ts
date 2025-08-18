import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string, correlationId?: string) {
    super(message, correlationId);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, correlationId?: string) {
    super(`${resource} not found`, correlationId);
  }
}

export class UnauthorizedError extends BaseError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message = 'Unauthorized', correlationId?: string) {
    super(message, correlationId);
  }
}

export class ForbiddenError extends BaseError {
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message = 'Forbidden', correlationId?: string) {
    super(message, correlationId);
  }
}

export class ConflictError extends BaseError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string, correlationId?: string) {
    super(message, correlationId);
  }
}

export class OrderStatusTransitionError extends BaseError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(fromStatus: string, toStatus: string, correlationId?: string) {
    super(`Invalid status transition from ${fromStatus} to ${toStatus}`, correlationId);
  }
}

export class InsufficientInventoryError extends BaseError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(orderId: number, correlationId?: string) {
    super(`Insufficient inventory for order ${orderId}`, correlationId);
  }
}
