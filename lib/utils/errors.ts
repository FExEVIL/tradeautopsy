/**
 * Error Handling Utilities
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      isOperational?: boolean;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'INTERNAL_ERROR';
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;
    this.cause = options.cause;

    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      isOperational: true,
    });
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, {
      code: 'UNAUTHORIZED',
      statusCode: 401,
      isOperational: true,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, {
      code: 'FORBIDDEN',
      statusCode: 403,
      isOperational: true,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      isOperational: true,
      context: { resource, id },
    });
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super('Rate limit exceeded', {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      isOperational: true,
    });
    this.retryAfter = retryAfter;
  }
}

export function handleError(
  error: unknown,
  options: {
    logError?: boolean;
    sendToSentry?: boolean;
  } = {}
): AppError {
  const { logError = true } = options;

  const appError = normalizeError(error);

  if (logError) {
    console.error('[Error]', {
      code: appError.code,
      message: appError.message,
      context: appError.context,
    });
  }

  return appError;
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes('JWT')) {
      return new AuthenticationError('Session expired');
    }
    
    if (error.message.includes('permission denied') || 
        error.message.includes('row-level security')) {
      return new AuthorizationError();
    }

    if (error.message.includes('not found') || 
        error.message.includes('no rows')) {
      return new NotFoundError('Resource');
    }

    return new AppError(error.message, {
      cause: error,
      isOperational: false,
    });
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError('An unexpected error occurred', {
    context: { originalError: String(error) },
  });
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    maxDelayMs?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    maxDelayMs = 30000,
  } = options;

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      if (error instanceof AppError) {
        if (['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN'].includes(error.code)) {
          throw error;
        }
      }

      await sleep(currentDelay);
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource could not be found.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
};

export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return USER_FRIENDLY_MESSAGES[error.code] || error.message;
  }

  return USER_FRIENDLY_MESSAGES.INTERNAL_ERROR;
}

export { sleep };
