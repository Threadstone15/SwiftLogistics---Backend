export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, public readonly correlationId?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this);
    }
  }
}
