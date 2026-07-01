export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(422, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = 'UNAUTHORIZED') {
    super(401, code, message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(409, code, message);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error occurred') {
    super(500, 'DATABASE_ERROR', message);
    this.name = 'DatabaseError';
  }
}
