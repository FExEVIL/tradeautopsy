const logger = {
  info: (data: any, msg?: string) => {
    console.log(msg || 'INFO:', data)
  },
  error: (data: any, msg?: string) => {
    console.error(msg || 'ERROR:', data)
  },
  warn: (data: any, msg?: string) => {
    console.warn(msg || 'WARN:', data)
  },
  debug: (data: any, msg?: string) => {
    console.debug(msg || 'DEBUG:', data)
  },
}

// Helper functions for backward compatibility
export function logApiCall(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string,
  error?: Error | any
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
      message: error.message || String(error),
      stack: error.stack,
    }
    logger.error(logData, `API ${method} ${path} failed`)
  } else {
    logger.info(logData, `API ${method} ${path}`)
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
      data: data || {},
    },
    `Event: ${event}`
  )
}

export function logDbQuery(
  query: string,
  duration: number,
  rows?: number,
  error?: Error
) {
  const logData: any = {
    type: 'db_query',
    query: query.substring(0, 200),
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
    key: key.substring(0, 100),
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

export function createLogger(context: Record<string, any> = {}) {
  return {
    info: (data: any, msg?: string) => {
      const mergedData = typeof data === 'object' ? { ...context, ...data } : data
      logger.info(mergedData, msg)
    },
    error: (data: any, msg?: string) => {
      const mergedData = typeof data === 'object' ? { ...context, ...data } : data
      logger.error(mergedData, msg)
    },
    warn: (data: any, msg?: string) => {
      const mergedData = typeof data === 'object' ? { ...context, ...data } : data
      logger.warn(mergedData, msg)
    },
    debug: (data: any, msg?: string) => {
      const mergedData = typeof data === 'object' ? { ...context, ...data } : data
      logger.debug(mergedData, msg)
    },
  }
}

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

export { logger }
export default logger
