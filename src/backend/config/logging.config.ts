export interface LoggingConfig {
  level: string;
  format: 'json' | 'simple';
  enableFileOutput: boolean;
  enableConsoleOutput: boolean;
  logDir: string;
  maxFiles: number;
  maxSize: string;
}

export const loggingConfig: LoggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'json',
  enableFileOutput: process.env.NODE_ENV === 'production',
  enableConsoleOutput: true,
  logDir: process.env.LOG_DIR || './logs',
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '10'),
  maxSize: process.env.LOG_MAX_SIZE || '20m',
};

export const createLoggerConfig = () => {
  const winston = require('winston');
  const path = require('path');
  const fs = require('fs');

  // Ensure log directory exists
  if (loggingConfig.enableFileOutput && !fs.existsSync(loggingConfig.logDir)) {
    fs.mkdirSync(loggingConfig.logDir, { recursive: true });
  }

  const formats = [];
  
  // Add timestamp
  formats.push(winston.format.timestamp());

  // Add format based on configuration
  if (loggingConfig.format === 'json') {
    formats.push(winston.format.json());
  } else {
    formats.push(winston.format.simple());
  }

  const transports = [];

  // Console transport
  if (loggingConfig.enableConsoleOutput) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }

  // File transports
  if (loggingConfig.enableFileOutput) {
    // Error log file
    transports.push(
      new winston.transports.File({
        filename: path.join(loggingConfig.logDir, 'error.log'),
        level: 'error',
        maxFiles: loggingConfig.maxFiles,
        maxsize: loggingConfig.maxSize,
        tailable: true,
      })
    );

    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: path.join(loggingConfig.logDir, 'combined.log'),
        maxFiles: loggingConfig.maxFiles,
        maxsize: loggingConfig.maxSize,
        tailable: true,
      })
    );

    // Application log file
    transports.push(
      new winston.transports.File({
        filename: path.join(loggingConfig.logDir, 'app.log'),
        level: 'info',
        maxFiles: loggingConfig.maxFiles,
        maxsize: loggingConfig.maxSize,
        tailable: true,
      })
    );
  }

  return {
    level: loggingConfig.level,
    format: winston.format.combine(...formats),
    transports,
    // Don't exit on handled exceptions
    exitOnError: false,
  };
};

export const createHttpLoggerConfig = () => {
  const winston = require('winston');
  
  return {
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: (req: any) => {
      // Ignore health check and static asset requests
      return req.url.includes('/health') || req.url.includes('/assets');
    },
  };
};