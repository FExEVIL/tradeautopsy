/**
 * Error Handling System
 * Custom error classes, error normalization, and retry logic
 */

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

export class ValidationError extends AppError {
  constructor(
    public readonly field: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, { field, ...details })
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, details)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: Record<string, any>) {
    super(`${resource} not found`, 'NOT_FOUND', 404, true, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, { retryAfter })
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error, details?: Record<string, any>) {
    super(
      `Database error: ${message}`,
      'DATABASE_ERROR',
      500,
      false,
      { originalError: originalError?.message, ...details }
    )
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    originalError?: Error,
    details?: Record<string, any>
  ) {
    super(
      `${service} error: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      false,
      { service, originalError: originalError?.message, ...details }
    )
  }
}

// ============================================
// ERROR NORMALIZATION
// ============================================

export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Error instance
  if (error instanceof Error) {
    const message = error.message || 'An unexpected error occurred'
    
    // Check for known error patterns
    if (message.includes('JWT') || message.includes('token')) {
      return new AuthenticationError('Invalid or expired token')
    }

    if (message.includes('permission') || message.includes('denied')) {
      return new AuthorizationError(message)
    }

    if (message.includes('not found') || message.includes('does not exist')) {
      return new NotFoundError(message)
    }

    if (message.includes('rate limit') || message.includes('too many')) {
      return new RateLimitError(message)
    }

    // Database errors
    if (message.includes('duplicate') || message.includes('unique')) {
      return new DatabaseError('Duplicate entry', error)
    }

    if (message.includes('foreign key') || message.includes('constraint')) {
      return new DatabaseError('Constraint violation', error)
    }

    // Generic error
    return new AppError(message, 'INTERNAL_ERROR', 500, false)
  }

  // Error object with message property
  if (error && typeof error === 'object') {
    // Check for nested error structure: { error: { message: '...' } }
    if ('error' in error && error.error && typeof error.error === 'object') {
      const nestedError = error.error as any
      if ('message' in nestedError && typeof nestedError.message === 'string' && nestedError.message.trim()) {
        return new AppError(nestedError.message, 'INTERNAL_ERROR', 500, false)
      }
      // Check if nested error itself is a string
      if (typeof nestedError === 'string' && nestedError.trim()) {
        return new AppError(nestedError, 'INTERNAL_ERROR', 500, false)
      }
    }

    // Check for direct message property
    if ('message' in error) {
      const message = (error as any).message
      if (typeof message === 'string' && message.trim() && message !== '[object Object]') {
        return new AppError(message, 'INTERNAL_ERROR', 500, false)
      }
    }

    // Check for error property (common in API responses)
    if ('error' in error) {
      const errorValue = (error as any).error
      if (typeof errorValue === 'string' && errorValue.trim() && errorValue !== '[object Object]') {
        return new AppError(errorValue, 'INTERNAL_ERROR', 500, false)
      }
    }

    // Check for WorkOS-specific error format
    if ('code' in error || 'statusCode' in error || 'response' in error) {
      const workosError = error as any
      const message = workosError.message || workosError.error?.message || workosError.response?.message || 'WorkOS service error'
      const msgString = String(message)
      if (msgString && msgString !== '[object Object]' && msgString.trim()) {
        return new AppError(msgString, 'EXTERNAL_SERVICE_ERROR', workosError.statusCode || 500, false)
      }
    }

    // Try to extract meaningful information from the object
    const keys = Object.keys(error)
    if (keys.length > 0) {
      // Try to find a meaningful message
      for (const key of ['message', 'error', 'msg', 'description', 'detail', 'reason']) {
        if (key in error && typeof (error as any)[key] === 'string') {
          const msg = (error as any)[key]
          if (msg && msg.trim() && msg !== '[object Object]') {
            return new AppError(msg, 'INTERNAL_ERROR', 500, false)
          }
        }
      }
    }

    // Try to stringify the object (but avoid [object Object])
    try {
      const errorString = JSON.stringify(error, null, 2)
      // If stringification produces something meaningful, use it
      if (errorString && errorString !== '{}' && !errorString.includes('[object Object]')) {
        // Limit the length to avoid huge error messages
        const truncated = errorString.length > 500 ? errorString.substring(0, 500) + '...' : errorString
        return new AppError(`An unexpected error occurred: ${truncated}`, 'UNKNOWN_ERROR', 500, false)
      }
    } catch {
      // JSON.stringify failed, fall through
    }

    // Last resort: return generic error
    return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, false)
  }

  // String error
  if (typeof error === 'string') {
    return new AppError(error, 'INTERNAL_ERROR', 500, false)
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, false)
}

// ============================================
// ERROR HANDLING
// ============================================

export function handleError(error: unknown, context?: Record<string, any>): AppError {
  const normalizedError = normalizeError(error)

  // Ensure message is never '[object Object]'
  if (!normalizedError.message || normalizedError.message === '[object Object]' || normalizedError.message.trim() === '') {
    normalizedError.message = 'An unexpected error occurred'
  }

  // Log error (will be handled by logger)
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', {
      code: normalizedError.code,
      message: normalizedError.message,
      statusCode: normalizedError.statusCode,
      context,
      stack: normalizedError.stack,
    })
  } else {
    console.error('Error:', normalizedError)
    if (context) {
      console.error('Context:', context)
    }
  }

  return normalizedError
}

// ============================================
// USER-FRIENDLY MESSAGES
// ============================================

export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.'
    case 'AUTHENTICATION_ERROR':
      return 'Please sign in to continue.'
    case 'AUTHORIZATION_ERROR':
      return 'You do not have permission to perform this action.'
    case 'NOT_FOUND':
      return 'The requested resource was not found.'
    case 'RATE_LIMIT_ERROR':
      return 'Too many requests. Please try again in a moment.'
    case 'DATABASE_ERROR':
      return 'A database error occurred. Please try again later.'
    case 'EXTERNAL_SERVICE_ERROR':
      return 'A service error occurred. Please try again later.'
    default:
      return 'An unexpected error occurred. Please try again later.'
  }
}

// ============================================
// RETRY LOGIC
// ============================================

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  backoffMultiplier?: number
  maxDelay?: number
  retryable?: (error: Error) => boolean
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  retryable: () => true,
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      if (!opts.retryable(lastError)) {
        throw lastError
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Retry failed')
}

// ============================================
// EXPORTS
// ============================================
// All classes and functions are already exported above

