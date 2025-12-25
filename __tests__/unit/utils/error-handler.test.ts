/**
 * Unit Tests: Error Handler Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  normalizeError,
  handleError,
  getUserFriendlyMessage,
  withRetry,
} from '@/lib/utils/error-handler'

describe('Error Classes', () => {
  it('should create AppError with default values', () => {
    const error = new AppError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(true)
  })

  it('should create ValidationError', () => {
    const error = new ValidationError('email', 'Invalid email format')
    expect(error.message).toBe('Invalid email format')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.field).toBe('email')
  })

  it('should create AuthenticationError', () => {
    const error = new AuthenticationError('Token expired')
    expect(error.message).toBe('Token expired')
    expect(error.code).toBe('AUTHENTICATION_ERROR')
    expect(error.statusCode).toBe(401)
  })

  it('should create AuthorizationError', () => {
    const error = new AuthorizationError('Access denied')
    expect(error.message).toBe('Access denied')
    expect(error.code).toBe('AUTHORIZATION_ERROR')
    expect(error.statusCode).toBe(403)
  })

  it('should create NotFoundError', () => {
    const error = new NotFoundError('User')
    expect(error.message).toBe('User not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
  })

  it('should create RateLimitError', () => {
    const error = new RateLimitError('Too many requests', 60)
    expect(error.message).toBe('Too many requests')
    expect(error.code).toBe('RATE_LIMIT_ERROR')
    expect(error.statusCode).toBe(429)
    expect(error.details?.retryAfter).toBe(60)
  })

  it('should create DatabaseError', () => {
    const originalError = new Error('Connection failed')
    const error = new DatabaseError('Query failed', originalError)
    expect(error.message).toBe('Database error: Query failed')
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
  })

  it('should create ExternalServiceError', () => {
    const originalError = new Error('Service unavailable')
    const error = new ExternalServiceError('API', 'Request failed', originalError)
    expect(error.message).toBe('API error: Request failed')
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
    expect(error.statusCode).toBe(502)
  })
})

describe('normalizeError', () => {
  it('should return AppError as-is', () => {
    const error = new AppError('Test')
    expect(normalizeError(error)).toBe(error)
  })

  it('should normalize Error instance', () => {
    const error = new Error('Test error')
    const normalized = normalizeError(error)
    expect(normalized).toBeInstanceOf(AppError)
    expect(normalized.message).toBe('Test error')
  })

  it('should detect authentication errors', () => {
    const error = new Error('JWT expired')
    const normalized = normalizeError(error)
    expect(normalized).toBeInstanceOf(AuthenticationError)
  })

  it('should detect authorization errors', () => {
    const error = new Error('Permission denied')
    const normalized = normalizeError(error)
    expect(normalized).toBeInstanceOf(AuthorizationError)
  })

  it('should detect not found errors', () => {
    const error = new Error('Resource not found')
    const normalized = normalizeError(error)
    expect(normalized).toBeInstanceOf(NotFoundError)
  })

  it('should detect rate limit errors', () => {
    const error = new Error('Rate limit exceeded')
    const normalized = normalizeError(error)
    expect(normalized).toBeInstanceOf(RateLimitError)
  })

  it('should normalize string errors', () => {
    const normalized = normalizeError('String error')
    expect(normalized).toBeInstanceOf(AppError)
    expect(normalized.message).toBe('String error')
  })

  it('should handle unknown error types', () => {
    const normalized = normalizeError(null)
    expect(normalized).toBeInstanceOf(AppError)
    expect(normalized.message).toBe('An unexpected error occurred')
  })
})

describe('handleError', () => {
  it('should normalize and return error', () => {
    const error = new Error('Test error')
    const handled = handleError(error, { userId: '123' })
    expect(handled).toBeInstanceOf(AppError)
    expect(handled.message).toBe('Test error')
  })

  it('should prevent [object Object] messages', () => {
    const error = { toString: () => '[object Object]' }
    const handled = handleError(error)
    expect(handled.message).not.toBe('[object Object]')
    expect(handled.message).toBe('An unexpected error occurred')
  })
})

describe('getUserFriendlyMessage', () => {
  it('should return user-friendly message for ValidationError', () => {
    const error = new ValidationError('email', 'Invalid')
    expect(getUserFriendlyMessage(error)).toBe('Please check your input and try again.')
  })

  it('should return user-friendly message for AuthenticationError', () => {
    const error = new AuthenticationError()
    expect(getUserFriendlyMessage(error)).toBe('Please sign in to continue.')
  })

  it('should return user-friendly message for AuthorizationError', () => {
    const error = new AuthorizationError()
    expect(getUserFriendlyMessage(error)).toBe('You do not have permission to perform this action.')
  })

  it('should return default message for unknown errors', () => {
    const error = new AppError('Unknown', 'UNKNOWN_CODE')
    expect(getUserFriendlyMessage(error)).toBe('An unexpected error occurred. Please try again later.')
  })
})

describe('withRetry', () => {
  it('should return result on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValueOnce('success')
    
    const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 10 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should fail after max attempts', async () => {
    const error = new Error('Persistent error')
    const fn = vi.fn().mockRejectedValue(error)
    
    await expect(withRetry(fn, { maxAttempts: 2, initialDelay: 10 })).rejects.toThrow('Persistent error')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should not retry non-retryable errors', async () => {
    const error = new ValidationError('field', 'Invalid')
    const fn = vi.fn().mockRejectedValue(error)
    
    await expect(withRetry(fn, {
      maxAttempts: 3,
      initialDelay: 10,
      retryable: (e) => !(e instanceof ValidationError),
    })).rejects.toThrow('Invalid')
    
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

