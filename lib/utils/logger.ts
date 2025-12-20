/**
 * Structured Logging for TradeAutopsy
 */

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

interface LogContext {
  userId?: string;
  profileId?: string;
  requestId?: string;
  traceId?: string;
  [key: string]: unknown;
}

let loggerInstance: any;

if (typeof window === 'undefined') {
  // Server-side logging
  try {
    const pino = require('pino');
    const options = {
      level: logLevel,
      base: {
        env: process.env.NODE_ENV,
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    };

    if (isProduction) {
      loggerInstance = pino(options);
    } else {
      const pinoPretty = require('pino-pretty');
      loggerInstance = pino({
        ...options,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      });
    }
  } catch {
    // Fallback to console if pino not available
    loggerInstance = {
      debug: console.debug.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      fatal: console.error.bind(console),
      trace: console.trace.bind(console),
      child: () => loggerInstance,
    };
  }
} else {
  // Client-side logging
  loggerInstance = {
    debug: (...args: unknown[]) => console.debug('[DEBUG]', ...args),
    info: (...args: unknown[]) => console.info('[INFO]', ...args),
    warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
    error: (...args: unknown[]) => console.error('[ERROR]', ...args),
    fatal: (...args: unknown[]) => console.error('[FATAL]', ...args),
    trace: (...args: unknown[]) => console.trace('[TRACE]', ...args),
    child: () => loggerInstance,
  };
}

export function createLogger(context: LogContext) {
  if (loggerInstance.child) {
    return loggerInstance.child(context);
  }
  return loggerInstance;
}

export function logApiCall(
  method: string,
  path: string,
  options: {
    statusCode?: number;
    duration?: number;
    userId?: string;
    error?: Error;
  } = {}
): void {
  const { statusCode, duration, userId, error } = options;
  
  const logData = {
    type: 'api_call',
    method,
    path,
    statusCode,
    duration,
    userId,
  };

  if (error) {
    loggerInstance.error(logData, `API ${method} ${path} failed: ${error.message}`);
  } else if (statusCode && statusCode >= 400) {
    loggerInstance.warn(logData, `API ${method} ${path} returned ${statusCode}`);
  } else {
    loggerInstance.info(logData, `API ${method} ${path} ${statusCode} in ${duration}ms`);
  }
}

export function logDbQuery(
  operation: string,
  table: string,
  options: {
    duration?: number;
    rowCount?: number;
    userId?: string;
    error?: Error;
  } = {}
): void {
  const { duration, rowCount, userId, error } = options;
  
  const logData = {
    type: 'db_query',
    operation,
    table,
    duration,
    rowCount,
    userId,
  };

  if (error) {
    loggerInstance.error(logData, `DB ${operation} on ${table} failed: ${error.message}`);
  } else {
    loggerInstance.debug(logData, `DB ${operation} on ${table}: ${rowCount} rows in ${duration}ms`);
  }
}

export function createTimer(label: string): () => number {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    loggerInstance.debug({
      type: 'performance',
      label,
      duration,
    }, `${label} completed in ${duration.toFixed(2)}ms`);
    return duration;
  };
}

export async function measureAsync<T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> {
  const timer = createTimer(label);
  try {
    const result = await operation();
    timer();
    return result;
  } catch (error) {
    timer();
    throw error;
  }
}

export const logger = loggerInstance;
export type { LogContext };
