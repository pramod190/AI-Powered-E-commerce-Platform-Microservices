/**
 * Analytics Service - Application Error
 */

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: Record<string, any>) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string, details?: Record<string, any>) {
    return new AppError(401, 'UNAUTHORIZED', message, details);
  }

  static forbidden(message: string, details?: Record<string, any>) {
    return new AppError(403, 'FORBIDDEN', message, details);
  }

  static notFound(message: string, details?: Record<string, any>) {
    return new AppError(404, 'NOT_FOUND', message, details);
  }

  static internal(message: string, details?: Record<string, any>) {
    return new AppError(500, 'INTERNAL_ERROR', message, details);
  }
}
