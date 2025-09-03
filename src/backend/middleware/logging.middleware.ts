import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logApiRequest, logError } from '../utils/logger';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip, headers } = req;

    // Log request start
    const requestId = this.generateRequestId();
    req['requestId'] = requestId;

    // Skip logging for health checks and static assets
    const shouldSkipLogging = this.shouldSkipLogging(originalUrl);

    if (!shouldSkipLogging) {
      console.log(`[${requestId}] ${method} ${originalUrl} - Started`, {
        ip,
        userAgent: headers['user-agent'],
        contentLength: headers['content-length'],
      });
    }

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function (chunk: any, encoding?: any) {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      if (!shouldSkipLogging) {
        // Log request completion
        logApiRequest(method, originalUrl, req['user']?.id, duration);
        
        console.log(`[${requestId}] ${method} ${originalUrl} - ${statusCode} ${duration}ms`);

        // Log slow requests
        if (duration > 1000) {
          console.warn(`Slow request detected: ${method} ${originalUrl} took ${duration}ms`);
        }

        // Log error responses
        if (statusCode >= 400) {
          logError(`HTTP Error Response: ${statusCode}`, null, {
            method,
            url: originalUrl,
            statusCode,
            duration,
            ip,
            userAgent: headers['user-agent'],
          });
        }
      }

      originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private shouldSkipLogging(url: string): boolean {
    const skipPatterns = ['/health', '/favicon.ico', '/assets/', '/static/'];
    return skipPatterns.some(pattern => url.includes(pattern));
  }
}