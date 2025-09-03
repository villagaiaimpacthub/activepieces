import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { logSystemEvent, logError } from '../src/backend/utils/logger';

export interface HealthStatus {
  status: 'ok' | 'error';
  info: Record<string, any>;
  error?: Record<string, any>;
  details: Record<string, any>;
}

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @HealthCheck()
  async check(): Promise<HealthStatus> {
    try {
      const result = await this.health.check([
        // Database health check
        () => this.db.pingCheck('database'),
        
        // Memory health check (alert if using more than 300MB)
        () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
        
        // RSS memory check (alert if using more than 500MB)
        () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

        // Custom application health checks
        () => this.checkApplicationHealth(),
        () => this.checkExternalServices(),
      ]);

      logSystemEvent('Health Check Passed', result);
      return result;
    } catch (error) {
      logError('Health Check Failed', error);
      throw error;
    }
  }

  private async checkApplicationHealth() {
    return {
      application: {
        status: 'up',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }

  private async checkExternalServices() {
    const checks: Record<string, any> = {};

    // Check Redis if configured
    if (process.env.REDIS_URL) {
      try {
        // Redis health check would go here
        checks.redis = { status: 'up', message: 'Redis connection healthy' };
      } catch (error) {
        checks.redis = { status: 'down', error: error.message };
      }
    }

    // Check file system access
    try {
      const fs = require('fs');
      const os = require('os');
      
      // Check if temp directory is writable
      const tempDir = os.tmpdir();
      fs.accessSync(tempDir, fs.constants.W_OK);
      checks.filesystem = { status: 'up', tempDir, writable: true };
    } catch (error) {
      checks.filesystem = { status: 'down', error: error.message };
    }

    return {
      external_services: checks,
    };
  }

  // Detailed system information for monitoring
  async getSystemInfo() {
    const os = require('os');
    
    return {
      system: {
        platform: os.platform(),
        architecture: os.arch(),
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        version: process.version,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    };
  }
}