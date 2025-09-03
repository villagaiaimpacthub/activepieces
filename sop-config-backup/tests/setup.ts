// Global test setup file
import 'reflect-metadata';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Only show errors that aren't expected test errors
  if (!args.some(arg => 
    typeof arg === 'string' && (
      arg.includes('Jest worker encountered') ||
      arg.includes('Warning: ReactDOM.render')
    )
  )) {
    originalConsoleError.apply(console, args);
  }
};

console.warn = (...args: any[]) => {
  // Filter out common test warnings
  if (!args.some(arg => 
    typeof arg === 'string' && (
      arg.includes('Warning:') ||
      arg.includes('deprecated')
    )
  )) {
    originalConsoleWarn.apply(console, args);
  }
};

// Global test timeout
jest.setTimeout(30000);

// Mock Date for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date = class extends Date {
  constructor(...args: any[]) {
    if (args.length === 0) {
      super(mockDate);
    } else {
      super(...args);
    }
  }
} as any;

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeValidDate(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass,
    };
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },

  toBeValidDate(received: string | Date) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid date`,
      pass,
    };
  },
});

// Cleanup after all tests
afterAll(async () => {
  // Close any open connections, cleanup resources
  await new Promise(resolve => setTimeout(resolve, 500));
});