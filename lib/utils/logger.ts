/**
 * Logging System
 * Pino-based logging with sensitive data redaction
 */

import pino from 'pino'

// ============================================
// SENSITIVE DATA REDACTION
// ============================================

const sensitiveKeys = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'access_token',
  'refresh_token',
  'api_key',
  'apikey',
  'auth',
  'credential',
]

function redactSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData)
  }

  const redacted: any = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()

    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      redacted[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

// ============================================
// LOGGER CONFIGURATION
// ============================================

const isDevelopment = process.env.NODE_ENV === 'development'

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  serializers: {
    req: (req) => {
      return {
        method: req.method,
        url: req.url,
        headers: redactSensitiveData(req.headers),
      }
    },
    res: (res) => {
      return {
        statusCode: res.statusCode,
      }
    },
    err: pino.stdSerializers.err,
  },
})

// ============================================
// CONTEXTUAL LOGGER
// ============================================

export function createLogger(context: Record<string, any> = {}) {
  return logger.child(redactSensitiveData(context))
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

export function logApiCall(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string,
  error?: Error
) {
  const logData: any = {
    type: 'api_call',
    method,
    path,
    statusCode,
    duration,
  }

  if (userId) {
    logData.userId = userId
  }

  if (error) {
    logData.error = {
      message: error.message,
      stack: error.stack,
    }
    logger.error(logData, `API ${method} ${path} failed`)
  } else {
    logger.info(logData, `API ${method} ${path}`)
  }
}

export function logDbQuery(
  query: string,
  duration: number,
  rows?: number,
  error?: Error
) {
  const logData: any = {
    type: 'db_query',
    query: query.substring(0, 200), // Truncate long queries
    duration,
  }

  if (rows !== undefined) {
    logData.rows = rows
  }

  if (error) {
    logData.error = {
      message: error.message,
    }
    logger.error(logData, 'Database query failed')
  } else {
    logger.debug(logData, 'Database query executed')
  }
}

export function logCacheOp(
  operation: 'get' | 'set' | 'delete' | 'hit' | 'miss',
  key: string,
  duration?: number,
  error?: Error
) {
  const logData: any = {
    type: 'cache_op',
    operation,
    key: key.substring(0, 100), // Truncate long keys
  }

  if (duration !== undefined) {
    logData.duration = duration
  }

  if (error) {
    logData.error = {
      message: error.message,
    }
    logger.error(logData, 'Cache operation failed')
  } else {
    logger.debug(logData, `Cache ${operation}`)
  }
}

export function logEvent(
  event: string,
  userId: string,
  data?: Record<string, any>
) {
  logger.info(
    {
      type: 'event',
      event,
      userId,
      data: redactSensitiveData(data || {}),
    },
    `Event: ${event}`
  )
}

// ============================================
// PERFORMANCE LOGGING
// ============================================

export function createTimer(label: string) {
  const start = Date.now()

  return {
    end: () => {
      const duration = Date.now() - start
      logger.debug({ type: 'timer', label, duration }, `Timer: ${label}`)
      return duration
    },
    log: (message?: string) => {
      const duration = Date.now() - start
      logger.debug(
        { type: 'timer', label, duration },
        message || `Timer: ${label}`
      )
      return duration
    },
  }
}

export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = createTimer(label)
  try {
    const result = await fn()
    timer.log(`${label} completed`)
    return result
  } catch (error) {
    timer.log(`${label} failed`)
    throw error
  }
}

// ============================================
// EXPORTS
// ============================================

export default logger
// All other functions are already exported above
