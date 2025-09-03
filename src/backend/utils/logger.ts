import { createLoggerConfig } from '../config/logging.config';

const winston = require('winston');

// Create the main logger instance
export const logger = winston.createLogger(createLoggerConfig());

// Create a child logger for specific modules
export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};

// Helper functions for different log levels
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | any, meta?: any) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    ...meta,
  });
};

export const logWarning = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Database query logging
export const logDatabaseQuery = (query: string, parameters?: any[], duration?: number) => {
  if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
    logger.debug('Database Query', {
      query,
      parameters,
      duration: duration ? `${duration}ms` : undefined,
    });
  }
};

// API request logging
export const logApiRequest = (method: string, url: string, userId?: string, duration?: number) => {
  logger.info('API Request', {
    method,
    url,
    userId,
    duration: duration ? `${duration}ms` : undefined,
  });
};

// Authentication logging
export const logAuthEvent = (event: string, userId?: string, email?: string, success: boolean = true) => {
  logger.info('Auth Event', {
    event,
    userId,
    email,
    success,
    timestamp: new Date().toISOString(),
  });
};

// Performance monitoring
export const logPerformance = (operation: string, duration: number, meta?: any) => {
  const level = duration > 1000 ? 'warn' : 'info'; // Warn if operation takes more than 1 second
  logger[level]('Performance', {
    operation,
    duration: `${duration}ms`,
    ...meta,
  });
};

// System events
export const logSystemEvent = (event: string, details?: any) => {
  logger.info('System Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Export the main logger for advanced usage
export default logger;